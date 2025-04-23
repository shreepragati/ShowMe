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

                console.log("Fetched notifications:", response.data); // Log the direct array

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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    console.log("Notifications state:", notifications); // Log notifications state

    return (
        <div className="max-w-xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Notifications</h2>
            {notifications.length === 0 ? (
                <p className="text-gray-500">No notifications yet.</p>
            ) : (
                <ul className="space-y-2">
                    {notifications.map((notification) => (
                        <li key={notification.id} className="bg-white shadow p-3 rounded">
                            <p>{notification.content}</p>
                            <p className="text-xs text-gray-400">
                                {new Date(notification.created_at).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                                Sent by: {notification.sender ? notification.sender.username : 'Unknown'}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}