import "../global.css";
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { colors } from '../constants/colors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isDarkMode, loadTheme, isLoading } = useThemeStore();
  
  useEffect(() => {
    loadTheme();
  }, []);

  const backgroundColor = isDarkMode ? colors.dark.background : colors.light.background;
  const textColor = isDarkMode ? colors.dark.text : colors.light.text;

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor }}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor,
            },
            headerTintColor: textColor,
            headerTitleStyle: {
              fontWeight: '600',
            },
            contentStyle: {
              backgroundColor,
            },
            headerShadowVisible: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="book/result" 
            options={{ 
              title: 'Book Details',
              headerBackTitle: 'Back',
            }} 
          />
          <Stack.Screen 
            name="settings" 
            options={{ 
              title: 'Settings',
              headerBackTitle: 'Back',
            }} 
          />
          <Stack.Screen 
            name="action/[id]" 
            options={{ 
              title: 'Action Detail',
              headerBackTitle: 'Back',
            }} 
          />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
