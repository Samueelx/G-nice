import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { formInstance } from '@/api/axiosConfig';
import { AxiosResponse } from 'axios';

// Types for the registration data and response
export interface UserRegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
}

interface RegistrationResponse {
  success: boolean;
  userId: string;
  message: string;
  // Add any other fields your API returns
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
    rejectValue: string; // Type for the rejection value
  }
>('user/register', async (userData: UserRegistrationData, { rejectWithValue }) => {
  try {
    const response: AxiosResponse<RegistrationResponse> = await formInstance.put(
      'Memefest-SNAPSHOT-01/resources/SignIn/Verify-email',
      userData
    );
    return response.data;
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