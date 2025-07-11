import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User as FirebaseUser, signInWithCustomToken } from 'firebase/auth';
import { loginApi, signupApi, logoutApi, updateNameApi, updatePasswordApi } from '../api/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../api/firebase';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

type RootState = {
  auth: AuthState;
};

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  email: firebaseUser.email || '',
  name: firebaseUser.displayName || '',
});

export const checkAuthOnStartup = createAsyncThunk(
  'auth/checkAuthOnStartup',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return null;
      const userCredential = await signInWithCustomToken(auth, token);
      return mapFirebaseUser(userCredential.user);
    } catch (error: any) {
      await AsyncStorage.removeItem('authToken');
      return rejectWithValue('Session expired. Please log in again.');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await loginApi(email, password);
      return mapFirebaseUser(user);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const user = await signupApi(name, email, password);
      return mapFirebaseUser(user);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await logoutApi();
    return null;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Logout failed');
  }
});

export const updateName = createAsyncThunk(
  'auth/updateName',
  async (name: string, { getState, rejectWithValue }) => {
    try {
      await updateNameApi(name);
      const state = getState() as RootState;
      if (state.auth.user) {
        return { ...state.auth.user, name };
      }
      return rejectWithValue('No user');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Update name failed');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (password: string, { dispatch, rejectWithValue }) => {
    try {
      await updatePasswordApi(password);
      await dispatch(logout());
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Update password failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAuthOnStartup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthOnStartup.fulfilled, (state, action: PayloadAction<User | null>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(checkAuthOnStartup.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateName.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePassword.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer; 