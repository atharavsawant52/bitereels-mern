import { useEffect, useState } from 'react';
import { FaBookmark, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import CompactReelCard from '../components/CompactReelCard';

const SavedReels = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSavedReels = async () => {
            try {
                const { data } = await api.get('/api/reels/saved');
                if (data.success) {
                    setReels(data.data);
                }
            } catch (error) {
                console.error(error);
                toast.error('Unable to load saved reels');
            } finally {
                setLoading(false);
            }
        };

        fetchSavedReels();
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-24px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                    <p className="text-sm text-slate-400">Loading your saved reels...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-24px)] px-4 py-6 pb-28 md:px-6 md:py-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                    >
                        <FaArrowLeft size={14} />
                    </button>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Saved</p>
                        <h1 className="text-3xl font-black tracking-tight text-white">Your saved reels</h1>
                    </div>
                </div>

                {reels.length === 0 ? (
                    <div className="rounded-[32px] border border-dashed border-white/10 bg-slate-950/35 px-6 py-24 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/8 bg-white/[0.04]">
                            <FaBookmark className="text-primary" size={20} />
                        </div>
                        <h3 className="mt-5 text-2xl font-bold text-white">No reels saved yet</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                            Tap the save icon on any reel and it will appear here for quick access later.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                        {reels.map((reel) => (
                            <CompactReelCard key={reel._id} reel={reel} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedReels;
