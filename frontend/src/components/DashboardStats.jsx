import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { FaVideo, FaShoppingCart, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { formatCurrency } from '../utils/formatters';

const statCards = [
    { key: 'totalReels', label: 'Total Reels', icon: FaVideo, accent: 'bg-sky-500/12 text-sky-300 border-sky-400/12' },
    { key: 'totalOrders', label: 'Total Orders', icon: FaShoppingCart, accent: 'bg-amber-500/12 text-amber-300 border-amber-400/12' },
    { key: 'completedOrders', label: 'Completed Orders', icon: FaCheckCircle, accent: 'bg-emerald-500/12 text-emerald-300 border-emerald-400/12' },
    { key: 'totalEarnings', label: 'Total Earnings', icon: FaMoneyBillWave, accent: 'bg-purple-500/12 text-purple-300 border-purple-400/12' }
];

const DashboardStats = () => {
    const [stats, setStats] = useState({
        totalReels: 0,
        totalOrders: 0,
        completedOrders: 0,
        totalEarnings: 0
    });
    const { user } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/api/restaurants/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        if (user?.token) fetchStats();
    }, [user?.token]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/api/restaurants/stats');
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        socketRef.current = io(socketUrl);
        socketRef.current.on('orderStatusUpdated', fetchStats);

        return () => {
            socketRef.current?.disconnect();
        };
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
                const Icon = card.icon;
                const value = card.key === 'totalEarnings' ? formatCurrency(stats[card.key]) : stats[card.key];

                return (
                    <article key={card.key} className="rounded-[28px] border border-white/8 bg-slate-950/42 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${card.accent}`}>
                                <Icon size={18} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">{card.label}</p>
                                <p className="mt-1 text-2xl font-black text-white">{value}</p>
                            </div>
                        </div>
                    </article>
                );
            })}
        </div>
    );
};

export default DashboardStats;
