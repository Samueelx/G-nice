import { configureStore, Store } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import profileReducer from '../features/profile/profileSlice'
import userReducer from '../features/auth/userSlice';

export const store: Store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postsReducer,
        profile: profileReducer,
        user: userReducer,
    }
});


/**Typescript type for RootState */
export type RootState = ReturnType<typeof store.getState>;
/**TypeScript type for AppDispatch */
export type AppDispatch = typeof store.dispatch;