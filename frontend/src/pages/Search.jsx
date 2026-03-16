import { useEffect, useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaSlidersH, FaLocationArrow, FaUtensils } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../api/client';
import CompactReelCard from '../components/CompactReelCard';

const Search = () => {
    const [food, setFood] = useState('');
    const [location, setLocation] = useState('');
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [radius, setRadius] = useState(10);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const hasQuery = food.trim() || location.trim() || (lat && lng);

        if (!hasQuery) {
            setResults([]);
            return undefined;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const params = {};

                if (food.trim()) params.food = food.trim();
                if (lat && lng) {
                    params.lat = lat;
                    params.lng = lng;
                    params.radius = radius;
                } else if (location.trim()) {
                    params.location = location.trim();
                }

                const response = await api.get('/api/reels/search', { params });
                if (response.data.success) {
                    setResults(response.data.data);
                }
            } catch (error) {
                console.error('Search error', error);
                toast.error('Unable to search reels right now');
            } finally {
                setLoading(false);
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [food, location, lat, lng, radius]);

    const getMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported on this device');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLat(position.coords.latitude);
                setLng(position.coords.longitude);
                setLocation('Using current location');
                toast.success('Current location applied');
            },
            () => toast.error('Unable to access your location')
        );
    };

    const clearLocation = () => {
        setLat(null);
        setLng(null);
        setLocation('');
    };

    return (
        <div className="min-h-[calc(100vh-24px)] px-4 py-6 pb-28 md:px-6 md:py-8">
            <div className="mx-auto w-full max-w-5xl space-y-8">
                <section className="overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(135deg,rgba(251,93,71,0.18),rgba(15,23,42,0.5),rgba(2,6,23,0.9))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] md:p-8">
                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr] xl:items-end">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary/90">Search</p>
                            <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-white md:text-[3.5rem]">Find reels by dish, area, or live nearby restaurants.</h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                                Cleaner cards, smarter location search, and delivery-aware results so users don’t waste time on restaurants that have paused online orders.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4 backdrop-blur-xl">
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Live Query</p>
                                <p className="mt-2 text-xl font-black text-white">{results.length}</p>
                                <p className="text-sm text-slate-400">matching reels</p>
                            </div>
                            <div className="rounded-[24px] border border-white/8 bg-black/20 p-4 backdrop-blur-xl">
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Search Radius</p>
                                <p className="mt-2 text-xl font-black text-white">{radius} km</p>
                                <p className="text-sm text-slate-400">for geolocation mode</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-[32px] border border-white/8 bg-slate-950/45 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-6">
                    <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr_auto]">
                        <label className="relative block">
                            <FaSearch className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search dish name, like Paneer Tikka or Biryani"
                                value={food}
                                onChange={(event) => setFood(event.target.value)}
                                className="h-16 w-full rounded-[22px] border border-white/10 bg-white/[0.04] pl-14 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-primary/40 focus:bg-white/[0.06]"
                            />
                        </label>

                        <label className="relative block">
                            <FaMapMarkerAlt className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search city or area"
                                value={location}
                                onChange={(event) => {
                                    setLocation(event.target.value);
                                    setLat(null);
                                    setLng(null);
                                }}
                                className="h-16 w-full rounded-[22px] border border-white/10 bg-white/[0.04] pl-14 pr-16 text-white outline-none transition placeholder:text-slate-500 focus:border-primary/40 focus:bg-white/[0.06]"
                            />
                            <button
                                onClick={getMyLocation}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-primary transition hover:text-white"
                                title="Use my location"
                            >
                                <FaLocationArrow size={18} />
                            </button>
                        </label>

                        <button
                            onClick={() => setShowFilters((currentValue) => !currentValue)}
                            className={`flex h-16 items-center justify-center rounded-[22px] border px-5 transition ${
                                showFilters
                                    ? 'border-primary/30 bg-primary/15 text-primary'
                                    : 'border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]'
                            }`}
                        >
                            <FaSlidersH />
                        </button>
                    </div>

                    {(lat && lng) && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-500/12 px-4 py-2 text-xs font-semibold text-emerald-200">
                                Current location active
                            </span>
                            <button
                                onClick={clearLocation}
                                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 hover:text-white"
                            >
                                Clear location mode
                            </button>
                        </div>
                    )}

                    {showFilters && (
                        <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-semibold text-white">Delivery radius</p>
                                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    {radius} km
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={radius}
                                onChange={(event) => setRadius(Number(event.target.value))}
                                className="w-full accent-primary"
                            />
                            <div className="mt-2 flex justify-between text-[11px] uppercase tracking-[0.24em] text-slate-500">
                                <span>1 km</span>
                                <span>10 km</span>
                                <span>50 km</span>
                            </div>
                        </div>
                    )}
                </section>

                {loading ? (
                    <div className="flex items-center justify-center rounded-[32px] border border-white/8 bg-slate-950/40 py-24">
                        <div className="text-center">
                            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                            <p className="text-sm font-medium text-slate-400">Finding the best matching reels...</p>
                        </div>
                    </div>
                ) : results.length > 0 ? (
                    <section className="space-y-5">
                        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">
                            <FaUtensils className="text-primary" />
                            {results.length} reels found
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                            {results.map((reel) => (
                                <CompactReelCard key={reel._id} reel={reel} />
                            ))}
                        </div>
                    </section>
                ) : (food.trim() || location.trim() || (lat && lng)) ? (
                    <div className="rounded-[32px] border border-dashed border-white/10 bg-slate-950/35 px-6 py-24 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/8 bg-white/[0.04]">
                            <FaSearch className="text-slate-500" size={22} />
                        </div>
                        <h3 className="mt-5 text-2xl font-bold text-white">No matching reels found</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                            Try a broader dish name, change the area, or increase the radius for location-based results.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-[32px] border border-white/8 bg-slate-950/35 px-6 py-24 text-center">
                        <h3 className="text-2xl font-bold text-white">Start with a dish or location</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-400">
                            Search is now optimized for compact results, better spacing, and cleaner reel discovery.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
