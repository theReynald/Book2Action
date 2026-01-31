import { create } from 'zustand';
import {
  GoogleUserInfo,
  getStoredUserInfo,
  getAccessToken,
  saveAuthTokens,
  saveUserInfo,
  clearAuthData,
  fetchGoogleUserInfo,
  isTokenExpired,
} from '../services/googleAuthService';

interface AuthState {
  user: GoogleUserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: GoogleUserInfo | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth operations
  handleAuthSuccess: (accessToken: string, expiresIn?: number) => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  logout: () => Promise<void>;
  checkAndRefreshAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check stored auth
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  handleAuthSuccess: async (accessToken: string, expiresIn?: number) => {
    set({ isLoading: true, error: null });
    
    try {
      // Calculate expiry time
      const expiresAt = expiresIn 
        ? Date.now() + (expiresIn * 1000)
        : Date.now() + (3600 * 1000); // Default to 1 hour

      // Save tokens
      await saveAuthTokens({ accessToken, expiresAt });

      // Fetch and save user info
      const userInfo = await fetchGoogleUserInfo(accessToken);
      
      if (userInfo) {
        await saveUserInfo(userInfo);
        set({
          user: userInfo,
          accessToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Failed to get user information');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
      });
      throw error;
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    
    try {
      const [storedToken, storedUser, expired] = await Promise.all([
        getAccessToken(),
        getStoredUserInfo(),
        isTokenExpired(),
      ]);

      if (storedToken && storedUser && !expired) {
        set({
          user: storedUser,
          accessToken: storedToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else if (expired && storedToken) {
        // Token expired, clear auth
        await clearAuthData();
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await clearAuthData();
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error during logout:', error);
      set({ isLoading: false });
    }
  },

  checkAndRefreshAuth: async () => {
    const { accessToken, isAuthenticated } = get();
    
    if (!isAuthenticated || !accessToken) {
      return false;
    }

    const expired = await isTokenExpired();
    if (expired) {
      // For now, just clear auth if expired
      // In a production app, you'd implement token refresh here
      await get().logout();
      return false;
    }

    return true;
  },
}));
