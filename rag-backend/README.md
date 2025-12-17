# Book RAG Backend

This is the backend service for the integrated RAG chatbot in the Physical AI & Humanoid Robotics book. It provides API endpoints for chat functionality with retrieval from the book content.

## Features

- FastAPI-based REST API
- Qdrant vector store integration for book content retrieval
- OpenAI Agents SDK for contextual responses
- Neon Postgres for session and message persistence
- Support for both general Q&A (RAG) and selection-only mode
- Citation support with source links

## Prerequisites

- Python 3.9+
- Access to OpenAI API
- Qdrant Cloud account
- Neon Postgres database

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd humanoid-robotics-book
```

### 2. Setup backend

```bash
cd rag-backend
```

### 3. Create virtual environment and install dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure environment variables

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Edit `.env` and add your:
- OpenAI API key
- Qdrant URL and API key
- Neon Postgres database URL
- Optional: Qdrant collection name, embedding model, chat model, and CORS origins

### 5. Ingest book content

Make sure you have the book markdown files in the `../humanoid-robotics-book/docs/` directory, then run:

```bash
python ingest_docs.py
```

This will process all MD and MDX files and index them in Qdrant by headings.

## Running Locally

Start the backend API:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

API endpoints:
- `GET /health` - Health check
- `POST /chat` - Chat with conditional logic: if selected_text provided, answer only from that text; otherwise use RAG to retrieve from Qdrant

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `QDRANT_URL` - Your Qdrant Cloud cluster URL (required)
- `QDRANT_API_KEY` - Your Qdrant API key (required)
- `DATABASE_URL` - Your Neon Postgres database connection string (required)
- `QDRANT_COLLECTION` - Name of the Qdrant collection (default: "book_chunks")
- `EMBEDDING_MODEL` - OpenAI embedding model (default: "text-embedding-ada-002")
- `CHAT_MODEL` - OpenAI chat model (default: "gpt-3.5-turbo")
- `CORS_ORIGINS` - Comma-separated list of allowed origins (default: "*")

## API Endpoints

### Health Check
```
GET /health
```

### Chat with Conditional Logic
```
POST /chat
Content-Type: application/json

{
  "message": "Your question about the book",
  "selected_text": "Optional selected text to answer from only",
  "page_url": "Optional URL of the current page"
}
```

If `selected_text` is provided, the system will answer ONLY from that text.
If `selected_text` is not provided, the system will use RAG to retrieve from Qdrant and answer.

## Architecture

- **FastAPI**: Web framework
- **SQLAlchemy**: Database ORM (Neon Postgres)
- **Qdrant**: Vector store for book content
- **OpenAI**: Language model for responses
- **TikToken**: Token counting for text chunking

## Development

To run with auto-reload during development:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

To run tests (when available):

```bash
pytest
```

## Troubleshooting

If you encounter issues:
1. Verify all environment variables are set correctly
2. Check that your Qdrant instance is accessible
3. Ensure your OpenAI API key has sufficient quota
4. Confirm your database connection string is correct
5. Make sure the book content has been properly ingested into Qdrant