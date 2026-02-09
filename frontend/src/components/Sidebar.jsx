import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaPlay, FaShoppingBag, FaUser, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { BiMessageRoundedDots } from 'react-icons/bi';

const Sidebar = () => {
    const location = useLocation();
    
    const menuItems = [
        { icon: FaHome, label: 'Home', path: '/' },
        { icon: FaSearch, label: 'Search', path: '/search' },
        { icon: FaPlay, label: 'Reels', path: '/' }, // Assuming Home IS Reels feed as per current app structure
        { icon: BiMessageRoundedDots, label: 'Messages', path: '/messages' },
        { icon: FaShoppingCart, label: 'Cart', path: '/cart' },
        { icon: FaHeart, label: 'Notifications', path: '/notifications' },
        { icon: FaShoppingBag, label: 'Orders', path: '/orders' },
        { icon: FaUser, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="hidden md:flex flex-col h-screen w-16 xl:w-[244px] fixed left-0 top-0 border-r border-gray-800 bg-black text-white px-2 xl:px-4 py-8 z-50">
            {/* Logo */}
            <div className="mb-8 px-2 xl:px-4 mt-2">
                <h1 className="hidden xl:block text-2xl font-heading font-bold tracking-wide cursor-pointer">BiteReels</h1>
                <FaPlay className="xl:hidden text-2xl cursor-pointer" />
            </div>

            {/* Menu */}
            <nav className="flex-1 flex flex-col gap-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link 
                            key={item.label}
                            to={item.path}
                            className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900 transition-all group ${isActive ? 'font-bold' : ''}`}
                        >
                            <item.icon className={`text-2xl group-hover:scale-105 transition-transform ${isActive ? 'text-white' : 'text-gray-200'}`} />
                            <span className="hidden xl:block text-base">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
