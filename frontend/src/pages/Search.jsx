import { useState, useEffect } from 'react';
import ReelCard from '../components/ReelCard';
import { FaSearch, FaMapMarkerAlt, FaUtensils, FaSlidersH, FaLocationArrow } from 'react-icons/fa';
import api from '../api/client';

const Search = () => {
    const [food, setFood] = useState('');
    const [location, setLocation] = useState('');
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);
    const [radius, setRadius] = useState(10); // Default 10km
    
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!food && !location && !lat) return;

        setLoading(true);
        try {
            const params = { food };
            if (lat && lng) {
                params.lat = lat;
                params.lng = lng;
                params.radius = radius;
            } else if (location) {
                params.location = location; // fallback to text match
            }

            const response = await api.get('/api/reels/search', { params });
            const resData = response.data;
            if (resData.success) {
                setResults(resData.data);
            }
        } catch (error) {
            console.error('Search error', error);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search for food name
    useEffect(() => {
        const timer = setTimeout(() => {
            if (food || location || lat) handleSearch();
        }, 500);
        return () => clearTimeout(timer);
    }, [food, radius]);

    const getMyLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        navigator.geolocation.getCurrentPosition((pos) => {
            setLat(pos.coords.latitude);
            setLng(pos.coords.longitude);
            setLocation('Current Location');
            handleSearch();
        });
    };

    return (
        <div className="min-h-screen bg-black text-white pb-32 pt-4 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading font-black mb-6 tracking-tight">Explore Flavors</h1>
                    
                    <div className="flex flex-col gap-4">
                        {/* Search Bar */}
                        <div className="relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition" />
                            <input
                                type="text"
                                placeholder="Search for food (e.g. Biryani, Pizza)"
                                value={food}
                                onChange={(e) => setFood(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 p-4 pl-12 rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-xl"
                            />
                        </div>

                        {/* Location Bar */}
                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition" />
                                <input
                                    type="text"
                                    placeholder="Location (City or Area)"
                                    value={location}
                                    onChange={(e) => {
                                        setLocation(e.target.value);
                                        setLat(null);
                                        setLng(null);
                                    }}
                                    className="w-full bg-gray-900 border border-gray-800 p-4 pl-12 rounded-2xl outline-none focus:border-primary transition shadow-xl"
                                />
                                <button 
                                    onClick={getMyLocation}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary hover:text-white transition"
                                    title="Use my location"
                                >
                                    <FaLocationArrow size={16} />
                                </button>
                            </div>
                            <button 
                                onClick={() => setShowFilters(!showFilters)}
                                className={`p-4 rounded-2xl border transition shadow-xl ${showFilters ? 'bg-primary border-primary text-white' : 'bg-gray-900 border-gray-800 text-gray-500'}`}
                            >
                                <FaSlidersH />
                            </button>
                        </div>

                        {/* Filters Dropdown */}
                        {showFilters && (
                            <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 p-6 rounded-3xl animate-fadeIn">
                                <label className="block text-xs font-black uppercase tracking-widest text-primary mb-3">Search Radius: {radius} km</label>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="50" 
                                    value={radius} 
                                    onChange={(e) => setRadius(e.target.value)}
                                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold uppercase">
                                    <span>1 km</span>
                                    <span>Local (~5km)</span>
                                    <span>City Wide (~20km)</span>
                                    <span>50 km</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Finding the best reels...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {results.length > 0 ? (
                            <>
                                <div className="flex items-center gap-2 mb-2 text-gray-500 text-xs font-bold uppercase tracking-widest">
                                    <FaUtensils size={10} /> {results.length} Reels Found
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.map((reel) => (
                                        <ReelCard key={reel._id} reel={reel} />
                                    ))}
                                </div>
                            </>
                        ) : (
                            (food || location || lat) && (
                                <div className="text-center py-20 bg-gray-900/20 border border-gray-800 border-dashed rounded-3xl">
                                    <div className="bg-gray-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
                                        <FaSearch className="text-gray-600" size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-400">No matching flavors found</h3>
                                    <p className="text-gray-600 text-sm mt-1">Try changing your search or increasing radius</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
