import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaShoppingBag, FaUser, FaBell, FaShoppingCart, FaBookmark, FaStore, FaVideo, FaUtensils } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { user } = useAuth();

    const userMenuItems = [
        { icon: FaHome, label: 'Home', path: '/' },
        { icon: FaSearch, label: 'Search', path: '/search' },
        { icon: FaShoppingCart, label: 'Cart', path: '/cart' },
        { icon: FaBookmark, label: 'Saved', path: '/saved' },
        { icon: FaBell, label: 'Notifications', path: '/notifications' },
        { icon: FaShoppingBag, label: 'Orders', path: '/orders' },
        { icon: FaUser, label: 'Profile', path: '/profile' },
    ];
    const restaurantMenuItems = [
        { icon: FaStore, label: 'Dashboard', path: '/restaurant-dashboard' },
        { icon: FaVideo, label: 'Upload', path: '/restaurant/upload' },
        { icon: FaUtensils, label: 'Menu', path: '/restaurant/menu' },
        { icon: FaShoppingBag, label: 'Orders', path: '/restaurant/orders' },
        { icon: FaBell, label: 'Notifications', path: '/notifications' }
    ];
    const menuItems = user?.role === 'restaurant' ? restaurantMenuItems : userMenuItems;

    return (
        <aside className="hidden md:flex fixed left-0 top-0 z-50 h-screen w-[260px] flex-col overflow-hidden border-r border-white/8 bg-slate-950/85 px-4 py-6 backdrop-blur-2xl">
            <div className="flex h-full min-h-0 flex-col">
                <div className="mb-6 rounded-[28px] border border-white/8 bg-white/[0.04] px-4 py-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">BiteReels</p>
                    <h1 className="mt-3 text-[2.2rem] font-black leading-tight tracking-tight text-white">Food Reels, Better Orders</h1>
                    <p className="mt-3 text-[0.95rem] leading-7 text-slate-400">
                        Explore trending dishes, save what you love, and order only when restaurants are live for delivery.
                    </p>
                </div>

                <div className="sidebar-scroll flex-1 overflow-y-auto pr-1">
                    <nav className="flex flex-col gap-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className={`group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all ${
                                        isActive
                                            ? 'bg-gradient-to-r from-primary/20 via-primary/10 to-transparent text-white shadow-[0_12px_40px_rgba(251,93,71,0.2)]'
                                            : 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                                    }`}
                                >
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                                        isActive
                                            ? 'border-primary/30 bg-primary/15 text-primary'
                                            : 'border-white/8 bg-white/[0.03] text-slate-300 group-hover:border-white/20'
                                    }`}>
                                        <item.icon className="text-lg" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold">{item.label}</p>
                                        <p className="text-xs text-slate-500">
                                            {item.label === 'Saved'
                                                ? 'Your shortlist of reels'
                                                : user?.role === 'restaurant'
                                                    ? `Manage ${item.label.toLowerCase()}`
                                                    : `Open ${item.label.toLowerCase()}`}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {user?.role === 'restaurant' && (
                <div className="mt-6 rounded-[28px] border border-white/8 bg-white/[0.04] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Production Flow</p>
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                        Orders unlock only after a delivery address is saved, and delivery-paused restaurants stay protected across reels, cart, and orders.
                    </p>
                </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
