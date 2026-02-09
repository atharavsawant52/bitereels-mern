import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UploadReel = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [video, setVideo] = useState(null);
    const [foodItems, setFoodItems] = useState([]);
    const [selectedFoodItem, setSelectedFoodItem] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // Fetch restaurant's food items for the dropdown
        const fetchFoodItems = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const token = userInfo?.token;
                
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };
                const { data } = await axios.get('http://localhost:5000/api/foods/my', config);
                setFoodItems(data);
                if (data.length > 0) {
                    setSelectedFoodItem(data[0]._id);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load menu items. Please add items to your menu first.');
            }
        };

        fetchFoodItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!video || !selectedFoodItem) {
            setError('Please select a video and a food item.');
            return;
        }

        const formData = new FormData();
        formData.append('video', video);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('foodItemId', selectedFoodItem);

        setLoading(true);
        setError(null);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            };

            await axios.post('http://localhost:5000/api/reels', formData, config);
            setLoading(false);
            navigate('/restaurant-dashboard'); 
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to upload reel');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 flex justify-center items-center">
            <div className="bg-gray-900 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-800">
                <h2 className="text-2xl font-bold mb-6 text-primary text-center">Upload Food Reel</h2>
                
                {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                            placeholder="Delicious Burger"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                            placeholder="Describe this dish..."
                            rows="3"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Price (Optional override)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Select Food Item</label>
                        <select
                            value={selectedFoodItem}
                            onChange={(e) => setSelectedFoodItem(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-primary"
                            required
                        >
                            <option value="" disabled>Select a menu item</option>
                            {foodItems.map(item => (
                                <option key={item._id} value={item._id}>{item.name}</option>
                            ))}
                        </select>
                        {foodItems.length === 0 && <p className="text-sm text-yellow-500 mt-1">No items found. Add items to menu first.</p>}
                    </div>

                    <div>
                        <label className="block text-gray-400 mb-1">Video File</label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideo(e.target.files[0])}
                            className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-80"
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center mt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/restaurant-dashboard')}
                            className="text-gray-400 hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded transition disabled:opacity-50"
                        >
                            {loading ? 'Uploading...' : 'Upload Reel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadReel;
