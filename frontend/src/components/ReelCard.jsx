import { useState, useRef, useEffect } from 'react';
import { FaHeart, FaStore, FaShoppingCart, FaPlay } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

import CommentModal from './CommentModal';

const ReelCard = ({ reel }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(reel.likes.length);
    const [following, setFollowing] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (reel.likes.includes(user._id)) setLiked(true);
            if (user.following?.includes(reel.restaurant?._id)) setFollowing(true);
        }
    }, [user, reel.likes, reel.restaurant]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (videoRef.current) {
                    if (entry.isIntersecting) {
                        videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
                        setIsPlaying(true);
                    } else {
                        videoRef.current.pause();
                        videoRef.current.currentTime = 0; // optional: reset video
                        setIsPlaying(false);
                    }
                }
            });
        }, options);

        if (videoRef.current) observer.observe(videoRef.current);

        return () => {
            if (videoRef.current) observer.unobserve(videoRef.current);
        };
    }, []);

    const handlePlayPause = () => {
        if (!videoRef.current) return;
        
        if (isPlaying) {
            videoRef.current.pause();
            setIsPlaying(false);
        } else {
            videoRef.current.play().catch(e => console.log("Play failed", e));
            setIsPlaying(true);
        }
    };

    const getAuthHeaders = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : null;
    };

    const handleLike = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return alert("Please login first");

            await api.put(`/api/reels/${reel._id}/like`, {}, { headers });

            setLiked(!liked);
            setLikesCount(prev => liked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error("Error liking reel", error);
        }
    };

    const handleFollow = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) return alert("Please login first");

            const restaurantId = reel.restaurant?._id;
            if (!restaurantId) return;

            await api.put(`/api/users/${restaurantId}/follow`, {}, { headers });

            setFollowing(!following);
        } catch (error) {
             console.error("Error following user", error);
        }
    };

    const handleShare = () => {
         navigator.clipboard.writeText(`http://localhost:5173/reel/${reel._id}`)
            .then(() => alert("Link copied to clipboard!"))
            .catch(() => alert("Failed to copy link"));
    };
    
    const handleAddToCart = async () => {
         try {
            const headers = getAuthHeaders();
            if (!headers) return alert("Please login first");
            
            const response = await api.post('/api/cart', {
                reelId: reel._id,
                quantity: 1
            }, { headers });
            
            if (response.data.success) {
                alert("Added to Cart successfully!"); 
            }
        } catch (error) {
            console.error("Error adding to cart", error);
            const errorMessage = error.response?.data?.message || "Failed to add to cart";
            alert(errorMessage);
        }
    }

    return (
        <div className="h-[calc(100vh-50px)] md:h-screen w-full relative snap-start bg-black flex items-center justify-center md:my-4 md:rounded-lg overflow-hidden border-gray-800 md:border">
            {/* Video Player */}
            <video
                ref={videoRef}
                src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000')}${reel.videoUrl}`}
                className="h-full w-full object-cover"
                loop
                muted={false} 
                onClick={handlePlayPause}
                playsInline
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none"></div>

            {/* Right Action Bar */}
            <div className="absolute bottom-20 right-4 flex flex-col gap-6 items-center z-20">
                <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                    <div className="p-2 rounded-full transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                        <FaHeart size={28} className={`drop-shadow-lg ${liked ? "text-red-500" : "text-white"}`} />
                    </div>
                    <span className="text-xs font-semibold drop-shadow-md">{likesCount}</span>
                </button>
                
                <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
                    <div className="p-2 rounded-full transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                         <svg aria-label="Comment" className="text-white drop-shadow-lg" color="rgb(245, 245, 245)" fill="rgb(245, 245, 245)" height="28" role="img" viewBox="0 0 24 24" width="28"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>
                    </div>
                </button>

                <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
                    <div className="p-2 rounded-full transition-transform duration-200 group-hover:scale-110 group-active:scale-95">
                        <svg aria-label="Share Post" className="text-white drop-shadow-lg" color="rgb(245, 245, 245)" fill="rgb(245, 245, 245)" height="28" role="img" viewBox="0 0 24 24" width="28"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>
                    </div>
                </button>

                 <button onClick={handleAddToCart} className="flex flex-col items-center gap-1 group mt-2">
                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 transition-all group-hover:bg-white/20 group-hover:scale-105 group-active:scale-95 shadow-lg">
                         <FaShoppingCart size={20} className="text-white" />
                    </div>
                </button>
            </div>

            <CommentModal 
                reelId={reel._id} 
                isOpen={showComments} 
                onClose={() => setShowComments(false)} 
            />

            {/* Bottom Info Overlay */}
            <div className="absolute bottom-4 left-4 right-16 z-20 text-white text-left text-shadow-sm">
                {/* User/Restaurant Info */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px] shadow-lg">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                             <FaStore className="text-xs text-gray-300" />
                        </div>
                    </div>
                    <span
                        className="font-bold text-sm tracking-wide hover:underline cursor-pointer drop-shadow-md"
                        onClick={() => navigate(`/restaurant/${reel.restaurant?._id}`)}
                    >
                        {reel.restaurant?.restaurantDetails?.restaurantName || reel.restaurant?.username}
                    </span>
                    <button
                        onClick={handleFollow}
                        className={`border border-white/60 rounded-lg px-3 py-1 text-[11px] font-semibold backdrop-blur-md transition-colors ${following ? 'bg-white text-black' : 'bg-black/20 text-white hover:bg-white/20'}`}
                    >
                        {following ? 'Following' : 'Follow'}
                    </button>
                </div>
                
                {/* Caption / Description */}
                <div className="mb-4">
                    <h3 className="text-lg font-bold mb-1 drop-shadow-md leading-tight">{reel.title}</h3>
                    <p className="text-primary font-bold text-lg mb-2 shadow-black drop-shadow-md">₹{reel.price}</p>
                    <div className="bg-gradient-to-r from-black/40 to-transparent p-2 rounded-lg backdrop-blur-[2px] inline-block max-w-[90%]">
                        <p className="text-sm text-gray-100 font-medium leading-normal line-clamp-3">
                            {reel.description}
                        </p>
                    </div>
                </div>
        </div>

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                     <div className="bg-black/40 p-5 rounded-full backdrop-blur-sm">
                        <FaPlay className="text-3xl text-white ml-1 opacity-90" />
                     </div>
                </div>
            )}
        </div>
    );
};

export default ReelCard;
