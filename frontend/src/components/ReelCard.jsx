import { useState, useRef, useEffect } from 'react';
import {
    FaHeart,
    FaStore,
    FaShoppingCart,
    FaPlay,
    FaRegBookmark,
    FaBookmark,
    FaRegCommentDots,
    FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import CommentModal from './CommentModal';
import {
    formatCurrency,
    getRestaurantName,
    getRestaurantStatusBadge,
    isRestaurantClosed,
    isRestaurantOrderingUnavailable
} from '../utils/formatters';

const ReelCard = ({ reel }) => {
    const videoRef = useRef(null);
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(reel.likes.length);
    const [following, setFollowing] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTitleExpanded, setIsTitleExpanded] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const restaurantClosed = isRestaurantClosed(reel.restaurant);
    const orderingUnavailable = isRestaurantOrderingUnavailable(reel.restaurant);
    const statusBadge = getRestaurantStatusBadge(reel.restaurant);

    useEffect(() => {
        if (!user) return;

        setLiked(reel.likes.some((likeId) => likeId === user._id || likeId?._id === user._id));
        setFollowing(user.following?.some((followingId) => followingId === reel.restaurant?._id || followingId?._id === reel.restaurant?._id));
        setIsSaved(user.savedReels?.some((savedReelId) => savedReelId === reel._id || savedReelId?._id === reel._id));
    }, [user, reel._id, reel.likes, reel.restaurant]);

    useEffect(() => {
        const currentVideo = videoRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!currentVideo) return;

                    if (entry.isIntersecting) {
                        currentVideo.play().catch((error) => console.log('Autoplay prevented', error));
                        setIsPlaying(true);
                    } else {
                        currentVideo.pause();
                        currentVideo.currentTime = 0;
                        setIsPlaying(false);
                    }
                });
            },
            { root: null, rootMargin: '0px', threshold: 0.6 }
        );

        if (currentVideo) {
            observer.observe(currentVideo);
        }

        return () => {
            if (currentVideo) {
                observer.unobserve(currentVideo);
            }
        };
    }, []);

    const getAuthHeaders = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : null;
    };

    const handlePlayPause = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
            return;
        }

        videoRef.current.play().catch((error) => console.log('Play failed', error));
        setIsPlaying(true);
    };

    const handleLike = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) {
                toast.error('Please login first');
                return;
            }

            await api.put(`/api/reels/${reel._id}/like`, {}, { headers });
            setLiked((currentLiked) => !currentLiked);
            setLikesCount((currentCount) => (liked ? currentCount - 1 : currentCount + 1));
        } catch (error) {
            console.error('Error liking reel', error);
            toast.error('Unable to update like');
        }
    };

    const handleFollow = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) {
                toast.error('Please login first');
                return;
            }

            const restaurantId = reel.restaurant?._id;
            if (!restaurantId) return;

            const { data } = await api.put(`/api/users/${restaurantId}/follow`, {}, { headers });
            const nextFollowing = following
                ? (user?.following || []).filter((followingId) => followingId !== restaurantId)
                : [...(user?.following || []), restaurantId];

            setFollowing((currentValue) => !currentValue);
            updateUser({ following: nextFollowing });
            toast.success(data.message);
        } catch (error) {
            console.error('Error following restaurant', error);
            toast.error('Unable to update follow status');
        }
    };

    const handleSaveReel = async () => {
        if (!user?.token || isSaving) {
            toast.error('Please login first');
            return;
        }

        try {
            setIsSaving(true);
            const { data } = await api.put(`/api/reels/${reel._id}/save`);
            setIsSaved(data.data.saved);
            updateUser({ savedReels: data.data.savedReels });
            toast.success(data.message);
        } catch (error) {
            console.error('Error saving reel', error);
            toast.error(error.response?.data?.message || 'Unable to save reel');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddToCart = async () => {
        if (orderingUnavailable) {
            toast.error('Online delivery is currently paused for this restaurant.');
            return;
        }

        try {
            setIsAddingToCart(true);
            const headers = getAuthHeaders();
            if (!headers) {
                toast.error('Please login first');
                return;
            }

            const response = await api.post('/api/cart', {
                reelId: reel._id,
                quantity: 1
            }, { headers });

            if (response.data.success) {
                toast.success('Added to cart successfully');
            }
        } catch (error) {
            console.error('Error adding to cart', error);
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <div className="flex w-full items-center justify-center">
            <div className="relative w-full max-w-[420px] overflow-hidden rounded-[34px] border border-white/8 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                <div className="relative h-[calc(100dvh-2rem)] w-full bg-black">
                    <video
                        ref={videoRef}
                        src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000')}${reel.videoUrl}`}
                        className="h-full w-full object-cover"
                        loop
                        muted
                        onClick={handlePlayPause}
                        playsInline
                    />

                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.08)_40%,rgba(2,6,23,0.94)_100%)]" />
                    {orderingUnavailable && <div className="pointer-events-none absolute inset-0 bg-black/26" />}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/40 to-transparent" />
                    <div className="absolute right-4 top-20 z-20">
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] backdrop-blur-xl ${statusBadge.tone}`}>
                            {statusBadge.label}
                        </span>
                    </div>

                    <div className="absolute bottom-24 right-4 z-20 flex flex-col items-center gap-5 md:right-5">
                <button onClick={handleLike} className="group flex flex-col items-center gap-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/35 backdrop-blur-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                        <FaHeart size={21} className={`drop-shadow-lg ${liked ? 'text-red-500' : 'text-white'}`} />
                    </div>
                    <span className="text-xs font-semibold drop-shadow-md">{likesCount}</span>
                </button>

                <button onClick={() => setShowComments(true)} className="group flex flex-col items-center gap-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/35 backdrop-blur-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                        <FaRegCommentDots size={19} className="text-white drop-shadow-lg" />
                    </div>
                </button>

                <button onClick={handleSaveReel} className="group flex flex-col items-center gap-1" disabled={isSaving}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-black/35 backdrop-blur-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95 disabled:opacity-60">
                        {isSaved ? <FaBookmark size={19} className="text-primary drop-shadow-lg" /> : <FaRegBookmark size={19} className="text-white drop-shadow-lg" />}
                    </div>
                </button>

                <button onClick={handleAddToCart} className="group mt-2 flex flex-col items-center gap-1" disabled={orderingUnavailable || isAddingToCart}>
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full border shadow-lg backdrop-blur-xl transition-all group-hover:scale-105 group-active:scale-95 ${
                        orderingUnavailable
                            ? 'border-amber-400/25 bg-amber-500/10 text-amber-200 opacity-70'
                            : 'border-white/20 bg-white/10 text-white group-hover:bg-white/20'
                    }`}>
                        <FaShoppingCart size={18} />
                    </div>
                    {orderingUnavailable && <span className="max-w-16 text-center text-[10px] font-semibold text-amber-200">Paused</span>}
                </button>
                    </div>

                    <CommentModal reelId={reel._id} isOpen={showComments} onClose={() => setShowComments(false)} />

                    <div className="absolute bottom-5 left-4 right-20 z-20 text-left text-white md:left-5 md:right-24">
                {orderingUnavailable && (
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-100 backdrop-blur-xl">
                        <FaExclamationTriangle className="text-amber-300" />
                        {restaurantClosed ? 'Restaurant is currently closed for orders' : 'Online delivery is paused for this restaurant'}
                    </div>
                )}

                <div className="mb-4 flex items-center gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] shadow-lg">
                        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-black">
                            <FaStore className="text-sm text-gray-300" />
                        </div>
                    </div>
                    <span
                        className="cursor-pointer text-[0.95rem] font-bold tracking-wide drop-shadow-md hover:underline"
                        onClick={() => navigate(`/restaurant/${reel.restaurant?._id}`)}
                    >
                        {getRestaurantName(reel.restaurant)}
                    </span>
                    <button
                        onClick={handleFollow}
                        className={`rounded-full border px-4 py-2 text-[11px] font-semibold backdrop-blur-md transition-colors ${
                            following ? 'border-white bg-white text-black' : 'border-white/30 bg-black/20 text-white hover:bg-white/20'
                        }`}
                    >
                        {following ? 'Following' : 'Follow'}
                    </button>
                </div>

                <div className="mb-4">
                    <div className="mb-2">
                        <h3 className={`text-[20px] font-black leading-tight drop-shadow-md md:text-[22px] ${isTitleExpanded ? '' : 'line-clamp-2'}`}>
                            {reel.title}
                        </h3>
                        {reel.title?.length > 90 && (
                            <button
                                type="button"
                                onClick={() => setIsTitleExpanded((currentValue) => !currentValue)}
                                className="mt-1 text-sm font-semibold text-slate-200 underline-offset-2 hover:underline"
                            >
                                {isTitleExpanded ? 'show less' : '... more'}
                            </button>
                        )}
                    </div>
                        <p className="mb-3 text-[1.55rem] font-black text-primary drop-shadow-md">{formatCurrency(reel.price)}</p>
                        <div className="inline-block max-w-[92%] rounded-[22px] border border-white/8 bg-black/30 p-4 backdrop-blur-md">
                            <p className={`text-[0.88rem] font-medium leading-6 text-slate-100 ${isDescriptionExpanded ? '' : 'line-clamp-4'}`}>
                                {reel.description}
                            </p>
                            {reel.description?.length > 140 && (
                                <button
                                    type="button"
                                    onClick={() => setIsDescriptionExpanded((currentValue) => !currentValue)}
                                    className="mt-2 text-sm font-semibold text-slate-200 underline-offset-2 hover:underline"
                                >
                                    {isDescriptionExpanded ? 'show less' : '... more'}
                                </button>
                            )}
                        </div>
                    </div>
                    </div>

                    {!isPlaying && (
                        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                            <div className="rounded-full bg-black/40 p-5 backdrop-blur-sm">
                                <FaPlay className="ml-1 text-3xl text-white opacity-90" />
                            </div>
                        </div>
                    )}
                </div>
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/70 to-transparent" />
            </div>
        </div>
    );
};

export default ReelCard;
