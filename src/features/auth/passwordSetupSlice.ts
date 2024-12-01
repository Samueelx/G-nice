import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
interface PasswordSetupState {
    loading: boolean;
    error: string | null;
    success: boolean;
}

/**Initial state */
const initialState: PasswordSetupState = {
    loading: false,
    error: null,
    success: false,
}

export const setupPassword = createAsyncThunk(
    'auth/setupPassword',
    async(
        {token, password}: {token: string; password: string },
        {rejectWithValue}
    ) => {
        try {
            const response = await fetch('/api/auth/setup-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({token, password})
            });
            if(!response.ok){
                const errorData = await response.json().catch(() => ({}));
                return rejectWithValue(
                    errorData.message || 'password setup failed'
                )
            }

            return await response.json();
            
        } catch (error) {
            return rejectWithValue('An unexpected error occured when trying to setup the password.');
        }
    }
);

/**Create the slice */
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
            .addCase(setupPassword.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
                state.success = true;
            })
            .addCase(setupPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.success = false;
            });
    }
});

export const {resetPasswordSetupState} = passwordSetupSlice.actions;
export default passwordSetupSlice.reducer;