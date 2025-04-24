import { useNavigate } from 'react-router-dom';
import { FiBell } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationBell({ className = '' }) {
    const navigate = useNavigate();
    const [count, setCount] = useState(0);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access');

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:8000/notifications/notifications/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            const unread = (response.data || []).filter(notif => !notif.read);
            setCount(unread.length);

        } catch (err) {
            console.error("Failed to fetch notifications", err);
            setError('Failed to fetch notifications');
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
                onClick={() => navigate('/notifications')}
                className={`relative p-1 transition-colors duration-200 ${className}`}
            >
                <FiBell size={24} />
                {count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-teal-400 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center z-10">

                        {count}
                    </span>
                )}
            </button>
        </div>
    );
}
