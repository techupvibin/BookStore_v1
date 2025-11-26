import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; // ⭐ CORRECTED: Use the modern @stomp/stompjs package
import { useAuth } from './AuthContext';
import { v4 as uuidv4 } from 'uuid';

const NotificationContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user, getToken } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Helper function to add a notification
    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: notification.id || uuidv4(),
            type: notification.type,
            title: notification.title,
            message: notification.message,
            userId: notification.userId,
            orderId: notification.orderId,
            metadata: notification.metadata,
            read: false,
            timestamp: notification.timestamp ? new Date(notification.timestamp) : new Date()
        };
        
        setNotifications(prevNotifications => [
            newNotification,
            ...prevNotifications,
        ]);
    }, []);

    // Mark notification as read
    const markAsRead = useCallback((notificationId) => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === notificationId
                    ? { ...notification, read: true }
                    : notification
            )
        );
    }, []);

    // Clear all notifications
    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    // Connect to WebSocket
    const connect = useCallback(() => {
        const token = getToken();
        if (!token || !user) {
            console.log("No token or user, not connecting to WebSocket.");
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                'Authorization': `Bearer ${token}`
            },
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            onConnect: (frame) => {
                console.log('Connected to WebSocket:', frame);
                setIsConnected(true);
                setStompClient(client);

                // Subscribe to the user-specific notification queue
                const userQueue = `/user/queue/notifications`;
                client.subscribe(userQueue, (message) => {
                    const notification = JSON.parse(message.body);
                    console.log("Received a new notification:", notification);
                    addNotification(notification);
                });

                // Subscribe to general notifications topic (for Kafka notifications)
                const generalTopic = `/topic/notifications`;
                client.subscribe(generalTopic, (message) => {
                    const notification = JSON.parse(message.body);
                    console.log("Received a Kafka notification:", notification);
                    addNotification(notification);
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
                setIsConnected(false);
                // Attempt to reconnect after a delay on failure
                setTimeout(connect, 5000);
            },
            onWebSocketClose: () => {
                console.log("WebSocket connection closed. Attempting to reconnect...");
                setIsConnected(false);
                setTimeout(connect, 5000); // Reconnect after 5 seconds
            }
        });

        client.activate();
    }, [user, getToken, addNotification]);

    // Disconnect from WebSocket
    const disconnect = useCallback(() => {
        if (stompClient) {
            stompClient.deactivate().then(() => {
                console.log("Disconnected from WebSocket.");
                setIsConnected(false);
                setStompClient(null);
            });
        }
    }, [stompClient]);

    // Effect to manage connection based on authentication state
    useEffect(() => {
        if (isAuthenticated && user && !isConnected) {
            connect();
        } else if (!isAuthenticated && isConnected) {
            disconnect();
        }

        // Cleanup on component unmount
        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, [isAuthenticated, user, isConnected, connect, disconnect, stompClient]);

    const value = {
        notifications,
        isConnected,
        connect,
        disconnect,
        markAsRead,
        clearAll
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};