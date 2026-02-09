import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const socketRef = useRef(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const token = userInfo?.token;
                const { data } = await axios.get('http://localhost:5000/api/orders/myorders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(data);
            } catch (error) {
                console.error("Fetch orders failed", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchOrders();
    }, [user]);

    // Socket.io real-time updates
    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io('http://localhost:5000');

        socketRef.current.on('connect', () => {
            console.log('Connected to Socket.io server');
        });

        // Listen for order status updates
        socketRef.current.on('orderStatusUpdated', (data) => {
            console.log('Order status updated:', data);
            const { orderId, newStatus } = data;
            
            // Update the specific order in state
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order._id === orderId 
                        ? { ...order, status: newStatus } 
                        : order
                )
            );
        });

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                console.log('Disconnected from Socket.io server');
            }
        };
    }, []);

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
            case 'preparing': return 'bg-blue-900 text-blue-300 border-blue-700';
            case 'completed': return 'bg-green-900 text-green-300 border-green-700';
            case 'cancelled': return 'bg-red-900 text-red-300 border-red-700';
            default: return 'bg-gray-900 text-gray-300';
        }
    };

    const getStatusMessage = (status) => {
        switch(status) {
            case 'pending': return '⏳ Waiting for restaurant confirmation';
            case 'preparing': return '👨‍🍳 Restaurant is preparing your food';
            case 'completed': return '✅ Order completed!';
            case 'cancelled': return '❌ Order was cancelled';
            default: return '';
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Loading Orders...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-dark p-4 pb-20">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-heading font-bold mb-6 text-white">My Orders</h1>

                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order._id} className="bg-secondary border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="font-bold text-lg text-white">
                                        Order #{order._id.substring(order._id.length - 6).toUpperCase()}
                                    </span>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${getStatusColor(order.status)}`}>
                                    {order.status.toUpperCase()}
                                </span>
                            </div>

                            {/* Status Message */}
                            <div className="bg-dark/50 border border-gray-700/50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-300">{getStatusMessage(order.status)}</p>
                            </div>

                            {/* Items */}
                            <div className="mb-3">
                                <h4 className="text-xs text-gray-500 uppercase font-semibold mb-2">Items</h4>
                                <ul className="space-y-1">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="text-sm text-gray-300 flex justify-between">
                                            <span>
                                                <span className="text-gray-500">×{item.quantity}</span> {item.foodItem?.name || item.name || 'Item'}
                                            </span>
                                            <span className="text-gray-400">₹{Math.round(item.price * item.quantity)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center pt-3 border-t border-gray-700">
                                <span className="text-gray-400 text-sm">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Total Amount</p>
                                    <p className="text-xl font-bold text-primary">₹{Math.round(order.totalAmount)}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {orders.length === 0 && (
                        <div className="text-center py-16 bg-secondary rounded-xl border border-gray-700">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-gray-400 text-lg mb-2">No orders yet</p>
                            <p className="text-gray-500 text-sm">Start ordering from your favorite restaurants!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;
