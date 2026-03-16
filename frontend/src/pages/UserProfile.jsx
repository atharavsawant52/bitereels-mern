import { useMemo, useState } from 'react';
import { FaUser, FaMapMarkerAlt, FaPlus, FaTrash, FaCheckCircle, FaBuilding, FaHome, FaMap, FaLocationArrow } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { formatFullAddress } from '../utils/formatters';

const emptyAddressForm = {
    label: 'Home',
    fullName: '',
    phone: '',
    street: '',
    landmark: '',
    area: '',
    city: '',
    state: '',
    country: 'India',
    postalCode: '',
    lat: null,
    lng: null
};

const UserProfile = () => {
    const { user, updateUser, logout } = useAuth();
    const [name, setName] = useState(user?.name || user?.username || '');
    const [editingProfile, setEditingProfile] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addressForm, setAddressForm] = useState({
        ...emptyAddressForm,
        fullName: user?.name || user?.username || ''
    });

    const defaultAddress = useMemo(
        () => user?.addresses?.find((address) => address._id === user?.defaultAddress),
        [user?.addresses, user?.defaultAddress]
    );

    const resetAddressForm = () => {
        setAddressForm({
            ...emptyAddressForm,
            fullName: user?.name || user?.username || ''
        });
        setEditingAddressId(null);
        setShowAddressForm(false);
    };

    const handleProfileSave = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const { data } = await api.put('/api/users/update', { name });
            updateUser(data.data);
            toast.success('Profile updated');
            setEditingProfile(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Profile update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        const payload = {
            label: addressForm.label,
            fullName: addressForm.fullName,
            phone: addressForm.phone,
            street: addressForm.street,
            landmark: addressForm.landmark,
            area: addressForm.area,
            city: addressForm.city,
            state: addressForm.state,
            country: addressForm.country,
            postalCode: addressForm.postalCode,
            location: addressForm.lat && addressForm.lng
                ? {
                    type: 'Point',
                    coordinates: [addressForm.lng, addressForm.lat]
                }
                : undefined
        };

        try {
            const response = editingAddressId
                ? await api.put(`/api/users/address/${editingAddressId}`, payload)
                : await api.post('/api/users/address', payload);

            updateUser({
                addresses: response.data.data.addresses,
                defaultAddress: response.data.data.defaultAddress
            });
            toast.success(editingAddressId ? 'Address updated' : 'Address saved');
            resetAddressForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleEditAddress = (address) => {
        setAddressForm({
            label: address.label || 'Home',
            fullName: address.fullName || '',
            phone: address.phone || '',
            street: address.street || '',
            landmark: address.landmark || '',
            area: address.area || '',
            city: address.city || '',
            state: address.state || '',
            country: address.country || 'India',
            postalCode: address.postalCode || '',
            lat: address.location?.coordinates?.[1] || null,
            lng: address.location?.coordinates?.[0] || null
        });
        setEditingAddressId(address._id);
        setShowAddressForm(true);
    };

    const handleDeleteAddress = async (addressId) => {
        setLoading(true);
        try {
            const { data } = await api.delete(`/api/users/address/${addressId}`);
            updateUser({
                addresses: data.data.addresses,
                defaultAddress: data.data.defaultAddress
            });
            toast.success('Address deleted');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefault = async (addressId) => {
        try {
            const { data } = await api.patch(`/api/users/address/default/${addressId}`, {});
            updateUser({ defaultAddress: data.data.defaultAddress });
            toast.success('Default address updated');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set default address');
        }
    };

    const getCoords = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported on this device');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setAddressForm((currentValue) => ({
                    ...currentValue,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
                toast.success('Current coordinates attached');
            },
            () => toast.error('Unable to fetch current location')
        );
    };

    return (
        <div className="min-h-[calc(100vh-24px)] px-4 py-6 pb-28 md:px-6 md:py-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <section className="overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(135deg,rgba(251,93,71,0.18),rgba(15,23,42,0.5),rgba(2,6,23,0.9))] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.35)] md:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                                <FaUser size={28} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-primary">Profile</p>
                                <h1 className="mt-2 text-[2.35rem] font-black tracking-tight text-white">{user?.name || user?.username}</h1>
                                <p className="mt-2 text-sm text-slate-300">{user?.email}</p>
                            </div>
                        </div>

                        <div className="rounded-[24px] border border-white/8 bg-black/20 px-4 py-4 backdrop-blur-xl">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Default Address</p>
                            <p className="mt-2 text-sm font-semibold text-white">{defaultAddress ? defaultAddress.label : 'Required for orders'}</p>
                            <p className="mt-1 text-sm text-slate-400">{defaultAddress ? formatFullAddress(defaultAddress) : 'Please add one to unlock ordering.'}</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-[30px] border border-white/8 bg-slate-950/38 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Account</p>
                            <h2 className="mt-2 text-[1.85rem] font-bold text-white">Display details</h2>
                        </div>
                        {!editingProfile && (
                            <button
                                onClick={() => setEditingProfile(true)}
                                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/30 hover:bg-primary/10"
                            >
                                Edit profile
                            </button>
                        )}
                    </div>

                    {editingProfile ? (
                        <form onSubmit={handleProfileSave} className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none transition placeholder:text-slate-500 focus:border-primary/40"
                                placeholder="Full name"
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingProfile(false);
                                        setName(user?.name || user?.username || '');
                                    }}
                                    className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6d59] disabled:opacity-60"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Full Name</p>
                                <p className="mt-2 text-lg font-semibold text-white">{user?.name || user?.username}</p>
                            </div>
                            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Role</p>
                                <p className="mt-2 text-lg font-semibold capitalize text-white">{user?.role}</p>
                            </div>
                        </div>
                    )}
                </section>

                <section className="rounded-[30px] border border-white/8 bg-slate-950/38 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Addresses</p>
                            <h2 className="mt-2 text-[1.85rem] font-bold text-white">Manage delivery addresses</h2>
                        </div>
                        {!showAddressForm && (
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6d59]"
                            >
                                <FaPlus size={12} />
                                Add address
                            </button>
                        )}
                    </div>

                    {showAddressForm && (
                        <form onSubmit={handleAddressSubmit} className="mt-6 space-y-4 rounded-[24px] border border-white/8 bg-black/20 p-5">
                            <div className="grid gap-3 sm:grid-cols-3">
                                {['Home', 'Work', 'Other'].map((label) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => setAddressForm((currentValue) => ({ ...currentValue, label }))}
                                        className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                            addressForm.label === label
                                                ? 'border-primary/30 bg-primary/15 text-primary'
                                                : 'border-white/10 bg-white/[0.04] text-slate-300'
                                        }`}
                                    >
                                        {label === 'Home' && <FaHome className="mr-2 inline" />}
                                        {label === 'Work' && <FaBuilding className="mr-2 inline" />}
                                        {label === 'Other' && <FaMap className="mr-2 inline" />}
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    required
                                    placeholder="Receiver name"
                                    value={addressForm.fullName}
                                    onChange={(event) => setAddressForm((currentValue) => ({ ...currentValue, fullName: event.target.value }))}
                                    className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-primary/40"
                                />
                                <input
                                    required
                                    placeholder="Phone number"
                                    value={addressForm.phone}
                                    onChange={(event) => setAddressForm((currentValue) => ({ ...currentValue, phone: event.target.value }))}
                                    className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-primary/40"
                                />
                            </div>

                            <input
                                required
                                placeholder="Street / House / Flat"
                                value={addressForm.street}
                                onChange={(event) => setAddressForm((currentValue) => ({ ...currentValue, street: event.target.value }))}
                                className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-primary/40"
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <input
                                    placeholder="Landmark"
                                    value={addressForm.landmark}
                                    onChange={(event) => setAddressForm((currentValue) => ({ ...currentValue, landmark: event.target.value }))}
                                    className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-primary/40"
                                />
                                <input
                                    placeholder="Area"
                                    value={addressForm.area}
                                    onChange={(event) => setAddressForm((currentValue) => ({ ...currentValue, area: event.target.value }))}
                                    className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-primary/40"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <input
                                    required
                                    placeholder="City"
                                    value={addressForm.city}
                                    onChange={(event) => setAddressForm((currentValue) => ({ ...currentValue, city: event.target.value }))}
                                    className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-primary/40"
                                />
                                <input
                                    required
                                    placeholder="State"
                                    value={addressForm.state}
                                    onChange={(event) => setAddressForm((currentValue) => ({ ...currentValue, state: event.target.value }))}
                                    className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-primary/40"
                                />
                                <input
                                    required
                                    placeholder="Pincode"
                                    value={addressForm.postalCode}
                                    onChange={(event) => setAddressForm((currentValue) => ({ ...currentValue, postalCode: event.target.value }))}
                                    className="h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white outline-none focus:border-primary/40"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={getCoords}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/12 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-primary/30 hover:text-white"
                            >
                                <FaLocationArrow size={12} />
                                {addressForm.lat ? `Coordinates attached (${addressForm.lat.toFixed(4)}, ${addressForm.lng.toFixed(4)})` : 'Attach current coordinates (optional)'}
                            </button>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={resetAddressForm}
                                    className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff6d59] disabled:opacity-60"
                                >
                                    {editingAddressId ? 'Update address' : 'Save address'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        {user?.addresses?.length ? (
                            user.addresses.map((address) => {
                                const isDefault = user.defaultAddress === address._id;

                                return (
                                    <article key={address._id} className={`rounded-[24px] border p-5 ${isDefault ? 'border-primary/20 bg-primary/[0.08]' : 'border-white/8 bg-white/[0.03]'}`}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-lg font-semibold text-white">{address.fullName}</p>
                                                    {isDefault && (
                                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-2 text-sm font-medium text-slate-300">{address.label}</p>
                                                <p className="mt-3 text-sm leading-7 text-slate-400">{formatFullAddress(address)}</p>
                                                <p className="mt-2 text-sm text-slate-500">{address.phone}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAddress(address._id)}
                                                className="flex h-11 w-11 items-center justify-center rounded-full border border-red-400/10 bg-red-500/10 text-red-300 transition hover:bg-red-500/16"
                                            >
                                                <FaTrash size={13} />
                                            </button>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-3">
                                            <button
                                                onClick={() => handleEditAddress(address)}
                                                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-primary/30 hover:bg-primary/10"
                                            >
                                                Edit
                                            </button>
                                            {!isDefault && (
                                                <button
                                                    onClick={() => handleSetDefault(address._id)}
                                                    className="rounded-2xl border border-emerald-400/16 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/16"
                                                >
                                                    <FaCheckCircle className="mr-2 inline" />
                                                    Set as default
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                );
                            })
                        ) : (
                            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center lg:col-span-2">
                                <FaMapMarkerAlt className="mx-auto text-slate-500" size={24} />
                                <h3 className="mt-4 text-xl font-bold text-white">No addresses saved yet</h3>
                                <p className="mt-2 text-sm leading-7 text-slate-400">
                                    Add a delivery address here. Orders stay blocked until a default address is saved.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <button
                    onClick={logout}
                    className="rounded-[24px] border border-red-400/16 bg-red-500/10 px-6 py-4 text-sm font-semibold text-red-200 transition hover:bg-red-500/16"
                >
                    Sign out
                </button>
            </div>
        </div>
    );
};

export default UserProfile;
