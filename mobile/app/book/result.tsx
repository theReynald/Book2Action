import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  BookOpen,
  User,
  Calendar,
  Tag,
  CheckCircle,
  Bookmark,
  CalendarPlus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
  FileDown,
} from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { useBookStore } from '../../stores/bookStore';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../constants/colors';
import { generateAmazonLink } from '../../utils/amazonLinks';
import { 
  generateCalendarLink, 
  generateCalendarEventData,
  addToGoogleCalendar 
} from '../../utils/calendarLinks';
import { exportToPdf } from '../../utils/pdfExport';

export default function BookResultScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { currentBook } = useBookStore();
  const { isAuthenticated, accessToken } = useAuthStore();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [addingStepIndex, setAddingStepIndex] = useState<number | null>(null);
  const [addedSteps, setAddedSteps] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  if (!currentBook) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No book data available</Text>
      </SafeAreaView>
    );
  }

  const book = currentBook;
  const bgColor = isDarkMode ? colors.dark.background : colors.light.background;
  const textColor = isDarkMode ? colors.dark.text : colors.light.text;
  const textMuted = isDarkMode ? colors.dark.textMuted : colors.light.textMuted;
  const cardBg = isDarkMode ? 'rgba(25, 30, 40, 0.75)' : 'rgba(255, 255, 255, 0.85)';

  const handleOpenAmazon = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = generateAmazonLink(book.title, book.author, book.isbn);
    Linking.openURL(url);
  };

  const handleAddToCalendar = async (step: string, day: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isAuthenticated && accessToken) {
      // Use Google Calendar API
      setAddingStepIndex(index);
      
      const eventData = generateCalendarEventData(step, book.title, day);
      const result = await addToGoogleCalendar(accessToken, eventData);
      
      setAddingStepIndex(null);
      
      if (result.success) {
        setAddedSteps(prev => new Set([...prev, index]));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Remove checkmark after 3 seconds
        setTimeout(() => {
          setAddedSteps(prev => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
        }, 3000);
      } else {
        Alert.alert(
          'Failed to Add',
          result.error || 'Could not add event to calendar.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Fallback to web URL
      const url = generateCalendarLink(step, book.title, day);
      Linking.openURL(url);
    }
  };

  const handleActionPress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/action/[id]',
      params: { id: index.toString() }
    });
  };

  const handleExportPdf = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExporting(true);
    
    const result = await exportToPdf(book);
    
    setIsExporting(false);
    
    if (!result.success) {
      Alert.alert('Export Failed', result.error || 'Could not export PDF');
    }
  };

  const summaryParagraphs = book.summary.split('\n\n');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Book Header Card */}
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
          <View style={{ flexDirection: 'row' }}>
            {/* Book Cover */}
            <View style={{
              width: 80,
              height: 120,
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: isDarkMode ? '#2d3748' : '#e2e8f0',
              marginRight: 16,
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

            {/* Book Info */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={handleOpenAmazon} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, flex: 1 }}>
                  {book.title}
                </Text>
                <ExternalLink size={16} color={textMuted} style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <User size={14} color={textMuted} />
                <Text style={{ marginLeft: 6, color: textMuted, fontSize: 14 }}>{book.author}</Text>
              </View>

              {book.publishedYear && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Calendar size={14} color={textMuted} />
                  <Text style={{ marginLeft: 6, color: textMuted, fontSize: 14 }}>{book.publishedYear}</Text>
                </View>
              )}

              {book.genre && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Tag size={14} color={textMuted} />
                  <Text style={{ marginLeft: 6, color: textMuted, fontSize: 14 }}>{book.genre}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  onPress={handleOpenAmazon}
                  style={{
                    backgroundColor: colors.amazon,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: '#000', fontWeight: '600', fontSize: 13 }}>Buy on Amazon</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleExportPdf}
                  disabled={isExporting}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primary.DEFAULT,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    opacity: isExporting ? 0.7 : 1,
                  }}
                >
                  {isExporting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <FileDown size={14} color="#fff" />
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13, marginLeft: 6 }}>Export PDF</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Section */}
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
            <BookOpen size={24} color={colors.primary.DEFAULT} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginLeft: 12 }}>
              Summary
            </Text>
          </View>

          <Text style={{ color: textColor, fontSize: 15, lineHeight: 24, marginBottom: 12 }}>
            {summaryParagraphs[0]}
          </Text>

          {isExpanded && summaryParagraphs.slice(1).map((paragraph, index) => (
            <Text key={index} style={{ color: textColor, fontSize: 15, lineHeight: 24, marginBottom: 12 }}>
              {paragraph}
            </Text>
          ))}

          {summaryParagraphs.length > 1 && (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsExpanded(!isExpanded);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.primary.DEFAULT,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                alignSelf: 'flex-start',
              }}
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>Show Less</Text>
                </>
              ) : (
                <>
                  <ChevronDown size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 6 }}>See More</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* 7-Day Action Plan Section */}
        <View style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <CheckCircle size={24} color={colors.primary.DEFAULT} />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor, marginLeft: 12 }}>
                7-Day Action Plan
              </Text>
            </View>
          </View>

          {book.actionableSteps.map((step, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleActionPress(index)}
              style={{
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row' }}>
                {/* Number Circle */}
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.primary.DEFAULT,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{index + 1}</Text>
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    {step.day && (
                      <Text style={{ color: colors.primary.light, fontWeight: 'bold', marginRight: 8, fontSize: 14 }}>
                        {step.day}:
                      </Text>
                    )}
                    <ExternalLink size={14} color={colors.primary.light} />
                  </View>
                  
                  <Text style={{ color: textColor, fontSize: 15, lineHeight: 22, marginBottom: 8 }}>
                    {step.step}
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Bookmark size={14} color={textMuted} />
                      <Text style={{ marginLeft: 6, color: textMuted, fontSize: 12, fontStyle: 'italic', flex: 1 }} numberOfLines={1}>
                        {step.chapter}
                      </Text>
                    </View>

                    {step.day && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleAddToCalendar(step.step, step.day!, index);
                        }}
                        disabled={addingStepIndex === index}
                        style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, opacity: addingStepIndex === index ? 0.7 : 1 }}
                      >
                        {addingStepIndex === index ? (
                          <ActivityIndicator size="small" color={colors.primary.light} />
                        ) : addedSteps.has(index) ? (
                          <>
                            <Check size={14} color={colors.success} />
                            <Text style={{ marginLeft: 4, color: colors.success, fontSize: 12 }}>
                              Added!
                            </Text>
                          </>
                        ) : (
                          <>
                            <CalendarPlus size={14} color={colors.primary.light} />
                            <Text style={{ marginLeft: 4, color: colors.primary.light, fontSize: 12 }}>
                              Add to Calendar
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
