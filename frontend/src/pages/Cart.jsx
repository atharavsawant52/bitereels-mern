import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash, FaArrowLeft, FaMotorcycle, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../api/client';
import {
    formatCurrency,
    formatFullAddress,
    getRestaurantName,
    isRestaurantOrderingUnavailable
} from '../utils/formatters';

const DELIVERY_FEE = 20;

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [paying, setPaying] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const defaultAddress = useMemo(
        () => user?.addresses?.find((address) => address._id === user?.defaultAddress),
        [user?.addresses, user?.defaultAddress]
    );

    const blockedRestaurants = useMemo(() => {
        if (!cart?.items?.length) return [];

        const restaurantMap = new Map();

        cart.items.forEach((item) => {
            const restaurant = item.restaurant || item.reel?.restaurant || item.foodItem?.restaurant;
            if (restaurant?._id && isRestaurantOrderingUnavailable(restaurant)) {
                restaurantMap.set(restaurant._id, restaurant);
            }
        });

        return Array.from(restaurantMap.values());
    }, [cart?.items]);

    const canCheckout = Boolean(cart?.items?.length) && Boolean(defaultAddress) && blockedRestaurants.length === 0;

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const { data } = await api.get('/api/cart');
                if (data.success) {
                    setCart(data.data);
                }
            } catch (error) {
                console.error('Fetch cart failed', error);
                toast.error(error.response?.data?.message || 'Failed to load cart');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchCart();
    }, [user]);

    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdating(true);
        try {
            const { data } = await api.put(`/api/cart/item/${itemId}`, { quantity: newQuantity });
            if (data.success) {
                setCart(data.data);
            }
        } catch (error) {
            console.error('Update quantity failed', error);
            toast.error('Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    const removeItem = async (itemId) => {
        setUpdating(true);
        try {
            const { data } = await api.delete(`/api/cart/item/${itemId}`);
            if (data.success) {
                setCart(data.data);
                toast.success('Item removed from cart');
            }
        } catch (error) {
            console.error('Remove item failed', error);
            toast.error('Failed to remove item');
        } finally {
            setUpdating(false);
        }
    };

    const ensureCheckoutReady = () => {
        if (!cart?.items?.length) {
            toast.error('Your cart is empty');
            return false;
        }

        if (!defaultAddress) {
            toast.error('Save a delivery address before placing an order');
            navigate('/profile');
            return false;
        }

        if (blockedRestaurants.length > 0) {
            toast.error('Remove unavailable restaurants from cart before checkout');
            return false;
        }

        return true;
    };

    const createRestaurantGroups = () => {
        const restaurantGroups = {};

        cart.items.forEach((item) => {
            const restaurantId = item.restaurant?._id || item.restaurant || item.foodItem?.restaurant?._id || item.reel?.restaurant?._id;

            if (!restaurantId) {
                throw new Error(`Restaurant information missing for ${item.foodItem?.name || item.reel?.title || 'item'}.`);
            }

            if (!restaurantGroups[restaurantId]) {
                restaurantGroups[restaurantId] = [];
            }

            restaurantGroups[restaurantId].push(item);
        });

        return restaurantGroups;
    };

    const handlePlaceOrder = async () => {
        if (!ensureCheckoutReady()) return;

        setUpdating(true);
        try {
            const restaurantGroups = createRestaurantGroups();

            for (const restaurantId in restaurantGroups) {
                const items = restaurantGroups[restaurantId].map((item) => ({
                    foodItem: item.foodItem?._id,
                    reel: item.reel?._id,
                    quantity: item.quantity,
                    price: item.price
                }));

                const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

                await api.post('/api/orders', {
                    restaurant: restaurantId,
                    items,
                    totalAmount: totalAmount + DELIVERY_FEE,
                    paymentMethod: 'COD'
                });
            }

            await api.delete('/api/cart');
            toast.success('Order placed successfully');
            navigate('/orders');
        } catch (error) {
            console.error('Place order failed', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to place order');
        } finally {
            setUpdating(false);
        }
    };

    const handlePayNow = async () => {
        if (!ensureCheckoutReady()) return;

        if (!window.Razorpay) {
            toast.error('Payment service not loaded. Please refresh the page.');
            return;
        }

        setPaying(true);
        try {
            const res = await api.post('/api/payment/create-order');

            if (!res.data?.success) {
                toast.error(res.data?.message || 'Failed to create payment order');
                return;
            }

            const { orderId, amount, currency } = res.data;
            const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

            if (!razorpayKey) {
                toast.error('Missing Razorpay key. Set `VITE_RAZORPAY_KEY_ID` and restart the app.');
                return;
            }

            const options = {
                key: razorpayKey,
                amount,
                currency,
                name: 'BiteReels',
                description: 'Food Order Payment',
                order_id: orderId,
                prefill: {
                    name: user?.name || user?.username || '',
                    email: user?.email || ''
                },
                theme: { color: '#fb5d47' },
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/api/payment/verify', response);
                        if (verifyRes.data?.success) {
                            toast.success('Payment successful');
                            navigate('/order-success');
                            return;
                        }

                        toast.error(verifyRes.data?.message || 'Payment verification failed');
                        navigate('/order-failed');
                    } catch (error) {
                        toast.error(error.response?.data?.message || 'Payment verification failed');
                        navigate('/order-failed');
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.error('Payment cancelled');
                        navigate('/order-failed');
                    }
                }
            };

            const razorpayInstance = new window.Razorpay(options);
            razorpayInstance.on('payment.failed', () => {
                toast.error('Payment failed');
                navigate('/order-failed');
            });
            razorpayInstance.open();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payment initiation failed');
        } finally {
            setPaying(false);
        }
    };

    const subtotal = cart?.totalPrice || 0;
    const grandTotal = subtotal + (cart?.items?.length ? DELIVERY_FEE : 0);

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-24px)] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-primary" />
                    <p className="text-sm text-slate-400">Loading your cart...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-24px)] px-4 py-6 pb-28 md:px-6 md:py-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                    >
                        <FaArrowLeft size={14} />
                    </button>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Cart</p>
                        <h1 className="text-3xl font-black tracking-tight text-white">Review before checkout</h1>
                    </div>
                </div>

                {!cart || cart.items.length === 0 ? (
                    <div className="rounded-[32px] border border-dashed border-white/10 bg-slate-950/35 px-6 py-24 text-center">
                        <h3 className="text-2xl font-bold text-white">Your cart is empty</h3>
                        <p className="mt-3 text-sm leading-7 text-slate-400">Add some reels to cart and come back here for checkout.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6d59]"
                        >
                            Browse reels
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                        <section className="space-y-4">
                            {blockedRestaurants.length > 0 && (
                                <div className="rounded-[24px] border border-amber-400/20 bg-amber-500/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <FaExclamationTriangle className="mt-1 text-amber-300" />
                                        <div>
                                            <p className="font-semibold text-amber-100">Some restaurants are not accepting orders</p>
                                            <p className="mt-1 text-sm leading-6 text-amber-50/80">
                                                Remove these restaurants from cart to continue: {blockedRestaurants.map(getRestaurantName).join(', ')}.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {cart.items.map((item) => {
                                const restaurant = item.restaurant || item.reel?.restaurant || item.foodItem?.restaurant;
                                const orderingUnavailable = isRestaurantOrderingUnavailable(restaurant);

                                return (
                                    <article key={item._id} className="rounded-[28px] border border-white/8 bg-slate-950/38 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                            <div className="flex h-20 w-20 items-center justify-center rounded-[22px] border border-primary/10 bg-primary/10 text-3xl">
                                                Item
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <p className="text-lg font-semibold text-white">
                                                        {item.foodItem?.name || item.reel?.title || 'Item'}
                                                    </p>
                                                    {orderingUnavailable && (
                                                        <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                                                            Ordering paused
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500">{getRestaurantName(restaurant)}</p>
                                                <p className="mt-2 text-xl font-bold text-primary">{formatCurrency(item.price)}</p>
                                            </div>

                                            <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.03] px-2 py-2">
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    disabled={updating || item.quantity <= 1}
                                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1] disabled:opacity-30"
                                                >
                                                    <FaMinus size={10} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold text-white">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    disabled={updating}
                                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300 transition hover:bg-white/[0.1] disabled:opacity-30"
                                                >
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item._id)}
                                                disabled={updating}
                                                className="flex h-11 w-11 items-center justify-center rounded-full border border-red-400/10 bg-red-500/10 text-red-300 transition hover:bg-red-500/16 disabled:opacity-30"
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        <aside className="space-y-5">
                            <section className="rounded-[28px] border border-white/8 bg-slate-950/42 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Delivery Address</p>
                                        <p className="mt-2 text-base font-semibold text-white">
                                            {defaultAddress ? defaultAddress.fullName : 'Address required'}
                                        </p>
                                    </div>
                                    <FaMapMarkerAlt className="text-primary" />
                                </div>
                                <p className="mt-3 text-sm leading-7 text-slate-400">
                                    {defaultAddress ? formatFullAddress(defaultAddress) : 'Save a default address in profile before checkout.'}
                                </p>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/30 hover:bg-primary/10"
                                >
                                    {defaultAddress ? 'Manage address' : 'Add address now'}
                                </button>
                            </section>

                            <section className="rounded-[28px] border border-white/8 bg-slate-950/42 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Bill Summary</p>
                                <div className="mt-5 space-y-3 text-sm text-slate-300">
                                    <div className="flex items-center justify-between">
                                        <span>Item total</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <FaMotorcycle className="text-emerald-400" size={14} />
                                            Delivery fee
                                        </span>
                                        <span>{formatCurrency(DELIVERY_FEE)}</span>
                                    </div>
                                    <div className="border-t border-white/8 pt-3">
                                        <div className="flex items-center justify-between text-base font-semibold text-white">
                                            <span>To pay</span>
                                            <span>{formatCurrency(grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="space-y-3">
                                <button
                                    onClick={handlePayNow}
                                    disabled={!canCheckout || updating || paying}
                                    className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-emerald-500 px-4 py-4 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {paying ? 'Opening payment...' : 'Pay Now (Razorpay)'}
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={!canCheckout || updating}
                                    className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-primary px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#ff6d59] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {updating ? 'Processing...' : 'Place Order (Cash on Delivery)'}
                                </button>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
