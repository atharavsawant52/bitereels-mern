import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaShoppingBag, FaUser, FaBell } from 'react-icons/fa';

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { icon: FaHome, path: '/', label: 'Home' },
        { icon: FaSearch, path: '/search', label: 'Search' },
        { icon: FaBell, path: '/notifications', label: 'Notifications' },
        { icon: FaShoppingBag, path: '/orders', label: 'Orders' },
        { icon: FaUser, path: '/profile', label: 'Profile' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 w-full bg-black border-t border-gray-800 flex justify-around items-center px-4 py-3 z-50">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link key={item.path} to={item.path} className="flex flex-col items-center gap-1">
                        <item.icon className={`text-xl transition-transform active:scale-95 ${isActive ? 'text-primary' : 'text-gray-500'}`} />
                    </Link>
                );
            })}
        </div>
    );
};

export default BottomNav;
