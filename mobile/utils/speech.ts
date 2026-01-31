import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

export interface VoiceOption {
  identifier: string;
  name: string;
  language: string;
  quality?: string;
}

/**
 * Get available voices filtered for English
 */
export const getAvailableVoices = async (): Promise<VoiceOption[]> => {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    
    // Filter for English voices and sort by quality
    const englishVoices = voices
      .filter(voice => voice.language.includes('en'))
      .sort((a, b) => {
        // Prioritize Google UK Female
        const aIsGoogleUK = a.name?.toLowerCase().includes('google') && 
                           a.name?.toLowerCase().includes('uk');
        const bIsGoogleUK = b.name?.toLowerCase().includes('google') && 
                           b.name?.toLowerCase().includes('uk');
        if (aIsGoogleUK && !bIsGoogleUK) return -1;
        if (!aIsGoogleUK && bIsGoogleUK) return 1;
        
        // Then prioritize Google voices
        const aIsGoogle = a.name?.toLowerCase().includes('google');
        const bIsGoogle = b.name?.toLowerCase().includes('google');
        if (aIsGoogle && !bIsGoogle) return -1;
        if (!aIsGoogle && bIsGoogle) return 1;
        
        // Then premium/enhanced voices
        const aPremium = a.quality === 'Enhanced' || 
                        a.name?.includes('Premium') ||
                        a.name?.includes('Neural');
        const bPremium = b.quality === 'Enhanced' || 
                        b.name?.includes('Premium') ||
                        b.name?.includes('Neural');
        if (aPremium && !bPremium) return -1;
        if (!aPremium && bPremium) return 1;
        
        return (a.name || '').localeCompare(b.name || '');
      })
      .map(voice => ({
        identifier: voice.identifier,
        name: voice.name || voice.identifier,
        language: voice.language,
        quality: voice.quality,
      }));
    
    return englishVoices;
  } catch (error) {
    console.error('Error getting voices:', error);
    return [];
  }
};

/**
 * Speak text with options
 */
export const speakText = (
  text: string,
  options?: {
    rate?: number;
    voice?: string;
    onDone?: () => void;
    onError?: (error: Error) => void;
  }
): void => {
  Speech.speak(text, {
    rate: options?.rate ?? 1.0,
    voice: options?.voice,
    pitch: 1.0,
    onDone: options?.onDone,
    onError: options?.onError,
  });
};

/**
 * Stop speaking
 */
export const stopSpeaking = (): void => {
  Speech.stop();
};

/**
 * Pause speaking (iOS only, stops on Android)
 */
export const pauseSpeaking = async (): Promise<void> => {
  if (Platform.OS === 'ios') {
    await Speech.pause();
  } else {
    // Android doesn't support pause, so we just stop
    Speech.stop();
  }
};

/**
 * Resume speaking (iOS only)
 */
export const resumeSpeaking = async (): Promise<void> => {
  if (Platform.OS === 'ios') {
    await Speech.resume();
  }
  // On Android, you'd need to restart from where you left off
};

/**
 * Check if currently speaking
 */
export const isSpeaking = async (): Promise<boolean> => {
  return await Speech.isSpeakingAsync();
};
