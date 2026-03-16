import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStore, FaMapMarkerAlt, FaPhone, FaHeart, FaUtensils } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const apiUrl = import.meta.env.VITE_API_URL;

const RestaurantDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();

    const [restaurant, setRestaurant] = useState(null);
    const [reels, setReels] = useState([]);
    const [menu, setMenu] = useState([]);
    const [activeTab, setActiveTab] = useState('reels'); // 'reels' or 'menu'
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user?.token}` } };
                
                // Parallel fetching
                const [restaurantRes, menuRes] = await Promise.all([
                    api.get(`/api/restaurants/${id}`, config),
                    api.get(`/api/menu/restaurant/${id}`, config)
                ]);
                
                if (restaurantRes.data.success) {
                    const data = restaurantRes.data.data;
                    setRestaurant(data);
                    setReels(data.reels || []);
                    if (user && data.followers) {
                        setFollowing(data.followers.some(f => f._id === user._id || f === user._id));
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
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-red-400 text-center px-4">
                <div>
                    <p className="text-lg font-semibold">{error || 'Restaurant not found'}</p>
                </div>
            </div>
        );
    }

    const info = restaurant.restaurantDetails || {};

    return (
        <div className="min-h-screen bg-black text-white pb-32">
            {/* Header Banner */}
            <div className="h-32 bg-gradient-to-r from-primary/40 to-orange-900/40 relative">
                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 flex items-end justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-lg border-2 border-black">
                            {restaurant.profilePicture ? (
                                <img src={restaurant.profilePicture} alt="dp" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <FaStore size={28} className="text-white" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-heading font-bold leading-tight">
                                {info.restaurantName || restaurant.username}
                            </h1>
                            <p className="text-gray-400 text-sm">@{restaurant.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`px-5 py-2 rounded-full font-semibold text-sm transition border ${
                            following
                                ? 'bg-transparent border-gray-500 text-gray-300 hover:border-red-500 hover:text-red-400'
                                : 'bg-primary border-primary text-white hover:bg-orange-600'
                        } disabled:opacity-60`}
                    >
                        {following ? 'Following' : 'Follow'}
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="px-6 pt-4 pb-4 border-b border-gray-800 space-y-2 text-sm">
                {info.businessAddress && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <FaMapMarkerAlt className="text-primary flex-shrink-0" />
                        <span>{info.businessAddress.street}, {info.businessAddress.city}</span>
                    </div>
                )}
                {info.phone && (
                    <div className="flex items-center gap-2 text-gray-400">
                        <FaPhone className="text-primary flex-shrink-0" />
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

            {/* Tabs */}
            <div className="flex border-b border-gray-800">
                <button 
                    onClick={() => setActiveTab('reels')}
                    className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'reels' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    REELS
                </button>
                <button 
                    onClick={() => setActiveTab('menu')}
                    className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'menu' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    MENU
                </button>
            </div>

            {/* Content Area */}
            <div className="px-4 pt-4">
                {activeTab === 'reels' ? (
                    /* Reels Grid */
                    reels.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-gray-600">
                            <FaHeart size={32} className="mb-3 opacity-20" />
                            <p>No reels uploaded yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-1">
                            {reels.map((reel) => (
                                <div key={reel._id} className="aspect-[9/16] bg-gray-900 relative overflow-hidden rounded group cursor-pointer">
                                    <video
                                        src={`${apiUrl}${reel.videoUrl}`}
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                                        muted
                                        playsInline
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <p className="text-white text-[10px] font-bold truncate">{reel.title}</p>
                                        <p className="text-primary text-[10px] font-bold">₹{reel.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* Menu Section */
                    menu.length === 0 ? (
                        <div className="flex flex-col items-center py-16 text-gray-600">
                            <FaUtensils size={32} className="mb-3 opacity-20" />
                            <p>No menu items available</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {menu.map((item) => (
                                <div key={item._id} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex justify-between items-center group hover:border-gray-700 transition">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-orange-50">{item.name}</h3>
                                            {!item.isAvailable && (
                                                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full uppercase font-bold border border-red-500/20">
                                                    Out of Stock
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-xs line-clamp-1 mb-2">{item.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-primary font-bold">₹{item.price}</span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{item.category}</span>
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
