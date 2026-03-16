import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaShoppingBag, FaUser, FaBell, FaBookmark, FaStore, FaVideo, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();

    const userNavItems = [
        { icon: FaHome, path: '/', label: 'Home' },
        { icon: FaSearch, path: '/search', label: 'Search' },
        { icon: FaBookmark, path: '/saved', label: 'Saved' },
        { icon: FaBell, path: '/notifications', label: 'Notifications' },
        { icon: FaShoppingBag, path: '/orders', label: 'Orders' },
        { icon: FaUser, path: '/profile', label: 'Profile' },
    ];
    const restaurantNavItems = [
        { icon: FaStore, path: '/restaurant-dashboard', label: 'Dashboard' },
        { icon: FaVideo, path: '/restaurant/upload', label: 'Upload' },
        { icon: FaUtensils, path: '/restaurant/menu', label: 'Menu' },
        { icon: FaShoppingBag, path: '/restaurant/orders', label: 'Orders' },
        { icon: FaBell, path: '/notifications', label: 'Notifications' }
    ];
    const navItems = user?.role === 'restaurant' ? restaurantNavItems : userNavItems;

    return (
        <div className="md:hidden fixed bottom-4 left-3 right-3 z-50 rounded-[28px] border border-white/10 bg-slate-950/90 px-3 py-3 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-2">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link key={item.path} to={item.path} className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-transform active:scale-95 ${
                            isActive ? 'bg-primary/15 text-primary' : 'text-slate-500'
                        }`}>
                            <item.icon className="text-lg" />
                        </div>
                    </Link>
                );
            })}
            </div>
        </div>
    );
};

export default BottomNav;
