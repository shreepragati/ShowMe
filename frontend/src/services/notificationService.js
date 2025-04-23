import axios from 'axios';

export const markNotificationRead = async (notificationId) => {
    try {
        const response = await axios.post(`notifications/notifications/${notificationId}/read/`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read', error);
    }
};
