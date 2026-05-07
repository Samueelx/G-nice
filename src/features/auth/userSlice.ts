import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import instance from '@/api/axiosConfig';
import { AxiosResponse } from 'axios';

// Types for the registration data and response
export interface UserRegistrationData {
  display_name: string;
  email: string;
  username: string;
  password?: string;
}

// Backend returns no data, just 200 OK status
interface RegistrationResponse {
  status: number;
}

interface UserState {
  loading: boolean;
  error: string | null;
  userData: UserRegistrationData | null;
  registrationResponse: RegistrationResponse | null;
}

const initialState: UserState = {
  loading: false,
  error: null,
  userData: null,
  registrationResponse: null,
};

export const registerUser = createAsyncThunk<
  RegistrationResponse,
  UserRegistrationData, 
  {
    rejectValue: string;
  }
>('user/register', async (userData: UserRegistrationData, { rejectWithValue }) => {
  try {
    const response: AxiosResponse = await instance.post(
      '/auth/register',
      userData
    );
    // Backend returns no data, just check status code
    return { status: response.status };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationResponse = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Registration failed';
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
export type { UserState };