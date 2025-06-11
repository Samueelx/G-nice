import { configureStore, Store } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice';
import postsReducer from '../features/posts/postsSlice';
import profileReducer from '../features/profile/profileSlice'
import userReducer from '../features/auth/userSlice';
import passwordSetupReducer from '../features/auth/passwordSetupSlice';
import chatsReducer from '../features/chats/chatsSlice'
import searchReducer from '../features/search/searchSlice'
import jokesReducer from '../features/jumbotron/jokesSlice'
import topicReducer from '../features/topics/topicSlice'
import notificationsReducer from '../features/notifications/notificationSlice'
import websocketReducer from '../features/websocket/websocketSlice';

export const store: Store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postsReducer,
        profile: profileReducer,
        user: userReducer,
        passwordSetup: passwordSetupReducer,
        chats: chatsReducer,
        search: searchReducer,
        jokes: jokesReducer,
        topic: topicReducer,
        notifications: notificationsReducer,
        websocket: websocketReducer,
    },

    // Add middleware to handle async actions and provide better dev experience
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types in serializableCheck
                ignoredActions: ['websocket/addMessage'],
                // Ignore these field paths in all actions
                ignoredActionsPaths: ['payload.timestamp'],
                // Ignore these paths in the state
                ignoredPaths: ['websocket.messages'],
            },
            // Enable thunk middleware
            thunk: true,
        }).concat(),
    // Enable Redux DevTools in development
    devTools: process.env.NODE_ENV !== 'production',
});


/**Typescript type for RootState */
export type RootState = ReturnType<typeof store.getState>;
/**TypeScript type for AppDispatch */
export type AppDispatch = typeof store.dispatch;