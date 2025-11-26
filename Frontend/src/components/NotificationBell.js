import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, AlertCircle, Info, CreditCard, Package, DollarSign, ExternalLink } from 'lucide-react';
import './NotificationBell.css';

const NotificationBell = () => {
    const { notifications, markAsRead, clearAll } = useNotifications();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Count unread notifications
        const count = notifications.filter(n => !n.read).length;
        setUnreadCount(count);
    }, [notifications]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = (notificationId) => {
        markAsRead(notificationId);
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
        
        // Close the dropdown
        setIsOpen(false);
    };

    const handleClearAll = () => {
        clearAll();
        setIsOpen(false);
    };

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

    const getNotificationClass = (type) => {
        switch (type) {
            case 'PAYMENT_SUCCESS':
            case 'ORDER_CREATED':
            case 'REFUND_PROCESSED':
                return 'notification-item success';
            case 'PAYMENT_FAILURE':
                return 'notification-item error';
            case 'PAYMENT_PROCESSING':
                return 'notification-item processing';
            case 'ORDER_STATUS_UPDATE':
                return 'notification-item info';
            default:
                return 'notification-item';
        }
    };

    return (
        <div className="notification-bell-container">
            {/* Notification Bell Button */}
            <button 
                className="notification-bell-button" 
                onClick={handleToggle}
                aria-label="Notifications"
            >
                <Bell className="bell-icon" />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="notification-dropdown">
                    <div className="notification-header">
                        <h3>Notifications</h3>
                        <div className="notification-actions">
                            {notifications.length > 0 && (
                                <button 
                                    className="clear-all-btn"
                                    onClick={handleClearAll}
                                >
                                    Clear All
                                </button>
                            )}
                            <button 
                                className="close-btn"
                                onClick={handleToggle}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="no-notifications">
                                <Bell className="no-notifications-icon" />
                                <p>No notifications yet</p>
                                <span>We'll notify you about important updates</span>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification.id} 
                                    className={`${getNotificationClass(notification.type)} ${notification.read ? 'read' : 'unread'}`}
                                    onClick={() => handleNotificationClick(notification)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="notification-content">
                                        {getNotificationIcon(notification.type)}
                                        <div className="notification-text">
                                            <h4>{notification.title}</h4>
                                            <p>{notification.message}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <span className="notification-time">
                                                    {new Date(notification.timestamp || Date.now()).toLocaleTimeString()}
                                                </span>
                                                {notification.metadata?.actionText && (
                                                    <>
                                                        <span style={{ color: '#666' }}>•</span>
                                                        <span style={{ 
                                                            color: '#1976d2', 
                                                            fontSize: '12px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px'
                                                        }}>
                                                            <ExternalLink size={10} />
                                                            {notification.metadata.actionText}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {!notification.read && (
                                        <button 
                                            className="mark-read-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarkAsRead(notification.id);
                                            }}
                                            title="Mark as read"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
