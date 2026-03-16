import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaMapMarkerAlt, FaStore, FaUser, FaLock, FaEnvelope } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');

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
            await signup(username, email, password, role,
                role === 'restaurant' ? {
                    restaurantName,
                    phone,
                    businessAddress: {
                        street,
                        area,
                        city,
                        state,
                        postalCode,
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
        <AuthLayout
            eyebrow="Create Your Access"
            title="Restaurants and food lovers, same reel-first universe."
            subtitle="Launch a customer account or register a restaurant and start publishing dishes that convert views into real orders."
            formTitle="Create Account"
            formSubtitle="Join the BiteReels community today"
            footer={(
                <div className="mt-10 border-t border-white/8 pt-8 text-center">
                    <p className="text-sm text-slate-500">
                        Already part of the flavors?
                        <Link to="/login" className="ml-2 font-bold text-primary transition-colors hover:text-white">
                            Login here
                        </Link>
                    </p>
                </div>
            )}
        >
            <div className="mb-8 flex rounded-[22px] border border-white/8 bg-black/35 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <button
                    type="button"
                    className={`flex flex-1 items-center justify-center gap-2 rounded-[18px] py-3 font-bold transition-all duration-300 ${role === 'user' ? 'bg-primary text-white shadow-[0_14px_30px_rgba(251,93,71,0.25)]' : 'text-slate-500 hover:text-white'}`}
                    onClick={() => setRole('user')}
                >
                    <FaUser size={14} />
                    Customer
                </button>
                <button
                    type="button"
                    className={`flex flex-1 items-center justify-center gap-2 rounded-[18px] py-3 font-bold transition-all duration-300 ${role === 'restaurant' ? 'bg-primary text-white shadow-[0_14px_30px_rgba(251,93,71,0.25)]' : 'text-slate-500 hover:text-white'}`}
                    onClick={() => setRole('restaurant')}
                >
                    <FaStore size={14} />
                    Restaurant
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <motion.div whileHover={{ y: -1 }} className="space-y-2">
                        <label className="ml-1 block text-sm font-semibold text-slate-400">Username</label>
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 transition-colors group-focus-within:text-primary">
                                <FaUser size={16} />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-[22px] border border-white/8 bg-black/40 py-3.5 pl-11 pr-4 text-white transition-all placeholder:text-slate-600 hover:border-primary/25 hover:shadow-[0_0_0_4px_rgba(251,93,71,0.08)] focus:border-primary focus:outline-none focus:shadow-[0_0_0_4px_rgba(251,93,71,0.12)]"
                                placeholder="johndoe"
                                required
                            />
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -1 }} className="space-y-2">
                        <label className="ml-1 block text-sm font-semibold text-slate-400">Email</label>
                        <div className="group relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 transition-colors group-focus-within:text-primary">
                                <FaEnvelope size={16} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-[22px] border border-white/8 bg-black/40 py-3.5 pl-11 pr-4 text-white transition-all placeholder:text-slate-600 hover:border-primary/25 hover:shadow-[0_0_0_4px_rgba(251,93,71,0.08)] focus:border-primary focus:outline-none focus:shadow-[0_0_0_4px_rgba(251,93,71,0.12)]"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                    </motion.div>
                </div>

                <motion.div whileHover={{ y: -1 }} className="space-y-2">
                    <label className="ml-1 block text-sm font-semibold text-slate-400">Password</label>
                    <div className="group relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 transition-colors group-focus-within:text-primary">
                            <FaLock size={16} />
                        </div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-[22px] border border-white/8 bg-black/40 py-3.5 pl-11 pr-4 text-white transition-all placeholder:text-slate-600 hover:border-primary/25 hover:shadow-[0_0_0_4px_rgba(251,93,71,0.08)] focus:border-primary focus:outline-none focus:shadow-[0_0_0_4px_rgba(251,93,71,0.12)]"
                            placeholder="********"
                            required
                        />
                    </div>
                </motion.div>

                {role === 'restaurant' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.35 }}
                        className="space-y-6 pt-4"
                    >
                        <div className="mb-2 flex items-center gap-3">
                            <div className="h-px flex-1 bg-white/8" />
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Business Details</span>
                            <div className="h-px flex-1 bg-white/8" />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="ml-1 block text-sm font-semibold text-slate-400">Restaurant Name</label>
                                <input
                                    type="text"
                                    value={restaurantName}
                                    onChange={(e) => setRestaurantName(e.target.value)}
                                    className="w-full rounded-[22px] border border-white/8 bg-black/40 px-4 py-3.5 text-white transition-all placeholder:text-slate-600 hover:border-primary/25 hover:shadow-[0_0_0_4px_rgba(251,93,71,0.08)] focus:border-primary focus:outline-none focus:shadow-[0_0_0_4px_rgba(251,93,71,0.12)]"
                                    placeholder="Gourmet Heaven"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 block text-sm font-semibold text-slate-400">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full rounded-[22px] border border-white/8 bg-black/40 px-4 py-3.5 text-white transition-all placeholder:text-slate-600 hover:border-primary/25 hover:shadow-[0_0_0_4px_rgba(251,93,71,0.08)] focus:border-primary focus:outline-none focus:shadow-[0_0_0_4px_rgba(251,93,71,0.12)]"
                                    placeholder="+91 98765 43210"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4 rounded-[28px] border border-white/8 bg-black/28 p-6">
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <label className="ml-1 block text-sm font-bold uppercase tracking-[0.16em] text-white">Business Address</label>
                                <button
                                    type="button"
                                    onClick={getCoordinates}
                                    className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary transition-colors hover:text-white"
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
                                    className="w-full rounded-xl border border-white/8 bg-black/40 px-4 py-3 text-sm text-white transition-all placeholder:text-slate-600 hover:border-primary/25 focus:border-primary focus:outline-none"
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Area / Landmark"
                                        value={area}
                                        onChange={(e) => setArea(e.target.value)}
                                        className="w-full rounded-xl border border-white/8 bg-black/40 px-4 py-3 text-sm text-white transition-all placeholder:text-slate-600 hover:border-primary/25 focus:border-primary focus:outline-none"
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full rounded-xl border border-white/8 bg-black/40 px-4 py-3 text-sm text-white transition-all placeholder:text-slate-600 hover:border-primary/25 focus:border-primary focus:outline-none"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full rounded-xl border border-white/8 bg-black/40 px-4 py-3 text-sm text-white transition-all placeholder:text-slate-600 hover:border-primary/25 focus:border-primary focus:outline-none"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        value={postalCode}
                                        onChange={(e) => setPostalCode(e.target.value)}
                                        className="w-full rounded-xl border border-white/8 bg-black/40 px-4 py-3 text-sm text-white transition-all placeholder:text-slate-600 hover:border-primary/25 focus:border-primary focus:outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="pt-3">
                    <motion.button
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-[26px] bg-gradient-to-r from-primary to-orange-600 py-4 text-lg font-bold text-white shadow-[0_18px_50px_rgba(251,93,71,0.28)] transition-all disabled:pointer-events-none disabled:opacity-60"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                <span>Processing...</span>
                            </div>
                        ) : (
                            role === 'restaurant' ? 'Register Restaurant' : 'Create Customer Account'
                        )}
                    </motion.button>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Signup;
