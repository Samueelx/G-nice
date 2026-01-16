import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Define the interface to include tokens
interface PasswordSetupState {
    loading: boolean;
    error: string | null;
    success: boolean;
    accessToken: string | null;
    refreshToken: string | null;
}

// Initial state with token fields
const initialState: PasswordSetupState = {
    loading: false,
    error: null,
    success: false,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken')
}

export const setupPassword = createAsyncThunk(
    'auth/setupPassword',
    async(
        {accessTkn, refreshTkn, password}: {
            accessTkn: string; 
            refreshTkn: string; 
            password: string 
        },
        {rejectWithValue}
    ) => {
        try {
            const response = await fetch('http://16.16.107.227:8080/Memefest-SNAPSHOT-01/resources/SignIn/Sign-Up', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({accessTkn, password})
            });

            if(!response.ok){
                const errorData = await response.json().catch(() => ({}));
                return rejectWithValue(
                    errorData.message || 'password setup failed'
                )
            }
            console.log(response);
            // Store tokens in localStorage
            localStorage.setItem('accessToken', accessTkn);
            localStorage.setItem('refreshToken', refreshTkn);

            return { accessTkn, refreshTkn };
        } catch (error) {
            return rejectWithValue('An unexpected error occurred when trying to setup the password.');
        }
    }
);

// Async thunk for token removal (logout)
export const removeTokens = createAsyncThunk(
    'auth/removeTokens',
    async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return true;
    }
);

// Create the slice
const passwordSetupSlice = createSlice({
    name: 'passwordSetup',
    initialState,
    reducers: {
        resetPasswordSetupState: (state) => {
            state.loading = false;
            state.error = null;
            state.success = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(setupPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(setupPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.success = true;
                // Update state with tokens
                state.accessToken = action.payload.accessTkn;
                state.refreshToken = action.payload.refreshTkn;
            })
            .addCase(setupPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
                // Clear tokens on failure
                state.accessToken = null;
                state.refreshToken = null;
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            })
            .addCase(removeTokens.fulfilled, (state) => {
                state.accessToken = null;
                state.refreshToken = null;
            });
    }
});

export const {resetPasswordSetupState} = passwordSetupSlice.actions;
export default passwordSetupSlice.reducer;
export type { PasswordSetupState };