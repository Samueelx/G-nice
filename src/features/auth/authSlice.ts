// authSlice.ts - Fixed with proper typing
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthTokens {
  accessTkn: string;
  refreshTkn: string;
}

interface LoginResponse {
  user: any;
  token: string;
  refresh_token: string;
}

interface AuthState {
  user: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  isAuthenticated: boolean;
  isGoogleAuth: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  error: null,
  message: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isGoogleAuth: false,
};

// Helper function to store tokens
const storeTokens = (accessTkn: string, refreshTkn: string) => {
  localStorage.setItem('accessToken', accessTkn);
  localStorage.setItem('refreshToken', refreshTkn);
};

// Helper function to clear tokens
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/** Login with email/password */
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/v1/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Login Failed!');
      }

      // Handle standard API envelope
      const responseBody = await response.json();
      const data = responseBody.data;

      // Extract token and user (using token as accessTkn)
      const token = data.token;
      const refresh_token = data.refresh_token;
      storeTokens(token, refresh_token);

      return {
        user: data.user,
        token: token,
        refresh_token: refresh_token,
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/** Verify OTP */
export const verifyOtp = createAsyncThunk<
  LoginResponse,
  { email: string; otp: string },
  { rejectValue: string }
>(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/v1/auth/verify-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, otp }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'OTP verification failed');
      }

      const responseBody = await response.json();
      const data = responseBody.data;
      
      const token = data.token;
      const refresh_token = data.refresh_token;
      storeTokens(token, refresh_token);

      return {
        user: data.user,
        token: token,
        refresh_token: refresh_token,
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/** Google Sign-In / Sign-Up
 *  Sends the raw Google ID token directly to the backend.
 *  The backend is responsible for verifying the token with Google.
 */
export const googleSignIn = createAsyncThunk<
  LoginResponse,
  string,
  { rejectValue: string }
>(
  'auth/googleSignIn',
  async (credential, { rejectWithValue }) => {
    try {
      const backendResponse = await fetch(
        'http://localhost:8080/api/v1/SignIn/google-login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ googleToken: credential }),
        }
      );

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Google sign-in failed. Please try again.');
      }

      const responseBody = await backendResponse.json();
      const data = responseBody.data ?? responseBody;

      storeTokens(data.token, data.refresh_token ?? '');

      return {
        user: data.user,
        token: data.token,
        refresh_token: data.refresh_token ?? '',
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/** Setup/Change Password */
export const setupPassword = createAsyncThunk<
  LoginResponse,
  { password: string; accessTkn: string },
  { rejectValue: string }
>(
  'auth/setupPassword',
  async ({ password, accessTkn }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/v1/SignIn/Sign-Up',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password, accessTkn }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Password setup failed');
      }

      const responseBody = await response.json();
      const data = responseBody.data ?? responseBody;

      storeTokens(data.token, data.refresh_token ?? '');

      return {
        user: data.user,
        token: data.token,
        refresh_token: data.refresh_token ?? '',
      };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/** Refresh Access Token */
export const refreshAccessToken = createAsyncThunk<
  AuthTokens,
  void,
  { rejectValue: string; state: { auth: AuthState } }
>(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const refreshToken =
        state.auth.refreshToken ||
        localStorage.getItem('refreshToken');

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(
        'http://localhost:8080/api/v1/auth/refresh',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      if (!response.ok) {
        clearTokens();
        throw new Error('Token refresh failed');
      }

      const responseBody = await response.json();
      const data = responseBody.data;

      storeTokens(data.token, data.refresh_token);

      return {
        accessTkn: data.token,
        refreshTkn: data.refresh_token
      };
    } catch (error) {
      clearTokens();
      return rejectWithValue((error as Error).message);
    }
  }
);

/** Reset Password */
export const resetPassword = createAsyncThunk<
  { message?: string },
  { token: string; newPassword: string },
  { rejectValue: string }
>(
  'auth/resetPassword',
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/v1/SignIn/reset-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, newPassword }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Reset password failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/** Forgot Password */
export const forgotPassword = createAsyncThunk<
  { message?: string },
  string,
  { rejectValue: string }
>(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await fetch(
        'http://localhost:8080/api/v1/SignIn/ResetPassword',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Forgot password request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/** Auth Slice */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isGoogleAuth = false;
      state.message = null;
      state.error = null;
      clearTokens();
    },
    clearMessage: (state) => {
      state.message = null;
      state.error = null;
    },
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.accessToken = action.payload.accessTkn;
      state.refreshToken = action.payload.refreshTkn;
      state.isAuthenticated = true;
      storeTokens(action.payload.accessTkn, action.payload.refreshTkn);
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
        state.message = null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.message = null;
        state.isAuthenticated = false;
        clearTokens();
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
        state.message = null;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'OTP verification failed';
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.message = null;
        state.isAuthenticated = false;
        clearTokens();
      })

      // Google Sign-In
      .addCase(googleSignIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
        state.message = null;
        state.isAuthenticated = true;
        state.isGoogleAuth = true;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Google sign in failed';
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.message = null;
        state.isAuthenticated = false;
        clearTokens();
      })

      // Setup Password
      .addCase(setupPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(setupPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.token;
        state.refreshToken = action.payload.refresh_token;
        state.error = null;
        state.message = 'Password setup successful!';
        state.isAuthenticated = true;
      })
      .addCase(setupPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password setup failed';
        state.message = null;
        clearTokens();
      })

      // Refresh Token
      .addCase(refreshAccessToken.pending, (state) => {
        state.error = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessTkn;
        state.refreshToken = action.payload.refreshTkn;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.user = null;
        clearTokens();
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.message = action.payload?.message || 'Password reset successful!';
        state.isAuthenticated = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Password reset failed!';
        state.message = null;
      })

      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.message = action.payload?.message || 'Password reset email sent successfully!';
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Forgot password request failed';
        state.message = null;
      });
  },
});

export const { logout, clearMessage, setTokens } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState, AuthTokens, LoginCredentials };