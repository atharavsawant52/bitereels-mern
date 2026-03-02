import { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/api/notifications');
            if (data.success) {
                setNotifications(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchNotifications();
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`, {});
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, isRead: true } : n)
            );
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all', {});
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <div className="min-h-screen bg-black text-white pb-24 pt-4 px-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-heading font-bold text-primary">Notifications</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                    >
                        <FaCheckDouble /> Mark all read
                    </button>
                )}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
                </div>
            )}

            {!loading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-600">
                    <FaBell size={40} className="mb-4 opacity-20" />
                    <p className="text-lg text-gray-500">No notifications yet</p>
                    <p className="text-sm mt-1 text-gray-600">Order updates and alerts will appear here</p>
                </div>
            )}

            {!loading && notifications.length > 0 && (
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <div
                            key={n._id}
                            className={`flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer hover:bg-gray-900 ${
                                n.isRead
                                    ? 'border-gray-800 bg-gray-950'
                                    : 'border-primary/30 bg-primary/5'
                            }`}
                            onClick={() => !n.isRead && markAsRead(n._id)}
                        >
                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.isRead ? 'bg-gray-700' : 'bg-primary'}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm leading-relaxed ${n.isRead ? 'text-gray-400' : 'text-white'}`}>
                                    {n.message}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">{formatTime(n.createdAt)}</p>
                            </div>
                            {!n.isRead && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                                    className="text-gray-600 hover:text-primary transition flex-shrink-0"
                                    title="Mark as read"
                                >
                                    <FaCheck size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
