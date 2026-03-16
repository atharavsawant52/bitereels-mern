import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPowerOff, FaPlus, FaUtensils, FaClipboardList, FaSignOutAlt, FaStore, FaBolt, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import DashboardStats from '../components/DashboardStats';
import MyReels from '../components/MyReels';
import EditProfileModal from '../components/EditProfileModal';
import { formatDateTime } from '../utils/formatters';
import api from '../api/client';

const RestaurantDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [updatingDelivery, setUpdatingDelivery] = useState(false);
    const [updatingRestaurantStatus, setUpdatingRestaurantStatus] = useState(false);

    const deliverySettings = user?.restaurantDetails?.deliverySettings || {
        isDeliveryPaused: false,
        updatedAt: null,
        note: 'Online delivery is active. Users can add your reels to cart.'
    };
    const restaurantStatus = user?.restaurantDetails?.restaurantStatus === 'closed' ? 'closed' : 'open';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileUpdate = (updatedUser) => {
        updateUser(updatedUser);
        setIsEditProfileOpen(false);
    };

    const toggleDeliveryPause = async () => {
        try {
            setUpdatingDelivery(true);
            const nextValue = !deliverySettings.isDeliveryPaused;
            const { data } = await api.patch('/api/restaurants/delivery-settings', {
                isDeliveryPaused: nextValue,
                restaurantStatus
            });

            updateUser(data.data);
            toast.success(data.message);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update delivery mode');
        } finally {
            setUpdatingDelivery(false);
        }
    };

    const toggleRestaurantStatus = async () => {
        try {
            setUpdatingRestaurantStatus(true);
            const nextStatus = restaurantStatus === 'open' ? 'closed' : 'open';
            const { data } = await api.patch('/api/restaurants/delivery-settings', {
                restaurantStatus: nextStatus,
                isDeliveryPaused: deliverySettings.isDeliveryPaused
            });

            updateUser(data.data);
            toast.success(nextStatus === 'open' ? 'Restaurant is now open for orders' : 'Restaurant is now closed for orders');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to update restaurant status');
        } finally {
            setUpdatingRestaurantStatus(false);
        }
    };

    return (
        <div className="overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(251,93,71,0.16),_transparent_24%),linear-gradient(180deg,#050816_0%,#02040a_100%)] px-4 py-6 pb-10 text-white md:px-6">
            <div className="mx-auto flex max-w-[1560px] flex-col gap-8">
                <header className="overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(135deg,rgba(251,93,71,0.18),rgba(15,23,42,0.5),rgba(2,6,23,0.9))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] md:p-8">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px] xl:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Restaurant Dashboard</p>
                            <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">
                                {user?.restaurantDetails?.restaurantName || user?.username}
                            </h1>
                            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                                Manage reels, menu, live orders, and online delivery status from one production-ready control panel.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5 backdrop-blur-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {restaurantStatus === 'closed' ? 'Restaurant closed' : (deliverySettings.isDeliveryPaused ? 'Delivery paused' : 'Ordering live')}
                                    </p>
                                </div>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                    restaurantStatus === 'closed'
                                        ? 'bg-red-500/15 text-red-300'
                                        : deliverySettings.isDeliveryPaused
                                            ? 'bg-amber-500/15 text-amber-300'
                                            : 'bg-emerald-500/15 text-emerald-300'
                                }`}>
                                    <FaBolt size={16} />
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-slate-300">
                                <p className="flex items-center gap-2">
                                    <FaClock className="text-primary" />
                                    {deliverySettings.updatedAt ? `Updated ${formatDateTime(deliverySettings.updatedAt)}` : 'Not changed yet'}
                                </p>
                                <p className="text-sm leading-7 text-slate-400">
                                    {restaurantStatus === 'closed'
                                        ? 'Restaurant is closed. Users can view reels, but add-to-cart and checkout stay disabled until you reopen.'
                                        : deliverySettings.isDeliveryPaused
                                            ? 'Customers can still watch reels, but add-to-cart stays disabled until you switch delivery back on.'
                                            : 'Your reels are currently open for normal ordering and checkout.'}
                                </p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center gap-2 rounded-[20px] border border-red-400/16 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/16"
                            >
                                <FaSignOutAlt size={14} />
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col gap-8">
                    <DashboardStats />

                    <div className="grid gap-6 xl:grid-cols-2">
                        <div className="flex flex-col gap-6">
                            <section className="rounded-[30px] border border-white/8 bg-slate-950/38 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Restaurant Status</p>
                                        <h2 className="mt-2 text-2xl font-bold text-white">Open or closed</h2>
                                    </div>
                                    <FaStore className={restaurantStatus === 'closed' ? 'text-red-300' : 'text-emerald-300'} />
                                </div>

                                <div className="mt-6 rounded-[24px] border border-white/8 bg-black/20 p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {restaurantStatus === 'closed' ? 'Restaurant closed' : 'Restaurant open'}
                                            </p>
                                            <p className="mt-2 text-sm leading-7 text-slate-400">
                                                {restaurantStatus === 'closed'
                                                    ? 'Temporarily stop all ordering. Add to cart and checkout stay disabled for every user.'
                                                    : 'Restaurant is accepting orders. Users can continue to browse reels and place orders.'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                                                restaurantStatus === 'closed' ? 'bg-red-500/14 text-red-200' : 'bg-emerald-500/14 text-emerald-200'
                                            }`}>
                                                {restaurantStatus === 'closed' ? 'Closed' : 'Open'}
                                            </span>
                                            <button
                                                onClick={toggleRestaurantStatus}
                                                disabled={updatingRestaurantStatus}
                                                aria-label={restaurantStatus === 'closed' ? 'Open restaurant' : 'Close restaurant'}
                                                className={`relative h-14 w-28 rounded-full border p-1.5 transition-all duration-300 ${
                                                    restaurantStatus === 'closed'
                                                        ? 'border-red-400/20 bg-red-500 shadow-[0_14px_32px_rgba(239,68,68,0.22)]'
                                                        : 'border-emerald-400/20 bg-emerald-500 shadow-[0_14px_32px_rgba(16,185,129,0.22)]'
                                                } ${updatingRestaurantStatus ? 'cursor-wait opacity-70' : ''}`}
                                            >
                                                <span className="absolute inset-y-0 left-4 flex items-center text-[10px] font-black uppercase tracking-[0.24em] text-white/75">
                                                    {restaurantStatus === 'closed' ? 'Off' : 'On'}
                                                </span>
                                                <span
                                                    className={`absolute top-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.25)] transition-all duration-300 ${
                                                        restaurantStatus === 'closed' ? 'left-[calc(100%-3.35rem)]' : 'left-1.5'
                                                    }`}
                                                >
                                                    <FaStore size={12} />
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-[30px] border border-white/8 bg-slate-950/38 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Delivery Control</p>
                                        <h2 className="mt-2 text-2xl font-bold text-white">Online delivery</h2>
                                    </div>
                                    <FaPowerOff className={deliverySettings.isDeliveryPaused ? 'text-amber-300' : 'text-emerald-300'} />
                                </div>

                                <div className="mt-6 rounded-[24px] border border-white/8 bg-black/20 p-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {deliverySettings.isDeliveryPaused ? 'Delivery paused' : 'Delivery active'}
                                            </p>
                                            <p className="mt-2 text-sm leading-7 text-slate-400">
                                                {deliverySettings.isDeliveryPaused
                                                    ? 'Users can still watch reels, but add-to-cart is disabled on all your reels until you resume.'
                                                    : 'Users can add your reel items to cart and place orders normally.'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                                                deliverySettings.isDeliveryPaused ? 'bg-amber-500/14 text-amber-200' : 'bg-emerald-500/14 text-emerald-200'
                                            }`}>
                                                {deliverySettings.isDeliveryPaused ? 'Delivery Paused' : 'Delivery Active'}
                                            </span>
                                            <button
                                                onClick={toggleDeliveryPause}
                                                disabled={updatingDelivery}
                                                aria-label={deliverySettings.isDeliveryPaused ? 'Resume online delivery' : 'Pause online delivery'}
                                                className={`relative h-14 w-28 rounded-full border p-1.5 transition-all duration-300 ${
                                                    deliverySettings.isDeliveryPaused
                                                        ? 'border-amber-400/20 bg-amber-500 shadow-[0_14px_32px_rgba(245,158,11,0.22)]'
                                                        : 'border-emerald-400/20 bg-emerald-500 shadow-[0_14px_32px_rgba(16,185,129,0.22)]'
                                                } ${updatingDelivery ? 'cursor-wait opacity-70' : ''}`}
                                            >
                                                <span className="absolute inset-y-0 left-4 flex items-center text-[10px] font-black uppercase tracking-[0.24em] text-white/75">
                                                    {deliverySettings.isDeliveryPaused ? 'Off' : 'On'}
                                                </span>
                                                <span
                                                    className={`absolute top-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.25)] transition-all duration-300 ${
                                                        deliverySettings.isDeliveryPaused ? 'left-[calc(100%-3.35rem)]' : 'left-1.5'
                                                    }`}
                                                >
                                                    <FaPowerOff size={12} />
                                                </span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest system note</p>
                                        <p className="mt-2 text-sm font-medium text-white">
                                            {deliverySettings.note || 'Online delivery is active. Users can add your reels to cart.'}
                                        </p>
                                        {deliverySettings.updatedAt && (
                                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                                                Updated {formatDateTime(deliverySettings.updatedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-[30px] border border-white/8 bg-slate-950/38 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Quick Actions</p>
                                <div className="mt-5 space-y-3">
                                    <button
                                        onClick={() => navigate('/restaurant/upload')}
                                        className="flex w-full items-center gap-3 rounded-[24px] bg-primary px-4 py-4 text-left text-white transition hover:bg-[#ff6d59]"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                                            <FaPlus size={14} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Upload new reel</p>
                                            <p className="text-xs text-white/70">Post a new dish and keep the feed active.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => navigate('/restaurant/menu')}
                                        className="flex w-full items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4 text-left text-white transition hover:border-primary/20 hover:bg-primary/[0.08]"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06]">
                                            <FaUtensils size={14} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Manage menu</p>
                                            <p className="text-xs text-slate-400">Update items, prices, and availability.</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => navigate('/restaurant/orders')}
                                        className="flex w-full items-center gap-3 rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4 text-left text-white transition hover:border-primary/20 hover:bg-primary/[0.08]"
                                    >
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06]">
                                            <FaClipboardList size={14} />
                                        </div>
                                        <div>
                                            <p className="font-semibold">Orders received</p>
                                            <p className="text-xs text-slate-400">View customer name, phone number, and full address.</p>
                                        </div>
                                    </button>
                                </div>
                            </section>
                        </div>

                        <section className="rounded-[30px] border border-white/8 bg-slate-950/38 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Restaurant Profile</p>
                                    <h2 className="mt-2 text-2xl font-bold text-white">Business details</h2>
                                </div>
                                <button
                                    onClick={() => setIsEditProfileOpen(true)}
                                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/30 hover:bg-primary/10"
                                >
                                    Edit profile
                                </button>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Restaurant</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{user?.restaurantDetails?.restaurantName}</p>
                                </div>
                                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Phone</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{user?.restaurantDetails?.phone}</p>
                                </div>
                                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Restaurant status</p>
                                    <p className={`mt-2 text-lg font-semibold ${restaurantStatus === 'closed' ? 'text-red-300' : 'text-emerald-300'}`}>
                                        {restaurantStatus === 'closed' ? 'Closed' : 'Open'}
                                    </p>
                                </div>
                                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Delivery mode</p>
                                    <p className={`mt-2 text-lg font-semibold ${deliverySettings.isDeliveryPaused ? 'text-amber-300' : 'text-emerald-300'}`}>
                                        {deliverySettings.isDeliveryPaused ? 'Paused' : 'Active'}
                                    </p>
                                </div>
                                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 md:col-span-2">
                                    <div className="flex items-center gap-2">
                                        <FaStore className="text-primary" />
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Address</p>
                                    </div>
                                    <p className="mt-3 text-sm leading-7 text-slate-300">
                                        {[
                                            user?.restaurantDetails?.businessAddress?.street,
                                            user?.restaurantDetails?.businessAddress?.area,
                                            user?.restaurantDetails?.businessAddress?.city,
                                            user?.restaurantDetails?.businessAddress?.state,
                                            user?.restaurantDetails?.businessAddress?.postalCode
                                        ].filter(Boolean).join(', ')}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mt-2">
                        <MyReels />
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                userDetails={user?.restaurantDetails}
                onUpdate={handleProfileUpdate}
            />
        </div>
    );
};

export default RestaurantDashboard;
