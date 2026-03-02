import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const userInfoRaw = localStorage.getItem('userInfo');
    if (!userInfoRaw) return config;

    try {
        const userInfo = JSON.parse(userInfoRaw);
        const token = userInfo?.token;
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch {
    }

    return config;
});

export default api;
