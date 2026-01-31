import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { Key, Eye, EyeOff, Check, ExternalLink, Trash2, Calendar, LogOut, User } from 'lucide-react-native';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { useGoogleAuth } from '../services/googleAuthService';
import { colors } from '../constants/colors';

const API_KEY_STORAGE_KEY = 'openrouter_api_key';

export default function SettingsScreen() {
  const { isDarkMode } = useThemeStore();
  const { 
    user, 
    isAuthenticated, 
    isLoading: authLoading, 
    handleAuthSuccess, 
    loadStoredAuth, 
    logout 
  } = useAuthStore();
  const { request, response, promptAsync } = useGoogleAuth();
  
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const bgColor = isDarkMode ? colors.dark.background : colors.light.background;
  const textColor = isDarkMode ? colors.dark.text : colors.light.text;
  const textMuted = isDarkMode ? colors.dark.textMuted : colors.light.textMuted;
  const cardBg = isDarkMode ? 'rgba(25, 30, 40, 0.75)' : 'rgba(255, 255, 255, 0.85)';

  useEffect(() => {
    loadApiKey();
    loadStoredAuth();
  }, []);

  // Handle Google auth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        setIsSigningIn(true);
        handleAuthSuccess(authentication.accessToken, authentication.expiresIn ?? undefined)
          .then(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          })
          .catch((error) => {
            Alert.alert('Sign In Failed', error.message || 'Failed to sign in with Google');
          })
          .finally(() => {
            setIsSigningIn(false);
          });
      }
    } else if (response?.type === 'error') {
      Alert.alert('Sign In Error', response.error?.message || 'An error occurred during sign in');
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    promptAsync();
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of Google?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const loadApiKey = async () => {
    try {
      const savedKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
        setHasExistingKey(true);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    try {
      await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsSaved(true);
      setHasExistingKey(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key');
    }
  };

  const deleteApiKey = async () => {
    Alert.alert(
      'Delete API Key',
      'Are you sure you want to remove your API key?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
              setApiKey('');
              setHasExistingKey(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting API key:', error);
            }
          },
        },
      ]
    );
  };

  const openOpenRouter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL('https://openrouter.ai/keys');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Google Account Section */}
        <View style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Calendar size={24} color={colors.primary.DEFAULT} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginLeft: 12 }}>
              Google Calendar
            </Text>
          </View>

          <Text style={{ color: textMuted, marginBottom: 16, lineHeight: 20 }}>
            Sign in with Google to add action steps directly to your calendar.
          </Text>

          {authLoading || isSigningIn ? (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={{ color: textMuted, marginTop: 12 }}>
                {isSigningIn ? 'Signing in...' : 'Loading...'}
              </Text>
            </View>
          ) : isAuthenticated && user ? (
            // Signed in state
            <View>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(241, 245, 249, 0.9)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
              }}>
                {user.picture ? (
                  <Image
                    source={{ uri: user.picture }}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                  />
                ) : (
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.primary.DEFAULT,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <User size={24} color="#fff" />
                  </View>
                )}
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={{ color: textColor, fontWeight: '600', fontSize: 16 }}>
                    {user.name}
                  </Text>
                  <Text style={{ color: textMuted, fontSize: 14 }}>
                    {user.email}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                  paddingVertical: 14,
                  borderRadius: 12,
                }}
              >
                <LogOut size={18} color={colors.error} />
                <Text style={{ color: colors.error, fontWeight: '600', marginLeft: 8 }}>
                  Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Sign in button
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={!request}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                opacity: request ? 1 : 0.5,
              }}
            >
              <Image
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={{ width: 20, height: 20, marginRight: 10 }}
              />
              <Text style={{ color: '#333', fontWeight: '600', fontSize: 16 }}>
                Sign in with Google
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Google Calendar Status */}
        <View style={{
          backgroundColor: isAuthenticated 
            ? (isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
            : (isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)'),
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: isAuthenticated 
            ? (isDarkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)')
            : (isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'),
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: isAuthenticated ? colors.success : colors.warning,
            marginBottom: 8,
          }}>
            {isAuthenticated ? '✓ Calendar Connected' : '⚠ Calendar Not Connected'}
          </Text>
          <Text style={{ color: textMuted, lineHeight: 20 }}>
            {isAuthenticated 
              ? 'Action steps will be added directly to your Google Calendar.'
              : 'Sign in with Google to add action steps to your calendar with one tap.'}
          </Text>
        </View>

        {/* API Key Section */}
        <View style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Key size={24} color={colors.primary.DEFAULT} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginLeft: 12 }}>
              OpenRouter API Key
            </Text>
          </View>

          <Text style={{ color: textMuted, marginBottom: 16, lineHeight: 20 }}>
            Enter your OpenRouter API key to enable AI-powered book analysis for any book. 
            Without a key, only pre-loaded popular books will work.
          </Text>

          {/* API Key Input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(241, 245, 249, 0.9)',
            borderRadius: 12,
            paddingHorizontal: 16,
            marginBottom: 16,
          }}>
            <TextInput
              style={{
                flex: 1,
                paddingVertical: 14,
                fontSize: 15,
                color: textColor,
                fontFamily: showKey ? undefined : 'monospace',
              }}
              placeholder="sk-or-v1-..."
              placeholderTextColor={textMuted}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={() => setShowKey(!showKey)}
              style={{ padding: 8 }}
            >
              {showKey ? (
                <EyeOff size={20} color={textMuted} />
              ) : (
                <Eye size={20} color={textMuted} />
              )}
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={saveApiKey}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isSaved ? colors.success : colors.primary.DEFAULT,
                paddingVertical: 14,
                borderRadius: 12,
              }}
            >
              {isSaved ? (
                <>
                  <Check size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>Saved!</Text>
                </>
              ) : (
                <Text style={{ color: '#fff', fontWeight: '600' }}>Save Key</Text>
              )}
            </TouchableOpacity>

            {hasExistingKey && (
              <TouchableOpacity
                onPress={deleteApiKey}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                }}
              >
                <Trash2 size={18} color={colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Get API Key Card */}
        <View style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: 20,
          marginBottom: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: textColor, marginBottom: 12 }}>
            Don't have an API key?
          </Text>
          <Text style={{ color: textMuted, marginBottom: 16, lineHeight: 20 }}>
            Get one from OpenRouter. They offer free credits for new accounts, and you can use various AI models including GPT-4.
          </Text>

          <TouchableOpacity
            onPress={openOpenRouter}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.primary.DEFAULT,
              paddingVertical: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', marginRight: 8 }}>Get API Key</Text>
            <ExternalLink size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={{
          backgroundColor: hasExistingKey 
            ? (isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
            : (isDarkMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)'),
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: hasExistingKey 
            ? (isDarkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.2)')
            : (isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)'),
        }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: '600', 
            color: hasExistingKey ? colors.success : colors.warning,
            marginBottom: 8,
          }}>
            {hasExistingKey ? '✓ API Key Configured' : '⚠ No API Key'}
          </Text>
          <Text style={{ color: textMuted, lineHeight: 20 }}>
            {hasExistingKey 
              ? 'You can search for any book and get AI-generated summaries and action plans.'
              : 'Only pre-loaded books (Atomic Habits, Think and Grow Rich, 7 Habits) will work without an API key.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
