import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaCheck, FaTimes, FaConciergeBell, FaClock, FaBoxOpen } from 'react-icons/fa';

const OrdersReceived = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const { data } = await axios.get('http://localhost:5000/api/orders/restaurant', config);
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (orderId, newStatus) => {
         try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, config);
            
            // Optimistic update
            setOrders(orders.map(order => order._id === orderId ? { ...order, status: newStatus } : order));
        } catch (error) {
            console.error('Error updating status:', error);
            alert("Failed to update status");
        }
    };

    const filteredOrders = activeTab === 'all' 
        ? orders 
        : orders.filter(order => order.status === activeTab);

    const tabs = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'preparing', label: 'Preparing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
    ];

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
            case 'preparing': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
            case 'completed': return 'bg-green-500/20 text-green-500 border-green-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-500 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-dark text-light p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                 <header className="flex items-center gap-4 mb-8">
                    <button 
                         onClick={() => navigate('/restaurant-dashboard')}
                         className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-primary">Orders Received</h1>
                        <p className="text-gray-400 text-sm">Manage and track your customer orders</p>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-700 pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`px-6 py-2 rounded-t-lg font-semibold transition ${
                                activeTab === tab.value 
                                ? 'bg-primary text-white border-b-2 border-primary' 
                                : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-20 flex flex-col items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                        <p>Loading orders...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-20 bg-secondary rounded-xl border border-gray-700">
                                <FaBoxOpen className="mx-auto text-gray-600 mb-4" size={48} />
                                <p className="text-gray-400 text-lg">No {activeTab !== 'all' ? activeTab : ''} orders found.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {filteredOrders.map(order => (
                                    <div key={order._id} className="bg-secondary border border-gray-700 rounded-xl overflow-hidden shadow-lg flex flex-col md:flex-row">
                                        
                                        {/* Order Info Left */}
                                        <div className="p-6 flex-1">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-lg text-white">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                                                        <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(order.status)}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                                        <FaClock size={12} /> {new Date(order.createdAt).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-gray-400 mt-1">Customer: <span className="text-white font-medium">{order.user?.username || 'Guest'}</span></p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-primary">₹{Math.round(order.totalAmount)}</div>
                                                    <p className="text-xs text-gray-500">Total Amount</p>
                                                </div>
                                            </div>

                                            <div className="bg-dark/50 p-4 rounded-lg border border-gray-700/50">
                                                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Order Items</h4>
                                                <ul className="space-y-2">
                                                    {order.items.map((item, index) => (
                                                        <li key={index} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span className="bg-white/10 text-white px-2 py-0.5 rounded text-xs font-mono">x{item.quantity}</span>
                                                                <span className="text-gray-200">{item.foodItem?.name || 'Unknown Item'}</span>
                                                            </div>
                                                            <span className="text-gray-400 font-mono">₹{Math.round(item.price)}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Actions Right */}
                                        <div className="bg-gray-800/50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-gray-700 flex flex-col justify-center gap-3">
                                            <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">Update Status</h4>
                                            
                                            {/* Step-based status controls */}
                                            {order.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(order._id, 'preparing')}
                                                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition font-semibold"
                                                    >
                                                        <FaConciergeBell /> Mark as Preparing
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                        className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-900/80 text-red-400 border border-red-900 py-2 rounded transition font-semibold"
                                                    >
                                                        <FaTimes /> Cancel Order
                                                    </button>
                                                </>
                                            )}
                                            
                                            {order.status === 'preparing' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(order._id, 'completed')}
                                                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded transition font-semibold"
                                                    >
                                                        <FaCheck /> Mark Completed
                                                    </button>
                                                    <button 
                                                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                                                        className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-900/80 text-red-400 border border-red-900 py-2 rounded transition font-semibold"
                                                    >
                                                        <FaTimes /> Cancel Order
                                                    </button>
                                                </>
                                            )}
                                            
                                            {order.status === 'completed' && (
                                                <div className="text-center text-green-500 font-bold flex items-center justify-center gap-2 py-2">
                                                    <FaCheck /> Order Completed
                                                </div>
                                            )}
                                            
                                             {order.status === 'cancelled' && (
                                                <div className="text-center text-red-500 font-bold flex items-center justify-center gap-2 py-2">
                                                    <FaTimes /> Order Cancelled
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersReceived;
