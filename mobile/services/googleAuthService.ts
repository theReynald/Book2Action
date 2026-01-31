import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';

// Required for web browser auth redirect
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const ACCESS_TOKEN_KEY = 'google_access_token';
const REFRESH_TOKEN_KEY = 'google_refresh_token';
const USER_INFO_KEY = 'google_user_info';
const TOKEN_EXPIRY_KEY = 'google_token_expiry';

// Google OAuth Client IDs - Replace with your own from Google Cloud Console
// https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = {
  // For iOS standalone builds
  iosClientId: '971573793288-86o4ssddnvjbo7er7m3ickfl61kr4dko.apps.googleusercontent.com',
  // For Android standalone builds  
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  // For web / Expo Go development
  webClientId: '971573793288-0rr8pqi40eklk4i0hetn4ggd27j79ktb.apps.googleusercontent.com',
};

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * Hook to get Google Auth request configuration
 */
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID.webClientId,
    iosClientId: GOOGLE_CLIENT_ID.iosClientId,
    androidClientId: GOOGLE_CLIENT_ID.androidClientId,
    scopes: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  return { request, response, promptAsync };
};

/**
 * Fetch user info from Google
 */
export const fetchGoogleUserInfo = async (accessToken: string): Promise<GoogleUserInfo | null> => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Google user info:', error);
    return null;
  }
};

/**
 * Save auth tokens to secure storage
 */
export const saveAuthTokens = async (tokens: AuthTokens): Promise<void> => {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    if (tokens.refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
    if (tokens.expiresAt) {
      await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, tokens.expiresAt.toString());
    }
  } catch (error) {
    console.error('Error saving auth tokens:', error);
    throw error;
  }
};

/**
 * Save user info to secure storage
 */
export const saveUserInfo = async (userInfo: GoogleUserInfo): Promise<void> => {
  try {
    await SecureStore.setItemAsync(USER_INFO_KEY, JSON.stringify(userInfo));
  } catch (error) {
    console.error('Error saving user info:', error);
    throw error;
  }
};

/**
 * Get stored access token
 */
export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get stored user info
 */
export const getStoredUserInfo = async (): Promise<GoogleUserInfo | null> => {
  try {
    const userInfoStr = await SecureStore.getItemAsync(USER_INFO_KEY);
    return userInfoStr ? JSON.parse(userInfoStr) : null;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = async (): Promise<boolean> => {
  try {
    const expiryStr = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);
    if (!expiryStr) return true;
    
    const expiresAt = parseInt(expiryStr, 10);
    // Consider expired if within 5 minutes of expiry
    return Date.now() > (expiresAt - 5 * 60 * 1000);
  } catch (error) {
    return true;
  }
};

/**
 * Clear all stored auth data (logout)
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_INFO_KEY);
    await SecureStore.deleteItemAsync(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};

/**
 * Create a calendar event using Google Calendar API
 */
export const createCalendarEvent = async (
  accessToken: string,
  event: {
    summary: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    timeZone?: string;
  }
): Promise<{ success: boolean; eventId?: string; htmlLink?: string; error?: string }> => {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.summary,
          description: event.description,
          start: {
            dateTime: event.startDateTime,
            timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: event.endDateTime,
            timeZone: event.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 30 },
              { method: 'email', minutes: 60 },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create calendar event');
    }

    const data = await response.json();
    return {
      success: true,
      eventId: data.id,
      htmlLink: data.htmlLink,
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
