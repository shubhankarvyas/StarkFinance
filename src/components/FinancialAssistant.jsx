import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
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

// Welcome message constant to ensure consistency
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
  const [autoScrollDisabled, setAutoScrollDisabled] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef(messages);
  const typingTimeoutRef = useRef(null);
  const animationTimeoutsRef = useRef([]);

  // Update messagesRef whenever messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Message saving logic with proper error handling and retry
  useEffect(() => {
    const saveMessage = async () => {
      if (messages.length > 1 && user?.uid) {
        const lastMessage = messages[messages.length - 1];

        // Skip welcome message and history toggle indicators
        if (lastMessage.type === 'user' || (lastMessage.type === 'assistant' && messages[messages.length - 2]?.type === 'user')) {
          // Skip if the message already has a savedFlag to prevent repeated save attempts
          if (lastMessage.savedFlag) return;

          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              await saveChatMessage(user.uid, {
                ...lastMessage,
                // Ensure consistent format for timestamp and createdAt
                createdAt: lastMessage.createdAt || new Date().toISOString()
              });

              // Mark as saved by updating the messages array
              setMessages(prev =>
                prev.map((msg, idx) =>
                  idx === prev.length - 1 ? { ...msg, savedFlag: true } : msg
                )
              );

              if (error) setError(''); // Clear any previous errors
              break;
            } catch (err) {
              console.error(`Error saving message (attempt ${retryCount + 1}):`, err);
              retryCount++;

              if (retryCount === maxRetries) {
                const errorMessage = err.code === 'permission-denied'
                  ? 'Permission denied: Unable to save message. Please check your connection and try again.'
                  : 'Failed to save message. Please try again.';
                setError(errorMessage);
              } else {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
              }
            }
          }
        }
      }
    };

    saveMessage();
  }, [messages, user?.uid, error]);

  // Improved history loading with proper state management
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user?.uid) return;

      // Start with loading state
      setIsLoadingHistory(true);

      // Clear existing timeouts
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimeoutsRef.current = [];

      try {
        // Reset auto-scroll when toggling history
        setAutoScrollDisabled(false);

        if (showHistory) {
          // Fetch history
          const history = await getChatHistory(user.uid);

          if (history?.messages?.length > 0) {
            // Create a consistent timestamp parser
            const getTimestamp = (msg) => {
              // Try to get a standardized timestamp
              if (msg.createdAt) {
                return new Date(msg.createdAt);
              }
              if (typeof msg.timestamp === 'string') {
                // Try to parse the timestamp string
                try {
                  return new Date(msg.timestamp);
                } catch (e) {
                  console.warn("Failed to parse timestamp string:", msg.timestamp);
                }
              } else if (msg.timestamp instanceof Date) {
                return msg.timestamp;
              }
              // Default to a very old date to put unreadable timestamps at the beginning
              return new Date(0);
            };

            // Sort messages chronologically
            const sortedMessages = [...history.messages].sort((a, b) => {
              return getTimestamp(a) - getTimestamp(b);
            });

            // More reliable deduplication based on content+timestamp+type
            const seen = new Set();
            const uniqueMessages = sortedMessages.filter(msg => {
              // If it has an ID, use that as the unique key
              if (msg.id) {
                if (seen.has(msg.id)) return false;
                seen.add(msg.id);
                return true;
              }

              // Create a unique key from content + type + approximate timestamp
              const timestamp = getTimestamp(msg);
              const contentKey = `${msg.type}:${msg.content || msg.text || ''}:${timestamp.getHours()}:${timestamp.getMinutes()}`;

              if (seen.has(contentKey)) return false;
              seen.add(contentKey);
              return true;
            });

            // Format messages consistently
            const formattedMessages = uniqueMessages.map(msg => {
              const timestamp = getTimestamp(msg);
              return {
                id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: msg.type || 'assistant',
                content: msg.content || msg.text || '',
                timestamp: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                createdAt: timestamp.toISOString(),
                savedFlag: true // Mark as already saved
              };
            });

            // Update state with welcome message + history
            setMessages([WELCOME_MESSAGE, ...formattedMessages]);

            // Ensure scrolling to bottom happens after render
            requestAnimationFrame(() => {
              if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
              }
            });
          } else {
            // No history found
            setMessages([WELCOME_MESSAGE]);
          }
        } else {
          // Reset to just welcome message when history is toggled off
          setMessages([WELCOME_MESSAGE]);
        }
      } catch (err) {
        console.error('Error loading chat history:', err);
        setError('Failed to load chat history. Please try again.');
        // Reset to welcome message on error
        setMessages([WELCOME_MESSAGE]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [user?.uid, showHistory]);

  // Function to clear chat history with confirmation
  const handleClearHistory = useCallback(async () => {
    if (!user?.uid) return;

    if (window.confirm("Are you sure you want to clear your chat history? This action cannot be undone.")) {
      try {
        await clearChatHistory(user.uid);
        setMessages([WELCOME_MESSAGE]); // Reset to just the welcome message
        setError('');
        // Provide feedback
        setMessages([
          WELCOME_MESSAGE,
          {
            type: 'assistant',
            content: "Your chat history has been cleared.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            id: `system-${Date.now()}`,
            isNew: true
          }
        ]);

        // Remove the "isNew" flag after animation
        const timeout = setTimeout(() => {
          setMessages(prev =>
            prev.map(msg => ({ ...msg, isNew: false }))
          );
        }, 1000);
        animationTimeoutsRef.current.push(timeout);
      } catch (err) {
        console.error('Error clearing chat history:', err);
        setError('Failed to clear chat history. Please try again.');
      }
    }
  }, [user?.uid]);

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

  // Enhanced scroll position tracking with improved stability and performance
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    let scrollTimeout;
    let lastScrollTop = chatContainer.scrollTop;
    let lastScrollUpdate = 0;
    const scrollThreshold = 100; // Optimized threshold for better responsiveness
    const updateThreshold = 30; // Reduced threshold for smoother updates
    const debounceDelay = 50; // Optimized debounce delay
    let isScrolling = false;
    let rafId;
    let scrollEndTimeout;

    const updateScrollState = (scrollTop, scrollHeight, clientHeight) => {
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > scrollThreshold;
      const scrollDiff = Math.abs(scrollTop - lastScrollTop);

      if (!isLoadingHistory && (scrollDiff > updateThreshold || (!isScrolledUp && autoScrollDisabled))) {
        setShowScrollButton(isScrolledUp);
        setAutoScrollDisabled(isScrolledUp);
        lastScrollTop = scrollTop;
      }
    };

    const handleScroll = () => {
      if (!chatContainer) return;

      const now = Date.now();
      if (now - lastScrollUpdate < 16) return; // Maintain 60fps limit
      lastScrollUpdate = now;

      // Clear existing timeouts
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
      if (rafId) cancelAnimationFrame(rafId);

      // Use RAF for smooth updates
      rafId = requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer;
        updateScrollState(scrollTop, scrollHeight, clientHeight);
      });

      // Reset scroll state after delay
      scrollEndTimeout = setTimeout(() => {
        isScrolling = false;
        if (rafId) cancelAnimationFrame(rafId);
      }, debounceDelay);
    };

    const debouncedScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        handleScroll();
      }
    };

    // Use passive listener for better performance
    chatContainer.addEventListener('scroll', debouncedScroll, { passive: true });

    return () => {
      chatContainer.removeEventListener('scroll', debouncedScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      if (scrollEndTimeout) clearTimeout(scrollEndTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [autoScrollDisabled, isLoadingHistory]);

  // Enhanced auto-scroll behavior with smooth animation
  useEffect(() => {
    if (messages.length > 0 && !autoScrollDisabled) {
      let scrollFrame;
      let startTime;
      let startScroll;

      const smoothScrollToBottom = (timestamp) => {
        if (!startTime) {
          startTime = timestamp;
          if (chatContainerRef.current) {
            startScroll = chatContainerRef.current.scrollTop;
          }
        }

        if (chatContainerRef.current) {
          const { scrollHeight, clientHeight } = chatContainerRef.current;
          const maxScroll = scrollHeight - clientHeight;
          const elapsed = timestamp - startTime;
          const duration = 300; // Animation duration in ms

          if (elapsed < duration) {
            // Smooth easing function
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
            const targetScroll = startScroll + (maxScroll - startScroll) * easeProgress;

            chatContainerRef.current.scrollTop = targetScroll;
            scrollFrame = requestAnimationFrame(smoothScrollToBottom);
          } else {
            // Ensure we reach the exact bottom
            chatContainerRef.current.scrollTop = maxScroll;
          }
        }
      };

      // Start the smooth scroll animation
      scrollFrame = requestAnimationFrame(smoothScrollToBottom);

      return () => {
        if (scrollFrame) {
          cancelAnimationFrame(scrollFrame);
        }
      };
    }
  }, [messages, autoScrollDisabled]);

  // Handle scroll to bottom button click with smooth animation
  const handleScrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      const targetScroll = scrollHeight - clientHeight;

      chatContainerRef.current.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });

      setShowScrollButton(false);
      setAutoScrollDisabled(false);
    }
  }, []);

  // Error recovery for typing state
  useEffect(() => {
    // Clear any existing timeout to prevent leaks
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      // Auto-reset typing state after 15 seconds (shortened for better UX)
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        setError('Response took too long. Please try again.');
      }, 15000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping]);

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Input change handler with debounce
  const handleInputChange = useCallback((e) => {
    e.stopPropagation(); // Prevent event bubbling
    setInputState(e.target.value);
  }, []);

  // Copy to clipboard with proper feedback
  const copyToClipboard = useCallback((text) => {
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
  }, []);

  // More reliable message sending logic
  const handleSend = useCallback(async () => {
    const input = inputState.trim();
    if (!input || isTyping) return;

    // Generate unique ID for message
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add user message with consistent format and unique ID
    const userMessage = {
      id: `user-${messageId}`,
      type: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    };

    // Update state using functional update to avoid stale closure issues
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputState('');
    setIsTyping(true);
    setError('');

    // Reset auto-scroll when sending new message
    setAutoScrollDisabled(false);

    try {
      // Ensure API key is available
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key is missing. Please check your environment variables.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

      // Get current messages for context
      const currentMessages = messagesRef.current;

      // Create conversation context
      const context = currentMessages
        .slice(-10) // Limit context window to 10 most recent messages
        .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      const prompt = `You are a friendly and knowledgeable financial advisor named Vision having a natural conversation. Based on this conversation history:

${context}

User: ${input}

Provide a warm, engaging response that feels personal and conversational while maintaining professional accuracy. Include specific examples, relatable analogies, and actionable steps when relevant. If discussing investments, include brief market context and risk disclaimers naturally in the conversation.

Use emojis occasionally (1-2 per response) to make the conversation more engaging. Break down complex financial concepts into simple terms.

When you want to emphasize text, use Markdown format like **bold text** or *italic text*.

If you don't know something or if it's outside your expertise, clearly state that instead of making up information.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;

      // Create assistant response with consistent format and unique ID
      const assistantMessage = {
        id: `assistant-${messageId}`,
        type: 'assistant',
        content: response.text(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString(),
        isNew: true
      };

      // Update messages using functional update
      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      // Force scroll to bottom after message is added
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          setShowScrollButton(false);
          setAutoScrollDisabled(false);
        }
      });

      // Remove the "isNew" flag after animation completes
      const timeout = setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id ? { ...msg, isNew: false } : msg
          )
        );
      }, 1000);
      animationTimeoutsRef.current.push(timeout);

    } catch (err) {
      console.error('Error:', err);

      // Create error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `I apologize, but I encountered an error while processing your request. ${err.message ? `Error details: ${err.message}` : 'Please try again or rephrase your question.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date().toISOString()
      };

      setError(err.message || 'An error occurred while processing your request');
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [inputState, isTyping]);

  // Handle keyboard shortcuts 
  const handleKeyPress = useCallback((event) => {
    event.stopPropagation(); // Prevent event bubbling
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    } else if (event.key === 'Escape') {
      // Clear input on Escape
      setInputState('');
    }
  }, [handleSend]);

  // Handle suggestion clicks
  const handleSuggestionClick = useCallback((suggestion) => {
    setInputState(suggestion);
    // Focus the input after setting suggestion
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Start a new conversation
  const refreshConversation = useCallback(() => {
    if (window.confirm("Are you sure you want to start a new conversation? This will clear the current chat.")) {
      // Clear animation timeouts
      animationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      animationTimeoutsRef.current = [];

      const newWelcomeMessage = {
        ...WELCOME_MESSAGE,
        id: `welcome-${Date.now()}`,
        isNew: true
      };

      setMessages([newWelcomeMessage]);
      setInputState('');
      setError('');
      setAutoScrollDisabled(false);

      // Remove animation flag after delay
      const timeout = setTimeout(() => {
        setMessages(prev =>
          prev.map(msg => ({ ...msg, isNew: false }))
        );
      }, 1000);
      animationTimeoutsRef.current.push(timeout);
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      requestAnimationFrame(() => {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        setShowScrollButton(false);
        setAutoScrollDisabled(false);
      });
    }
  }, []);

  // Optimized MessageBubble component
  const MessageBubble = useMemo(() => React.memo(({ message, style }) => (
    <Zoom in={true} appear={message.isNew} style={{ transitionDelay: message.isNew ? '150ms' : '0ms' }}>
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
            height: 40,
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            },
            animation: message.isNew ? 'pulse 2s infinite' : 'none',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(104, 159, 56, 0.7)'
              },
              '70%': {
                boxShadow: '0 0 0 10px rgba(104, 159, 56, 0)'
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(104, 159, 56, 0)'
              }
            }
          }}
        >
          {message.type === 'user' ?
            <PersonIcon sx={{ fontSize: 24 }} /> :
            <SmartToyIcon sx={{ fontSize: 24 }} />
          }
        </Avatar>
        <Box sx={{ position: 'relative', maxWidth: '70%' }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: message.type === 'user' ? 'primary.light' : 'background.paper',
              color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
              boxShadow: message.isNew
                ? '0 0 15px rgba(104, 159, 56, 0.5)'
                : '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
              },
              borderLeft: message.type === 'assistant' ? '4px solid' : 'none',
              borderColor: message.type === 'assistant' ? 'secondary.main' : 'transparent',
            }}
          >
            {message.type === 'assistant' ? (
              <Box
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontSize: '1rem',
                  fontWeight: message.isNew ? 500 : 400,
                  '& strong': { fontWeight: 700 },
                  '& em': { fontStyle: 'italic' }
                }}
              >
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Box>
            ) : (
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                  fontSize: '1rem',
                  fontWeight: message.isNew ? 500 : 400,
                }}
              >
                {message.content}
              </Typography>
            )}
            {message.type === 'assistant' && (
              <Fade in={true}>
                <Box sx={{ position: 'absolute', right: 8, bottom: 8 }}>
                  <Tooltip title={copySuccess || "Copy to clipboard"}>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(message.content)}
                      sx={{
                        opacity: 0.6,
                        '&:hover': {
                          opacity: 1,
                          backgroundColor: 'rgba(104, 159, 56, 0.1)'
                        }
                      }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Fade>
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
            {message.type === 'user' ? 'You' : 'Vision'} • {message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      </Box>
    </Zoom>
  ), (prevProps, nextProps) => {
    // Return true if nothing important changed (preventing re-render)
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.isNew === nextProps.message.isNew
    );
  }), [copyToClipboard, copySuccess]);

  // Virtualized message list with dynamic sizing
  const MessageListRenderer = useMemo(() => {
    if (messages.length === 0) return null;

    const Row = ({ index, style }) => (
      <MessageBubble
        message={messages[index]}
        style={style}
      />
    );

    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={messages.length}
            itemSize={150} // Approximate height of each message
            width={width}
            overscanCount={5} // Increased for smoother scrolling
            initialScrollOffset={messages.length * 150} // Start at the bottom
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    );
  }, [messages, MessageBubble]);

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        position: 'relative',
        bgcolor: 'background.default',
        overflow: 'hidden' // Important - prevent outer scrolling
      }}
    >
      {/* Header with actions */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
        pb: 2,
        borderBottom: '1px solid',
        borderColor: 'divider'
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
          px: 1,
          position: 'relative',
          height: '100%',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
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
          MessageListRenderer
        )}

        {isTyping && (
          <Fade in={isTyping}>
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
          </Fade>
        )}

        {error && (
          <Zoom in={!!error}>
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          </Zoom>
        )}

        {/* Hidden div for scroll reference */}
        <div ref={messagesEndRef} />
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
      <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
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
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            }}
          />
        ))}
      </Box>

      {/* Input area */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          variant="standard"
          placeholder="Ask Vision about your finances..."
          value={inputState}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          multiline
          maxRows={4}
          disabled={isTyping}
          InputProps={{
            disableUnderline: true,
            sx: {
              p: 1,
              fontSize: '1rem',
              '&.Mui-focused': {
                boxShadow: 'none'
              }
            }
          }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!inputState.trim() || isTyping}
          sx={{
            p: 1,
            bgcolor: inputState.trim() && !isTyping ? 'primary.main' : 'grey.300',
            color: inputState.trim() && !isTyping ? 'white' : 'grey.500',
            '&:hover': {
              bgcolor: inputState.trim() && !isTyping ? 'primary.dark' : 'grey.400',
            },
            transition: 'all 0.2s ease',
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