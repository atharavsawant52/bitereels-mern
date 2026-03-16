import { useState, useEffect, useRef } from 'react';
import { FaCompass } from 'react-icons/fa';
import ReelCard from './ReelCard';
import api from '../api/client';

const ReelFeed = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);
    const reelRefs = useRef([]);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const response = await api.get('/api/reels');
                if (response.data.success) {
                    setReels(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching reels', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReels();
    }, []);

    const scrollToReel = (direction) => {
        if (!reelRefs.current.length) return;

        const viewportCenter = window.innerHeight / 2;
        const currentIndex = reelRefs.current.findIndex((node) => {
            if (!node) return false;
            const rect = node.getBoundingClientRect();
            return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
        });

        const fallbackIndex = currentIndex === -1 ? 0 : currentIndex;
        const nextIndex = direction === 'up'
            ? Math.max(fallbackIndex - 1, 0)
            : Math.min(fallbackIndex + 1, reelRefs.current.length - 1);

        reelRefs.current[nextIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-[70dvh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-14 w-14 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                    <p className="text-sm font-medium text-slate-400">Loading fresh food reels...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative mx-auto flex h-full w-full max-w-[460px] flex-col items-center overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-4 z-30 flex items-center justify-center gap-3">
                <div className="rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-300 backdrop-blur-xl">
                    Trending Reels
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs text-slate-300 backdrop-blur-xl md:flex">
                    <FaCompass className="text-primary" />
                    Scroll for the next dish
                </div>
            </div>

            <div className="pointer-events-none absolute right-[-72px] top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:right-[-84px]">
                <div className="pointer-events-auto flex flex-col gap-3">
                    <button
                        onClick={() => scrollToReel('up')}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-white/90 shadow-xl backdrop-blur-xl transition-all hover:scale-110 hover:bg-white/15"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scrollToReel('down')}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-950/70 text-white/90 shadow-xl backdrop-blur-xl transition-all hover:scale-110 hover:bg-white/15"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="no-scrollbar h-[100dvh] w-full overflow-y-scroll scroll-smooth snap-y snap-mandatory">
                {reels.map((reel, index) => (
                    <div
                        key={reel._id}
                        ref={(node) => {
                            reelRefs.current[index] = node;
                        }}
                        className="flex h-[100dvh] w-full snap-start items-center justify-center"
                    >
                        <div className="flex w-full justify-center px-2 py-4 md:px-4">
                            <ReelCard reel={reel} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReelFeed;
