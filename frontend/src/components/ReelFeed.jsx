import { useState, useEffect, useRef } from 'react';
import ReelCard from './ReelCard';
import api from '../api/client';

const ReelFeed = () => {
    const [reels, setReels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                const response = await api.get('/api/reels');
                const resData = response.data;
                if (resData.success) {
                    setReels(resData.data);
                }
            } catch (error) {
                console.error("Error fetching reels", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReels();
    }, []);

    const containerRef = useRef(null);

    const scrollToReel = (direction) => {
        if (containerRef.current) {
            const container = containerRef.current;
            const scrollAmount = container.clientHeight;
            container.scrollBy({
                top: direction === 'up' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) return <div className="text-center mt-10">Loading Reels...</div>;

    return (
        <div className="relative w-full h-[100dvh]">
             {/* Navigation Arrows - Right Side Floating */}
             <div className="hidden lg:flex flex-col gap-4 absolute -right-28 top-1/2 -translate-y-1/2 z-50">
                <button 
                    onClick={() => scrollToReel('up')}
                    className="w-12 h-12 bg-gray-800/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 hover:bg-white/20 hover:scale-110 transition-all border border-white/10 shadow-xl"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
                </button>
                <button 
                    onClick={() => scrollToReel('down')}
                    className="w-12 h-12 bg-gray-800/60 backdrop-blur-md rounded-full flex items-center justify-center text-white/90 hover:bg-white/20 hover:scale-110 transition-all border border-white/10 shadow-xl"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
                </button>
            </div>

            <div 
                ref={containerRef}
                className="h-full w-full snap-y snap-mandatory overflow-y-scroll no-scrollbar scroll-smooth"
            >
                {reels.map((reel) => (
                    <ReelCard key={reel._id} reel={reel} />
                ))}
            </div>
        </div>
    );
};

export default ReelFeed;
