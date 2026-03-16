import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStore, FaMapMarkerAlt, FaPhone, FaHeart, FaUtensils, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
    getRestaurantStatusBadge,
    isRestaurantClosed,
    isRestaurantOrderingUnavailable
} from '../utils/formatters';

const RestaurantDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState(null);
    const [reels, setReels] = useState([]);
    const [menu, setMenu] = useState([]);
    const [activeTab, setActiveTab] = useState('reels');
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user?.token}` } };

                const [restaurantRes, menuRes] = await Promise.all([
                    api.get(`/api/restaurants/${id}`, config),
                    api.get(`/api/menu/restaurant/${id}`, config)
                ]);

                if (restaurantRes.data.success) {
                    const data = restaurantRes.data.data;
                    setRestaurant(data);
                    setReels(data.reels || []);
                    if (user && data.followers) {
                        setFollowing(data.followers.some((f) => f._id === user._id || f === user._id));
                    }
                }

                if (menuRes.data.success) {
                    setMenu(menuRes.data.data);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load restaurant profile.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const handleFollow = async () => {
        if (!user || followLoading) return;
        setFollowLoading(true);
        try {
            const { data } = await api.put(
                `/api/users/${id}/follow`,
                {},
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );
            if (data.success) {
                setFollowing(data.data.isFollowing);
                toast.success(data.message);
            }
        } catch (err) {
            toast.error('Failed to update follow status');
            console.error('Follow error:', err);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-primary"></div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black px-4 text-center text-red-400">
                <div>
                    <p className="text-lg font-semibold">{error || 'Restaurant not found'}</p>
                </div>
            </div>
        );
    }

    const info = restaurant.restaurantDetails || {};
    const restaurantClosed = isRestaurantClosed(restaurant);
    const orderingUnavailable = isRestaurantOrderingUnavailable(restaurant);
    const statusBadge = getRestaurantStatusBadge(restaurant);

    return (
        <div className="min-h-screen bg-black pb-32 text-white">
            <div className="relative h-32 bg-gradient-to-r from-primary/40 to-orange-900/40">
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-black bg-gradient-to-tr from-primary to-orange-400 shadow-lg">
                            {restaurant.profilePicture ? (
                                <img src={restaurant.profilePicture} alt="dp" className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <FaStore size={28} className="text-white" />
                            )}
                        </div>
                        <div>
                            <h1 className="font-heading text-2xl font-bold leading-tight">
                                {info.restaurantName || restaurant.username}
                            </h1>
                            <p className="text-sm text-gray-400">@{restaurant.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                            following
                                ? 'border-gray-500 bg-transparent text-gray-300 hover:border-red-500 hover:text-red-400'
                                : 'border-primary bg-primary text-white hover:bg-orange-600'
                        } disabled:opacity-60`}
                    >
                        {following ? 'Following' : 'Follow'}
                    </button>
                </div>
                <div className="absolute right-6 top-4">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${statusBadge.tone}`}>
                        {statusBadge.label}
                    </span>
                </div>
            </div>

            <div className="space-y-2 border-b border-gray-800 px-6 pb-4 pt-4 text-sm">
                {orderingUnavailable && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-200">
                        <FaExclamationTriangle />
                        {restaurantClosed ? 'Restaurant is currently closed for orders' : 'Online delivery is currently paused for this restaurant'}
                    </div>
                )}
                {info.businessAddress && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <FaMapMarkerAlt className="flex-shrink-0 text-primary" />
                        <span>{info.businessAddress.street}, {info.businessAddress.city}</span>
                    </div>
                )}
                {info.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <FaPhone className="flex-shrink-0 text-primary" />
                        <span>{info.phone}</span>
                    </div>
                )}
                <div className="flex items-center gap-4 pt-1">
                    <div className="text-gray-400">
                        <span className="font-bold text-white">{restaurant.followers?.length || 0}</span>{' '}
                        <span>followers</span>
                    </div>
                    <div className="text-gray-400">
                        <span className="font-bold text-white">{reels.length}</span>{' '}
                        <span>reels</span>
                    </div>
                </div>
            </div>

            <div className="flex border-b border-gray-800">
                <button
                    onClick={() => setActiveTab('reels')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'reels' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    REELS
                </button>
                <button
                    onClick={() => setActiveTab('menu')}
                    className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'menu' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    MENU
                </button>
            </div>

            <div className="px-4 pt-4">
                {activeTab === 'reels' ? (
                    reels.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-gray-600">
                            <FaHeart size={32} className="mb-3 opacity-20" />
                            <p>No reels uploaded yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1">
                            {reels.map((reel) => (
                                <div key={reel._id} className="group relative aspect-[9/16] cursor-pointer overflow-hidden rounded bg-gray-900">
                                    <video
                                        src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000')}${reel.videoUrl}`}
                                        className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
                                        muted
                                        playsInline
                                    />
                                    {orderingUnavailable && <div className="absolute inset-0 bg-black/28" />}
                                    <div className="absolute inset-0 flex flex-col justify-end bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <p className="truncate text-[10px] font-bold text-white">{reel.title}</p>
                                        <p className="text-[10px] font-bold text-primary">Rs {reel.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    menu.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-gray-600">
                            <FaUtensils size={32} className="mb-3 opacity-20" />
                            <p>No menu items available</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {menu.map((item) => (
                                <div key={item._id} className="group flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/50 p-4 transition hover:border-gray-700">
                                    <div className="flex-1">
                                        <div className="mb-1 flex items-center gap-2">
                                            <h3 className="font-bold text-orange-50">{item.name}</h3>
                                            {!item.isAvailable && (
                                                <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-red-500">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                        <p className="mb-2 line-clamp-1 text-xs text-gray-400">{item.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-primary">Rs {item.price}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{item.category}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RestaurantDetail;
