export const formatCurrency = (amount = 0) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(Number(amount || 0));

export const formatRelativeTime = (value) => {
    if (!value) return 'Just now';

    const date = new Date(value);
    const seconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
    });
};

export const formatDateTime = (value) => {
    if (!value) return '';

    return new Date(value).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatFullAddress = (address) => {
    if (!address) return 'Address not available';

    return [
        address.street,
        address.landmark,
        address.area,
        address.city,
        address.state,
        address.postalCode
    ]
        .filter(Boolean)
        .join(', ');
};

export const getRestaurantName = (restaurant) =>
    restaurant?.restaurantDetails?.restaurantName || restaurant?.username || 'Restaurant';

export const getRestaurantLocation = (restaurant) => {
    const businessAddress = restaurant?.restaurantDetails?.businessAddress;

    return [businessAddress?.area, businessAddress?.city, businessAddress?.state]
        .filter(Boolean)
        .join(', ');
};

export const isRestaurantDeliveryPaused = (restaurant) =>
    Boolean(restaurant?.restaurantDetails?.deliverySettings?.isDeliveryPaused);

export const getRestaurantStatus = (restaurant) =>
    restaurant?.restaurantDetails?.restaurantStatus === 'closed' ? 'closed' : 'open';

export const isRestaurantClosed = (restaurant) =>
    getRestaurantStatus(restaurant) === 'closed';

export const isRestaurantOrderingUnavailable = (restaurant) =>
    isRestaurantClosed(restaurant) || isRestaurantDeliveryPaused(restaurant);

export const getRestaurantStatusBadge = (restaurant) =>
    isRestaurantClosed(restaurant)
        ? { label: 'CLOSED', tone: 'bg-red-500/20 text-red-300 border-red-400/25' }
        : { label: 'OPEN', tone: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/25' };
