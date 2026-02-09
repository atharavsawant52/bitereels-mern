import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEdit, FaPlus, FaUtensils, FaClipboardList } from 'react-icons/fa';
import DashboardStats from '../components/DashboardStats';
import MyReels from '../components/MyReels';
import EditProfileModal from '../components/EditProfileModal';

const RestaurantDashboard = () => {
    const { user, logout } = useAuth(); // Ideally use setAuth or similar to update user in context, but refreshing also works
    const navigate = useNavigate();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    // Local state for user details to reflect changes immediately without full context reload if needed
    // But modifying context is better. For now, we rely on page refresh or simple prop passing if child needs it.
    // The Modal updates the backend. The context might be stale until refresh.
    // Let's reload page on successful update or just accept it for now.
    
    // Quick fix: simple local state for display if context doesn't update automatically 
    // (Assuming AuthContext reads from localStorage on init, so updating localStorage + reload works or setAuth)
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileUpdate = (updatedUser) => {
        // Update local storage to keep data consistent incase of refresh
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const newUserInfo = { ...userInfo, restaurantDetails: updatedUser.restaurantDetails };
        localStorage.setItem('userInfo', JSON.stringify(newUserInfo));
        // Force reload or update context (if exposing setAuth) - simplistic approach:
        window.location.reload(); 
    };

    return (
        <div className="min-h-screen bg-dark text-light p-6 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-700 pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-primary tracking-tight">Restaurant Dashboard</h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                        Welcome, <span className="text-white font-semibold">{user?.restaurantDetails?.restaurantName || user?.username}</span>
                        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full border border-primary/30">PRO</span>
                    </p>
                </div>
                <button 
                    onClick={handleLogout}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-6 py-2 rounded-lg transition font-medium text-sm"
                >
                    Logout
                </button>
            </header>

            {/* Analytics Section */}
            <DashboardStats />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Left Column: Actions & Details */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Quick Custom Actions */}
                    <div className="bg-secondary p-5 rounded-xl shadow-lg border border-gray-700">
                        <h3 className="text-lg font-bold mb-4 text-white">Quick Actions</h3>
                        <div className="space-y-3">
                            <button 
                                onClick={() => navigate('/restaurant/upload')}
                                className="w-full flex items-center gap-3 bg-primary hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition shadow-md group"
                            >
                                <div className="bg-white/20 p-2 rounded-md group-hover:scale-110 transition">
                                    <FaPlus size={14} />
                                </div>
                                <span className="font-semibold">Upload New Reel</span>
                            </button>

                            <button 
                                onClick={() => navigate('/restaurant/menu')}
                                className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition border border-gray-600 group"
                            >
                                <div className="bg-gray-700 p-2 rounded-md group-hover:bg-gray-600 transition">
                                    <FaUtensils size={14} className="text-gray-300" />
                                </div>
                                <span className="font-semibold">Manage Menu</span>
                            </button>

                            <button 
                                onClick={() => navigate('/restaurant/orders')}
                                className="w-full flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition border border-gray-600 group"
                            >
                                <div className="bg-gray-700 p-2 rounded-md group-hover:bg-gray-600 transition">
                                    <FaClipboardList size={14} className="text-gray-300" />
                                </div>
                                <div className="flex justify-between w-full items-center">
                                    <span className="font-semibold">Orders Received</span>
                                    {/* Badge could go here */}
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Restaurant Profile Card */}
                    <div className="bg-secondary p-5 rounded-xl shadow-lg border border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <FaUtensils size={100} />
                        </div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <h3 className="text-lg font-bold text-white">Your Profile</h3>
                            <button 
                                onClick={() => setIsEditProfileOpen(true)}
                                className="text-primary hover:text-orange-400 transition"
                            >
                                <FaEdit size={18} />
                            </button>
                        </div>
                        <div className="space-y-3 relative z-10 text-sm">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Name</p>
                                <p className="font-medium">{user?.restaurantDetails?.restaurantName || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Address</p>
                                <p className="font-medium text-gray-300">{user?.restaurantDetails?.address || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Phone</p>
                                <p className="font-medium text-gray-300">{user?.restaurantDetails?.phone || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Reel Management (Wider) */}
                <div className="lg:col-span-3">
                    <MyReels />
                </div>
            </div>

            {/* Modals */}
            <EditProfileModal 
                isOpen={isEditProfileOpen} 
                onClose={() => setIsEditProfileOpen(false)} 
                userDetails={user?.restaurantDetails}
                onUpdate={handleProfileUpdate}
            />
        </div>
    );
};

export default RestaurantDashboard;
