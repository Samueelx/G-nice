import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface LoginCredentials{
  username: string;
  password: string;
}
interface AuthState{
  user: any | null;
  token: string | null;
  isLoading: boolean | null;
  error: string | null; 
}

/**async thunk for login */
export const loginUser = createAsyncThunk(
  'auth/login',
  async(credentials: LoginCredentials, { rejectWithValue }) => {
    try{
      /**Create Base64 encoded credentials for Basic Auth */
      //const encodedCredentials = btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch('http://localhost:8080/Memefest-SNAPSHOT-01/resources/SignIn/login', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials.username}:${credentials.password}`
        }
      });

      if(!response.ok){
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Login Failed!');
      }

      const data = await response.json();
      /**Store token in local storage */
      localStorage.setItem('token', data.token);
      return data;
    } catch(error){
      return rejectWithValue((error as Error).message);
    }
  }
);

/**Auth Slice */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
  } as AuthState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder.
      addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;