import { useState, useEffect } from 'react';
import { FaTrash, FaBookmark } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { formatCurrency, formatDateTime, isRestaurantClosed } from '../utils/formatters';

const MyReels = ({ refreshTrigger }) => {
    const [reels, setReels] = useState([]);
    const { user } = useAuth();
    const deliveryPaused = Boolean(user?.restaurantDetails?.deliverySettings?.isDeliveryPaused);
    const restaurantClosed = isRestaurantClosed(user);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const response = await api.get('/api/reels/restaurant/my-reels');
                if (response.data.success) {
                    setReels(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching reels:', error);
            }
        };

        if (user?.token) fetchReels();
    }, [user?.token, refreshTrigger]);

    const handleDelete = async (reelId) => {
        if (!window.confirm('Delete this reel?')) return;

        try {
            await api.delete(`/api/reels/${reelId}`);
            setReels((currentReels) => currentReels.filter((reel) => reel._id !== reelId));
            toast.success('Reel deleted');
        } catch (error) {
            console.error('Error deleting reel:', error);
            toast.error('Failed to delete reel');
        }
    };

    return (
        <section className="rounded-[32px] border border-white/8 bg-slate-950/38 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Reels</p>
                    <h2 className="mt-2 text-3xl font-black text-white">Your posted reels</h2>
                </div>
                {(deliveryPaused || restaurantClosed) && (
                    <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                        restaurantClosed
                            ? 'border border-red-400/20 bg-red-500/10 text-red-200'
                            : 'border border-amber-400/20 bg-amber-500/10 text-amber-200'
                    }`}>
                        {restaurantClosed ? 'Restaurant closed for users' : 'Add to cart disabled for users'}
                    </span>
                )}
            </div>

            {reels.length === 0 ? (
                <div className="mt-8 rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-20 text-center">
                    <p className="text-lg font-semibold text-white">No reels posted yet</p>
                    <p className="mt-2 text-sm text-slate-400">Upload a reel from the dashboard to start attracting orders.</p>
                </div>
            ) : (
                <div className="mt-8 flex flex-wrap gap-5">
                    {reels.map((reel) => (
                        <article key={reel._id} className="w-full max-w-[290px] overflow-hidden rounded-[28px] border border-white/8 bg-black/20 shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
                            <div className="relative aspect-[9/16] overflow-hidden bg-black">
                                <video
                                    src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000')}${reel.videoUrl}`}
                                    className="h-full w-full object-cover"
                                    muted
                                    playsInline
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                                <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                                    {formatDateTime(reel.createdAt)}
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-lg font-semibold text-white">{reel.title}</p>
                                        <p className="mt-1 text-sm text-slate-400">{formatCurrency(reel.price)}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(reel._id)}
                                        className="flex h-11 w-11 items-center justify-center rounded-full border border-red-400/10 bg-red-500/10 text-red-300 transition hover:bg-red-500/16"
                                    >
                                        <FaTrash size={13} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-sm text-slate-300">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Likes</p>
                                        <p className="mt-2 text-lg font-bold text-white">{reel.likes.length}</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-sm text-slate-300">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Comments</p>
                                        <p className="mt-2 text-lg font-bold text-white">{reel.comments?.length || 0}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                                    <FaBookmark className="text-primary" />
                                    {restaurantClosed ? 'Reel visible, restaurant closed' : deliveryPaused ? 'Reel visible, ordering paused' : 'Reel live for orders'}
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default MyReels;
