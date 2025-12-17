#!/usr/bin/env python3
"""
Script to ingest MDX documentation files and index them in Qdrant.
"""
import os
import re
import asyncio
import argparse
from pathlib import Path
from typing import List, Dict, Tuple
import tiktoken
from qdrant_store import qdrant_store
from settings import settings


def extract_frontmatter(content: str) -> Tuple[str, Dict]:
    """Extract frontmatter from MDX content"""
    frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)'
    match = re.match(frontmatter_pattern, content, re.DOTALL)

    if match:
        frontmatter_text = match.group(1)
        content_text = match.group(2)

        # Simple frontmatter parsing (could be enhanced with pyyaml)
        frontmatter = {}
        for line in frontmatter_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                frontmatter[key.strip()] = value.strip().strip('"\'')

        return content_text, frontmatter
    else:
        return content, {}


def chunk_by_headings(text: str) -> List[Dict]:
    """Chunk text by headings to preserve context"""
    # Split by markdown headings
    heading_pattern = r'^(#{1,6})\s+(.+)$'
    lines = text.split('\n')

    chunks = []
    current_chunk = []
    current_heading_path = []

    for line in lines:
        match = re.match(heading_pattern, line.strip())
        if match:
            # If we have content in the current chunk, save it
            if current_chunk and any(c.strip() for c in current_chunk):
                chunks.append({
                    'text': '\n'.join(current_chunk).strip(),
                    'heading_path': ' > '.join(current_heading_path)
                })

            # Update heading path
            heading_level = len(match.group(1))
            heading_text = match.group(2).strip()

            # Maintain heading hierarchy
            current_heading_path = current_heading_path[:heading_level-1]
            current_heading_path.append(heading_text)

            # Start new chunk with heading
            current_chunk = [line]
        else:
            current_chunk.append(line)

    # Add the last chunk if it has content
    if current_chunk and any(c.strip() for c in current_chunk):
        chunks.append({
            'text': '\n'.join(current_chunk).strip(),
            'heading_path': ' > '.join(current_heading_path)
        })

    return chunks


def chunk_large_sections(chunks: List[Dict], max_tokens: int = 500) -> List[Dict]:
    """Further chunk large sections to stay within token limits"""
    encoding = tiktoken.encoding_for_model("cl100k_base")
    final_chunks = []

    for chunk in chunks:
        text = chunk['text']
        heading_path = chunk['heading_path']

        # If the chunk is already small enough, add it as is
        if len(encoding.encode(text)) <= max_tokens:
            final_chunks.append(chunk)
        else:
            # Split the large chunk into smaller pieces
            sentences = re.split(r'(?<=[.!?])\s+', text)
            current_section = []
            current_tokens = 0

            for sentence in sentences:
                sentence_tokens = len(encoding.encode(sentence))

                if current_tokens + sentence_tokens > max_tokens and current_section:
                    # Save current section and start a new one
                    final_chunks.append({
                        'text': ' '.join(current_section).strip(),
                        'heading_path': heading_path
                    })
                    current_section = [sentence]
                    current_tokens = sentence_tokens
                else:
                    current_section.append(sentence)
                    current_tokens += sentence_tokens

            # Add remaining section if any
            if current_section:
                final_chunks.append({
                    'text': ' '.join(current_section).strip(),
                    'heading_path': heading_path
                })

    return final_chunks


async def process_mdx_file(file_path: Path, docs_dir: str = "docs") -> List[Dict]:
    """Process a single MDX file and return chunks with metadata"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract frontmatter
    content_without_frontmatter, frontmatter = extract_frontmatter(content)

    # Chunk by headings
    heading_chunks = chunk_by_headings(content_without_frontmatter)

    # Further chunk large sections
    final_chunks = chunk_large_sections(heading_chunks, max_tokens=500)

    # Create payload for each chunk
    payloads = []
    for i, chunk in enumerate(final_chunks):
        # Create relative path from docs directory
        relative_path = str(file_path.relative_to(docs_dir))
        # Create URL-friendly version
        url_path = relative_path.replace('.mdx', '').replace('.md', '').replace('\\', '/')
        if url_path == 'index':
            url_path = ''

        payload = {
            "filename": relative_path,
            "chunk_id": f"{file_path.stem}_chunk_{i}",
            "heading_path": chunk['heading_path'],
            "text": chunk['text'],
            "source_url": f"/docs/{url_path}" if url_path else "/docs/"
        }
        payloads.append(payload)

    return payloads


async def ingest_docs(docs_dir: str = "docs", max_tokens: int = 500):
    """Main function to ingest all MD and MDX files in the docs directory"""
    print(f"Starting ingestion from {docs_dir}/ directory...")

    # Find all MD and MDX files
    md_files = list(Path(docs_dir).glob("**/*.md")) + list(Path(docs_dir).glob("**/*.mdx"))
    print(f"Found {len(md_files)} markdown files")

    all_texts = []
    all_payloads = []

    for file_path in md_files:
        print(f"Processing {file_path}...")
        try:
            payloads = await process_mdx_file(file_path, docs_dir)

            for payload in payloads:
                all_texts.append(payload["text"])
                all_payloads.append({
                    "filename": payload["filename"],
                    "chunk_id": payload["chunk_id"],
                    "heading_path": payload["heading_path"],
                    "source_url": payload["source_url"]
                })
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            continue

    print(f"Total chunks to index: {len(all_texts)}")

    if all_texts:
        print("Indexing chunks in Qdrant...")
        try:
            chunk_ids = await qdrant_store.upsert_vectors(all_texts, all_payloads)
            print(f"Successfully indexed {len(chunk_ids)} chunks")
        except Exception as e:
            print(f"Error during indexing: {e}")
            raise
    else:
        print("No content to index")

    print("Ingestion completed!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest markdown documentation into Qdrant")
    parser.add_argument("--docs-dir", default="docs",
                       help="Directory containing markdown files")
    parser.add_argument("--max-tokens", type=int, default=500,
                       help="Maximum tokens per chunk (default: 500)")

    args = parser.parse_args()

    # Verify docs directory exists
    if not os.path.exists(args.docs_dir):
        print(f"Error: Directory {args.docs_dir} does not exist")
        exit(1)

    # Initialize Qdrant collection
    asyncio.run(qdrant_store.initialize_collection())

    # Run the ingestion
    asyncio.run(ingest_docs(args.docs_dir, args.max_tokens))