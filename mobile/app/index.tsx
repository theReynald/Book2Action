import React, { useState, useEffect, useCallback, useRef } from "react";
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
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  BookOpen,
  Search,
  Lightbulb,
  Sun,
  Moon,
  RefreshCw,
  Settings,
} from "lucide-react-native";
import { useThemeStore } from "../stores/themeStore";
import { useBookStore } from "../stores/bookStore";
import { colors } from "../constants/colors";
import { fallbackBooks } from "../constants/fallbackBooks";
import { searchBook } from "../services/openRouterService";
import {
  searchOpenLibrary,
  OpenLibraryBook,
} from "../services/openLibraryService";

const placeholders = [
  "Search by title or author...",
  "Try 'Atomic Habits' by James Clear",
  "Try 'Think and Grow Rich' by Napoleon Hill",
  "Try 'The 7 Habits of Highly Effective People'",
  "Try author: Malcolm Gladwell",
  "Try 'The 4-Hour Workweek' by Tim Ferriss",
  "Try 'Rich Dad Poor Dad' by Robert Kiyosaki",
  "Try author: Brené Brown",
];

// Shuffle and get random books without repetition
let previouslyShown: string[] = [];
const getRandomBooks = (count: number = 5) => {
  const shuffled = [...fallbackBooks].sort(() => Math.random() - 0.5);
  const nonRepeating = shuffled.filter(
    (book) => !previouslyShown.includes(book.title),
  );
  const selected = nonRepeating.slice(0, count);
  previouslyShown = selected.map((b) => b.title);
  return selected;
};

export default function HomeScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const {
    setCurrentBook,
    setIsLoading,
    setError,
    setSearchTitle,
    isLoading,
    error,
  } = useBookStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [trendingBooks, setTrendingBooks] = useState(getRandomBooks());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [suggestions, setSuggestions] = useState<OpenLibraryBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCoverUrl, setSelectedCoverUrl] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cycle placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim() || isLoading) return;

    setShowSuggestions(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setError(null);
    setSearchTitle(searchTerm.trim());

    try {
      const result = await searchBook(searchTerm.trim());

      if (result.success && result.book) {
        // Use the cover from typeahead if available
        if (selectedCoverUrl) {
          result.book.coverImageUrl = selectedCoverUrl;
        }
        setCurrentBook(result.book);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/book/result");
      } else {
        setError(result.error || "Failed to find book");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookSelect = (title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchTerm(title);
    setSelectedCoverUrl(null);
  };

  const handleTextChange = (text: string) => {
    setSearchTerm(text);
    setSelectedCoverUrl(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!text.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowSuggestions(true);

    debounceRef.current = setTimeout(async () => {
      const results = await searchOpenLibrary(text);
      setSuggestions(results);
      setIsSearching(false);
    }, 500);
  };

  const handleSuggestionSelect = (book: OpenLibraryBook) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchTerm(book.title);
    setSelectedCoverUrl(book.coverImageUrl);
    setSuggestions([]);
    setShowSuggestions(false);
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
  const cardBg = isDarkMode
    ? "rgba(25, 30, 40, 0.75)"
    : "rgba(255, 255, 255, 0.85)";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
            />
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 32,
              position: "relative",
            }}
          >
            {/* Top Right Buttons */}
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                flexDirection: "row",
                gap: 8,
              }}
            >
              {/* Settings Button */}
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push("/settings");
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
            <View
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(49, 130, 206, 0.2)"
                  : "rgba(49, 130, 206, 0.15)",
                borderRadius: 50,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <BookOpen size={48} color={colors.primary.DEFAULT} />
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: textColor,
                marginBottom: 8,
              }}
            >
              Book<Text style={{ color: colors.primary.DEFAULT }}>2</Text>Action
            </Text>
            <Text
              style={{ fontSize: 16, color: textMuted, textAlign: "center" }}
            >
              Transform Books into Actionable Insights
            </Text>

            {/* Feature Indicators */}
            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                gap: 16,
                paddingHorizontal: 16,
                justifyContent: "center",
              }}
            >
              {[
                { icon: Search, label: "Search Books" },
                { icon: BookOpen, label: "Get Summary" },
                { icon: Lightbulb, label: "Actionable Steps" },
              ].map(({ icon: Icon, label }) => (
                <View
                  key={label}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Icon size={14} color={textMuted} />
                  <Text
                    style={{ marginLeft: 4, color: textMuted, fontSize: 11 }}
                  >
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Search Bar */}
          <View
            style={{
              backgroundColor: cardBg,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View style={{ position: "relative" }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: isDarkMode
                    ? "rgba(30, 41, 59, 0.9)"
                    : "rgba(255, 255, 255, 0.9)",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                }}
              >
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
                  onChangeText={handleTextChange}
                  onSubmitEditing={handleSearch}
                  editable={!isLoading}
                  returnKeyType="search"
                />
              </View>

              {/* Typeahead Suggestions */}
              {showSuggestions && (
                <View
                  style={{
                    backgroundColor: isDarkMode ? "#1a2332" : "#ffffff",
                    borderRadius: 12,
                    marginTop: 8,
                    borderWidth: 1,
                    borderColor: isDarkMode
                      ? "rgba(55, 65, 81, 0.8)"
                      : "rgba(229, 231, 235, 1)",
                    overflow: "hidden",
                    maxHeight: 280,
                  }}
                >
                  {isSearching && suggestions.length === 0 && (
                    <View
                      style={{
                        padding: 16,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <ActivityIndicator size="small" color={textMuted} />
                      <Text
                        style={{
                          color: textMuted,
                          marginLeft: 8,
                          fontSize: 14,
                        }}
                      >
                        Searching...
                      </Text>
                    </View>
                  )}
                  {!isSearching &&
                    suggestions.length === 0 &&
                    searchTerm.trim() && (
                      <View style={{ padding: 16 }}>
                        <Text style={{ color: textMuted, fontSize: 14 }}>
                          No books found. Tap Get Insights to search with AI.
                        </Text>
                      </View>
                    )}
                  {suggestions.map((book) => (
                    <TouchableOpacity
                      key={book.id}
                      onPress={() => handleSuggestionSelect(book)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: isDarkMode
                          ? "rgba(55, 65, 81, 0.4)"
                          : "rgba(229, 231, 235, 0.6)",
                      }}
                      activeOpacity={0.7}
                    >
                      {book.coverImageUrl ? (
                        <Image
                          source={{ uri: book.coverImageUrl }}
                          style={{ width: 36, height: 50, borderRadius: 4 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: 36,
                            height: 50,
                            borderRadius: 4,
                            backgroundColor: colors.primary.DEFAULT,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <BookOpen size={16} color="#fff" />
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text
                          style={{
                            color: textColor,
                            fontWeight: "500",
                            fontSize: 14,
                          }}
                          numberOfLines={1}
                        >
                          {book.title}
                        </Text>
                        <Text
                          style={{
                            color: textMuted,
                            fontSize: 12,
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {book.author}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={handleSearch}
                disabled={!searchTerm.trim() || isLoading}
                style={{
                  marginTop: 12,
                  backgroundColor:
                    searchTerm.trim() && !isLoading
                      ? colors.primary.DEFAULT
                      : "rgba(49, 130, 206, 0.5)",
                  paddingVertical: 14,
                  borderRadius: 12,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
                    >
                      Analyzing...
                    </Text>
                  </>
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}
                  >
                    Get Insights
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {!isLoading && (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  color: textMuted,
                  fontSize: 13,
                }}
              >
                Try any book title - AI will analyze it and create actionable
                steps!
              </Text>
            )}
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={{ alignItems: "center", marginVertical: 32 }}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text
                style={{
                  marginTop: 16,
                  color: colors.primary.light,
                  fontSize: 16,
                  fontWeight: "600",
                  textAlign: "center",
                  paddingHorizontal: 20,
                }}
              >
                Our AI is reading through "{searchTerm}" to create a custom
                7-day action plan...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: 16,
                padding: 24,
                marginBottom: 24,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors.error,
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Oops! Something went wrong
              </Text>
              <Text
                style={{
                  color: textMuted,
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setError(null);
                  setSearchTerm("");
                }}
                style={{
                  backgroundColor: colors.primary.DEFAULT,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Trending Books */}
          {!isLoading && !error && (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{ fontSize: 22, fontWeight: "bold", color: textColor }}
                >
                  Trending Books
                </Text>
                <TouchableOpacity
                  onPress={handleRefresh}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: cardBg,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                  }}
                >
                  <RefreshCw
                    size={16}
                    color={textColor}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={{ color: textColor, fontSize: 14 }}>
                    Refresh
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  color: textMuted,
                  textAlign: "center",
                  marginBottom: 16,
                  fontSize: 13,
                }}
              >
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
                      alignItems: "center",
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={{
                        width: 100,
                        height: 150,
                        borderRadius: 8,
                        overflow: "hidden",
                        marginBottom: 8,
                        backgroundColor: isDarkMode ? "#2d3748" : "#e2e8f0",
                      }}
                    >
                      {book.coverImageUrl ? (
                        <Image
                          source={{ uri: book.coverImageUrl }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: colors.primary.DEFAULT,
                          }}
                        >
                          <BookOpen size={32} color="#fff" />
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        color: textColor,
                        fontWeight: "500",
                        fontSize: 13,
                        textAlign: "center",
                      }}
                      numberOfLines={2}
                    >
                      {book.title}
                    </Text>
                    <Text
                      style={{
                        color: textMuted,
                        fontSize: 11,
                        textAlign: "center",
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
      <Text
        style={{
          textAlign: "center",
          color: "#fff",
          fontSize: 14,
          paddingBottom: 4,
        }}
      >
        Build:{" "}
        {new Date().toLocaleString("en-US", {
          timeZone: "America/Los_Angeles",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}{" "}
        PT
      </Text>
    </SafeAreaView>
  );
}
