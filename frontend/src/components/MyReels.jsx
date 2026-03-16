import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaEdit } from 'react-icons/fa';
import api from '../api/client';

const apiUrl = import.meta.env.VITE_API_URL;

const MyReels = ({ refreshTrigger }) => {
    const [reels, setReels] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const fetchReels = async () => {
            try {
                if (user?.token) {
                     const config = {
                         headers: { Authorization: `Bearer ${user.token}` }
                    };
                    const response = await api.get('/api/reels/restaurant/my-reels', config);
                    if (response.data.success) {
                        setReels(response.data.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching reels:", error);
            }
        };

        fetchReels();
    }, [user, refreshTrigger]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this reel?")) {
            try {
                const config = {
                        headers: { Authorization: `Bearer ${user.token}` }
                };
                await api.delete(`/api/reels/${id}`, config);
                setReels(reels.filter(reel => reel._id !== id));
            } catch (error) {
                console.error("Error deleting reel:", error);
                alert("Failed to delete reel");
            }
        }
    };

    return (
        <div className="bg-secondary p-6 rounded-xl shadow-lg border border-gray-700 mt-8">
            <h2 className="text-2xl font-bold mb-6 text-primary border-b border-gray-700 pb-2">My Posted Reels</h2>
            
            {reels.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No reels posted yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reels.map((reel) => (
                        <div key={reel._id} className="bg-dark rounded-lg overflow-hidden border border-gray-700 shadow-md group">
                            <div className="relative aspect-[9/16] bg-black">
                                <video 
                                    src={`${apiUrl}${reel.videoUrl}`} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                                />
                                <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                                    {new Date(reel.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg truncate">{reel.title}</h3>
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-green-400 font-bold">₹{reel.price}</span>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-blue-600/20 text-blue-500 rounded hover:bg-blue-600/40 transition">
                                            <FaEdit size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(reel._id)}
                                            className="p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600/40 transition"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                    <span>{reel.likes.length} Likes</span>
                                    <span>{reel.comments?.length || 0} Comments</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReels;
