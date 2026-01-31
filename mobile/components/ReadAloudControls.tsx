import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { Play, Pause, Square, Settings, Volume2 } from 'lucide-react-native';
import { colors } from '../constants/colors';
import { useThemeStore } from '../stores/themeStore';
import {
  speakText,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  isSpeaking,
  getAvailableVoices,
  VoiceOption,
} from '../utils/speech';

interface ReadAloudControlsProps {
  text: string;
  compact?: boolean;
}

type SpeechState = 'idle' | 'playing' | 'paused';

export default function ReadAloudControls({ text, compact = false }: ReadAloudControlsProps) {
  const { isDarkMode } = useThemeStore();
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>();
  const [loadingVoices, setLoadingVoices] = useState(false);

  const textColor = isDarkMode ? colors.dark.text : colors.light.text;
  const textMuted = isDarkMode ? colors.dark.textMuted : colors.light.textMuted;
  const cardBg = isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(241, 245, 249, 0.95)';

  useEffect(() => {
    // Check speech state periodically
    const interval = setInterval(async () => {
      if (speechState === 'playing') {
        const speaking = await isSpeaking();
        if (!speaking) {
          setSpeechState('idle');
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
      stopSpeaking();
    };
  }, [speechState]);

  const loadVoices = async () => {
    setLoadingVoices(true);
    const availableVoices = await getAvailableVoices();
    setVoices(availableVoices);
    if (availableVoices.length > 0 && !selectedVoice) {
      setSelectedVoice(availableVoices[0].identifier);
    }
    setLoadingVoices(false);
  };

  const handlePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    console.log('handlePlay called, text length:', text?.length);
    console.log('speechState:', speechState);
    
    if (!text || text.trim().length === 0) {
      console.warn('No text provided to ReadAloudControls');
      return;
    }
    
    if (speechState === 'paused' && Platform.OS === 'ios') {
      resumeSpeaking();
      setSpeechState('playing');
    } else {
      speakText(text, {
        rate: speechRate,
        voice: selectedVoice,
        onDone: () => setSpeechState('idle'),
        onError: (error) => {
          console.error('Speech error in handlePlay:', error);
          setSpeechState('idle');
        },
      });
      setSpeechState('playing');
    }
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pauseSpeaking();
    setSpeechState(Platform.OS === 'ios' ? 'paused' : 'idle');
  };

  const handleStop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopSpeaking();
    setSpeechState('idle');
  };

  const handleOpenSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadVoices();
    setShowSettings(true);
  };

  const handleTestVoice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    stopSpeaking();
    speakText('Hello! This is how I will read the text for you.', {
      rate: speechRate,
      voice: selectedVoice,
    });
  };

  if (compact) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {speechState === 'idle' ? (
          <TouchableOpacity
            onPress={handlePlay}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.primary.DEFAULT,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 6,
            }}
          >
            <Volume2 size={14} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 12, marginLeft: 4 }}>
              Read
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              onPress={speechState === 'playing' ? handlePause : handlePlay}
              style={{
                backgroundColor: '#8b5cf6',
                padding: 6,
                borderRadius: 6,
              }}
            >
              {speechState === 'playing' ? (
                <Pause size={14} color="#fff" />
              ) : (
                <Play size={14} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleStop}
              style={{
                backgroundColor: colors.error,
                padding: 6,
                borderRadius: 6,
              }}
            >
              <Square size={14} color="#fff" />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          onPress={handleOpenSettings}
          style={{
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            padding: 6,
            borderRadius: 6,
          }}
        >
          <Settings size={14} color={textMuted} />
        </TouchableOpacity>

        {/* Settings Modal */}
        <Modal
          visible={showSettings}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSettings(false)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 20,
            }}
            activeOpacity={1}
            onPress={() => setShowSettings(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={{
                backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                borderRadius: 16,
                padding: 20,
                width: '100%',
                maxWidth: 320,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 20 }}>
                Voice Settings
              </Text>

              {/* Speech Rate */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: textColor, fontWeight: '600', marginBottom: 8 }}>
                  Speed: {speechRate.toFixed(1)}x
                </Text>
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0.5}
                  maximumValue={2.0}
                  step={0.1}
                  value={speechRate}
                  onValueChange={setSpeechRate}
                  minimumTrackTintColor={colors.primary.DEFAULT}
                  maximumTrackTintColor={isDarkMode ? '#4a5568' : '#cbd5e0'}
                  thumbTintColor={colors.primary.DEFAULT}
                />
              </View>

              {/* Voice Selection */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: textColor, fontWeight: '600', marginBottom: 8 }}>
                  Voice
                </Text>
                {loadingVoices ? (
                  <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
                ) : (
                  <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                    {voices.map((voice) => (
                      <TouchableOpacity
                        key={voice.identifier}
                        onPress={() => setSelectedVoice(voice.identifier)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          backgroundColor: selectedVoice === voice.identifier
                            ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                            : 'transparent',
                          borderRadius: 8,
                          marginBottom: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 8,
                            borderWidth: 2,
                            borderColor: colors.primary.DEFAULT,
                            backgroundColor: selectedVoice === voice.identifier
                              ? colors.primary.DEFAULT
                              : 'transparent',
                            marginRight: 10,
                          }}
                        />
                        <Text style={{ color: textColor, fontSize: 14, flex: 1 }} numberOfLines={1}>
                          {voice.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Test Button */}
              <TouchableOpacity
                onPress={handleTestVoice}
                style={{
                  backgroundColor: colors.primary.DEFAULT,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Test Voice</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setShowSettings(false)}
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: textMuted, fontWeight: '600' }}>Close</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  // Full-size controls
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {speechState === 'idle' ? (
        <TouchableOpacity
          onPress={handlePlay}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary.DEFAULT,
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 8,
          }}
        >
          <Volume2 size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 }}>
            Read Aloud
          </Text>
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity
            onPress={speechState === 'playing' ? handlePause : handlePlay}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#8b5cf6',
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
            }}
          >
            {speechState === 'playing' ? (
              <>
                <Pause size={16} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 }}>
                  Pause
                </Text>
              </>
            ) : (
              <>
                <Play size={16} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 }}>
                  Resume
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleStop}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.error,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
            }}
          >
            <Square size={16} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14, marginLeft: 6 }}>
              Stop
            </Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        onPress={handleOpenSettings}
        style={{
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          padding: 8,
          borderRadius: 8,
        }}
      >
        <Settings size={16} color={textMuted} />
      </TouchableOpacity>

      {/* Settings Modal - same as compact */}
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
          activeOpacity={1}
          onPress={() => setShowSettings(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: isDarkMode ? '#1e293b' : '#fff',
              borderRadius: 16,
              padding: 20,
              width: '100%',
              maxWidth: 320,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 20 }}>
              Voice Settings
            </Text>

            {/* Speech Rate */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: textColor, fontWeight: '600', marginBottom: 8 }}>
                Speed: {speechRate.toFixed(1)}x
              </Text>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0.5}
                maximumValue={2.0}
                step={0.1}
                value={speechRate}
                onValueChange={setSpeechRate}
                minimumTrackTintColor={colors.primary.DEFAULT}
                maximumTrackTintColor={isDarkMode ? '#4a5568' : '#cbd5e0'}
                thumbTintColor={colors.primary.DEFAULT}
              />
            </View>

            {/* Voice Selection */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: textColor, fontWeight: '600', marginBottom: 8 }}>
                Voice
              </Text>
              {loadingVoices ? (
                <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              ) : (
                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                  {voices.map((voice) => (
                    <TouchableOpacity
                      key={voice.identifier}
                      onPress={() => setSelectedVoice(voice.identifier)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        backgroundColor: selectedVoice === voice.identifier
                          ? (isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)')
                          : 'transparent',
                        borderRadius: 8,
                        marginBottom: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: colors.primary.DEFAULT,
                          backgroundColor: selectedVoice === voice.identifier
                            ? colors.primary.DEFAULT
                            : 'transparent',
                          marginRight: 10,
                        }}
                      />
                      <Text style={{ color: textColor, fontSize: 14, flex: 1 }} numberOfLines={1}>
                        {voice.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Test Button */}
            <TouchableOpacity
              onPress={handleTestVoice}
              style={{
                backgroundColor: colors.primary.DEFAULT,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Test Voice</Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowSettings(false)}
              style={{
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: textMuted, fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
