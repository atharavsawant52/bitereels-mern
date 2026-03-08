import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const UserEditProfileModal = ({ isOpen, onClose, initial }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(initial?.name || '');
  const [phone, setPhone] = useState(initial?.phone || '');
  const [street, setStreet] = useState(initial?.street || '');
  const [area, setArea] = useState(initial?.area || '');
  const [city, setCity] = useState(initial?.city || '');
  const [state, setState] = useState(initial?.state || '');
  const [postalCode, setPostalCode] = useState(initial?.postalCode || '');
  const [imageUrl, setImageUrl] = useState(initial?.profilePicture || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('image', file);
    try {
      const { data } = await api.post('/api/upload/profile', form);
      if (data.success) setImageUrl(data.url);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Update profile image and name first
      const upd = await api.put('/api/users/update', { name, profilePicture: imageUrl });
      if (upd.data?.success) {
        updateUser(upd.data.data);
      }
      // Update default address if provided
      if (street || city || state || postalCode || phone) {
        const payload = {
          label: 'Home',
          fullName: name || user.name || user.username,
          phone,
          street,
          area,
          city,
          state,
          postalCode
        };
        if (initial?.addressId) {
          await api.put(`/api/users/address/${initial.addressId}`, payload);
        } else {
          await api.post(`/api/users/address`, payload);
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-white/10 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h3 className="text-white font-bold uppercase text-sm">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10 bg-black flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-600 text-xs">No Image</div>
              )}
            </div>
            <label className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-xs font-semibold cursor-pointer hover:bg-white/10">
              Change Photo
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>

          <div>
            <label className="text-xs text-gray-400">Name</label>
            <input className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white" value={name} onChange={e=>setName(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400">Phone</label>
            <input className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white" value={phone} onChange={e=>setPhone(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-400">Address</label>
            <input placeholder="Street" className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-white mb-2" value={street} onChange={e=>setStreet(e.target.value)} />
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Area" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white" value={area} onChange={e=>setArea(e.target.value)} />
              <input placeholder="City" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white" value={city} onChange={e=>setCity(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <input placeholder="State" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white" value={state} onChange={e=>setState(e.target.value)} />
              <input placeholder="Pincode" className="bg-black border border-white/10 rounded-xl px-3 py-2 text-white" value={postalCode} onChange={e=>setPostalCode(e.target.value)} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 text-gray-300 text-xs font-bold uppercase">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-primary rounded-xl py-3 text-white text-xs font-bold uppercase">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditProfileModal;
