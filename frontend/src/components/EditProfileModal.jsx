import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaTimes } from 'react-icons/fa';

const EditProfileModal = ({ isOpen, onClose, userDetails, onUpdate }) => {
    const [formData, setFormData] = useState({
        restaurantName: '',
        address: '',
        phone: ''
    });
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userDetails) {
            setFormData({
                restaurantName: userDetails.restaurantName || '',
                address: userDetails.address || '',
                phone: userDetails.phone || ''
            });
        }
    }, [userDetails]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.put('http://localhost:5000/api/restaurants/profile', formData, config);
            onUpdate(data);
            alert("Profile Updated Successfully!");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-secondary w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-700 animate-slide-up">
                <div className="flex justify-between items-center p-5 border-b border-gray-700 bg-gray-800/50">
                    <h2 className="text-xl font-bold text-white">Edit Restaurant Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <FaTimes size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Restaurant Name</label>
                        <input 
                            type="text" 
                            name="restaurantName" 
                            value={formData.restaurantName}
                            onChange={handleChange}
                            className="w-full bg-dark border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary transition"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Address</label>
                        <textarea 
                            name="address" 
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full bg-dark border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary transition h-20 resize-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 mb-1 text-sm">Phone</label>
                        <input 
                            type="text" 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-dark border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-primary transition"
                            required
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                         <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 bg-primary hover:bg-orange-600 text-white py-2 rounded font-semibold transition disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
