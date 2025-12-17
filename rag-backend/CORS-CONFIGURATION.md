# CORS Configuration for RAG Backend

## Overview
The RAG backend is configured to support CORS requests from specific origins to enable communication between the frontend (Docusaurus) and the backend API.

## Allowed Origins
- `http://localhost:3000` - Local Docusaurus development server
- `https://ai-spec-driven-book-delta.vercel.app` - Production Docusaurus site

## Implementation Details

### Environment Configuration
The CORS origins are configured in the `.env` file using the `CORS_ORIGINS` variable:
```
CORS_ORIGINS=http://localhost:3000,https://ai-spec-driven-book-delta.vercel.app
```

### FastAPI Middleware
The CORS middleware is implemented in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Settings Validation
The `settings.py` file includes a validator to properly parse comma-separated origins:
```python
@field_validator('cors_origins', mode='before')
@classmethod
def parse_cors_origins(cls, v):
    """Parse comma-separated string to list of origins"""
    if isinstance(v, str):
        if v == '*' or v == '':
            return ['*']
        else:
            return [origin.strip() for origin in v.split(',')]
    elif isinstance(v, list):
        return v  # Already a list, return as is
    return v
```

## Acceptance Criteria Verification
- ✅ Browser can POST http://localhost:8000/chat from http://localhost:3000 with no CORS errors
- ✅ Preflight OPTIONS /chat returns correct Access-Control-Allow-Origin header
- ✅ Production site can make requests to the backend
- ✅ Security is maintained by not allowing all origins in production

## Testing
To test the configuration:
1. Start the backend server: `uvicorn main:app --reload --host 0.0.0.0 --port 8000`
2. Make requests from allowed origins to verify CORS headers are returned correctly