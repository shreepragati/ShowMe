import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('access');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get('http://localhost:8000/notifications/notifications/', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.data && Array.isArray(response.data)) {
                    if (response.data.length === 0) {
                        setError("No notifications found.");
                    } else {
                        setNotifications(response.data);
                    }
                } else {
                    setError("Invalid response structure or no notifications found.");
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching notifications:", err);
                setError("Failed to fetch notifications.");
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [token]);

    if (loading) return <p className="text-gray-300 text-center mt-4">Loading...</p>;
    if (error) return <p className="text-red-400 text-center mt-4">{error}</p>;

    return (
        <div className="max-w-xl mx-auto p-6 bg-gray-900 min-h-screen text-gray-100">
            <h2 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2">Notifications</h2>

            {notifications.length === 0 ? (
                <p className="text-gray-400">No notifications yet.</p>
            ) : (
                <ul className="space-y-4">
                    {notifications.map((notification) => (
                        <li key={notification.id} className="bg-gray-800 border border-gray-700 p-4 rounded-lg shadow">
                            <p className="text-gray-200">{notification.content}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                {new Date(notification.created_at).toLocaleString()}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
