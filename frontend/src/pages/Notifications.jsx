import { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaCheckDouble, FaClipboardCheck, FaMotorcycle, FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { formatRelativeTime } from '../utils/formatters';

const typeMeta = {
    order_placed: { icon: FaClipboardCheck, accent: 'text-primary', ring: 'border-primary/20 bg-primary/10' },
    order_preparing: { icon: FaMotorcycle, accent: 'text-sky-300', ring: 'border-sky-400/20 bg-sky-500/10' },
    order_completed: { icon: FaCheckDouble, accent: 'text-emerald-300', ring: 'border-emerald-400/20 bg-emerald-500/10' },
    order_cancelled: { icon: FaExclamationCircle, accent: 'text-red-300', ring: 'border-red-400/20 bg-red-500/10' },
    delivery_mode_updated: { icon: FaBell, accent: 'text-amber-300', ring: 'border-amber-400/20 bg-amber-500/10' }
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get('/api/notifications');
                if (data.success) {
                    setNotifications(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchNotifications();
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`, {});
            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification._id === id ? { ...notification, isRead: true } : notification
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all', {});
            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) => ({ ...notification, isRead: true }))
            );
        } catch (error) {
            console.error(error);
        }
    };

    const unreadCount = notifications.filter((notification) => !notification.isRead).length;

    return (
        <div className="min-h-[calc(100vh-24px)] px-4 py-6 pb-28 md:px-6 md:py-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <section className="overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(135deg,rgba(251,93,71,0.18),rgba(15,23,42,0.5),rgba(2,6,23,0.9))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] md:p-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Notifications</p>
                            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Cleaner alerts, no ugly native popups.</h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                                Order updates, delivery mode changes, and restaurant alerts now live in a proper notification center.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="rounded-[24px] border border-white/8 bg-black/20 px-4 py-3 backdrop-blur-xl">
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Unread</p>
                                <p className="mt-2 text-2xl font-black text-white">{unreadCount}</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/30 hover:bg-primary/12"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {loading ? (
                    <div className="flex items-center justify-center rounded-[32px] border border-white/8 bg-slate-950/40 py-24">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                            <p className="text-sm text-slate-400">Loading notifications...</p>
                        </div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="rounded-[32px] border border-dashed border-white/10 bg-slate-950/35 px-6 py-24 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/8 bg-white/[0.04]">
                            <FaBell className="text-slate-500" size={20} />
                        </div>
                        <h3 className="mt-5 text-2xl font-bold text-white">No notifications yet</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                            Order updates and delivery alerts will appear here as soon as they happen.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => {
                            const meta = typeMeta[notification.type] || {
                                icon: FaBell,
                                accent: 'text-slate-200',
                                ring: 'border-white/10 bg-white/[0.04]'
                            };
                            const Icon = meta.icon;

                            return (
                                <article
                                    key={notification._id}
                                    className={`rounded-[28px] border p-5 transition ${
                                        notification.isRead
                                            ? 'border-white/8 bg-slate-950/35'
                                            : 'border-primary/15 bg-primary/[0.08] shadow-[0_18px_60px_rgba(251,93,71,0.08)]'
                                    }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${meta.ring}`}>
                                            <Icon className={meta.accent} size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <p className={`text-base font-semibold ${notification.isRead ? 'text-slate-300' : 'text-white'}`}>
                                                    {notification.message}
                                                </p>
                                                {!notification.isRead && (
                                                    <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                                                        New
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-3 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-slate-500">
                                                <span>{formatRelativeTime(notification.createdAt)}</span>
                                                <span className="h-1 w-1 rounded-full bg-slate-700" />
                                                <span>{notification.type.replaceAll('_', ' ')}</span>
                                            </div>
                                        </div>
                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition hover:border-primary/30 hover:text-primary"
                                                title="Mark as read"
                                            >
                                                <FaCheck size={13} />
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
