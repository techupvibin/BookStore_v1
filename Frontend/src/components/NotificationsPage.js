import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Chip,
  Button,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Package,
  CreditCard,
  DollarSign,
  AlertCircle,
  Info,
  Check,
  X,
  ExternalLink,
  Clock
} from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';

const NotificationsPage = () => {
  const { notifications, markAsRead, clearAll } = useNotifications();
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PAYMENT_SUCCESS':
        return <CreditCard className="notification-icon success" />;
      case 'PAYMENT_FAILURE':
        return <AlertCircle className="notification-icon error" />;
      case 'PAYMENT_PROCESSING':
        return <DollarSign className="notification-icon processing" />;
      case 'ORDER_STATUS_UPDATE':
        return <Package className="notification-icon info" />;
      case 'ORDER_CREATED':
        return <Package className="notification-icon success" />;
      case 'REFUND_PROCESSED':
        return <DollarSign className="notification-icon success" />;
      default:
        return <Info className="notification-icon info" />;
    }
  };

  const getStatusColor = (type) => {
    switch (type) {
      case 'PAYMENT_SUCCESS':
      case 'ORDER_CREATED':
      case 'REFUND_PROCESSED':
        return 'success';
      case 'PAYMENT_FAILURE':
        return 'error';
      case 'PAYMENT_PROCESSING':
        return 'warning';
      case 'ORDER_STATUS_UPDATE':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to relevant page based on notification type
    if (notification.metadata?.trackingUrl) {
      navigate(notification.metadata.trackingUrl);
    } else if (notification.type === 'ORDER_STATUS_UPDATE' || notification.type === 'ORDER_CREATED') {
      navigate('/order-history');
    } else if (notification.type.includes('PAYMENT')) {
      navigate('/order-history');
    }
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markAsRead(notification.id);
      }
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Notifications
          {unreadCount > 0 && (
            <Chip 
              label={unreadCount} 
              color="primary" 
              size="small" 
              sx={{ ml: 2 }}
            />
          )}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleMarkAllAsRead}
              startIcon={<Check size={16} />}
            >
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              onClick={clearAll}
              startIcon={<X size={16} />}
              color="error"
            >
              Clear All
            </Button>
          )}
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {notifications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Info size={48} color={theme.palette.text.secondary} />
            <Typography variant="h6" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We'll notify you about important updates regarding your orders and account
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  disablePadding
                  sx={{
                    backgroundColor: notification.read ? 'transparent' : theme.palette.action.hover,
                    borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <ListItemButton
                    onClick={() => handleNotificationClick(notification)}
                    sx={{ p: 2 }}
                  >
                    <ListItemIcon sx={{ minWidth: 48 }}>
                      {getNotificationIcon(notification.type)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: notification.read ? 'normal' : 'bold',
                              color: notification.read ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {notification.title}
                          </Typography>
                          <Chip
                            label={notification.type.replace('_', ' ')}
                            size="small"
                            color={getStatusColor(notification.type)}
                            variant="outlined"
                          />
                          {!notification.read && (
                            <Chip
                              label="New"
                              size="small"
                              color="primary"
                              variant="filled"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {notification.message}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Clock size={14} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary">
                              {formatTimestamp(notification.timestamp)}
                            </Typography>
                            
                            {notification.metadata?.actionText && (
                              <>
                                <Typography variant="caption" color="text.secondary">
                                  •
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <ExternalLink size={12} color={theme.palette.primary.main} />
                                  <Typography 
                                    variant="caption" 
                                    color="primary"
                                    sx={{ cursor: 'pointer' }}
                                  >
                                    {notification.metadata.actionText}
                                  </Typography>
                                </Box>
                              </>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    
                    {!notification.read && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          sx={{ ml: 1 }}
                        >
                          <Check size={16} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemButton>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default NotificationsPage;
