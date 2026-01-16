import axios from 'axios';
import { store } from '@/store/store'; // Import your Redux store

// Create the main instance with JSON content type (for most API calls)
const instance = axios.create({
    baseURL: 'http://16.16.107.227:8080/Memefest-SNAPSHOT-01/resources',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Create a separate instance for form data (login/signup)
export const formInstance = axios.create({
    baseURL: 'http://16.16.107.227:8080/',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
});

// Request interceptor for the main instance (adds auth token)
instance.interceptors.request.use(
    (config) => {
        // Get the current state and token
        const state = store.getState() as any;
        const token = state.auth?.token;
        
        // Add Authorization header if token exists
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Request interceptor for form instance (no auth token needed for login/signup)
formInstance.interceptors.request.use(
    (config) => {
        // You can add any form-specific logic here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration (shared logic)
const responseInterceptor = (response: any) => {
    return response;
};

const responseErrorInterceptor = (error: any) => {
    // Handle 401 unauthorized responses (token expired/invalid)
    if (error.response?.status === 401) {
        // You can dispatch a logout action here if needed
        // store.dispatch(logout());
        
        // Optionally redirect to login page
        // window.location.href = '/login';
        console.log('Token expired or invalid');
    }
    
    return Promise.reject(error);
};

// Apply response interceptors to both instances
instance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
formInstance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// Export the main instance as default (for JSON API calls)
export default instance;