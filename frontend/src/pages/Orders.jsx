import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { formatCurrency, formatDateTime, formatFullAddress, getRestaurantName } from '../utils/formatters';

const statusStyles = {
    pending: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
    preparing: 'border-sky-400/20 bg-sky-500/10 text-sky-200',
    completed: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
    cancelled: 'border-red-400/20 bg-red-500/10 text-red-200'
};

const statusMessage = {
    pending: 'Waiting for restaurant confirmation',
    preparing: 'Restaurant is preparing your order',
    completed: 'Delivered / completed',
    cancelled: 'Order was cancelled'
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/api/orders/myorders');
                if (data.success) {
                    setOrders(data.data);
                }
            } catch (error) {
                console.error('Fetch orders failed', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchOrders();
    }, [user]);

    useEffect(() => {
        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        socketRef.current = io(socketUrl);

        socketRef.current.on('orderStatusUpdated', ({ orderId, newStatus }) => {
            setOrders((currentOrders) =>
                currentOrders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order))
            );
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-24px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                    <p className="text-sm text-slate-400">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-24px)] px-4 py-6 pb-28 md:px-6 md:py-8">
            <div className="mx-auto max-w-5xl space-y-8">
                <section className="overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(135deg,rgba(251,93,71,0.18),rgba(15,23,42,0.5),rgba(2,6,23,0.9))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] md:p-8">
                    <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Orders</p>
                    <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Track every order in one place.</h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                        Status updates arrive in real time, and each order now keeps the saved delivery address snapshot used during checkout.
                    </p>
                </section>

                {orders.length === 0 ? (
                    <div className="rounded-[32px] border border-dashed border-white/10 bg-slate-950/35 px-6 py-24 text-center">
                        <h3 className="text-2xl font-bold text-white">No orders yet</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-400">Start exploring reels and place your first order once your address is saved.</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {orders.map((order) => (
                            <article key={order._id} className="rounded-[30px] border border-white/8 bg-slate-950/38 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <p className="text-xl font-bold text-white">
                                                Order #{order._id.substring(order._id.length - 6).toUpperCase()}
                                            </p>
                                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${statusStyles[order.status] || 'border-white/10 bg-white/[0.04] text-slate-300'}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-300">{getRestaurantName(order.restaurant)}</p>
                                        <p className="text-sm text-slate-500">{formatDateTime(order.createdAt)}</p>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[360px]">
                                        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Order Status</p>
                                            <p className="mt-2 text-sm font-semibold text-white">{statusMessage[order.status]}</p>
                                        </div>
                                        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Delivery Address</p>
                                            <p className="mt-2 text-sm leading-6 text-slate-300">{formatFullAddress(order.shippingAddress)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
                                    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Items</p>
                                        <div className="mt-4 space-y-3">
                                            {order.items.map((item, index) => (
                                                <div key={`${order._id}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">
                                                            {item.name || item.title || item.foodItem?.name || item.reel?.title || 'Unavailable item'}
                                                        </p>
                                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Qty {item.quantity}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Payment Summary</p>
                                        <div className="mt-5 space-y-3 text-sm text-slate-300">
                                            <div className="flex items-center justify-between">
                                                <span>Items</span>
                                                <span>{order.items.length}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Payment</span>
                                                <span>{order.paymentMethod}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span>Status</span>
                                                <span>{order.paymentStatus}</span>
                                            </div>
                                            <div className="border-t border-white/8 pt-3">
                                                <div className="flex items-center justify-between text-base font-semibold text-white">
                                                    <span>Total</span>
                                                    <span>{formatCurrency(order.totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
