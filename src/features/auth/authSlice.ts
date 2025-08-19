import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface LoginCredentials {
  username: string;
  password: string;
}
interface AuthState {
  user: unknown | null;
  token: string | null;
  isLoading: boolean | null;
  error: string | null;
  isAuthenticated: boolean;
}

/**async thunk for login */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      /**Create Base64 encoded credentials for Basic Auth */
      //const encodedCredentials = btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch('http://localhost:8080/Memefest-SNAPSHOT-01/resources/SignIn/login', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials.username}:${credentials.password}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Login Failed!');
      }

      const data = await response.json();
      /**Store token in local storage */
      localStorage.setItem('token', data.accessTkn);
      localStorage.setItem('refresh-token', data.refreshTkn);
      return data;
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

/**Async thunk for Google sign in */
export const googleSignIn = createAsyncThunk(
  'auth/googleSignIn',
  async (credential: string, { rejectWithValue }) => {
    try {
      const googleResponse = await fetch('https://oauth2.googleapis.com/tokeninfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `id_token=${credential}`
      });

      if (!googleResponse.ok) {
        const errorData = await googleResponse.json().catch(() => ({}));
        console.log("Google Sign in error: ", errorData);
        throw new Error(errorData.message || 'Google sign in failed')
      }

      const googleUserInfo = await googleResponse.json();
      console.log("Google sign in data: ", googleUserInfo);

      /**Send user info to your backend */
      const backendResponse = await fetch('http://localhost:8080/Memefest-SNAPSHOT-01/resources/SignIn/google-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleToken: credential,
          userInfo: {
            email: googleUserInfo?.email,
            name: googleUserInfo?.name,
            sub: googleUserInfo?.sub,
          }
        })
      });

      if(!backendResponse.ok){
        const errorData = await backendResponse.json().catch(() => ({}));
        throw new Error(errorData || 'Backend Auth Failed');
      }

      const data = await backendResponse.json();

      /**Store token in local storage */
      localStorage.setItem('token', data.accessTkn);
      localStorage.setItem('refresh-token', data.refreshTkn);
      return data;
    } catch (error) {
      console.log("Network Error!")
      return rejectWithValue((error as Error).message);
    }
  }
);

/**Async thunk for reset password */
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async(
    {token, newPassword} : { token: string; newPassword: string },
    {rejectWithValue}
  ) => {
    try {
      const response = await fetch('http://localhost:8080/Memefest-SNAPSHOT-01/resources/SignIn/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({token, newPassword}),
      });
      return await response.json();
    } catch (error: any) {
      if(error.response && error.response?.data){
        return rejectWithValue(error.response.data?.message);
      }
      return rejectWithValue('An unexpected error occured');
    }
  }
);

/**async thunk for forgot password */
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8080/Memefest-SNAPSHOT-01/resources/SignIn/ResetPassword', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(email),
      })

      return await response.json();
    } catch(error: any) {
      if(error.response && error.response?.data){
        return rejectWithValue(error.response.data?.message);
      }
      return rejectWithValue('An unexpected error occured');
    }
  }
)

/** Auth Slice */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('accessTkn'),
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('accessTkn'),
  } as AuthState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessTkn');
      localStorage.removeItem('refreshTkn');
    },
  },
  extraReducers: (builder) => {
    // Login reducers
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessTkn;
        state.error = null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // Google Sign-In reducers
      .addCase(googleSignIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleSignIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessTkn;
        state.error = null;
        state.isAuthenticated = true;
      })
      .addCase(googleSignIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.token = null;
      })
      //Reset reducers
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.isAuthenticated = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Password reset failed!'
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState };