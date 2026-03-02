import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaStore, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

    // Restaurant-specific structured address fields
    const [restaurantName, setRestaurantName] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [area, setArea] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);

    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [toastId, setToastId] = useState(null);

    const getCoordinates = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLat(position.coords.latitude);
                setLng(position.coords.longitude);
                toast.success('Location captured');
            },
            () => {
                toast.error('Unable to retrieve your location');
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await signup(username, email, password, role, 
                role === 'restaurant' ? {
                    restaurantName,
                    phone,
                    businessAddress: { street, area, city, state, postalCode, 
                        location: lat && lng ? { type: 'Point', coordinates: [lng, lat] } : undefined 
                    }
                } : {}
            );
            toast.success('Welcome to BiteReels!');
            navigate(role === 'restaurant' ? '/restaurant-dashboard' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black py-12 px-4">
            <div className="w-full max-w-xl p-8 bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-3xl shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-heading font-extrabold text-white mb-2 tracking-tight">
                        Create Account
                    </h2>
                    <p className="text-gray-400">Join the BiteReels community today</p>
                </div>

                {/* Role Toggle */}
                <div className="flex bg-black/50 border border-gray-800 rounded-2xl p-1.5 mb-8">
                    <button
                        type="button"
                        className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${role === 'user' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                        onClick={() => setRole('user')}
                    >
                        <FaUser size={14} />
                        Customer
                    </button>
                    <button
                        type="button"
                        className={`flex-1 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${role === 'restaurant' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                        onClick={() => setRole('restaurant')}
                    >
                        <FaStore size={14} />
                        Restaurant
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-gray-400 text-sm font-semibold ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                    <FaUser size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-gray-600"
                                    placeholder="johndoe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-400 text-sm font-semibold ml-1">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                    <FaEnvelope size={16} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-gray-600"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-400 text-sm font-semibold ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                <FaLock size={16} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-gray-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Restaurant-specific fields */}
                    {role === 'restaurant' && (
                        <div className="pt-4 space-y-6 animate-fadeIn">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-px bg-gray-800 flex-1"></div>
                                <span className="text-primary font-bold uppercase tracking-widest text-xs">Business Details</span>
                                <div className="h-px bg-gray-800 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-gray-400 text-sm font-semibold ml-1">Restaurant Name</label>
                                    <input
                                        type="text"
                                        value={restaurantName}
                                        onChange={(e) => setRestaurantName(e.target.value)}
                                        className="w-full px-4 py-3.5 rounded-2xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-gray-600"
                                        placeholder="Gourmet Heaven"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-gray-400 text-sm font-semibold ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-3.5 rounded-2xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder-gray-600"
                                        placeholder="+91 98765 43210"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4 bg-black/30 p-6 rounded-3xl border border-gray-800/50">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-white text-sm font-bold ml-1 uppercase tracking-wide">Business Address</label>
                                    <button
                                        type="button"
                                        onClick={getCoordinates}
                                        className="text-xs font-bold text-primary hover:text-white transition-colors flex items-center gap-1.5 py-1 px-3 rounded-full bg-primary/10 border border-primary/20"
                                    >
                                        <FaMapMarkerAlt /> {lat ? 'Location Captured' : 'Auto Detect coordinates'}
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Street Address / Shop No."
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary text-sm"
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Area / Landmark"
                                            value={area}
                                            onChange={(e) => setArea(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="City"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="State"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary text-sm"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Postal Code"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl bg-black/40 text-white border border-gray-800 focus:outline-none focus:border-primary text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary to-orange-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 transform active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                role === 'restaurant' ? 'Register Restaurant' : 'Create Customer Account'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-10 text-center border-t border-gray-800 pt-8">
                    <p className="text-gray-500 text-sm">
                        Already part of the flavors?{' '}
                        <Link to="/login" className="text-primary font-bold hover:text-white transition-colors ml-1">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
