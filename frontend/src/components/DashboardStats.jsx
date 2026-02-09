import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { FaVideo, FaShoppingCart, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa';

const DashboardStats = () => {
    const [stats, setStats] = useState({
        totalReels: 0,
        totalOrders: 0,
        completedOrders: 0,
        totalEarnings: 0
    });
    const { user } = useAuth();
    const socketRef = useRef(null);

    const fetchStats = async () => {
        try {
            if (user?.token) {
                const config = {
                     headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get('http://localhost:5000/api/restaurants/stats', config);
                setStats(data);
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [user]);

    // Socket.io real-time stats refresh
    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('connect', () => {
            console.log('Dashboard connected to Socket.io');
        });

        // Listen for order status updates - refresh stats when order is completed
        socketRef.current.on('orderStatusUpdated', (data) => {
            console.log('Order status updated, refreshing dashboard stats:', data);
            // Refresh stats whenever any order status changes
            fetchStats();
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log('Dashboard disconnected from Socket.io');
            }
        };
    }, [user]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-secondary p-6 rounded-xl shadow-lg border border-gray-700 flex items-center gap-4">
                <div className="p-4 bg-blue-500/20 rounded-full text-blue-500">
                    <FaVideo size={24} />
                </div>
                <div>
                    <h3 className="text-gray-400 text-sm font-semibold">Total Reels</h3>
                    <p className="text-2xl font-bold text-white">{stats.totalReels}</p>
                </div>
            </div>

            <div className="bg-secondary p-6 rounded-xl shadow-lg border border-gray-700 flex items-center gap-4">
                <div className="p-4 bg-yellow-500/20 rounded-full text-yellow-500">
                    <FaShoppingCart size={24} />
                </div>
                <div>
                    <h3 className="text-gray-400 text-sm font-semibold">Total Orders</h3>
                    <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
                </div>
            </div>

            <div className="bg-secondary p-6 rounded-xl shadow-lg border border-gray-700 flex items-center gap-4">
                <div className="p-4 bg-green-500/20 rounded-full text-green-500">
                    <FaCheckCircle size={24} />
                </div>
                <div>
                    <h3 className="text-gray-400 text-sm font-semibold">Completed Orders</h3>
                    <p className="text-2xl font-bold text-white">{stats.completedOrders}</p>
                </div>
            </div>

            <div className="bg-secondary p-6 rounded-xl shadow-lg border border-gray-700 flex items-center gap-4">
                <div className="p-4 bg-purple-500/20 rounded-full text-purple-500">
                    <FaMoneyBillWave size={24} />
                </div>
                <div>
                    <h3 className="text-gray-400 text-sm font-semibold">Total Earnings</h3>
                    <p className="text-2xl font-bold text-white">₹{Math.round(stats.totalEarnings)}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
