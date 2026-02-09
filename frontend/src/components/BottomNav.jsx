import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaShoppingBag, FaUser } from 'react-icons/fa';

const BottomNav = () => {
    const location = useLocation();

    const navItems = [
        { icon: FaHome, path: '/' },
        { icon: FaSearch, path: '/search' },
        { icon: FaShoppingBag, path: '/orders' }, // Changed Cart -> Orders/Bag for mobile nav
        { icon: FaUser, path: '/profile' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 w-full bg-black border-t border-gray-800 flex justify-between items-center px-6 py-3 z-50">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link key={item.path} to={item.path}>
                        <item.icon className={`text-2xl transition-transform active:scale-95 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    </Link>
                );
            })}
        </div>
    );
};

export default BottomNav;
