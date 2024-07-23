import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
    profile: null | {id: string; name: string; bio: string};
}

const initialState: ProfileState = {
    profile: null,
}

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setProfile: (state, action: PayloadAction<{id: string; name: string; bio: string}>) => {
            state.profile= action.payload;
        },
        clearProfile: (state) => {
            state.profile = null;
        },
    },
});

export const {setProfile, clearProfile} = profileSlice.actions;
export default profileSlice.reducer;