import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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
        <div className="flex items-center justify-center min-h-screen bg-dark px-4">
            <div className="w-full max-w-md p-8 bg-secondary rounded-[2rem] shadow-2xl border border-gray-800">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Welcome Back</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Login to your BiteReels account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary py-4 rounded-3xl font-black uppercase tracking-[0.2em] text-sm text-white hover:bg-orange-600 transition shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
                
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                        Don't have an account? {' '}
                        <Link to="/signup" className="text-primary hover:text-orange-400 ml-1">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
