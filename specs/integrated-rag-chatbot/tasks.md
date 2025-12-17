# Tasks: Integrated RAG Chatbot

## Backend Tasks

### 1. Setup Backend Structure [X]
**Input**: None
**Output**: Basic FastAPI project structure in rag-backend/
**Files**:
- rag-backend/main.py
- rag-backend/config.py
- rag-backend/models.py
- rag-backend/requirements.txt

**Steps**:
- Create rag-backend directory with basic FastAPI app
- Define configuration settings with environment variables
- Create Pydantic models for API requests/responses
- Define requirements.txt with necessary dependencies

### 2. Setup Database Connection [X]
**Input**: Neon Postgres connection string
**Output**: Database connection and session management
**Files**:
- rag-backend/database.py
- rag-backend/schemas.py

**Steps**:
- Create database connection utility functions
- Define SQLAlchemy models for chat_sessions and chat_messages
- Implement session management and connection pooling

### 3. Setup Qdrant Integration [X]
**Input**: Qdrant Cloud credentials
**Output**: Qdrant client wrapper with CRUD operations
**Files**:
- rag-backend/vector_store.py

**Steps**:
- Create Qdrant client wrapper class
- Implement methods for upsert, search, and delete operations
- Define collection schema for book chunks

### 4. Implement Ingestion Pipeline [X]
**Input**: MDX files from ./docs/
**Output**: Indexed book content in Qdrant
**Files**:
- rag-backend/ingestion/__init__.py
- rag-backend/ingestion/chunker.py
- rag-backend/ingestion/ingest_docs.py

**Steps**:
- Create text chunking utility with token size control
- Implement MDX parsing and frontmatter stripping
- Build CLI script to process docs/ directory and index content
- Add OpenAI embedding generation and Qdrant upsert

### 5. Implement OpenAI Agents SDK Integration [X]
**Input**: Query text and context
**Output**: Generated response using OpenAI agents
**Files**:
- rag-backend/agents/book_search_tool.py
- rag-backend/agents/chat_agent.py

**Steps**:
- Create custom tool for Qdrant search functionality
- Implement OpenAI Agent with strict context-following instructions
- Handle selection-only mode with restricted context

### 6. Implement API Endpoints [X]
**Input**: API requests from frontend
**Output**: Structured API responses
**Files**:
- rag-backend/api/__init__.py
- rag-backend/api/chat.py

**Steps**:
- Implement POST /chat endpoint with Qdrant retrieval
- Implement POST /chat/selection endpoint for selection-only mode
- Implement GET /health endpoint
- Add request validation and error handling

### 7. Setup Database Migrations [X]
**Input**: None
**Output**: Alembic migration files and startup script
**Files**:
- rag-backend/migrations/env.py
- rag-backend/migrations/script.py.mako
- rag-backend/migrations/versions/initial_schema.py
- rag-backend/migrate.py (startup script)

**Steps**:
- Initialize Alembic for database migrations
- Create initial schema migration for chat tables
- Implement startup script to run migrations

## Frontend Tasks

### 8. Create Chat Widget Components [X]
**Input**: None
**Output**: React components for chat interface
**Files**:
- src/components/ChatWidget/ChatWidget.tsx
- src/components/ChatWidget/ChatWindow.tsx
- src/components/ChatWidget/MessageBubble.tsx
- src/components/ChatWidget/ChatInput.tsx
- src/components/ChatWidget/styles.module.css

**Steps**:
- Create main ChatWidget container component
- Implement chat window with scrollable message history
- Create message bubble components for user/assistant messages
- Build input field with send button
- Add CSS modules for styling

### 9. Implement Selection Detection and Handling [X]
**Input**: User text selection
**Output**: Highlighted selection with Q&A option
**Files**:
- src/components/ChatWidget/SelectionIndicator.tsx

**Steps**:
- Add event listeners for text selection
- Create floating button that appears near selection
- Implement functionality to pass selected text to chat
- Add visual indication of selected text

### 10. Implement Session Persistence [X]
**Input**: Chat session data
**Output**: Persistent session storage in localStorage
**Files**:
- src/components/ChatWidget/ChatWidget.tsx
- src/utils/sessionStorage.ts (new file)

**Steps**:
- Create utility functions for localStorage operations
- Implement session ID generation and storage
- Add functionality to persist chat history in browser
- Handle session restoration on page reload

### 11. Integrate Chat Widget into Docusaurus Theme [X]
**Input**: None
**Output**: Chat widget appearing on all pages
**Files**:
- src/theme/Root/index.js
- src/theme/Root/styles.css

**Steps**:
- Modify Root theme component to include ChatWidget
- Add global CSS for widget positioning and styling
- Ensure widget doesn't interfere with page content
- Add toggle functionality to show/hide widget

## Configuration Tasks

### 12. Configure Docusaurus Environment Variables [X]
**Input**: API base URL
**Output**: Updated docusaurus.config.js with customFields
**Files**:
- docusaurus.config.js

**Steps**:
- Add RAG_API_BASE_URL to customFields in docusaurus.config.js
- Configure webpack to handle environment variables
- Ensure proper fallback for development/production

### 13. Setup Environment Configuration [X]
**Input**: None
**Output**: Environment configuration files
**Files**:
- rag-backend/.env.example
- .env.example (root)

**Steps**:
- Create example environment files with required variables
- Document all necessary environment variables
- Add instructions for setting up environment

## Documentation Tasks

### 14. Create Backend README [X]
**Input**: None
**Output**: README with backend setup and deployment instructions
**Files**:
- rag-backend/README.md

**Steps**:
- Document backend architecture and components
- Provide detailed setup instructions
- Include API endpoint documentation
- Add deployment instructions for various platforms

### 15. Create Deployment Guide [X]
**Input**: None
**Output**: Comprehensive deployment documentation
**Files**:
- docs/deployment-guide.md

**Steps**:
- Document full deployment process for backend and frontend
- Include environment variable setup
- Provide troubleshooting tips
- Add scaling recommendations for production

## Testing Tasks

### 16. Implement Backend Tests [X]
**Input**: None
**Output**: Test suite for backend functionality
**Files**:
- rag-backend/tests/test_api.py
- rag-backend/tests/test_ingestion.py
- rag-backend/tests/conftest.py

**Steps**:
- Create test suite for API endpoints
- Implement tests for ingestion pipeline
- Add mock implementations for external services
- Set up test fixtures and configuration

## Integration Tasks

### 17. End-to-End Testing [X]
**Input**: Full system with backend and frontend
**Output**: Verified integrated functionality
**Files**: None (testing procedure)

**Steps**:
- Test complete chat workflow from frontend to backend
- Verify session persistence across page reloads
- Test selection-only mode functionality
- Validate error handling and edge cases