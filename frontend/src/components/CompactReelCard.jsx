import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBookmark, FaRegBookmark, FaStore, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
    formatCurrency,
    getRestaurantLocation,
    getRestaurantName,
    isRestaurantDeliveryPaused
} from '../utils/formatters';

const CompactReelCard = ({ reel }) => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [saving, setSaving] = useState(false);

    const isSaved = useMemo(
        () => user?.savedReels?.some((savedReelId) => savedReelId === reel._id || savedReelId?._id === reel._id),
        [reel._id, user?.savedReels]
    );

    const handleSave = async () => {
        if (!user?.token || saving) {
            toast.error('Please login first');
            return;
        }

        try {
            setSaving(true);
            const { data } = await api.put(`/api/reels/${reel._id}/save`);
            updateUser({ savedReels: data.data.savedReels });
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update saved reel');
        } finally {
            setSaving(false);
        }
    };

    return (
        <article className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.45)] transition hover:-translate-y-1 hover:border-white/20">
            <div className="relative aspect-[9/16] overflow-hidden bg-black">
                <video
                    src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000')}${reel.videoUrl}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    muted
                    autoPlay
                    loop
                    playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-xl transition hover:scale-105 hover:bg-black/70 disabled:opacity-50"
                >
                    {isSaved ? <FaBookmark size={16} className="text-primary" /> : <FaRegBookmark size={16} />}
                </button>
                {isRestaurantDeliveryPaused(reel.restaurant) && (
                    <span className="absolute left-4 top-4 rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-[11px] font-semibold text-amber-200 backdrop-blur-xl">
                        Online delivery paused
                    </span>
                )}
            </div>

            <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-lg font-semibold text-white">{reel.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{formatCurrency(reel.price)}</p>
                    </div>
                    <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {reel.likes?.length || 0} likes
                    </div>
                </div>

                <div className="space-y-2 rounded-2xl border border-white/8 bg-black/30 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                        <FaStore className="text-primary" />
                        <span>{getRestaurantName(reel.restaurant)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <FaMapMarkerAlt className="text-slate-500" />
                        <span>{getRestaurantLocation(reel.restaurant) || 'Location shared in restaurant profile'}</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate(`/restaurant/${reel.restaurant?._id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/30 hover:bg-primary/12"
                >
                    View restaurant
                    <FaArrowRight size={12} />
                </button>
            </div>
        </article>
    );
};

export default CompactReelCard;
