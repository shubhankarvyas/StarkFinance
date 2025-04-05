import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    IconButton,
    Collapse,
    TextField,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    useTheme,
    CircularProgress,
    Zoom,
    Fade
} from '@mui/material';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { saveChatMessage, getChatHistory } from '../services/chatHistory';

const AIAssistant = () => {
    const theme = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isBotVisible, setIsBotVisible] = useState(true);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                const { messages: historicalMessages } = await getChatHistory();
                if (historicalMessages.length === 0) {
                    setMessages([{
                        text: 'Hi! I\'m your AI assistant. How can I help you today?',
                        sender: 'ai'
                    }]);
                } else {
                    setMessages(historicalMessages);
                }
            } catch (error) {
                console.error('Error loading chat history:', error);
                setMessages([{
                    text: 'Hi! I\'m your AI assistant. How can I help you today?',
                    sender: 'ai'
                }]);
            } finally {
                setIsLoading(false);
            }
        };

        loadChatHistory();
        const timer = setTimeout(() => setIsBotVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input.trim(), sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

            const context = messages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
            const prompt = `You are a helpful AI assistant. Based on this conversation:\n${context}\n\nUser: ${input.trim()}\n\nProvide a concise and helpful response.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;

            setMessages(prev => [...prev, {
                text: response.text(),
                sender: 'ai'
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                text: 'I apologize, but I encountered an error. Please try again.',
                sender: 'ai'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                right: 20,
                bottom: 90,
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
            }}
        >
            <Collapse in={isOpen} sx={{ mb: 1 }} timeout={300}>
                <Paper
                    elevation={3}
                    sx={{
                        width: 380,
                        height: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        borderRadius: 2,
                        bgcolor: 'transparent',
                        background: theme.palette.mode === 'dark'
                            ? `linear-gradient(145deg, rgba(18, 18, 18, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)`
                            : `linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 245, 0.95) 100%)`,
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(255,255,255,0.08)'
                            : '0 8px 32px rgba(0,0,0,0.08)',
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <SmartToyIcon sx={{ color: theme.palette.primary.main }} />
                            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                AI Assistant
                            </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => setIsOpen(false)}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                    <Box
                        ref={chatContainerRef}
                        sx={{
                            flex: 1,
                            overflow: 'auto',
                            p: 2,
                            scrollBehavior: 'smooth',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                borderRadius: '4px',
                                '&:hover': {
                                    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                                },
                            },
                        }}
                    >
                        <List
                            sx={{
                                width: '100%',
                                bgcolor: 'background.paper',
                                p: 2,
                                '& .MuiListItem-root': {
                                    px: 1,
                                    py: 0.5,
                                },
                            }}
                        >
                            {messages.map((message, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                                    }}
                                >
                                    <ListItemAvatar sx={{ minWidth: 40 }}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                bgcolor: message.sender === 'user' ? 'primary.main' : 'secondary.main',
                                            }}
                                        >
                                            {message.sender === 'user' ? 'U' : <SmartToyIcon />}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    bgcolor: 'transparent',
                                                    background: message.sender === 'user'
                                                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                                                        : theme.palette.mode === 'dark'
                                                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%)'
                                                            : 'linear-gradient(135deg, rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.01) 100%)',
                                                    color: message.sender === 'user' ? 'white' : theme.palette.text.primary,
                                                    p: 2.5,
                                                    borderRadius: 3,
                                                    display: 'inline-block',
                                                    maxWidth: '85%',
                                                    boxShadow: message.sender === 'user'
                                                        ? '0 8px 25px rgba(0,0,0,0.2)'
                                                        : '0 4px 15px rgba(0,0,0,0.05)',
                                                    animation: 'fadeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                                    '@keyframes fadeIn': {
                                                        from: { opacity: 0, transform: 'translateY(10px) scale(0.98)' },
                                                        to: { opacity: 1, transform: 'translateY(0) scale(1)' }
                                                    }
                                                }}
                                            >
                                                {message.text}
                                            </Typography>
                                        }
                                    />
                                    {isTyping && message === messages[messages.length - 1] && message.sender === 'ai' && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                                            <CircularProgress size={16} thickness={6} />
                                        </Box>
                                    )}
                                </ListItem>
                            ))}
                            <div ref={messagesEndRef} />
                        </List>
                    </Box>
                    <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Ask me anything about finance..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                        borderColor: 'primary.main'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }
                                }
                            }}
                            InputProps={{
                                endAdornment: (
                                    <IconButton
                                        size="small"
                                        onClick={handleSend}
                                        sx={{
                                            color: 'primary.main',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                                transform: 'scale(1.1) rotate(5deg)',
                                                color: 'primary.dark'
                                            }
                                        }}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                ),
                            }}
                        />
                    </Box>
                </Paper>
            </Collapse>

            <Zoom in={isBotVisible} timeout={500}>
                <IconButton
                    onClick={() => setIsOpen(!isOpen)}
                    sx={{
                        width: 65,
                        height: 65,
                        bgcolor: 'transparent',
                        background: theme.palette.mode === 'dark'
                            ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                        color: 'white',
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 8px 32px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.1)'
                            : '0 8px 32px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.2)',
                        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isOpen ? 'rotate(135deg) scale(1.1)' : 'rotate(0)',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            background: theme.palette.mode === 'dark'
                                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`
                                : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                            transform: isOpen ? 'rotate(180deg) scale(1.2)' : 'rotate(-45deg) scale(1.15)',
                            boxShadow: theme.palette.mode === 'dark'
                                ? '0 12px 45px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.15)'
                                : '0 12px 45px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.25)',
                            filter: 'brightness(1.1)'
                        },
                        '&:active': {
                            transform: 'scale(0.95)'
                        }
                    }}
                >
                    <SmartToyIcon sx={{ fontSize: 28 }} />
                </IconButton>
            </Zoom>
        </Box >
    );
};

export default AIAssistant;