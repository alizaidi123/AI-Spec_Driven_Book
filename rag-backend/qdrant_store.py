import asyncio
from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models
from typing import List, Dict, Optional
from settings import settings
import uuid
import logging


class QdrantStore:
    def __init__(self):
        self.client = AsyncQdrantClient(
            url=settings.qdrant_url,
            api_key=settings.qdrant_api_key,
            prefer_grpc=True
        )
        self.collection_name = settings.qdrant_collection
        self._connected = False

    async def initialize_collection(self):
        """Initialize the collection with the proper schema using AsyncQdrantClient"""
        try:
            collections = await self.client.get_collections()
            collection_exists = any(col.name == self.collection_name for col in collections.collections)

            if not collection_exists:
                # Determine vector size based on embedding model
                vector_size = self._get_vector_size(settings.embedding_model)

                await self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(size=vector_size, distance=models.Distance.COSINE),
                )

                # Create payload index for filename to optimize search
                await self.client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name="filename",
                    field_schema=models.PayloadSchemaType.KEYWORD
                )

            self._connected = True
            logging.info(f"Qdrant collection '{self.collection_name}' ready")
        except Exception as e:
            logging.warning(f"Error initializing Qdrant collection: {e}. Continuing startup...")
            self._connected = False
            # Don't raise the exception - allow startup to continue

    def _get_vector_size(self, model_name: str) -> int:
        """Get the appropriate vector size based on the embedding model"""
        # Common embedding model vector sizes
        model_to_size = {
            "text-embedding-ada-002": 1536,
            "text-embedding-3-small": 1536,
            "text-embedding-3-large": 3072,
        }
        return model_to_size.get(model_name, 1536)  # Default to 1536

    async def upsert_vectors(self, texts: List[str], payloads: List[Dict]):
        """Upsert text vectors into the collection"""
        if not self._connected:
            raise Exception("Qdrant not connected")

        # Generate embeddings using OpenAI
        import openai
        openai.api_key = settings.openai_api_key

        # Get embeddings for all texts at once
        response = await openai.embeddings.acreate(
            input=texts,
            model=settings.embedding_model
        )

        embeddings = [item.embedding for item in response.data]

        # Prepare points for upsert
        points = []
        for i, (text, embedding, payload) in enumerate(zip(texts, embeddings, payloads)):
            point_id = str(uuid.uuid4())
            points.append(
                models.PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        "text": text,
                        **payload
                    }
                )
            )

        # Upsert the points
        await self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

        return [point.id for point in points]

    async def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """Search for similar text chunks"""
        if not self._connected:
            raise Exception("Qdrant not connected")

        import openai
        openai.api_key = settings.openai_api_key

        # Get embedding for query
        response = await openai.embeddings.acreate(
            input=[query],
            model=settings.embedding_model
        )

        query_embedding = response.data[0].embedding

        # Search in Qdrant
        search_results = await self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            limit=top_k
        )

        results = []
        for hit in search_results:
            payload = hit.payload
            results.append({
                "id": hit.id,
                "text": payload.get("text"),
                "filename": payload.get("filename"),
                "chunk_id": payload.get("chunk_id"),
                "heading_path": payload.get("heading_path"),
                "source_url": payload.get("source_url"),
                "score": hit.score
            })

        return results

    def is_connected(self):
        """Return whether Qdrant is connected"""
        return self._connected

    async def close(self):
        """Close the Qdrant client connection"""
        if hasattr(self.client, 'close'):
            await self.client.close()


# Global instance
qdrant_store = QdrantStore()