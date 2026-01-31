import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BookOpen, Search, Lightbulb, Sun, Moon, RefreshCw, Settings } from 'lucide-react-native';
import { useThemeStore } from '../stores/themeStore';
import { useBookStore } from '../stores/bookStore';
import { colors } from '../constants/colors';
import { fallbackBooks } from '../constants/fallbackBooks';
import { searchBook } from '../services/openRouterService';

const placeholders = [
  "Try 'Atomic Habits' by James Clear",
  "Try 'Think and Grow Rich' by Napoleon Hill",
  "Try 'The 7 Habits of Highly Effective People'",
  "Try 'How to Win Friends and Influence People'",
  "Try 'The 4-Hour Workweek' by Tim Ferriss",
  "Try 'Rich Dad Poor Dad' by Robert Kiyosaki",
  "Try 'The Power of Now' by Eckhart Tolle",
];

// Shuffle and get random books without repetition
let previouslyShown: string[] = [];
const getRandomBooks = (count: number = 5) => {
  const shuffled = [...fallbackBooks].sort(() => Math.random() - 0.5);
  const nonRepeating = shuffled.filter(book => !previouslyShown.includes(book.title));
  const selected = nonRepeating.slice(0, count);
  previouslyShown = selected.map(b => b.title);
  return selected;
};

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { setCurrentBook, setIsLoading, setError, setSearchTitle, isLoading, error } = useBookStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [trendingBooks, setTrendingBooks] = useState(getRandomBooks());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cycle placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim() || isLoading) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setError(null);
    setSearchTitle(searchTerm.trim());

    try {
      const result = await searchBook(searchTerm.trim());
      
      if (result.success && result.book) {
        setCurrentBook(result.book);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/book/result');
      } else {
        setError(result.error || 'Failed to find book');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSelect = (title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchTerm(title);
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTrendingBooks(getRandomBooks());
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  const handleThemeToggle = () => {
    Haptics.selectionAsync();
    toggleTheme();
  };

  const bgColor = isDarkMode ? colors.dark.background : colors.light.background;
  const textColor = isDarkMode ? colors.dark.text : colors.light.text;
  const textMuted = isDarkMode ? colors.dark.textMuted : colors.light.textMuted;
  const cardBg = isDarkMode ? 'rgba(25, 30, 40, 0.75)' : 'rgba(255, 255, 255, 0.85)';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32, position: 'relative' }}>
            {/* Top Right Buttons */}
            <View style={{ position: 'absolute', top: 0, right: 0, flexDirection: 'row', gap: 8 }}>
              {/* Settings Button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/settings');
                }}
                style={{
                  padding: 12,
                  backgroundColor: cardBg,
                  borderRadius: 50,
                }}
              >
                <Settings size={24} color={textMuted} />
              </TouchableOpacity>
              
              {/* Theme Toggle */}
              <TouchableOpacity
                onPress={handleThemeToggle}
                style={{
                  padding: 12,
                  backgroundColor: cardBg,
                  borderRadius: 50,
                }}
              >
                {isDarkMode ? (
                  <Sun size={24} color="#fbbf24" />
                ) : (
                  <Moon size={24} color="#3b82f6" />
                )}
              </TouchableOpacity>
            </View>

            {/* Logo */}
            <View style={{
              backgroundColor: isDarkMode ? 'rgba(49, 130, 206, 0.2)' : 'rgba(49, 130, 206, 0.15)',
              borderRadius: 50,
              padding: 16,
              marginBottom: 16,
            }}>
              <BookOpen size={48} color={colors.primary.DEFAULT} />
            </View>

            {/* Title */}
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: textColor, marginBottom: 8 }}>
              Book<Text style={{ color: colors.primary.DEFAULT }}>2</Text>Action
            </Text>
            <Text style={{ fontSize: 16, color: textMuted, textAlign: 'center' }}>
              Transform Books into Actionable Insights
            </Text>

            {/* Feature Indicators */}
            <View style={{ flexDirection: 'row', marginTop: 20, gap: 24 }}>
              {[
                { icon: Search, label: 'Search Books' },
                { icon: BookOpen, label: 'Get Summary' },
                { icon: Lightbulb, label: 'Actionable Steps' },
              ].map(({ icon: Icon, label }) => (
                <View key={label} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon size={16} color={textMuted} />
                  <Text style={{ marginLeft: 6, color: textMuted, fontSize: 12 }}>{label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Search Bar */}
          <View style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}>
            <View style={{ position: 'relative' }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                borderRadius: 12,
                paddingHorizontal: 16,
              }}>
                <Search size={20} color={textMuted} />
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    paddingHorizontal: 12,
                    fontSize: 16,
                    color: textColor,
                  }}
                  placeholder={placeholders[placeholderIndex]}
                  placeholderTextColor={textMuted}
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  onSubmitEditing={handleSearch}
                  editable={!isLoading}
                  returnKeyType="search"
                />
              </View>
              
              <TouchableOpacity
                onPress={handleSearch}
                disabled={!searchTerm.trim() || isLoading}
                style={{
                  marginTop: 12,
                  backgroundColor: searchTerm.trim() && !isLoading ? colors.primary.DEFAULT : 'rgba(49, 130, 206, 0.5)',
                  paddingVertical: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Analyzing...</Text>
                  </>
                ) : (
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Get Insights</Text>
                )}
              </TouchableOpacity>
            </View>

            {!isLoading && (
              <Text style={{ textAlign: 'center', marginTop: 12, color: textMuted, fontSize: 13 }}>
                Try any book title - AI will analyze it and create actionable steps!
              </Text>
            )}
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={{ alignItems: 'center', marginVertical: 32 }}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={{ 
                marginTop: 16, 
                color: colors.primary.light, 
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
                paddingHorizontal: 20,
              }}>
                Our AI is reading through "{searchTerm}" to create a custom 7-day action plan...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24,
              alignItems: 'center',
            }}>
              <Text style={{ color: colors.error, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                Oops! Something went wrong
              </Text>
              <Text style={{ color: textMuted, textAlign: 'center', marginBottom: 16 }}>{error}</Text>
              <TouchableOpacity
                onPress={() => { setError(null); setSearchTerm(''); }}
                style={{
                  backgroundColor: colors.primary.DEFAULT,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Trending Books */}
          {!isLoading && !error && (
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: textColor }}>
                  Trending Books
                </Text>
                <TouchableOpacity
                  onPress={handleRefresh}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: cardBg,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                  }}
                >
                  <RefreshCw size={16} color={textColor} style={{ marginRight: 6 }} />
                  <Text style={{ color: textColor, fontSize: 14 }}>Refresh</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ color: textMuted, textAlign: 'center', marginBottom: 16, fontSize: 13 }}>
                Click on a book to get its summary and 7-day action plan
              </Text>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 16 }}
              >
                {trendingBooks.map((book, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleBookSelect(book.title)}
                    style={{
                      width: 120,
                      alignItems: 'center',
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 100,
                      height: 150,
                      borderRadius: 8,
                      overflow: 'hidden',
                      marginBottom: 8,
                      backgroundColor: isDarkMode ? '#2d3748' : '#e2e8f0',
                    }}>
                      {book.coverImageUrl ? (
                        <Image
                          source={{ uri: book.coverImageUrl }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{
                          flex: 1,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: colors.primary.DEFAULT,
                        }}>
                          <BookOpen size={32} color="#fff" />
                        </View>
                      )}
                    </View>
                    <Text 
                      style={{ 
                        color: textColor, 
                        fontWeight: '500', 
                        fontSize: 13,
                        textAlign: 'center',
                      }}
                      numberOfLines={2}
                    >
                      {book.title}
                    </Text>
                    <Text 
                      style={{ 
                        color: textMuted, 
                        fontSize: 11,
                        textAlign: 'center',
                        marginTop: 2,
                      }}
                      numberOfLines={1}
                    >
                      {book.author}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
