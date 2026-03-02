import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaArrowLeft, FaVideo, FaCloudUploadAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../api/client';

const UploadReel = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [selectedMenuItem, setSelectedMenuItem] = useState('');
    const [video, setVideo] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const { data } = await api.get(`/api/menu/restaurant/${user._id}`);
                if (data.success) {
                    setMenuItems(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch menu:', err);
            }
        };
        if (user?._id) fetchMenu();
    }, [user]);

    const handleMenuChange = (e) => {
        const itemId = e.target.value;
        setSelectedMenuItem(itemId);
        if (itemId) {
            const item = menuItems.find(i => i._id === itemId);
            if (item) {
                setTitle(item.name);
                setPrice(item.price);
                if (item.description) setDescription(item.description);
            }
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideo(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!video || !title || !price) {
            toast.error('Please provide title, price, and a video file.');
            return;
        }

        const formData = new FormData();
        formData.append('video', video);
        formData.append('title', title);
        formData.append('description', description);
        formData.append('price', price);
        if (selectedMenuItem) {
            formData.append('menuItem', selectedMenuItem);
        }

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

            const res = await api.post('/api/reels', formData, config);
            if (res.data.success) {
                toast.success('Reel uploaded successfully!');
                setLoading(false);
                navigate('/restaurant-dashboard'); 
            }
        } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.message || 'Failed to upload reel');
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-32 pt-6 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="p-3 bg-gray-900 rounded-2xl border border-gray-800 hover:border-gray-700 transition"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tight">Upload New Reel</h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Share your flavors with the world</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-3xl text-center text-sm font-bold mb-6 animate-shake">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Video Preview */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Video Content</label>
                        <div 
                            className={`aspect-[9/16] rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center relative overflow-hidden group ${videoPreview ? 'border-primary/50' : 'border-gray-800 bg-gray-900/40 hover:border-gray-700'}`}
                        >
                            {videoPreview ? (
                                <>
                                    <video src={videoPreview} className="w-full h-full object-cover" autoPlay muted loop />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                        <label className="cursor-pointer bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-xl">
                                            Change Video
                                            <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                                        </label>
                                    </div>
                                </>
                            ) : (
                                <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center gap-4">
                                    <div className="bg-gray-800 p-5 rounded-3xl text-primary animate-bounce">
                                        <FaVideo size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-gray-300">Choose a video</p>
                                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">MP4, MOV supported</p>
                                    </div>
                                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="space-y-6">
                        <div className="bg-gray-900/40 p-6 rounded-[2rem] border border-gray-800 space-y-5">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Link to Menu Item (Optional)</label>
                                <select
                                    value={selectedMenuItem}
                                    onChange={handleMenuChange}
                                    className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary transition appearance-none cursor-pointer"
                                >
                                    <option value="">-- Standalone Reel --</option>
                                    {menuItems.map(item => (
                                        <option key={item._id} value={item._id}>
                                            {item.name} (₹{item.price})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Reel Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                                    placeholder="e.g. Sizzling Paneer Tikka"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary transition h-32 resize-none"
                                    placeholder="Describe the vibe and taste..."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Price (₹)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full bg-black border border-gray-800 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary py-4 rounded-3xl font-black uppercase tracking-[0.2em] text-sm text-white hover:bg-orange-600 transition shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaCloudUploadAlt size={20} />
                                        Upload Reel
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/restaurant-dashboard')}
                                className="w-full bg-transparent py-4 rounded-3xl font-black uppercase tracking-[0.2em] text-xs text-gray-500 hover:text-white transition"
                            >
                                Cancel Upload
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadReel;
