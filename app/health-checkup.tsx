
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import VroomieLogo from '@/components/VroomieLogo';
import { colors } from '@/styles/commonStyles';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import { mockAnalyses } from '@/data/mockData';
import { AudioAnalysis, Anomaly } from '@/types/entities';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WAVEFORM_HEIGHT = Platform.OS === 'web' ? 300 : 200;

export default function HealthCheckUpScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [logoRotationDisabled, setLogoRotationDisabled] = useState(false);
  
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const recordingStartTime = useRef<number>(0);

  useEffect(() => {
    requestPermissions();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem('logoRotationDisabled');
    if (saved) {
      setLogoRotationDisabled(JSON.parse(saved));
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - recordingStartTime.current) / 1000));
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, isPaused]);

  const requestPermissions = async () => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (granted) {
        setHasPermission(true);
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } else {
        Alert.alert('Permission Denied', 'Microphone access is required for audio recording.');
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request microphone permissions.');
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      await requestPermissions();
      return;
    }

    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      recordingStartTime.current = Date.now();
      setIsRecording(true);
      setIsPaused(false);
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const pauseRecording = async () => {
    try {
      await audioRecorder.pause();
      setIsPaused(true);
      console.log('Recording paused');
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      audioRecorder.record();
      setIsPaused(false);
      console.log('Recording resumed');
    } catch (error) {
      console.error('Error resuming recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);
      setIsPaused(false);
      console.log('Recording stopped');
      await saveAnalysis();
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const saveAnalysis = async () => {
    if (!audioRecorder.uri) {
      Alert.alert('Error', 'No recording available to save.');
      return;
    }

    setIsSaving(true);

    try {
      const durationSeconds = recordingTime;
      
      // Simulate anomaly detection
      const anomalyCount = Math.floor(Math.random() * 4) + 1;
      const anomalies: Anomaly[] = [];
      let hasHighOrCritical = false;

      for (let i = 0; i < anomalyCount; i++) {
        const timestamp_ms = Math.floor(Math.random() * durationSeconds * 1000);
        const rand = Math.random();
        let severity: 'low' | 'medium' | 'high' | 'critical';
        
        if (rand < 0.25) severity = 'low';
        else if (rand < 0.75) severity = 'medium';
        else if (rand < 0.95) severity = 'high';
        else severity = 'critical';

        if (severity === 'high' || severity === 'critical') {
          hasHighOrCritical = true;
        }

        const freqStart = Math.floor(1000 + Math.random() * 7000);
        const freqEnd = freqStart + Math.floor(500 + Math.random() * 1500);

        anomalies.push({
          timestamp_ms,
          severity,
          frequency_range: `${freqStart}-${freqEnd} Hz`,
        });
      }

      anomalies.sort((a, b) => a.timestamp_ms - b.timestamp_ms);

      const anomalyScore = hasHighOrCritical 
        ? Math.floor(60 + Math.random() * 40) 
        : Math.floor(Math.random() * 40);

      const newAnalysis: AudioAnalysis = {
        id: `analysis-${Date.now()}`,
        vehicle_id: 'default',
        audio_file_url: audioRecorder.uri,
        duration_seconds: durationSeconds,
        anomaly_detected: hasHighOrCritical,
        anomaly_score: anomalyScore,
        anomalies,
        created_at: new Date().toISOString(),
      };

      mockAnalyses.unshift(newAnalysis);
      
      setTimeout(() => {
        setIsSaving(false);
        setRecordingTime(0);
        Alert.alert(
          'Health CheckUp Completed',
          hasHighOrCritical 
            ? `Issues detected! Anomaly score: ${anomalyScore}/100`
            : `Engine sounds healthy! Score: ${anomalyScore}/100`,
          [
            { text: 'View Reports', onPress: () => router.push('/reports') },
            { text: 'Done', style: 'cancel' },
          ]
        );
      }, 1500);

    } catch (error) {
      console.error('Error saving analysis:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Failed to save analysis.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    if (isRecording) {
      Alert.alert(
        'Recording in Progress',
        'Stop recording before going back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Stop & Go Back', onPress: async () => {
            await stopRecording();
            router.back();
          }},
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181B', '#27272a', '#18181B']}
        style={styles.gradient}
      >
        {/* Minimal Top Bar */}
        <View style={styles.topBar}>
          <VroomieLogo size={48} disableRotation={logoRotationDisabled} />
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <IconSymbol
              ios_icon_name="chevron.left"
              android_material_icon_name="arrow-back"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Health CheckUp</Text>
          <Text style={styles.subtitle}>Record your engine audio for AI analysis</Text>

          {/* Waveform Container */}
          <BlurView intensity={20} style={styles.waveformContainer}>
            <View style={styles.waveformContent}>
              <Text style={styles.waveformTitle}>Live Audio Monitor</Text>
              
              <View style={styles.waveformCanvas}>
                {/* Scan-line grid */}
                <View style={styles.gridLines}>
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={styles.gridLine} />
                  ))}
                </View>
                
                {/* Waveform bars */}
                <View style={styles.waveform}>
                  {[...Array(50)].map((_, index) => (
                    <React.Fragment key={index}>
                      <WaveBar 
                        index={index} 
                        isRecording={isRecording && !isPaused}
                        time={recordingTime}
                      />
                    </React.Fragment>
                  ))}
                </View>

                {/* Ambient pulse overlay */}
                {isRecording && !isPaused && (
                  <View style={styles.pulseOverlay} />
                )}
              </View>

              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={[styles.recordingDot, isPaused && styles.recordingDotPaused]} />
                  <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
                  {isPaused && <Text style={styles.pausedText}>PAUSED</Text>}
                </View>
              )}

              {!isRecording && (
                <Text style={styles.waveformHint}>Press Start Recording to begin</Text>
              )}
            </View>
          </BlurView>

          {/* Controls */}
          <View style={styles.controls}>
            {!isRecording ? (
              <TouchableOpacity
                style={styles.recordButton}
                onPress={startRecording}
                disabled={!hasPermission}
                accessibilityLabel="Start recording"
                accessibilityRole="button"
              >
                <BlurView intensity={30} style={styles.recordButtonBlur}>
                  <LinearGradient
                    colors={['rgba(252, 211, 77, 0.3)', 'rgba(252, 211, 77, 0.1)']}
                    style={styles.recordButtonGradient}
                  >
                    <IconSymbol
                      ios_icon_name="mic.circle.fill"
                      android_material_icon_name="mic"
                      size={56}
                      color={hasPermission ? colors.primary : colors.textSecondary}
                    />
                    <Text style={styles.recordButtonText}>
                      {hasPermission ? 'Start Recording' : 'Permission Required'}
                    </Text>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            ) : (
              <View style={styles.activeControls}>
                {!isPaused ? (
                  <TouchableOpacity
                    style={styles.pauseButton}
                    onPress={pauseRecording}
                    accessibilityLabel="Pause recording"
                    accessibilityRole="button"
                  >
                    <BlurView intensity={30} style={styles.controlButtonBlur}>
                      <IconSymbol
                        ios_icon_name="pause.circle.fill"
                        android_material_icon_name="pause-circle"
                        size={48}
                        color={colors.primary}
                      />
                      <Text style={styles.controlButtonText}>Pause</Text>
                    </BlurView>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.resumeButton}
                    onPress={resumeRecording}
                    accessibilityLabel="Resume recording"
                    accessibilityRole="button"
                  >
                    <BlurView intensity={30} style={styles.controlButtonBlur}>
                      <IconSymbol
                        ios_icon_name="play.circle.fill"
                        android_material_icon_name="play-circle"
                        size={48}
                        color={colors.primary}
                      />
                      <Text style={styles.controlButtonText}>Resume</Text>
                    </BlurView>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.stopButton}
                  onPress={stopRecording}
                  disabled={isSaving}
                  accessibilityLabel="Stop recording"
                  accessibilityRole="button"
                >
                  <BlurView intensity={30} style={styles.stopButtonBlur}>
                    <IconSymbol
                      ios_icon_name="stop.circle.fill"
                      android_material_icon_name="stop-circle"
                      size={48}
                      color="#EF4444"
                    />
                    <Text style={styles.stopButtonText}>
                      {isSaving ? 'Analyzing...' : 'Stop & Analyze'}
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Instructions */}
          <BlurView intensity={20} style={styles.instructionsCard}>
            <View style={styles.instructionsContent}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={24}
                color={colors.primary}
              />
              <Text style={styles.instructionsTitle}>Recording Tips</Text>
              <View style={styles.instructionsList}>
                <Text style={styles.instructionItem}>- Start your engine and let it idle</Text>
                <Text style={styles.instructionItem}>- Hold phone near engine bay</Text>
                <Text style={styles.instructionItem}>- Record for 30-60 seconds</Text>
                <Text style={styles.instructionItem}>- Minimize background noise</Text>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Animated wave bar component
const WaveBar = ({ index, isRecording, time }: { index: number; isRecording: boolean; time: number }) => {
  const [height, setHeight] = useState(4);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        const baseHeight = 4;
        const maxHeight = 80;
        const randomHeight = baseHeight + Math.random() * (maxHeight - baseHeight);
        const wave = Math.sin((time * 2 + index * 0.2) * Math.PI) * 20;
        setHeight(Math.max(baseHeight, randomHeight + wave));
      }, 50);
      return () => clearInterval(interval);
    } else {
      setHeight(4);
    }
  }, [isRecording, time, index]);

  return (
    <View
      style={[
        styles.waveBar,
        {
          height,
          backgroundColor: isRecording ? colors.primary : 'rgba(252, 211, 77, 0.3)',
          shadowColor: isRecording ? colors.primary : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  waveformContainer: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    marginBottom: 24,
    height: WAVEFORM_HEIGHT + 120,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  waveformContent: {
    padding: 20,
    flex: 1,
  },
  waveformTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  waveformCanvas: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  gridLine: {
    height: 1,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
  },
  waveform: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 8,
    gap: 2,
  },
  waveBar: {
    flex: 1,
    borderRadius: 2,
    minHeight: 4,
  },
  pulseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(252, 211, 77, 0.05)',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  recordingDotPaused: {
    backgroundColor: colors.primary,
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  pausedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  waveformHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  controls: {
    marginBottom: 24,
  },
  recordButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  recordButtonBlur: {
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.5)',
  },
  recordButtonGradient: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  recordButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resumeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  stopButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  controlButtonBlur: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  stopButtonBlur: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: '#EF4444',
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  stopButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
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
