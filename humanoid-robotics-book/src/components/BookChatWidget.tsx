import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Array<{
    filename: string;
    heading_path?: string;
    source_url?: string;
  }>;
}

interface ChatResponse {
  session_id: string;
  answer: string;
  citations: Array<{
    filename: string;
    heading_path?: string;
    source_url?: string;
  }>;
}

interface BookChatWidgetProps {
  colorMode: 'light' | 'dark';
}

const BookChatWidget: React.FC<BookChatWidgetProps> = ({ colorMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [showSelectionButton, setShowSelectionButton] = useState(false);
  const [selectionButtonPosition, setSelectionButtonPosition] = useState({ x: 0, y: 0 });
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'offline'>('checking');

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Diagnostic log - only in browser and development
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === "development") {
      console.log("BookChatWidget render");
    }
  }, []);

  // Check backend health on component mount and periodically
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${(window as any).RAG_API_BASE_URL}/health`);
        if (response.ok) {
          setBackendStatus('connected');
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        setBackendStatus('offline');
        // Only show backend URL in development for debugging
        if (process.env.NODE_ENV === "development") {
          console.log(`Backend offline: tried to connect to ${(window as any).RAG_API_BASE_URL}`);
        }
      }
    };

    // Delay the initial health check slightly to allow the API URL to be set
    const initialTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).RAG_API_BASE_URL) {
        checkBackendHealth();
      }
    }, 100);

    // Set up interval to check health every 10 seconds
    const healthCheckInterval = setInterval(checkBackendHealth, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(healthCheckInterval);
    };
  }, []);

  // Load session from localStorage on component mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem('bookChatSessionId');
    const savedMessages = localStorage.getItem('bookChatMessages');

    if (savedSessionId) {
      setSessionId(savedSessionId);
    }

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Error parsing saved messages', e);
      }
    }

    // Add event listeners for text selection
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length >= 20) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionButtonPosition({ x: rect.left, y: rect.top - 10 });
        setShowSelectionButton(true);
        setSelectedText(selection.toString().trim());
      } else {
        setShowSelectionButton(false);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('bookChatMessages', JSON.stringify(messages));
  }, [messages]);

  // Save session ID to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('bookChatSessionId', sessionId);
    }
  }, [sessionId]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: selectionMode ? `Question: ${inputValue}\nSelection: ${selectedText}` : inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare request payload
      const requestPayload: any = {
        message: inputValue,
      };

      if (selectionMode) {
        requestPayload.selected_text = selectedText;
        requestPayload.page_url = typeof window !== 'undefined' ? window.location.href : '';
      }

      // Determine the API endpoint
      const response = await fetch(`${(window as any).RAG_API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      // Update session ID if new one was returned
      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
      }

      // Backend is clearly connected since we got a response
      setBackendStatus('connected');

      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer,
        citations: data.citations,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Exit selection mode after sending message
      if (selectionMode) {
        setSelectionMode(false);
        setSelectedText('');
        setShowSelectionButton(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Check if it's a network error (backend not available)
      if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Backend offline. Cannot send messages.',
        };
        setMessages(prev => [...prev, errorMessage]);
        setBackendStatus('offline'); // Update status to reflect backend is offline
      } else {
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectionButtonClick = () => {
    setSelectionMode(true);
    setShowSelectionButton(false);
    setInputValue('');
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('bookChatMessages');
  };

  return (
    <>
      {/* Selection button - appears when text is selected */}
      {showSelectionButton && (
        <div
          style={{
            position: 'fixed',
            left: `${selectionButtonPosition.x}px`,
            top: `${selectionButtonPosition.y}px`,
            zIndex: 100001, // Even higher z-index than main widget for selection button
            backgroundColor: colorMode === 'dark' ? '#2563eb' : '#3b82f6',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }}
          onClick={handleSelectionButtonClick}
        >
          Ask about selection
        </div>
      )}

      {/* Floating chat button - always renders in browser */}
      {!isOpen && (
        <button
          onClick={toggleWidget}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: colorMode === 'dark' ? '#2563eb' : '#3b82f6',
            color: 'white',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 200000,
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          }}
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      {/* Chat widget panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '400px',
            height: '500px',
            backgroundColor: colorMode === 'dark' ? '#1f2937' : '#ffffff',
            border: `1px solid ${colorMode === 'dark' ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 200000,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px',
              backgroundColor: colorMode === 'dark' ? '#374151' : '#f3f4f6',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '16px', color: colorMode === 'dark' ? '#f9fafb' : '#111827' }}>
              Book Assistant
            </h3>
            <div>
              {selectionMode && (
                <span
                  style={{
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    marginRight: '8px',
                  }}
                >
                  Selection Mode
                </span>
              )}
              <button
                onClick={clearChat}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colorMode === 'dark' ? '#9ca3af' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginRight: '8px',
                }}
                title="Clear chat"
              >
                🗑️
              </button>
              <button
                onClick={toggleWidget}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colorMode === 'dark' ? '#9ca3af' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
                title="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages container */}
          <div
            style={{
              flex: 1,
              padding: '12px',
              overflowY: 'auto',
              backgroundColor: colorMode === 'dark' ? '#111827' : '#f9fafb',
            }}
          >
            {messages.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  color: colorMode === 'dark' ? '#9ca3af' : '#6b7280',
                  fontStyle: 'italic',
                  marginTop: '20px',
                }}
              >
                {isLoading ? 'Connecting to backend...' :
                 backendStatus === 'checking' ? 'Checking connection...' :
                 backendStatus === 'connected' ?
                   (selectionMode
                     ? 'Ask a question about the selected text'
                     : 'Ask a question about the book content') :
                   'Backend offline'}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    marginBottom: '12px',
                    textAlign: message.role === 'user' ? 'right' : 'left',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '8px 12px',
                      borderRadius: '18px',
                      backgroundColor:
                        message.role === 'user'
                          ? colorMode === 'dark' ? '#3b82f6' : '#3b82f6'
                          : colorMode === 'dark' ? '#374151' : '#e5e7eb',
                      color: message.role === 'user' ? 'white' : colorMode === 'dark' ? '#f9fafb' : '#111827',
                      maxWidth: '80%',
                    }}
                  >
                    {message.content}
                  </div>

                  {/* Citations for assistant messages */}
                  {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '12px',
                        color: colorMode === 'dark' ? '#9ca3af' : '#6b7280',
                      }}
                    >
                      Sources:
                      <ul style={{ margin: '4px 0 0 0', padding: '0 0 0 16px' }}>
                        {message.citations.map((citation, index) => (
                          <li key={index}>
                            {citation.filename} {citation.heading_path && `(${citation.heading_path})`}
                            {citation.source_url && (
                              <a href={citation.source_url} target="_blank" rel="noopener noreferrer"
                                 style={{ color: colorMode === 'dark' ? '#60a5fa' : '#2563eb', marginLeft: '4px' }}>
                                [View]
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '12px',
              backgroundColor: colorMode === 'dark' ? '#1f2937' : '#ffffff',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
            }}
          >
            {selectionMode && (
              <div
                style={{
                  fontSize: '12px',
                  padding: '4px 8px',
                  marginBottom: '4px',
                  backgroundColor: colorMode === 'dark' ? '#374151' : '#e5e7eb',
                  borderRadius: '4px',
                  color: colorMode === 'dark' ? '#d1d5db' : '#4b5563',
                }}
              >
                Using selection: "{selectedText.substring(0, 50)}..."
              </div>
            )}
            <div style={{ display: 'flex' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={selectionMode ? "Ask about the selected text..." : "Ask about the book..."}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: `1px solid ${colorMode === 'dark' ? '#374151' : '#d1d5db'}`,
                  borderRadius: '18px',
                  backgroundColor: colorMode === 'dark' ? '#111827' : '#ffffff',
                  color: colorMode === 'dark' ? '#f9fafb' : '#111827',
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                style={{
                  marginLeft: '8px',
                  padding: '8px 16px',
                  backgroundColor: colorMode === 'dark' ? '#3b82f6' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '18px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.6 : 1,
                }}
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default BookChatWidget;