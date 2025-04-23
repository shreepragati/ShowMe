import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationBell() {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access');

    // Fetch notifications function
    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:8000/notifications/notifications/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log('Fetched notifications:', response.data);

            if (response.headers['content-type'] && response.headers['content-type'].includes('application/json')) {
                const unread = (response.data.notifications || []).filter(notif => !notif.read);
                setCount(unread.length);
            } else {
                console.error("Expected JSON, but got:", response);
                setError('Failed to fetch notifications');
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
            setError('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchNotifications();
    }, []);

    useEffect(() => {
        const interval = setInterval(fetchNotifications, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            {error && <div className="error-message">{error}</div>}
            <button
                onClick={() => navigate('/notifications')}
                className="relative p-1 hover:text-orange-500"
            >
                <FiBell size={24} />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                        {count}
                    </span>
                )}
            </button>
        </div>
    );
}
