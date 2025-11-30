
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import TopNavigation from '@/components/TopNavigation';
import { colors } from '@/styles/commonStyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

// Wave bar component to fix the hook usage issue
const WaveBar = ({ index, isRecording, waveAmplitude }: { index: number; isRecording: boolean; waveAmplitude: Animated.SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const delay = index * 0.05;
    const height = isRecording
      ? 20 + Math.sin(waveAmplitude.value * Math.PI + delay * 10) * 40
      : 20;
    return {
      height: withTiming(height, { duration: 100 }),
    };
  });

  return (
    <Animated.View
      style={[styles.waveBar, animatedStyle]}
    />
  );
};

export default function HealthCheckUpScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const waveAmplitude = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      waveAmplitude.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    } else {
      waveAmplitude.value = 0;
      setRecordingTime(0);
    }
  }, [isRecording, waveAmplitude]);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181b', '#27272a', '#18181b']}
        style={styles.gradient}
      >
        <TopNavigation />
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Health CheckUp</Text>
          <Text style={styles.subtitle}>Record your engine audio for AI analysis</Text>

          <BlurView intensity={20} style={styles.waveformContainer}>
            <View style={styles.waveformContent}>
              <Text style={styles.waveformTitle}>Audio Waveform</Text>
              
              <View style={styles.waveform}>
                {[...Array(20)].map((_, index) => (
                  <React.Fragment key={index}>
                    <WaveBar 
                      index={index} 
                      isRecording={isRecording} 
                      waveAmplitude={waveAmplitude}
                    />
                  </React.Fragment>
                ))}
              </View>

              {isRecording && (
                <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
              )}
            </View>
          </BlurView>

          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordButtonActive]}
            onPress={toggleRecording}
          >
            <BlurView intensity={30} style={styles.recordButtonBlur}>
              <View style={styles.recordButtonContent}>
                <IconSymbol
                  ios_icon_name={isRecording ? 'stop.circle.fill' : 'mic.circle.fill'}
                  android_material_icon_name={isRecording ? 'stop-circle' : 'mic'}
                  size={48}
                  color={isRecording ? '#EF4444' : colors.primary}
                />
                <Text style={styles.recordButtonText}>
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Text>
              </View>
            </BlurView>
          </TouchableOpacity>

          <BlurView intensity={20} style={styles.instructionsCard}>
            <View style={styles.instructionsContent}>
              <IconSymbol
                ios_icon_name="info.circle"
                android_material_icon_name="info"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.instructionsTitle}>Recording Tips</Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instructionItem}>• Start your engine and let it idle</Text>
                <Text style={styles.instructionItem}>• Hold phone near engine bay</Text>
                <Text style={styles.instructionItem}>• Record for 30-60 seconds</Text>
                <Text style={styles.instructionItem}>• Minimize background noise</Text>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 80 : 0,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  waveformContainer: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  waveformContent: {
    padding: 24,
  },
  waveformTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  waveform: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 100,
    gap: 4,
  },
  waveBar: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 4,
    minHeight: 20,
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 20,
  },
  recordButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recordButtonActive: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  recordButtonBlur: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  recordButtonContent: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  instructionsCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
  },
  instructionsContent: {
    padding: 20,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    marginBottom: 16,
  },
  instructionsList: {
    width: '100%',
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
