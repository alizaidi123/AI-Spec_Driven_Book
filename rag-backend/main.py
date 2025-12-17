from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from db import get_async_session, ChatSession, ChatMessage
from agent import BookChatAgent
from settings import settings
from qdrant_store import qdrant_store
import asyncio
import os
import datetime


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    selected_text: Optional[str] = None
    page_url: Optional[str] = None


class ChatResponse(BaseModel):
    session_id: str
    answer: str
    citations: List[Dict[str, Any]]


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    qdrant: dict


# Initialize FastAPI app
app = FastAPI(title="Book RAG API", version="1.0.0")

# Add CORS middleware
# Read CORS origins from settings (now a list after validation)
if settings.cors_origins == ["*"]:
    cors_origins = ["*"]
elif settings.cors_origins == []:
    # Default to localhost for development if not specified
    cors_origins = ["http://localhost:3000"]
else:
    cors_origins = settings.cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency to get database session
async def get_db():
    async_session = await get_async_session(settings.database_url)
    async with async_session() as session:
        yield session


# Initialize the chat agent
chat_agent = BookChatAgent()


@app.on_event("startup")
async def startup_event():
    """Initialize Qdrant collection on startup (async method)"""
    await qdrant_store.initialize_collection()


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint with Qdrant status"""
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "qdrant": {
            "connected": qdrant_store.is_connected()
        }
    }


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """Chat endpoint with conditional logic for selection vs RAG mode"""
    try:
        # Generate or use provided session ID
        session_id = uuid.uuid4()

        # Create/get session in database
        session = ChatSession(id=session_id)
        db.add(session)
        await db.commit()

        # Save user message
        user_message = ChatMessage(
            session_id=session_id,
            role="user",
            content=request.message
        )
        db.add(user_message)
        await db.commit()

        # Determine response based on selected_text presence
        if request.selected_text:
            # Selection-only mode: answer ONLY from provided text
            result = await chat_agent.chat_selection(request.message, request.selected_text)
        else:
            # RAG mode: retrieve from Qdrant and answer
            result = await chat_agent.chat_with_rag(request.message)

        # Save assistant response
        assistant_message = ChatMessage(
            session_id=session_id,
            role="assistant",
            content=result["answer"]
        )
        db.add(assistant_message)
        await db.commit()

        return ChatResponse(
            session_id=str(session_id),
            answer=result["answer"],
            citations=result["citations"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")


@app.get("/cors-debug")
async def cors_debug():
    """Development endpoint to check configured CORS origins"""
    return {
        "cors_origins": settings.cors_origins,
        "actual_cors_origins": settings.cors_origins if settings.cors_origins != ["*"] and settings.cors_origins != [] else ["*"]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)