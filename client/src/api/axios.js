import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
    const user = localStorage.getItem('roomie_user');
    if (user) {
        const { token } = JSON.parse(user);
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 globally — clear storage and redirect to login
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('roomie_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;
