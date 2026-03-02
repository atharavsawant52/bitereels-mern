import { useState, useEffect } from 'react';
import { FaUser, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaPlus, FaTrash, FaCheckCircle, FaBuilding, FaHome, FaMap } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const UserProfile = () => {
    const { user, updateUser, logout } = useAuth();
    
    const [editingProfile, setEditingProfile] = useState(false);
    const [name, setName] = useState(user?.name || user?.username || '');
    
    // Address management states
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        street: '',
        area: '',
        city: '',
        state: '',
        postalCode: '',
        lat: null,
        lng: null
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || user.username || '');
        }
    }, [user]);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.put(
                '/api/users/update',
                { name },
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );
            updateUser(data);
            setSuccess('Profile updated!');
            setEditingProfile(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const resetAddressForm = () => {
        setAddressForm({
            label: 'Home',
            fullName: user?.name || user?.username || '',
            phone: '',
            street: '',
            area: '',
            city: '',
            state: '',
            postalCode: '',
            lat: null,
            lng: null
        });
        setEditingAddressId(null);
        setShowAddressForm(false);
    };

    const handleEditAddress = (addr) => {
        setAddressForm({
            label: addr.label || 'Home',
            fullName: addr.fullName || '',
            phone: addr.phone || '',
            street: addr.street || '',
            area: addr.area || '',
            city: addr.city || '',
            state: addr.state || '',
            postalCode: addr.postalCode || '',
            lat: addr.location?.coordinates?.[1] || null,
            lng: addr.location?.coordinates?.[0] || null
        });
        setEditingAddressId(addr._id);
        setShowAddressForm(true);
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...addressForm,
                location: addressForm.lat && addressForm.lng ? {
                    type: 'Point',
                    coordinates: [addressForm.lng, addressForm.lat]
                } : undefined
            };

            let response;
            if (editingAddressId) {
                response = await api.put(
                    `/api/users/address/${editingAddressId}`,
                    payload,
                    { headers: { Authorization: `Bearer ${user?.token}` } }
                );
            } else {
                response = await api.post(
                    '/api/users/address',
                    payload,
                    { headers: { Authorization: `Bearer ${user?.token}` } }
                );
            }

            updateUser({ 
                addresses: response.data.addresses, 
                defaultAddress: response.data.defaultAddress 
            });
            setSuccess('Address saved!');
            resetAddressForm();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try {
            const { data } = await api.delete(
                `/api/users/address/${id}`,
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );
            updateUser({ 
                addresses: data.addresses, 
                defaultAddress: data.defaultAddress 
            });
            setSuccess('Address removed');
        } catch (err) {
            setError('Delete failed');
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const { data } = await api.patch(
                `/api/users/address/default/${id}`,
                {},
                { headers: { Authorization: `Bearer ${user?.token}` } }
            );
            updateUser({ defaultAddress: data.defaultAddress });
            setSuccess('Default address changed');
        } catch (err) {
            setError('Failed to set default');
        }
    };

    const getCoords = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setAddressForm(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude }));
        });
    };

    return (
        <div className="min-h-screen bg-black text-white pb-32 pt-6 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-1 mb-4 shadow-xl shadow-primary/20">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <FaUser size={40} className="text-primary" />
                            )}
                        </div>
                    </div>
                    <h1 className="text-3xl font-heading font-black text-white tracking-tight">{user?.name || user?.username}</h1>
                    <p className="text-gray-500 font-medium">{user?.email}</p>
                    <div className="mt-3 px-4 py-1 rounded-full bg-gray-900 border border-gray-800 text-xs font-bold uppercase tracking-widest text-primary">
                        {user?.role}
                    </div>
                </div>

                {success && <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-2xl text-center text-sm font-bold animate-pulse">{success}</div>}
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-center text-sm font-bold">{error}</div>}

                {/* Profile Section */}
                <section className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <FaUser className="text-gray-500" /> Account Settings
                        </h2>
                        {!editingProfile && (
                            <button onClick={() => setEditingProfile(true)} className="text-primary text-sm font-bold hover:text-white transition">Edit</button>
                        )}
                    </div>

                    {editingProfile ? (
                        <form onSubmit={handleProfileSave} className="space-y-4">
                            <div>
                                <label className="block text-gray-500 text-xs font-bold uppercase mb-1 ml-1">Full Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black border border-gray-800 p-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-primary py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-primary/20">Save Profile</button>
                                <button type="button" onClick={() => setEditingProfile(false)} className="px-6 bg-gray-800 rounded-xl font-bold">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-gray-500 text-sm">Display Name: <span className="text-white font-medium ml-2">{user?.name || user?.username}</span></p>
                        </div>
                    )}
                </section>

                {/* Address Manager Section */}
                <section className="bg-gray-900/40 p-6 rounded-3xl border border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <FaMapMarkerAlt className="text-gray-500" /> Saved Addresses
                        </h2>
                        {!showAddressForm && (
                            <button 
                                onClick={() => { resetAddressForm(); setShowAddressForm(true); }}
                                className="bg-primary/10 text-primary p-2 rounded-xl border border-primary/20 hover:bg-primary hover:text-white transition"
                            >
                                <FaPlus size={16} />
                            </button>
                        )}
                    </div>

                    {showAddressForm ? (
                        <form onSubmit={handleAddressSubmit} className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-3 gap-2">
                                {['Home', 'Work', 'Other'].map(l => (
                                    <button 
                                        key={l}
                                        type="button"
                                        onClick={() => setAddressForm(prev => ({ ...prev, label: l }))}
                                        className={`py-2 rounded-xl text-xs font-bold border transition ${addressForm.label === l ? 'bg-primary border-primary text-white' : 'bg-black border-gray-800 text-gray-500'}`}
                                    >
                                        {l === 'Home' && <FaHome className="inline mr-1" />}
                                        {l === 'Work' && <FaBuilding className="inline mr-1" />}
                                        {l === 'Other' && <FaMap className="inline mr-1" />}
                                        {l}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input 
                                    placeholder="Receiver Name" 
                                    value={addressForm.fullName}
                                    onChange={e => setAddressForm(prev => ({ ...prev, fullName: e.target.value }))}
                                    className="bg-black border border-gray-800 p-3 rounded-xl outline-none focus:border-primary text-sm"
                                    required
                                />
                                <input 
                                    placeholder="Phone Number" 
                                    value={addressForm.phone}
                                    onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                                    className="bg-black border border-gray-800 p-3 rounded-xl outline-none focus:border-primary text-sm"
                                    required
                                />
                            </div>

                            <input 
                                placeholder="Street / House No. / Flat" 
                                value={addressForm.street}
                                onChange={e => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                                className="w-full bg-black border border-gray-800 p-3 rounded-xl outline-none focus:border-primary text-sm"
                                required
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    placeholder="Area / Landmark" 
                                    value={addressForm.area}
                                    onChange={e => setAddressForm(prev => ({ ...prev, area: e.target.value }))}
                                    className="bg-black border border-gray-800 p-3 rounded-xl outline-none focus:border-primary text-sm"
                                />
                                <input 
                                    placeholder="City" 
                                    value={addressForm.city}
                                    onChange={e => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                                    className="bg-black border border-gray-800 p-3 rounded-xl outline-none focus:border-primary text-sm"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    placeholder="State" 
                                    value={addressForm.state}
                                    onChange={e => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                                    className="bg-black border border-gray-800 p-3 rounded-xl outline-none focus:border-primary text-sm"
                                    required
                                />
                                <input 
                                    placeholder="Pincode" 
                                    value={addressForm.postalCode}
                                    onChange={e => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
                                    className="bg-black border border-gray-800 p-3 rounded-xl outline-none focus:border-primary text-sm"
                                    required
                                />
                            </div>

                            <button 
                                type="button" 
                                onClick={getCoords}
                                className="w-full py-2 border border-dashed border-gray-700 rounded-xl text-xs font-bold text-gray-500 hover:text-primary hover:border-primary transition"
                            >
                                {addressForm.lat ? `Location Fixed (${addressForm.lat.toFixed(4)}, ${addressForm.lng.toFixed(4)})` : 'Attach Current Coordinates (Optional)'}
                            </button>

                            <div className="flex gap-3">
                                <button type="submit" className="flex-1 bg-white text-black py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition">
                                    {editingAddressId ? 'Update Address' : 'Save Address'}
                                </button>
                                <button type="button" onClick={resetAddressForm} className="px-6 bg-gray-800 rounded-xl font-bold">Cancel</button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            {user?.addresses?.length === 0 ? (
                                <div className="text-center py-8">
                                    <FaMapMarkerAlt size={32} className="mx-auto text-gray-800 mb-2" />
                                    <p className="text-gray-600 text-sm">No addresses saved yet</p>
                                    <button onClick={() => setShowAddressForm(true)} className="mt-4 text-primary text-sm font-bold">Add your first address</button>
                                </div>
                            ) : (
                                user?.addresses?.map((addr) => (
                                    <div key={addr._id} className={`group bg-black/40 border p-4 rounded-2xl relative transition-all ${user.defaultAddress === addr._id ? 'border-primary/50 ring-1 ring-primary/20' : 'border-gray-800 hover:border-gray-700'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-gray-800 p-1.5 rounded-lg text-primary">
                                                    {addr.label === 'Home' && <FaHome size={12} />}
                                                    {addr.label === 'Work' && <FaBuilding size={12} />}
                                                    {addr.label === 'Other' && <FaMap size={12} />}
                                                </div>
                                                <h3 className="font-bold text-sm text-white uppercase tracking-wider">{addr.label}</h3>
                                                {user.defaultAddress === addr._id && (
                                                    <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded-full border border-primary/30 uppercase">Default</span>
                                                )}
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                <button onClick={() => handleEditAddress(addr)} className="p-2 text-gray-500 hover:text-white"><FaEdit size={14} /></button>
                                                <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-gray-500 hover:text-red-500"><FaTrash size={14} /></button>
                                            </div>
                                        </div>
                                        <p className="text-white text-sm font-bold mb-1">{addr.fullName}</p>
                                        <p className="text-gray-400 text-xs leading-relaxed max-w-[80%]">
                                            {addr.street}, {addr.area && `${addr.area}, `}
                                            {addr.city}, {addr.state} - {addr.postalCode}
                                        </p>
                                        <p className="text-gray-500 text-[10px] mt-2 font-medium">{addr.phone}</p>
                                        
                                        {user.defaultAddress !== addr._id && (
                                            <button 
                                                onClick={() => handleSetDefault(addr._id)}
                                                className="mt-4 w-full py-2 bg-gray-900 border border-gray-800 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition"
                                            >
                                                Set as Delivery Address
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </section>

                {/* Logout */}
                <button 
                    onClick={logout}
                    className="w-full py-4 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition shadow-lg shadow-red-500/10"
                >
                    Sign Out Account
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
