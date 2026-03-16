import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaConciergeBell, FaClock, FaBoxOpen, FaPhone, FaMapMarkerAlt, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../api/client';
import { formatCurrency, formatDateTime, formatFullAddress } from '../utils/formatters';

const tabOptions = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
];

const statusStyles = {
    pending: 'border-amber-400/20 bg-amber-500/10 text-amber-200',
    preparing: 'border-sky-400/20 bg-sky-500/10 text-sky-200',
    completed: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200',
    cancelled: 'border-red-400/20 bg-red-500/10 text-red-200'
};

const OrdersReceived = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/api/orders/restaurant');
                if (data.success) {
                    setOrders(data.data);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
            setOrders((currentOrders) =>
                currentOrders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order))
            );
            toast.success(`Order marked as ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter((order) => order.status === activeTab);

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,93,71,0.16),_transparent_24%),linear-gradient(180deg,#050816_0%,#02040a_100%)] px-4 py-6 text-white md:px-6">
            <div className="mx-auto max-w-7xl space-y-8">
                <header className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/restaurant-dashboard')}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                    >
                        <FaArrowLeft size={14} />
                    </button>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Orders Received</p>
                        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Manage live customer orders</h1>
                    </div>
                </header>

                <div className="flex flex-wrap gap-3">
                    {tabOptions.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                activeTab === tab.value
                                    ? 'border-primary/30 bg-primary/15 text-primary'
                                    : 'border-white/10 bg-white/[0.03] text-slate-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center rounded-[32px] border border-white/8 bg-slate-950/40 py-24">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                            <p className="text-sm text-slate-400">Loading orders...</p>
                        </div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="rounded-[32px] border border-dashed border-white/10 bg-slate-950/35 px-6 py-24 text-center">
                        <FaBoxOpen className="mx-auto text-slate-500" size={28} />
                        <h3 className="mt-5 text-2xl font-bold text-white">No {activeTab !== 'all' ? activeTab : ''} orders found</h3>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {filteredOrders.map((order) => (
                            <article key={order._id} className="rounded-[30px] border border-white/8 bg-slate-950/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                                <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                                    <div className="space-y-5">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-xl font-bold text-white">
                                                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                                                    </p>
                                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${statusStyles[order.status]}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                                    <span className="flex items-center gap-2">
                                                        <FaClock size={12} />
                                                        {formatDateTime(order.createdAt)}
                                                    </span>
                                                    <span className="font-semibold text-primary">{formatCurrency(order.totalAmount)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-[24px] border border-white/8 bg-black/20 p-4">
                                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Order Items</p>
                                            <div className="mt-4 space-y-3">
                                                {order.items.map((item, index) => (
                                                    <div key={`${order._id}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">
                                                                {item.foodItem?.name || item.reel?.title || item.name || item.title || 'Unknown item'}
                                                            </p>
                                                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Qty {item.quantity}</p>
                                                        </div>
                                                        <p className="text-sm font-semibold text-primary">{formatCurrency(item.price * item.quantity)}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        <section className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Customer Details</p>
                                            <div className="mt-4 space-y-3 text-sm text-slate-300">
                                                <p className="flex items-center gap-3">
                                                    <FaUser className="text-primary" />
                                                    <span>{order.shippingAddress?.fullName || order.user?.name || order.user?.username || 'Customer'}</span>
                                                </p>
                                                <p className="flex items-center gap-3">
                                                    <FaPhone className="text-primary" />
                                                    <span>{order.shippingAddress?.phone || 'Phone not available'}</span>
                                                </p>
                                                <p className="flex items-start gap-3">
                                                    <FaMapMarkerAlt className="mt-1 text-primary" />
                                                    <span className="leading-7">{formatFullAddress(order.shippingAddress)}</span>
                                                </p>
                                            </div>
                                        </section>

                                        <section className="rounded-[24px] border border-white/8 bg-black/20 p-5">
                                            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Update Status</p>
                                            <div className="mt-4 space-y-3">
                                                {order.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'preparing')}
                                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400"
                                                        >
                                                            <FaConciergeBell size={12} />
                                                            Mark as preparing
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/16 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/16"
                                                        >
                                                            <FaTimes size={12} />
                                                            Cancel order
                                                        </button>
                                                    </>
                                                )}

                                                {order.status === 'preparing' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'completed')}
                                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                                                        >
                                                            <FaCheck size={12} />
                                                            Mark completed
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/16 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/16"
                                                        >
                                                            <FaTimes size={12} />
                                                            Cancel order
                                                        </button>
                                                    </>
                                                )}

                                                {order.status === 'completed' && (
                                                    <div className="rounded-2xl border border-emerald-400/16 bg-emerald-500/10 px-4 py-3 text-center text-sm font-semibold text-emerald-200">
                                                        Order completed
                                                    </div>
                                                )}

                                                {order.status === 'cancelled' && (
                                                    <div className="rounded-2xl border border-red-400/16 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-200">
                                                        Order cancelled
                                                    </div>
                                                )}
                                            </div>
                                        </section>
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

export default OrdersReceived;
