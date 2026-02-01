import axios, { InternalAxiosRequestConfig } from 'axios';
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
        const token = state.auth?.accessToken;

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

// Custom type for AxiosRequestConfig to include _retry property
interface ValidAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const responseErrorInterceptor = async (error: any) => {
    const originalRequest = error.config as ValidAxiosRequestConfig;

    // Handle 401 unauthorized responses (token expired/invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            // Import dynamically to avoid circular dependency issues if any
            const { refreshAccessToken, logout } = await import('@/features/auth/authSlice');

            // Dispatch refresh token action
            // @ts-ignore - Dispatch typing can be tricky with thunks outside components
            const resultAction = await store.dispatch(refreshAccessToken());

            if (refreshAccessToken.fulfilled.match(resultAction)) {
                // Get the new token from the result
                const newToken = resultAction.payload.accessTkn;

                // Update header and retry original request
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                return instance(originalRequest);
            } else {
                // Refresh failed - logout user
                // @ts-ignore
                store.dispatch(logout());
                return Promise.reject(error);
            }
        } catch (refreshError) {
            // Handle refresh errors
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
};

// Apply response interceptors to both instances
instance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);
formInstance.interceptors.response.use(responseInterceptor, responseErrorInterceptor);

// Export the main instance as default (for JSON API calls)
export default instance;