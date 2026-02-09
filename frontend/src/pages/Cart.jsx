import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash, FaArrowLeft, FaMotorcycle } from 'react-icons/fa';

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const DELIVERY_FEE = 20;

    const getAuthHeaders = () => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        return userInfo?.token ? { Authorization: `Bearer ${userInfo.token}` } : null;
    };

    const fetchCart = async () => {
        try {
            const headers = getAuthHeaders();
            if (!headers) {
                navigate('/login');
                return;
            }
            const { data } = await axios.get('http://localhost:5000/api/cart', { headers });
            setCart(data);
        } catch (error) {
            console.error("Fetch cart failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchCart();
    }, [user]);

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        
        setUpdating(true);
        try {
            const headers = getAuthHeaders();
            const { data } = await axios.put(
                `http://localhost:5000/api/cart/item/${itemId}`,
                { quantity: newQuantity },
                { headers }
            );
            setCart(data);
        } catch (error) {
            console.error("Update quantity failed", error);
            alert("Failed to update quantity");
        } finally {
            setUpdating(false);
        }
    };

    const removeItem = async (itemId) => {
        if (!confirm("Remove this item from cart?")) return;
        
        setUpdating(true);
        try {
            const headers = getAuthHeaders();
            const { data } = await axios.delete(
                `http://localhost:5000/api/cart/item/${itemId}`,
                { headers }
            );
            setCart(data);
        } catch (error) {
            console.error("Remove item failed", error);
            alert("Failed to remove item");
        } finally {
            setUpdating(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!cart || cart.items.length === 0) {
            alert("Your cart is empty");
            return;
        }

        setUpdating(true);
        try {
            const headers = getAuthHeaders();
            
            // Debug: Check if restaurant data is present
            console.log('Cart items:', cart.items);
            
            // Group items by restaurant
            const restaurantGroups = {};
            cart.items.forEach(item => {
                // Handle both populated and unpopulated restaurant field
                const restaurantId = item.foodItem?.restaurant?._id || item.foodItem?.restaurant;
                
                if (!restaurantId) {
                    console.error('Missing restaurant for item:', item);
                    throw new Error(`Restaurant information missing for ${item.foodItem?.name || 'item'}. Please refresh the page and try again.`);
                }
                
                if (!restaurantGroups[restaurantId]) {
                    restaurantGroups[restaurantId] = [];
                }
                restaurantGroups[restaurantId].push(item);
            });

            console.log('Restaurant groups:', restaurantGroups);

            for (const restaurantId in restaurantGroups) {
                const items = restaurantGroups[restaurantId].map(item => ({
                    foodItem: item.foodItem._id,
                    quantity: item.quantity,
                    price: item.price
                }));

                const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                await axios.post('http://localhost:5000/api/orders', {
                    restaurant: restaurantId,
                    items: items,
                    totalAmount: totalAmount + DELIVERY_FEE,
                    shippingAddress: {
                        address: "123 Main St",
                        city: "Metro City",
                        postalCode: "10001",
                        country: "India"
                    },
                    paymentMethod: "COD"
                }, { headers });
            }

            await axios.delete('http://localhost:5000/api/cart', { headers });
            alert("Order placed successfully!");
            navigate('/orders');
        } catch (error) {
            console.error("Place order failed", error);
            alert("Failed to place order: " + (error.response?.data?.message || error.message));
        } finally {
            setUpdating(false);
        }
    };

    const subtotal = cart?.totalPrice || 0;
    const grandTotal = subtotal + (cart?.items?.length > 0 ? DELIVERY_FEE : 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-lg mx-auto px-4 py-6 pb-32 md:pb-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <FaArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Cart</h1>
                        {cart?.items?.length > 0 && (
                            <p className="text-sm text-gray-500 mt-0.5">
                                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
                            </p>
                        )}
                    </div>
                </div>

                {!cart || cart.items.length === 0 ? (
                    /* Empty State */
                    <div className="text-center py-16">
                        <div className="w-32 h-32 mx-auto mb-6 bg-gray-900 rounded-full flex items-center justify-center">
                            <div className="text-6xl">🛒</div>
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-gray-200">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Add delicious food from reels to get started!</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                        >
                            Browse Reels
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Cart Items */}
                        <div className="space-y-3 mb-6">
                            {cart.items.map((item) => (
                                <div 
                                    key={item._id} 
                                    className="bg-gray-900 rounded-2xl p-4 flex gap-3 items-center border border-gray-800 hover:border-gray-700 transition-colors"
                                >
                                    {/* Food Image */}
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border border-orange-500/20">
                                        🍔
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base text-white truncate mb-1">
                                            {item.foodItem?.name || 'Unknown Item'}
                                        </h3>
                                        <p className="text-orange-500 font-semibold text-lg">
                                            ₹{Math.round(item.price)}
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-1 py-1">
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                            disabled={updating || item.quantity <= 1}
                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-700 hover:bg-orange-500 disabled:opacity-30 disabled:hover:bg-gray-700 transition-colors"
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                        <span className="font-semibold text-sm w-6 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                            disabled={updating}
                                            className="w-7 h-7 flex items-center justify-center rounded-md bg-gray-700 hover:bg-orange-500 disabled:opacity-30 transition-colors"
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => removeItem(item._id)}
                                        disabled={updating}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Bill Summary */}
                        <div className="bg-gray-900 rounded-2xl p-5 mb-6 border border-gray-800">
                            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">Bill Details</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Item Total</span>
                                    <span className="text-sm font-medium text-white">₹{Math.round(subtotal)}</span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400 flex items-center gap-2">
                                        <FaMotorcycle className="text-green-500" size={14} />
                                        Delivery Fee
                                    </span>
                                    <span className="text-sm font-medium text-green-500">₹{DELIVERY_FEE}</span>
                                </div>
                                
                                <div className="border-t border-gray-800 my-3"></div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-base font-semibold text-white">To Pay</span>
                                    <span className="text-xl font-bold text-orange-500">₹{Math.round(grandTotal)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Place Order Button - Fixed at bottom on mobile */}
                        <div className="fixed md:relative bottom-0 left-0 right-0 p-4 md:p-0 bg-gradient-to-t from-black via-black to-transparent md:bg-none">
                            <div className="max-w-lg mx-auto">
                                <button 
                                    onClick={handlePlaceOrder}
                                    disabled={updating}
                                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-full font-semibold text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {updating ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Place Order (Cash on Delivery)</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart;
