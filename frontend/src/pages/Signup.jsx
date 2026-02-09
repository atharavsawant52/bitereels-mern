import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // 'user' or 'restaurant'
    const [restaurantName, setRestaurantName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await signup(username, email, password, role, {
                restaurantName,
                address,
                phone
            });
            navigate(role === 'restaurant' ? '/restaurant-dashboard' : '/');
        } catch (err) {
            setError(err);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-dark py-12">
            <div className="w-full max-w-md p-8 bg-secondary rounded-lg shadow-lg">
                <h2 className="text-3xl font-heading font-bold text-center text-primary mb-6">Join BiteReels</h2>
                {error && <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">{error}</div>}
                
                {/* Role Toggle */}
                <div className="flex bg-dark rounded-lg p-1 mb-6">
                    <button
                        className={`flex-1 py-2 rounded-md font-bold transition-all ${role === 'user' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setRole('user')}
                    >
                        User
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-md font-bold transition-all ${role === 'restaurant' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
                        onClick={() => setRole('restaurant')}
                    >
                        Restaurant
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-3 rounded bg-dark text-light border border-gray-700 focus:outline-none focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded bg-dark text-light border border-gray-700 focus:outline-none focus:border-primary"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 rounded bg-dark text-light border border-gray-700 focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    {/* Restaurant Specific Fields */}
                    {role === 'restaurant' && (
                        <>
                            <div className="border-t border-gray-700 pt-4 mt-4">
                                <h3 className="text-xl text-primary font-bold mb-3">Restaurant Details</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">Restaurant Name</label>
                                        <input
                                            type="text"
                                            value={restaurantName}
                                            onChange={(e) => setRestaurantName(e.target.value)}
                                            className="w-full p-3 rounded bg-dark text-light border border-gray-700 focus:outline-none focus:border-primary"
                                            required={role === 'restaurant'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full p-3 rounded bg-dark text-light border border-gray-700 focus:outline-none focus:border-primary"
                                            required={role === 'restaurant'}
                                        />
                                    </div>
                                     <div>
                                        <label className="block text-gray-300 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full p-3 rounded bg-dark text-light border border-gray-700 focus:outline-none focus:border-primary"
                                            required={role === 'restaurant'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded font-bold hover:bg-red-500 transition duration-300"
                    >
                        {role === 'restaurant' ? 'Register Restaurant' : 'Sign Up'}
                    </button>
                </form>
                <div className="mt-4 text-center text-gray-400">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
