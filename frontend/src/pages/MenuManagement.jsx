import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaEdit, FaPlus } from 'react-icons/fa';

const MenuManagement = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form State
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('');

    const navigate = useNavigate();

    const fetchMenu = async () => {
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
            setLoading(false);
        } catch (error) {
            console.error('Error fetching menu:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            
            await axios.post('http://localhost:5000/api/foods', {
                name: newItemName,
                price: Number(newItemPrice),
                description: newItemDesc,
                category: newItemCategory,
                images: [] // Simplify for now
            }, config);

            setShowModal(false);
            setNewItemName('');
            setNewItemPrice('');
            setNewItemDesc('');
            setNewItemCategory('');
            fetchMenu(); // Refresh list
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Failed to add item');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const token = userInfo?.token;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.delete(`http://localhost:5000/api/foods/${id}`, config);
            fetchMenu();
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold text-primary">Menu Management</h1>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/restaurant-dashboard')}
                            className="text-gray-400 hover:text-white px-4 py-2"
                        >
                            Back to Dashboard
                        </button>
                        <button 
                            onClick={() => setShowModal(true)}
                            className="bg-primary hover:bg-opacity-80 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <FaPlus /> Add Item
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400">Loading menu...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {foodItems.map(item => (
                            <div key={item._id} className="bg-gray-900 border border-gray-800 p-6 rounded-lg shadow-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                    <span className="bg-green-900 text-green-300 text-xs px-2 py-1 rounded ml-2">${item.price}</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                                <div className="text-xs text-secondary mb-4 uppercase tracking-wider">{item.category}</div>
                                
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete(item._id)} className="flex-1 bg-red-900/50 hover:bg-red-900 text-red-400 py-2 rounded flex justify-center items-center gap-2 transition">
                                        <FaTrash /> Delete
                                    </button>
                                     {/* Edit implementation could go here */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Item Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/80 flex justify-center items-center p-4 z-50">
                        <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md border border-gray-700">
                            <h2 className="text-2xl font-bold mb-4 text-white">Add New Food Item</h2>
                            <form onSubmit={handleAddItem} className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Item Name" 
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    required
                                />
                                <input 
                                    type="number" 
                                    placeholder="Price" 
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                    value={newItemPrice}
                                    onChange={e => setNewItemPrice(e.target.value)}
                                    required
                                />
                                <input 
                                    type="text" 
                                    placeholder="Category (e.g., Burger, Pizza)" 
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                    value={newItemCategory}
                                    onChange={e => setNewItemCategory(e.target.value)}
                                    required
                                />
                                <textarea 
                                    placeholder="Description" 
                                    className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                    rows="3"
                                    value={newItemDesc}
                                    onChange={e => setNewItemDesc(e.target.value)}
                                ></textarea>
                                
                                <div className="flex gap-4 mt-6">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 bg-primary text-white py-2 rounded font-bold"
                                    >
                                        Add Item
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuManagement;
