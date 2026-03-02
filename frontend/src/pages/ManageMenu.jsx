import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaUndo } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../api/client';

const ManageMenu = () => {
    const { user } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Add Item Form State
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        isAvailable: true
    });

    // Edit Item State
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState(null);

    const fetchMenu = async () => {
        try {
            const { data } = await api.get(`/api/menu/restaurant/${user._id}`);
            if (data.success) {
                setMenuItems(data.data);
            }
        } catch (error) {
            console.error('Fetch menu failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?._id) fetchMenu();
    }, [user]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await api.post('/api/menu', newItem, config);
            if (data.success) {
                setMenuItems([data.data, ...menuItems]);
                setNewItem({ name: '', description: '', price: '', category: '', isAvailable: true });
                toast.success('Item added successfully!');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add item');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await api.delete(`/api/menu/${id}`, config);
            if (data.success) {
                setMenuItems(menuItems.filter(item => item._id !== id));
                toast.success('Item removed');
            }
        } catch (error) {
            toast.error('Failed to delete item');
        }
    };

    const handleEditClick = (item) => {
        setEditingId(item._id);
        setEditForm({ ...item });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await api.put(`/api/menu/${editingId}`, editForm, config);
            if (data.success) {
                setMenuItems(menuItems.map(item => item._id === editingId ? data.data : item));
                setEditingId(null);
                setEditForm(null);
                toast.success('Item updated');
            }
        } catch (error) {
            toast.error('Failed to update item');
        } finally {
            setSaving(false);
        }
    };

    const toggleAvailability = async (item) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await api.put(`/api/menu/${item._id}`, {
                isAvailable: !item.isAvailable
            }, config);
            if (data.success) {
                setMenuItems(menuItems.map(i => i._id === item._id ? data.data : i));
                toast.success(data.data.isAvailable ? 'Item available' : 'Item out of stock');
            }
        } catch (error) {
            toast.error('Status update failed');
            console.error('Toggle failed:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading Menu...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-primary">Manage Menu</h1>

                {/* Add Item Form */}
                <div className="bg-gray-900 p-6 rounded-2xl mb-8 border border-gray-800">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <FaPlus className="text-primary text-sm" /> Add New Item
                    </h2>
                    <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Item Name"
                            className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                            value={newItem.name}
                            onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Price (₹)"
                            className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                            value={newItem.price}
                            onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Category (e.g. Starters, Main Course)"
                            className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                            value={newItem.category}
                            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                        />
                        <textarea
                            placeholder="Description"
                            className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary md:col-span-2"
                            value={newItem.description}
                            onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        />
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {saving ? 'Adding...' : 'Add Item to Menu'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Menu List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-2">My Menu ({menuItems.length})</h2>
                    {menuItems.length === 0 ? (
                        <p className="text-gray-500 italic">No items in your menu yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {menuItems.map(item => (
                                <div key={item._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 transition hover:border-gray-700">
                                    {editingId === item._id ? (
                                        /* Edit Mode */
                                        <form onSubmit={handleUpdateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                required
                                            />
                                            <input
                                                type="number"
                                                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white"
                                                value={editForm.price}
                                                onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                                                required
                                            />
                                            <textarea
                                                className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white md:col-span-2"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                            />
                                            <div className="flex gap-2 md:col-span-2">
                                                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                                    <FaSave size={14} /> Save
                                                </button>
                                                <button type="button" onClick={() => setEditingId(null)} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                                    <FaTimes size={14} /> Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        /* Display Mode */
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold">{item.name}</h3>
                                                    {item.category && (
                                                        <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-gray-700">
                                                            {item.category}
                                                        </span>
                                                    )}
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.isAvailable ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm mb-2">{item.description}</p>
                                                <p className="text-primary font-bold text-xl">₹{item.price}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => handleEditClick(item)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition">
                                                    <FaEdit size={16} />
                                                </button>
                                                <button onClick={() => toggleAvailability(item)} className="p-2 bg-orange-500/10 text-orange-400 rounded-lg hover:bg-orange-500/20 transition" title="Toggle Availability">
                                                    <FaUndo size={14} />
                                                </button>
                                                <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition">
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageMenu;
