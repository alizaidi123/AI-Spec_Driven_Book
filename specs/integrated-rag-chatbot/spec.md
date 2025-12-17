# Integrated RAG Chatbot Specification

## Feature Overview
Embed a RAG chatbot inside the Docusaurus book site that answers questions about the book content. The chatbot must support both general Q&A about the book and selection-only Q&A mode where it answers strictly from user-selected text.

## Goals
- Provide an interactive way for readers to ask questions about book content
- Enable selection-only Q&A mode for focused answers from highlighted text
- Integrate seamlessly with the existing Docusaurus documentation site
- Maintain fast response times and accurate information retrieval

## Non-Goals
- Answering questions outside the scope of the book content (except in selection-only mode)
- Replacing the existing navigation and search functionality
- Supporting complex mathematical notation rendering in responses

## Stack Requirements
- **Backend**: FastAPI (Python)
- **AI Integration**: OpenAI Agents SDK and/or ChatKit SDK
- **Database**: Neon Serverless Postgres (for sessions and messages)
- **Vector Store**: Qdrant Cloud Free Tier (for book content chunks)
- **Frontend**: Embedded widget in Docusaurus pages

## Functional Requirements

### Backend Endpoints

#### 1. Chat Endpoint (`POST /chat`)
**Input**: `{ session_id?: string, message: string }`

**Behavior**:
- Retrieve topK relevant chunks from Qdrant based on the user's message
- Answer using OpenAI Agents SDK with strict "use provided context only" instructions
- Store the interaction in the database

**Output**: `{ session_id: string, answer: string, sources: [{filename, chunk_id, score}] }`

#### 2. Selection Chat Endpoint (`POST /chat/selection`)
**Input**: `{ session_id?: string, message: string, selection: string }`

**Behavior**:
- Ignore Qdrant vector search
- Answer ONLY from the provided selection text (no outside knowledge)
- Store the interaction in the database

**Output**: `{ session_id: string, answer: string, sources: ["user-selection"] }`

#### 3. Health Check Endpoint (`GET /health`)
**Output**: `{ status: "healthy", timestamp: string }`

### Data Models (Neon Postgres)

#### Chat Sessions Table
```
chat_sessions(
  id: uuid (primary key),
  created_at: timestamp
)
```

#### Chat Messages Table
```
chat_messages(
  id: bigserial (primary key),
  session_id: uuid (foreign key to chat_sessions),
  role: text ('user' or 'assistant'),
  content: text,
  created_at: timestamp
)
```

### Ingestion Pipeline

#### CLI Script: `ingest_docs.py`
**Functionality**:
- Read MDX files from `./docs/` directory
- Strip frontmatter from documents
- Chunk text with size approximately 400-700 tokens and 80-token overlap
- Embed chunks using OpenAI embeddings API
- Upsert into Qdrant collection with payload containing:
  - `filename`: Original document file name
  - `chunk_id`: Unique identifier for the chunk
  - `heading_path`: Optional path of headings leading to this content
  - `text`: The actual chunk text content

### AI Integration

#### OpenAI Agents SDK Implementation
- Use an Agent with a custom tool function `search_book(query) -> contexts` that queries Qdrant
- For general chat: Agent uses the search tool to retrieve relevant contexts
- For selection mode: Bypass the search tool and run the agent with the instruction "use only the provided selection text"

## Frontend Requirements

### Chat Widget
- Floating chat widget that appears on all documentation pages
- Toggle button to open/close the chat interface
- Session persistence using the session_id from the backend
- Display conversation history within the widget

### Text Selection Detection
- Detect when user selects text on documentation pages
- Show a contextual menu or button near the selection to initiate selection-only Q&A
- Pass the selected text to the `/chat/selection` endpoint when activated

### Integration Points
- Add new component under `src/components/ChatWidget`
- Mount globally via `src/theme/Root` to appear on all pages
- Style to match the existing Docusaurus theme

## Technical Constraints

### Security
- Never expose OpenAI, Qdrant, or Neon credentials in frontend code
- Validate and sanitize all user inputs
- Implement rate limiting to prevent abuse

### Performance
- Optimize for free-tier deployment limitations
- Cache frequently accessed vectors when possible
- Limit concurrent requests to AI services

### Resource Limits
- Keep vector embeddings within Qdrant Cloud Free Tier limits
- Minimize database storage by potentially implementing message history cleanup
- Avoid heavy computational tasks on the server

## Acceptance Criteria

### General Chat Functionality
- [ ] User can start a new chat session
- [ ] Chat retrieves relevant information from book content
- [ ] Responses include proper citations with source filenames and chunk IDs
- [ ] Conversation history is preserved within the session

### Selection-Only Mode
- [ ] User can select text in documentation pages
- [ ] Selected text can be sent to the chat for focused Q&A
- [ ] Responses strictly adhere to information contained in the selection
- [ ] If the selection doesn't contain enough information, the bot acknowledges this

### Integration
- [ ] Chat widget appears consistently across all documentation pages
- [ ] Widget styling matches the Docusaurus theme
- [ ] Backend endpoints are properly secured and validated
- [ ] Health check endpoint returns appropriate status

### Performance
- [ ] Response times are acceptable (under 5 seconds for typical queries)
- [ ] System handles concurrent users within free-tier constraints
- [ ] Vector ingestion completes successfully for all documentation

## Success Metrics
- User engagement with the chat feature
- Accuracy of responses to book-related questions
- Successful handling of selection-only queries
- System uptime and response time reliability