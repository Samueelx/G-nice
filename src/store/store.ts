import { configureStore, Store } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import postsReducer from "../features/posts/postsSlice";
import profileReducer from "../features/profile/profileSlice";
import userReducer from "../features/auth/userSlice";
import passwordSetupReducer from "../features/auth/passwordSetupSlice";
import chatsReducer from "../features/chats/chatsSlice";
import searchReducer from "../features/search/searchSlice";
import jokesReducer from "../features/jumbotron/jokesSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import { notificationsApi } from "@/services/api/notificationsApi";
import { eventsApi } from "@/services/api/eventsApi";

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
    notifications: notificationsReducer,
    [eventsApi.reducerPath]: eventsApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
  },
  // Add middleware to handle async actions and provide better dev experience
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types in serializableCheck
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
      // Enable thunk middleware
      thunk: true,
    }).concat(
      eventsApi.middleware,
      notificationsApi.middleware  // Add this line
    ),
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

/**Typescript type for RootState */
export type RootState = ReturnType<typeof store.getState>;
/**TypeScript type for AppDispatch */
export type AppDispatch = typeof store.dispatch;