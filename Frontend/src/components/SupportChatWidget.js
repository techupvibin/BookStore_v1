import React, { useState, useContext } from 'react';
import { Box, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Paper, useTheme } from '@mui/material';
import { Chat as ChatIcon, Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import { ThemeContext } from './AppThemeProvider';
import ThemeAwareCaption from './ThemeAwareCaption';

const SupportChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you today?", sender: 'support', timestamp: new Date() }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  // Get theme context and Material-UI theme
  const theme = useTheme();
  const { appearance } = useContext(ThemeContext);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: newMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages([...messages, userMessage]);
      setNewMessage('');
      
      // Simulate support response
      setTimeout(() => {
        const supportMessage = {
          id: messages.length + 2,
          text: "Thank you for your message. Our support team will get back to you soon!",
          sender: 'support',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, supportMessage]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="support chat"
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <ChatIcon />
      </Fab>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '70vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText
        }}>
          <Typography variant="h6">Support Chat</Typography>
          <Button
            onClick={() => setOpen(false)}
            sx={{ color: theme.palette.primary.contrastText, minWidth: 'auto' }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ 
          flex: 1, 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default
        }}>
          <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
            {messages.map((message) => (
              <Paper
                key={message.id}
                sx={{
                  p: 1.5,
                  mb: 1,
                  maxWidth: '80%',
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: message.sender === 'user' 
                    ? theme.palette.primary.main 
                    : theme.palette.mode === 'dark' 
                      ? theme.palette.grey[800] 
                      : theme.palette.grey[100],
                  color: message.sender === 'user' 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.text.primary,
                  ml: message.sender === 'user' ? 'auto' : 0,
                  mr: message.sender === 'user' ? 0 : 'auto',
                }}
              >
                <Typography variant="body2">{message.text}</Typography>
                <ThemeAwareCaption 
                  variant="timestamp"
                  sx={{ 
                    display: 'block',
                    mt: 0.5,
                    color: message.sender === 'user' 
                      ? theme.palette.primary.contrastText 
                      : theme.palette.text.secondary
                  }}
                >
                  {message.timestamp.toLocaleTimeString()}
                </ThemeAwareCaption>
              </Paper>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: theme.palette.text.secondary,
                  opacity: 1,
                },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <SendIcon />
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupportChatWidget;
