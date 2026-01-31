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
    
    console.log('Total voices found:', voices.length);
    
    // Filter for proper English speech voices (exclude novelty/character voices)
    const noveltyVoices = [
      'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos',
      'good news', 'jester', 'organ', 'superstar', 'trinoids', 'whisper',
      'zarvox', 'bruce', 'fred', 'junior', 'kathy', 'princess', 'ralph',
      'agnes', 'hysterical', 'flo', 'grandma', 'grandpa', 'eddy', 'reed',
      'rocko', 'sandy', 'shelley', 'wobble', 'deranged', 'pipe organ'
    ];
    
    const englishVoices = voices
      .filter(voice => {
        // Must have English language
        if (!voice.language.includes('en')) return false;
        
        // Exclude novelty/sound effect voices
        const nameLower = (voice.name || '').toLowerCase();
        if (noveltyVoices.some(nv => nameLower.includes(nv))) return false;
        
        // Must have a proper name (not just identifier)
        if (!voice.name || voice.name.length < 3) return false;
        
        return true;
      });
    
    // Deduplicate voices by name (keep Enhanced quality over Standard)
    const voiceMap = new Map<string, typeof voices[0]>();
    for (const voice of englishVoices) {
      const baseName = (voice.name || '').toLowerCase().trim();
      const existing = voiceMap.get(baseName);
      if (!existing) {
        voiceMap.set(baseName, voice);
      } else {
        // Prefer Enhanced/Premium quality
        const existingIsEnhanced = existing.quality === 'Enhanced' || 
                                   existing.name?.includes('Premium');
        const newIsEnhanced = voice.quality === 'Enhanced' || 
                             voice.name?.includes('Premium');
        if (newIsEnhanced && !existingIsEnhanced) {
          voiceMap.set(baseName, voice);
        }
      }
    }
    
    const uniqueVoices = Array.from(voiceMap.values())
      .sort((a, b) => {
        // Note: "Google UK English Female" is a web browser voice, not available on iOS
        // On iOS, best UK voices are: Daniel (male), Kate (female)
        
        // Daniel (UK English - best British voice on iOS)
        const aIsDaniel = a.name?.toLowerCase().includes('daniel');
        const bIsDaniel = b.name?.toLowerCase().includes('daniel');
        if (aIsDaniel && !bIsDaniel) return -1;
        if (!aIsDaniel && bIsDaniel) return 1;
        
        // Kate (UK English female)
        const aIsKate = a.name?.toLowerCase().includes('kate');
        const bIsKate = b.name?.toLowerCase().includes('kate');
        if (aIsKate && !bIsKate) return -1;
        if (!aIsKate && bIsKate) return 1;
        
        // Samantha (default iOS high quality voice)
        const aIsSamantha = a.name?.toLowerCase().includes('samantha');
        const bIsSamantha = b.name?.toLowerCase().includes('samantha');
        if (aIsSamantha && !bIsSamantha) return -1;
        if (!aIsSamantha && bIsSamantha) return 1;
        
        // Prioritize UK/GB voices
        const aIsUK = a.language?.includes('en-GB') || a.language?.includes('en_GB');
        const bIsUK = b.language?.includes('en-GB') || b.language?.includes('en_GB');
        if (aIsUK && !bIsUK) return -1;
        if (!aIsUK && bIsUK) return 1;
        
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
    
    console.log('Filtered English voices:', uniqueVoices.length);
    console.log('Top voices:', uniqueVoices.slice(0, 5).map(v => `${v.name} (${v.language})`));
    
    return uniqueVoices;
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
  // Ensure text is not empty
  if (!text || text.trim().length === 0) {
    console.warn('speakText called with empty text');
    options?.onError?.(new Error('No text to speak'));
    return;
  }

  console.log('Speaking text:', text.substring(0, 50) + '...');
  console.log('Speech options:', { rate: options?.rate, voice: options?.voice });
  
  Speech.speak(text, {
    rate: options?.rate ?? 1.0,
    voice: options?.voice,
    pitch: 1.0,
    onDone: () => {
      console.log('Speech completed');
      options?.onDone?.();
    },
    onError: (error) => {
      console.error('Speech error:', error);
      options?.onError?.(error as Error);
    },
    onStart: () => {
      console.log('Speech started');
    },
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
