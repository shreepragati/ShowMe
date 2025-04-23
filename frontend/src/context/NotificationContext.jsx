import React, { createContext, useEffect, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ userId, children }) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}/`);

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
                setNotifications(prev => [data.notification, ...prev]);
                setNotificationCount(prevCount => prevCount + 1);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error: ", error);
        };

        ws.onclose = () => {
            console.log("WebSocket closed");
        };

        setSocket(ws);

        return () => {
            ws.close();
        };
    }, [userId]);

    const markAllRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification => ({
                ...notification,
                read: true, // Update the 'read' status in state
            }))
        );
        setNotificationCount(0); // Reset notification count when marked as read
        // You may also want to make an API call to mark notifications as read on the server.
    };

    return (
        <NotificationContext.Provider value={{ notifications, notificationCount, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
};
