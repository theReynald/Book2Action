import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { BookOpen, Calendar, Check } from 'lucide-react-native';
import { useThemeStore } from '../../stores/themeStore';
import { useBookStore } from '../../stores/bookStore';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../constants/colors';
import { 
  generateDetailedCalendarLink, 
  generateDetailedCalendarEventData,
  addToGoogleCalendar 
} from '../../utils/calendarLinks';
import ReadAloudControls from '../../components/ReadAloudControls';

export default function ActionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode } = useThemeStore();
  const { currentBook } = useBookStore();
  const { isAuthenticated, accessToken } = useAuthStore();
  
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [addedToCalendar, setAddedToCalendar] = useState(false);

  const stepIndex = parseInt(id || '0', 10);
  const step = currentBook?.actionableSteps[stepIndex];

  if (!currentBook || !step) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Action step not found</Text>
      </SafeAreaView>
    );
  }

  const bgColor = isDarkMode ? colors.dark.background : colors.light.background;
  const textColor = isDarkMode ? colors.dark.text : colors.light.text;
  const textMuted = isDarkMode ? colors.dark.textMuted : colors.light.textMuted;
  const cardBg = isDarkMode ? 'rgba(25, 30, 40, 0.75)' : 'rgba(255, 255, 255, 0.85)';

  // Default details if not provided
  const details = step.details || {
    sentences: [
      `This step helps you implement "${step.step}" in your daily life.`,
      `Based on the principles from ${step.chapter}, this action creates lasting change.`,
      `Many readers have found that this specific technique leads to measurable results.`,
      `The author emphasizes this point as essential to mastering the book's core concepts.`,
      `Try implementing this consistently for at least 21 days to form a habit.`
    ],
    keyTakeaway: `The most important aspect of "${step.step}" is consistency and intentional practice.`
  };

  // Build the full text for Read Aloud
  const fullReadText = `${step.step}. Key Takeaway: ${details.keyTakeaway}. Detailed Implementation: ${details.sentences.join('. ')}`;

  const handleAddToCalendar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (isAuthenticated && accessToken) {
      // Use Google Calendar API
      setIsAddingToCalendar(true);
      
      const eventData = generateDetailedCalendarEventData(
        step.step,
        currentBook.title,
        step.chapter,
        details.keyTakeaway,
        details.sentences
      );
      
      const result = await addToGoogleCalendar(accessToken, eventData);
      
      setIsAddingToCalendar(false);
      
      if (result.success) {
        setAddedToCalendar(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Added to Calendar',
          'The action step has been added to your Google Calendar.',
          [{ text: 'OK' }]
        );
        setTimeout(() => setAddedToCalendar(false), 3000);
      } else {
        Alert.alert(
          'Failed to Add',
          result.error || 'Could not add event to calendar. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Fallback to web URL
      const url = generateDetailedCalendarLink(
        step.step,
        currentBook.title,
        step.chapter,
        details.keyTakeaway,
        details.sentences
      );
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Main Card */}
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
          {/* Action Title */}
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: textColor, marginBottom: 16 }}>
            {step.step}
          </Text>

          {/* Info Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <BookOpen size={16} color={colors.primary.light} />
              <Text style={{ marginLeft: 6, color: colors.primary.light, fontSize: 14 }}>
                {step.chapter}
              </Text>
            </View>
            
            {step.day && (
              <View style={{
                backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                paddingVertical: 4,
                paddingHorizontal: 12,
                borderRadius: 20,
              }}>
                <Text style={{ color: colors.primary.light, fontSize: 14, fontWeight: '500' }}>
                  {step.day}
                </Text>
              </View>
            )}
          </View>

          {/* Read Aloud Controls */}
          <View style={{ marginBottom: 20 }}>
            <ReadAloudControls text={fullReadText} />
          </View>

          {/* Key Takeaway */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 8 }}>
              Key Takeaway:
            </Text>
            <Text style={{ color: textColor, fontSize: 15, lineHeight: 24, fontStyle: 'italic' }}>
              {details.keyTakeaway}
            </Text>
          </View>

          {/* Detailed Implementation */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: textColor, marginBottom: 12 }}>
              Detailed Implementation:
            </Text>
            {details.sentences.map((sentence, index) => (
              <View key={index} style={{ flexDirection: 'row', marginBottom: 10 }}>
                <Text style={{ color: textColor, marginRight: 8, fontSize: 15 }}>•</Text>
                <Text style={{ color: textColor, fontSize: 15, lineHeight: 22, flex: 1 }}>
                  {sentence}
                </Text>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={{
            borderTopWidth: 1,
            borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            paddingTop: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <Text style={{ color: textMuted, fontSize: 14 }}>
              From <Text style={{ fontWeight: '500' }}>{currentBook.title}</Text>
            </Text>

            <TouchableOpacity
              onPress={handleAddToCalendar}
              disabled={isAddingToCalendar}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: addedToCalendar ? colors.success : colors.primary.DEFAULT,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                opacity: isAddingToCalendar ? 0.7 : 1,
              }}
            >
              {isAddingToCalendar ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>
                    Adding...
                  </Text>
                </>
              ) : addedToCalendar ? (
                <>
                  <Check size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>
                    Added!
                  </Text>
                </>
              ) : (
                <>
                  <Calendar size={16} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '600', marginLeft: 8 }}>
                    Add to Calendar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
