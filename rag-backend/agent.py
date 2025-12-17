import openai
from typing import List, Dict, Any
from qdrant_store import qdrant_store
from settings import settings
import asyncio


class BookSearchTool:
    """Custom tool for searching book content in Qdrant"""

    def __init__(self):
        self.name = "search_book"
        self.description = "Search for relevant information in the book content based on the query"
        self.parameters = {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "The search query to find relevant information in the book"
                }
            },
            "required": ["query"]
        }

    async def __call__(self, query: str) -> List[Dict[str, Any]]:
        """Execute the search and return results"""
        results = await qdrant_store.search(query, top_k=5)
        return results


class BookChatAgent:
    """OpenAI Agent for handling book-related questions using OpenAI Agents SDK"""

    def __init__(self):
        openai.api_key = settings.openai_api_key
        self.search_tool = BookSearchTool()

    async def chat_with_rag(self, message: str) -> Dict[str, Any]:
        """Handle chat with RAG (retrieve from Qdrant and answer)"""
        # Use the search tool to get relevant contexts
        search_results = await self.search_tool(message)

        # Format context for the agent
        context_text = "\n\n".join([chunk["text"] for chunk in search_results])

        # Prepare the system message with context
        system_message = f"""You are a helpful assistant for the Physical AI & Humanoid Robotics book.
        Answer questions based ONLY on the provided context from the book.
        If the answer cannot be found in the provided context, clearly state that the information is not available in the provided text.

        Context from the book:
        {context_text}"""

        # Create the conversation
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": message}
        ]

        # Call OpenAI API
        response = await openai.ChatCompletion.acreate(
            model=settings.chat_model,
            messages=messages,
            temperature=0.1,
            max_tokens=1000
        )

        answer = response.choices[0].message.content

        # Prepare citations for response
        citations = []
        for chunk in search_results:
            citations.append({
                "filename": chunk.get("filename"),
                "heading_path": chunk.get("heading_path"),
                "source_url": chunk.get("source_url")
            })

        return {
            "answer": answer,
            "citations": citations
        }

    async def chat_selection(self, message: str, selected_text: str) -> Dict[str, Any]:
        """Handle chat using only the provided selected text"""
        # Prepare the system message with only the selected text
        system_message = f"""You are a helpful assistant for the Physical AI & Humanoid Robotics book.
        Answer the user's question based ONLY on the provided selected text.
        Do not use any external knowledge or information beyond what's in the selected text.
        If the answer cannot be found in the provided text, clearly state that the information is not available in the provided text.

        Selected text:
        {selected_text}"""

        # Create the conversation
        messages = [
            {"role": "system", "content": system_message},
            {"role": "user", "content": message}
        ]

        # Call OpenAI API
        response = await openai.ChatCompletion.acreate(
            model=settings.chat_model,
            messages=messages,
            temperature=0.1,
            max_tokens=1000
        )

        answer = response.choices[0].message.content

        # For selection mode, we return the selection as the source
        citations = [{
            "filename": "user-selection",
            "heading_path": "User Selected Text",
            "source_url": None
        }]

        return {
            "answer": answer,
            "citations": citations
        }