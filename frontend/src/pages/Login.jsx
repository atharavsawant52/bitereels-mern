import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password);
            toast.success('Welcome back!');
            if (data.role === 'restaurant') {
                navigate('/restaurant-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            eyebrow="BiteReels Access"
            title="Food discovery that feels alive."
            subtitle="Watch dishes in motion, save what you love, and order from restaurants that know how to sell visually."
            formTitle="Welcome Back"
            formSubtitle="Login to your BiteReels account"
            footer={(
                <div className="mt-8 border-t border-white/8 pt-7 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                        Don't have an account?
                        <Link to="/signup" className="ml-2 text-primary transition hover:text-orange-300">Sign up</Link>
                    </p>
                </div>
            )}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <motion.div whileHover={{ y: -1 }} className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.34em] text-slate-500">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-[22px] border border-white/8 bg-black/45 px-4 py-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition duration-300 placeholder:text-slate-600 hover:border-primary/25 hover:shadow-[0_0_0_4px_rgba(251,93,71,0.08)] focus:border-primary focus:outline-none focus:shadow-[0_0_0_4px_rgba(251,93,71,0.12)]"
                        placeholder="name@example.com"
                        required
                    />
                </motion.div>

                <motion.div whileHover={{ y: -1 }} className="space-y-2">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.34em] text-slate-500">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-[22px] border border-white/8 bg-black/45 px-4 py-3.5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition duration-300 placeholder:text-slate-600 hover:border-primary/25 hover:shadow-[0_0_0_4px_rgba(251,93,71,0.08)] focus:border-primary focus:outline-none focus:shadow-[0_0_0_4px_rgba(251,93,71,0.12)]"
                        placeholder="********"
                        required
                    />
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-[28px] bg-gradient-to-r from-primary via-orange-500 to-orange-600 py-4 text-sm font-black uppercase tracking-[0.24em] text-white shadow-[0_18px_50px_rgba(251,93,71,0.3)] transition disabled:opacity-50"
                >
                    {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    ) : (
                        'Login'
                    )}
                </motion.button>
            </form>
        </AuthLayout>
    );
};

export default Login;
