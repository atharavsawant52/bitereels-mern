import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../api/client';

const EditProfileModal = ({ isOpen, onClose, userDetails, onUpdate }) => {
    const [restaurantName, setRestaurantName] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [area, setArea] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [lat, setLat] = useState(null);
    const [lng, setLng] = useState(null);

    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userDetails) {
            setRestaurantName(userDetails.restaurantName || '');
            setPhone(userDetails.phone || '');
            const ba = userDetails.businessAddress || {};
            setStreet(ba.street || '');
            setArea(ba.area || '');
            setCity(ba.city || '');
            setState(ba.state || '');
            setPostalCode(ba.postalCode || '');
            setLat(ba.location?.coordinates?.[1] || null);
            setLng(ba.location?.coordinates?.[0] || null);
        }
    }, [userDetails, isOpen]);

    const getCoords = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setLat(pos.coords.latitude);
            setLng(pos.coords.longitude);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                restaurantName,
                phone,
                businessAddress: {
                    street,
                    area,
                    city,
                    state,
                    postalCode,
                    location: lat && lng ? {
                        type: 'Point',
                        coordinates: [lng, lat]
                    } : undefined
                }
            };

            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await api.put('/api/restaurants/profile', payload, config);
            onUpdate(data);
            onClose();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-800 animate-slide-up">
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Edit Restaurant Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition p-2">
                        <FaTimes size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Restaurant Name</label>
                            <input 
                                type="text" 
                                value={restaurantName}
                                onChange={e => setRestaurantName(e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Phone Number</label>
                            <input 
                                type="text" 
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4 bg-black/40 p-6 rounded-3xl border border-gray-800">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest">Business Address</h3>
                            <button 
                                type="button" 
                                onClick={getCoords}
                                className="text-[10px] font-bold text-gray-500 hover:text-white transition flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full"
                            >
                                <FaMapMarkerAlt size={10} /> {lat ? 'Location Tagged' : 'Tag GPS'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-gray-600 text-[9px] font-bold uppercase ml-1">Street / Landmark</label>
                                <input 
                                    placeholder="e.g. 42nd Avenue, MG Road"
                                    value={street}
                                    onChange={e => setStreet(e.target.value)}
                                    className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-gray-600 text-[9px] font-bold uppercase ml-1">Area</label>
                                    <input 
                                        placeholder="e.g. Downtown"
                                        value={area}
                                        onChange={e => setArea(e.target.value)}
                                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-gray-600 text-[9px] font-bold uppercase ml-1">City</label>
                                    <input 
                                        placeholder="e.g. Mumbai"
                                        value={city}
                                        onChange={e => setCity(e.target.value)}
                                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-gray-600 text-[9px] font-bold uppercase ml-1">State</label>
                                    <input 
                                        placeholder="e.g. Maharashtra"
                                        value={state}
                                        onChange={e => setState(e.target.value)}
                                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-gray-600 text-[9px] font-bold uppercase ml-1">Pin Code</label>
                                    <input 
                                        placeholder="400001"
                                        value={postalCode}
                                        onChange={e => setPostalCode(e.target.value)}
                                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-primary outline-none"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                         <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 py-4 rounded-2xl font-bold transition uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 bg-primary hover:bg-orange-600 text-white py-4 rounded-2xl font-bold transition shadow-xl shadow-primary/20 disabled:opacity-50 uppercase tracking-widest text-xs"
                        >
                            {loading ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
