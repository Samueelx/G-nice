import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Updated to match the API types
export type NotificationTab = 'all' | 'mentions' | 'comments' | 'files' | 'access';

interface NotificationsState {
  activeTab: NotificationTab;
  isDropdownOpen: boolean;
  lastSeenTimestamp: string | null;
  // For infinite scroll/pagination
  hasLoadedInitial: boolean;
}

const initialState: NotificationsState = {
  activeTab: 'all',
  isDropdownOpen: false,
  lastSeenTimestamp: null,
  hasLoadedInitial: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<NotificationTab>) => {
      state.activeTab = action.payload;
    },
    
    toggleDropdown: (state) => {
      state.isDropdownOpen = !state.isDropdownOpen;
    },
    
    closeDropdown: (state) => {
      state.isDropdownOpen = false;
    },
    
    openDropdown: (state) => {
      state.isDropdownOpen = true;
    },
    
    setLastSeenTimestamp: (state, action: PayloadAction<string>) => {
      state.lastSeenTimestamp = action.payload;
    },
    
    setHasLoadedInitial: (state, action: PayloadAction<boolean>) => {
      state.hasLoadedInitial = action.payload;
    },
  },
});

export const {
  setActiveTab,
  toggleDropdown,
  closeDropdown,
  openDropdown,
  setLastSeenTimestamp,
  setHasLoadedInitial,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
export type { NotificationsState };