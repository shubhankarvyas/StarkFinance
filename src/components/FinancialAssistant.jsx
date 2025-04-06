import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Box,
  Avatar,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Fade,
  Zoom,
  Fab,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { saveChatMessage, getChatHistory, clearChatHistory } from '../services/chatHistory';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HistoryIcon from '@mui/icons-material/History';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';

// Quick suggestions for financial guidance
const quickSuggestions = [
  "How can I start investing with little money?",
  "What's the best way to save for retirement?",
  "How do I create a monthly budget?",
  "Should I pay off debt or invest first?",
  "How can I improve my credit score?"
];

// Welcome message constant
const WELCOME_MESSAGE = {
  type: 'assistant',
  content: "👋 Hi! I'm Vision, your personal financial guide. Whether you're looking to grow your wealth, plan for the future, or make smarter money decisions, I'm here to help with personalized advice tailored just for you. What's on your mind today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  id: 'welcome-message'
};

const FinancialAssistant = () => {
  const { user } = useAuth();
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputState, setInputState] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [error, setError] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Refs
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Save message to database
  useEffect(() => {
    const saveMessage = async () => {
      if (messages.length > 1 && user?.uid) {
        const lastMessage = messages[messages.length - 1];

        // Skip welcome message and already saved messages
        if ((lastMessage.type === 'user' || lastMessage.type === 'assistant') && !lastMessage.savedFlag) {
          try {
            await saveChatMessage(user.uid, {
              ...lastMessage,
              createdAt: lastMessage.createdAt || new Date().toISOString()
            });

            // Mark as saved
            setMessages(prev =>
              prev.map((msg, idx) =>
                idx === prev.length - 1 ? { ...msg, savedFlag: true } : msg
              )
            );
          } catch (err) {
            console.error('Error saving message:', err);
            setError('Failed to save message. Please try again.');
          }
        }
      }
    };

    saveMessage();
  }, [messages, user?.uid]);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user?.uid) {
        setMessages([WELCOME_MESSAGE]);
        return;
      }

      setIsLoadingHistory(true);

      try {
        if (showHistory) {
          const history = await getChatHistory(user.uid);

          if (history?.messages?.length > 0) {
            // Format timestamps
            const formattedMessages = history.messages.map(msg => ({
              id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: msg.type || 'assistant',
              content: msg.content || msg.text || '',
              timestamp: new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              createdAt: new Date(msg.createdAt || msg.timestamp).toISOString(),
              savedFlag: true
            }));

            // Sort by timestamp
            formattedMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            setMessages([WELCOME_MESSAGE, ...formattedMessages]);

            // Scroll to bottom after render
            setTimeout(() => scrollToBottom(), 100);
          } else {
            setMessages([WELCOME_MESSAGE]);
          }
        } else {
          setMessages([WELCOME_MESSAGE]);
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
        setError('Failed to load chat history. Please try again.');
        setMessages([WELCOME_MESSAGE]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [user?.uid, showHistory]);

  // Handle scroll events
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 50;
      setShowScrollButton(isScrolledUp);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && !showScrollButton) {
      scrollToBottom();
    }
  }, [messages, showScrollButton]);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      },
      () => {
        setCopySuccess('Failed to copy');
        setTimeout(() => setCopySuccess(''), 2000);
      }
    );
  };

  // Clear chat history
  const handleClearHistory = async () => {
    if (!user?.uid) return;

    if (window.confirm("Are you sure you want to clear your chat history? This action cannot be undone.")) {
      try {
        await clearChatHistory(user.uid);
        setMessages([WELCOME_MESSAGE]);
        setError('');
      } catch (err) {
        console.error('Error clearing chat history:', err);
        setError('Failed to clear chat history. Please try again.');
      }
    }
  };

  // Start a new conversation
  const refreshConversation = () => {
    if (window.confirm("Are you sure you want to start a new conversation? This will clear the current chat.")) {
      setMessages([WELCOME_MESSAGE]);
      setInputState('');
      setError('');
    }
  };

  // Send message
  const handleSend = async () => {
    const input = inputState.trim();
    if (!input || isTyping) return;

    // Add user message
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputState('');
    setIsTyping(true);
    setError('');

    try {
      // Get API key
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing. Please check your environment variables.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      // Create conversation context from recent messages
      const context = messages
        .slice(-5)
        .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const prompt = `You are a friendly and knowledgeable financial advisor named Vision. Based on this conversation history:

${context}

User: ${input}

Provide a warm, engaging response with actionable financial advice. Use 1-2 emojis and Markdown formatting like **bold** or *italic* when appropriate.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      // Create assistant response
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.text(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Scroll to bottom
      setTimeout(() => scrollToBottom(), 100);

    } catch (err) {
      console.error('Error:', err);

      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `I apologize, but I encountered an error. Please try again or rephrase your question.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };

      setError(err.message || 'An error occurred while processing your request');
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Keyboard shortcuts
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Handle suggestion clicks
  const handleSuggestionClick = (suggestion) => {
    setInputState(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Message Bubble component
  const MessageBubble = ({ message }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        mb: 2,
        flexDirection: message.type === 'user' ? 'row-reverse' : 'row'
      }}
    >
      <Avatar
        sx={{
          bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
          mx: 1,
          width: 40,
          height: 40
        }}
      >
        {message.type === 'user' ?
          <PersonIcon /> :
          <SmartToyIcon />
        }
      </Avatar>
      <Box sx={{ maxWidth: '70%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: message.type === 'user' ? 'primary.light' : 'background.paper',
            color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
            borderLeft: message.type === 'assistant' ? '4px solid' : 'none',
            borderColor: message.type === 'assistant' ? 'secondary.main' : 'transparent',
            position: 'relative'
          }}
        >
          {message.type === 'assistant' ? (
            <Box sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </Box>
          ) : (
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}
            >
              {message.content}
            </Typography>
          )}

          {message.type === 'assistant' && (
            <Box sx={{ position: 'absolute', right: 8, bottom: 8 }}>
              <Tooltip title={copySuccess || "Copy to clipboard"}>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(message.content)}
                  sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Paper>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            ml: message.type === 'user' ? 'auto' : '2px',
            mt: 0.5,
            display: 'block',
            textAlign: message.type === 'user' ? 'right' : 'left',
            fontStyle: 'italic'
          }}
        >
          {message.type === 'user' ? 'You' : 'Vision'} • {message.timestamp}
        </Typography>
      </Box>
    </Box>
  );

  // Authentication check
  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Please sign in to access the Financial Assistant
        </Alert>
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        height: { xs: '90vh', sm: '80vh' },
        display: 'flex',
        flexDirection: 'column',
        borderRadius: { xs: 0, sm: 3 },
        position: 'relative',
        bgcolor: 'background.default',
        mx: { xs: -2, sm: 0 },
        width: { xs: '100vw', sm: 'auto' }
      }}
    >
      {/* Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: { xs: 1, sm: 2 },
        pb: { xs: 1, sm: 2 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexWrap: { xs: 'wrap', sm: 'nowrap' }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: 'secondary.main',
              mr: 2,
              width: 48,
              height: 48
            }}
          >
            <SmartToyIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Vision
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your Personal Finance Guide
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Toggle chat history">
            <IconButton
              onClick={() => setShowHistory(!showHistory)}
              color={showHistory ? "secondary" : "default"}
              disabled={isLoadingHistory}
            >
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Start a new conversation">
            <IconButton
              onClick={refreshConversation}
              color="primary"
              disabled={isLoadingHistory}
            >
              <AutorenewIcon />
            </IconButton>
          </Tooltip>
          {showHistory && (
            <Tooltip title="Clear chat history">
              <IconButton
                onClick={handleClearHistory}
                color="error"
                disabled={isLoadingHistory}
              >
                <HistoryIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Chat container */}
      <Box
        ref={chatContainerRef}
        sx={{
          flex: 1,
          mb: 2,
          overflowY: 'auto',
          px: 2,
        }}
      >
        {isLoadingHistory ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
          }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {isTyping && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 6,
              mb: 2
            }}
          >
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Vision is thinking...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
      </Box>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <Zoom in={showScrollButton}>
          <Fab
            color="primary"
            size="small"
            onClick={scrollToBottom}
            sx={{
              position: 'absolute',
              bottom: 100,
              right: 20,
              zIndex: 2
            }}
          >
            <ArrowDownwardIcon />
          </Fab>
        </Zoom>
      )}

      {/* Quick suggestions */}
      <Box sx={{
        mb: 2,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
        justifyContent: 'center',
        px: { xs: 1, sm: 0 },
        '& .MuiChip-root': {
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          height: { xs: 28, sm: 32 }
        }
      }}>
        {quickSuggestions.map((suggestion, index) => (
          <Chip
            key={index}
            label={suggestion}
            clickable
            color="primary"
            variant="outlined"
            onClick={() => handleSuggestionClick(suggestion)}
            icon={<TipsAndUpdatesIcon />}
            sx={{
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }
            }}
          />
        ))}
      </Box>

      {/* Input area */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        p: { xs: 0.5, sm: 1 },
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider',
        mx: { xs: 1, sm: 0 },
        mt: { xs: 'auto', sm: 0 }
      }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          variant="standard"
          placeholder="Ask Vision about your finances..."
          value={inputState}
          onChange={(e) => setInputState(e.target.value)}
          onKeyDown={handleKeyPress}
          multiline
          maxRows={4}
          disabled={isTyping}
          InputProps={{
            disableUnderline: true,
            sx: { p: 1 }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!inputState.trim() || isTyping}
          sx={{
            bgcolor: inputState.trim() && !isTyping ? 'primary.main' : 'grey.300',
            color: inputState.trim() && !isTyping ? 'white' : 'grey.500',
            '&:hover': {
              bgcolor: inputState.trim() && !isTyping ? 'primary.dark' : 'grey.400',
            },
            borderRadius: '50%',
            width: 48,
            height: 48
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default FinancialAssistant;