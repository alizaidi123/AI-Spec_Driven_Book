# Implementation Plan: Integrated RAG Chatbot

## Architecture Overview
- Backend: FastAPI service in `rag-backend/` directory
- Frontend: React widget component integrated into Docusaurus via Root theme
- Database: Neon Serverless Postgres for session/message persistence
- Vector Store: Qdrant Cloud for book content indexing

## Backend Implementation (rag-backend/)

### File Structure
```
rag-backend/
├── main.py                 # FastAPI app entry point
├── config.py               # Configuration settings
├── models.py               # Pydantic models for request/response
├── database.py             # Neon Postgres connection/session
├── vector_store.py         # Qdrant client wrapper
├── schemas.py              # SQLAlchemy models
├── ingestion/              # Ingestion module
│   ├── __init__.py
│   ├── chunker.py          # Text chunking logic
│   └── ingest_docs.py      # CLI script for ingesting docs
├── agents/                 # AI agent module
│   ├── __init__.py
│   ├── book_search_tool.py # Custom tool for Qdrant search
│   └── chat_agent.py       # OpenAI Agent implementation
├── api/                    # API routes
│   ├── __init__.py
│   └── chat.py             # Chat endpoints
└── requirements.txt        # Python dependencies
```

### Dependencies (requirements.txt)
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
asyncpg==0.29.0
qdrant-client==1.7.0
openai==1.3.5
python-multipart==0.0.6
pydantic-settings==2.1.0
tiktoken==0.5.2
python-slugify==8.0.1
uuid6==2023.5.2
```

### Qdrant Collection Schema
```python
# Collection name: "book_chunks"
# Vector size: 1536 (OpenAI ada-002 embedding dimensions)
# Distance metric: Cosine

Payload fields:
- filename: str (required) - source document filename
- chunk_id: str (required) - unique chunk identifier
- heading_path: str (optional) - hierarchy of headings leading to this chunk
- text: str (required) - the actual text content of the chunk
- page_number: int (optional) - page number if applicable
```

### Neon Schema Creation Strategy
- Create `migrations/` directory with versioned migration scripts
- On startup, run `alembic upgrade head` to apply migrations
- Include initial schema creation for chat_sessions and chat_messages tables
- Use alembic for future schema changes

### API Endpoints Implementation
- `POST /chat` - Standard RAG chat with Qdrant retrieval
- `POST /chat/selection` - Selection-only mode with no external retrieval
- `GET /health` - Health check endpoint

## Frontend Implementation (src/)

### New Files
```
src/
├── components/
│   └── ChatWidget/
│       ├── ChatWidget.tsx          # Main chat widget component
│       ├── ChatWindow.tsx          # Chat window UI
│       ├── MessageBubble.tsx       # Individual message display
│       ├── ChatInput.tsx           # Input field with send button
│       ├── SelectionIndicator.tsx  # Shows selected text indicator
│       └── styles.module.css       # Component-specific styles
└── theme/
    └── Root/
        ├── index.js                # Enhanced Root component
        └── styles.css              # Global styles for chat widget
```

### Docusaurus Configuration
- Add `RAG_API_BASE_URL` to `customFields` in `docusaurus.config.js`
- Configure webpack to handle module resolution for new components

### Text Selection Integration
- Add event listeners to detect text selection on documentation pages
- Show floating button near selection to trigger selection-only Q&A
- Pass selected text to the chat widget for immediate querying

## Local Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Access to OpenAI API key
- Access to Qdrant Cloud instance
- Neon Serverless Postgres database

### Steps
1. Set environment variables:
   ```bash
   export OPENAI_API_KEY=your_key
   export QDRANT_URL=your_qdrant_url
   export QDRANT_API_KEY=your_qdrant_key
   export DATABASE_URL=neon_connection_string
   ```

2. Install backend dependencies:
   ```bash
   cd rag-backend
   pip install -r requirements.txt
   ```

3. Ingest documentation:
   ```bash
   python -m ingestion.ingest_docs
   ```

4. Start backend API:
   ```bash
   cd rag-backend
   uvicorn main:app --reload
   ```

5. Update docusaurus.config.js with:
   ```javascript
   customFields: {
     RAG_API_BASE_URL: process.env.RAG_API_BASE_URL || 'http://localhost:8000'
   }
   ```

6. Start Docusaurus:
   ```bash
   npm run start
   ```

## Deployment Instructions

### Backend Deployment
1. Deploy FastAPI app to preferred hosting (Heroku, Railway, etc.)
2. Set environment variables in deployment:
   - `OPENAI_API_KEY`
   - `QDRANT_URL`
   - `QDRANT_API_KEY`
   - `DATABASE_URL`

### Vercel Frontend Configuration
1. In Vercel dashboard, add environment variable:
   - `RAG_API_BASE_URL`: URL of deployed backend API

2. Ensure docusaurus.config.js references the environment variable:
   ```javascript
   customFields: {
     RAG_API_BASE_URL: process.env.RAG_API_BASE_URL || 'https://your-backend-url.com'
   }
   ```

## Testing Strategy
- Unit tests for ingestion pipeline
- Integration tests for API endpoints
- Mock tests for OpenAI and Qdrant clients during CI
- End-to-end tests for chat functionality

## Security Considerations
- Sanitize all user inputs before processing
- Implement rate limiting on API endpoints
- Validate session IDs to prevent unauthorized access
- Ensure no sensitive credentials are exposed in frontend code