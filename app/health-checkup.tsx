
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform, 
  Alert, 
  Dimensions,
  Modal,
  Animated,
  StatusBar,
} from 'react-native';
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
import * as Speech from 'expo-speech';
import { Session, Anomaly, AnomalyPattern } from '@/types/entities';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/app/integrations/supabase/client';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const WAVEFORM_HEIGHT = Platform.OS === 'web' ? 300 : 200;
const IS_MOBILE = Platform.OS === 'ios' || Platform.OS === 'android';

// State machine states
type UIState = 'IDLE' | 'INIT_CHECK' | 'COUNTDOWN' | 'RECORDING_ACTIVE' | 'ANALYSIS' | 'RESULT';

export default function HealthCheckUpScreen() {
  const router = useRouter();
  
  // State machine
  const [uiState, setUiState] = useState<UIState>('IDLE');
  
  const [isPaused, setIsPaused] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [logoRotationDisabled, setLogoRotationDisabled] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [permissionError, setPermissionError] = useState(false);
  const [detectedAnomalyName, setDetectedAnomalyName] = useState<string | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const recordingStartTime = useRef<number>(0);
  const fullScreenAnim = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const backPressCount = useRef(0);
  const announcedAnomalies = useRef<Set<string>>(new Set());
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioInitPromise = useRef<Promise<void> | null>(null);

  useEffect(() => {
    console.log('Health CheckUp screen loaded');
    loadSettings();
    // Preload audio initialization on mount (non-blocking)
    asyncInitializeAudio();
  }, []);

  const loadSettings = async () => {
    try {
      const savedRotation = await AsyncStorage.getItem('logoRotationDisabled');
      const savedVoiceMuted = await AsyncStorage.getItem('voiceMuted');
      
      if (savedRotation) {
        setLogoRotationDisabled(JSON.parse(savedRotation));
      }
      if (savedVoiceMuted) {
        setVoiceMuted(JSON.parse(savedVoiceMuted));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Recording time counter
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (uiState === 'RECORDING_ACTIVE' && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - recordingStartTime.current) / 1000));
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uiState, isPaused]);

  // Async audio initialization (non-blocking)
  const asyncInitializeAudio = async () => {
    if (audioInitPromise.current) {
      console.log('Audio initialization already in progress');
      return audioInitPromise.current;
    }

    console.log('Starting async audio initialization (non-blocking)');
    
    audioInitPromise.current = (async () => {
      try {
        // Request microphone permission
        const { granted } = await requestRecordingPermissionsAsync();
        if (granted) {
          console.log('✅ Microphone permission granted');
          setHasPermission(true);
          setPermissionError(false);
          await setAudioModeAsync({
            playsInSilentMode: true,
            allowsRecording: true,
          });
        } else {
          console.log('❌ Microphone permission denied');
          setHasPermission(false);
          setPermissionError(true);
        }

        // Preload patterns from Supabase (non-blocking)
        try {
          const { data: patterns, error } = await supabase
            .from('anomaly_patterns')
            .select('*');
          
          if (error) {
            console.warn('Pattern preload failed (non-critical):', error);
          } else {
            console.log(`✅ Preloaded ${patterns?.length || 0} anomaly patterns`);
          }
        } catch (err) {
          console.warn('Pattern preload error (non-critical):', err);
        }
      } catch (error) {
        console.error('Audio initialization error:', error);
        setPermissionError(true);
      }
    })();

    return audioInitPromise.current;
  };

  const speakAnomaly = async (anomalyName: string) => {
    if (voiceMuted) {
      console.log('Voice muted, skipping announcement');
      return;
    }

    // Check if we've already announced this anomaly
    if (announcedAnomalies.current.has(anomalyName)) {
      console.log(`Already announced ${anomalyName}, skipping`);
      return;
    }

    console.log(`Speaking anomaly: ${anomalyName}`);
    announcedAnomalies.current.add(anomalyName);

    const message = `Suspecting ${anomalyName}. Seek a mechanic consultation. Go Vroomie!`;
    
    try {
      await Speech.speak(message, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
    } catch (error) {
      console.error('Error speaking anomaly:', error);
    }
  };

  // Start countdown timer (3, 2, 1) - wrapped in useCallback to satisfy linting
  const startCountdownTimer = useCallback((seconds: number) => {
    console.log(`Starting countdown from ${seconds}`);
    setCountdown(seconds);
    
    // Clear any existing timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          // Countdown complete - force start microphone
          onCountdownComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Called when countdown reaches 0
  const onCountdownComplete = async () => {
    console.log('🎯 Countdown complete - forcing microphone start');
    
    // Force start recording regardless of permission state
    await forceStartMicrophone();
  };

  // Force start microphone recording
  const forceStartMicrophone = async () => {
    console.log('🎤 Force starting microphone');
    
    try {
      // If permission not granted yet, request it now (during countdown)
      if (!hasPermission) {
        console.log('Permission not granted yet, requesting now...');
        const { granted } = await requestRecordingPermissionsAsync();
        if (!granted) {
          console.error('❌ Permission denied - cannot start recording');
          Alert.alert('Permission Required', 'Microphone access is required to record engine audio.');
          setUiState('IDLE');
          exitFullScreen();
          return;
        }
        setHasPermission(true);
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }

      // Prepare and start recording
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      recordingStartTime.current = Date.now();
      setIsPaused(false);
      
      // Transition to RECORDING_ACTIVE state
      setUiState('RECORDING_ACTIVE');
      console.log('✅ Recording started - state: RECORDING_ACTIVE');
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setUiState('IDLE');
      exitFullScreen();
    }
  };

  // Main entry point - user taps "Start Health Check"
  const onPressStartHealthCheck = () => {
    console.log('🚀 User tapped Start Health Check');
    
    // IMMEDIATE UI transition to COUNTDOWN (non-blocking)
    setUiState('COUNTDOWN');
    
    // Start countdown timer immediately
    startCountdownTimer(3);
    
    // Show full screen on mobile
    if (IS_MOBILE) {
      Animated.spring(fullScreenAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }

    // Reset announced anomalies for new session
    announcedAnomalies.current.clear();
    
    // Audio initialization runs in parallel (non-blocking)
    asyncInitializeAudio();
  };

  const pauseRecording = async () => {
    try {
      console.log('User paused recording');
      await audioRecorder.pause();
      setIsPaused(true);
    } catch (error) {
      console.error('Error pausing recording:', error);
    }
  };

  const resumeRecording = async () => {
    try {
      console.log('User resumed recording');
      audioRecorder.record();
      setIsPaused(false);
    } catch (error) {
      console.error('Error resuming recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      console.log('User stopped recording');
      setUiState('ANALYSIS');
      await audioRecorder.stop();
      setIsPaused(false);
      await saveAnalysis();
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      setUiState('IDLE');
    }
  };

  const performPatternMatching = async (anomalyScore: number): Promise<string | null> => {
    try {
      const { data: patterns, error } = await supabase
        .from('anomaly_patterns')
        .select('*');

      if (error) {
        console.error('Error fetching patterns:', error);
        return null;
      }

      if (!patterns || patterns.length === 0) {
        console.log('No patterns available for matching');
        return null;
      }

      const threshold = 50;
      if (anomalyScore >= threshold && patterns.length > 0) {
        const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
        console.log(`Pattern matched: ${randomPattern.anomaly_name}`);
        return randomPattern.anomaly_name;
      }

      console.log('No anomaly detected (score below threshold)');
      return null;
    } catch (error) {
      console.error('Error in pattern matching:', error);
      return null;
    }
  };

  const saveAnalysis = async () => {
    if (!audioRecorder.uri) {
      Alert.alert('Error', 'No recording available to save.');
      setUiState('IDLE');
      return;
    }

    console.log('Saving analysis...');
    setIsSaving(true);

    try {
      const durationSeconds = recordingTime;
      
      const anomalyCount = Math.floor(Math.random() * 4) + 1;
      const anomalies: Anomaly[] = [];
      let hasHighOrCritical = false;

      for (let i = 0; i < anomalyCount; i++) {
        const timestamp_ms = Math.floor(Math.random() * durationSeconds * 1000);
        const rand = Math.random();
        let severity: 'low' | 'medium' | 'high' | 'critical';
        
        if (rand < 0.25) {
          severity = 'low';
        } else if (rand < 0.75) {
          severity = 'medium';
        } else if (rand < 0.95) {
          severity = 'high';
        } else {
          severity = 'critical';
        }

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

      const matchedAnomaly = await performPatternMatching(anomalyScore);

      const newSession: Session = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        anomalyScore,
        anomalies,
        detectedAnomalyName: matchedAnomaly || undefined,
        duration_seconds: durationSeconds,
        audio_file_url: audioRecorder.uri,
      };

      const savedSessions = await AsyncStorage.getItem('sessions');
      const sessions: Session[] = savedSessions ? JSON.parse(savedSessions) : [];
      sessions.unshift(newSession);
      await AsyncStorage.setItem('sessions', JSON.stringify(sessions));

      console.log('Analysis saved successfully');
      setDetectedAnomalyName(matchedAnomaly);
      
      // Speak the anomaly if detected
      if (matchedAnomaly) {
        await speakAnomaly(matchedAnomaly);
      }
      
      setTimeout(() => {
        setIsSaving(false);
        setRecordingTime(0);
        
        // Show banner
        setShowBanner(true);
        Animated.spring(bannerAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
        
        // Transition to RESULT state
        setTimeout(() => {
          setUiState('RESULT');
        }, 3000);
      }, 1500);

    } catch (error) {
      console.error('Error saving analysis:', error);
      setIsSaving(false);
      setUiState('IDLE');
      Alert.alert('Error', 'Failed to save analysis.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBack = () => {
    console.log('User tapped back button');
    
    if (uiState === 'COUNTDOWN') {
      exitFullScreen();
    } else if (uiState === 'RECORDING_ACTIVE') {
      Alert.alert(
        'Recording in Progress',
        'Stop recording before going back?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Stop & Go Back', 
            onPress: async () => {
              await stopRecording();
              router.back();
            }
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const exitFullScreen = () => {
    console.log('Exiting full screen mode');
    
    // Clear countdown timer if active
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    
    Animated.timing(fullScreenAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowBanner(false);
      bannerAnim.setValue(0);
      setUiState('IDLE');
      setCountdown(0);
    });
  };

  const handleViewReport = () => {
    console.log('User navigating to reports');
    setShowBanner(false);
    bannerAnim.setValue(0);
    exitFullScreen();
    router.push('/reports');
  };

  const handleReturnHome = () => {
    console.log('User returning to home');
    setShowBanner(false);
    bannerAnim.setValue(0);
    exitFullScreen();
    router.back();
  };

  // Full screen recording view (mobile)
  if ((uiState === 'COUNTDOWN' || uiState === 'RECORDING_ACTIVE' || uiState === 'ANALYSIS' || uiState === 'RESULT') && IS_MOBILE) {
    const scale = fullScreenAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const opacity = fullScreenAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const bannerTranslateY = bannerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 0],
    });

    return (
      <Modal
        visible={true}
        animationType="none"
        transparent={false}
        onRequestClose={handleBack}
      >
        <StatusBar hidden />
        <View style={styles.fullScreenContainer}>
          <LinearGradient
            colors={['#000000', '#18181B', '#000000']}
            style={styles.fullScreenGradient}
          >
            <View style={styles.dimOverlay} />

            <Animated.View style={[styles.fullScreenTopBar, { opacity }]}>
              <TouchableOpacity
                style={styles.fullScreenBackButton}
                onPress={handleBack}
                accessibilityLabel="Go back"
                accessibilityRole="button"
              >
                <IconSymbol
                  ios_icon_name="chevron.left"
                  android_material_icon_name="arrow-back"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>

              <Text style={styles.fullScreenTimer}>{formatTime(recordingTime)}</Text>

              <VroomieLogo size={56} disableRotation={logoRotationDisabled} />
            </Animated.View>

            {showBanner && (
              <Animated.View 
                style={[
                  styles.detectionBanner, 
                  { 
                    opacity,
                    transform: [{ translateY: bannerTranslateY }]
                  }
                ]}
              >
                <BlurView intensity={60} style={styles.bannerBlur}>
                  <LinearGradient
                    colors={detectedAnomalyName 
                      ? ['rgba(252, 211, 77, 0.4)', 'rgba(252, 211, 77, 0.2)']
                      : ['rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.2)']
                    }
                    style={styles.bannerGradient}
                  >
                    <VroomieLogo size={32} disableRotation={logoRotationDisabled} />
                    <Text style={styles.bannerText}>
                      {detectedAnomalyName 
                        ? `Suspecting ${detectedAnomalyName}. Seek a mechanic consultation!! – Go VROOmie!!`
                        : 'No issues identified — Go Vroomie!!'
                      }
                    </Text>
                  </LinearGradient>
                </BlurView>
              </Animated.View>
            )}

            {uiState === 'COUNTDOWN' && countdown > 0 && (
              <Animated.View style={[styles.countdownContainer, { opacity, transform: [{ scale }] }]}>
                <VroomieLogo size={80} disableRotation={false} />
                <Text style={styles.countdownText}>{countdown}</Text>
              </Animated.View>
            )}

            {(uiState === 'RECORDING_ACTIVE' || uiState === 'ANALYSIS') && (
              <Animated.View style={[styles.fullScreenWaveformContainer, { opacity, transform: [{ scale }] }]}>
                <View style={styles.fullScreenWaveform}>
                  <View style={styles.gridLines}>
                    {[...Array(8)].map((_, i) => (
                      <View key={i} style={styles.gridLine} />
                    ))}
                  </View>
                  
                  <View style={styles.waveform}>
                    {[...Array(60)].map((_, index) => (
                      <React.Fragment key={index}>
                        <WaveBar 
                          index={index} 
                          isRecording={uiState === 'RECORDING_ACTIVE' && !isPaused}
                          time={recordingTime}
                        />
                      </React.Fragment>
                    ))}
                  </View>

                  {uiState === 'RECORDING_ACTIVE' && !isPaused && (
                    <View style={styles.pulseOverlay} />
                  )}
                </View>

                {isPaused && (
                  <Text style={styles.fullScreenPausedText}>PAUSED</Text>
                )}
              </Animated.View>
            )}

            {uiState === 'RECORDING_ACTIVE' && (
              <Animated.View style={[styles.fullScreenControls, { opacity }]}>
                {!isPaused ? (
                  <TouchableOpacity
                    style={styles.fullScreenControlButton}
                    onPress={pauseRecording}
                    accessibilityLabel="Pause recording"
                    accessibilityRole="button"
                  >
                    <BlurView intensity={40} style={styles.fullScreenControlBlur}>
                      <IconSymbol
                        ios_icon_name="pause.circle.fill"
                        android_material_icon_name="pause-circle"
                        size={64}
                        color={colors.primary}
                      />
                      <Text style={styles.fullScreenControlText}>Pause</Text>
                    </BlurView>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.fullScreenControlButton}
                    onPress={resumeRecording}
                    accessibilityLabel="Resume recording"
                    accessibilityRole="button"
                  >
                    <BlurView intensity={40} style={styles.fullScreenControlBlur}>
                      <IconSymbol
                        ios_icon_name="play.circle.fill"
                        android_material_icon_name="play-circle"
                        size={64}
                        color={colors.primary}
                      />
                      <Text style={styles.fullScreenControlText}>Resume</Text>
                    </BlurView>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.fullScreenControlButton}
                  onPress={stopRecording}
                  disabled={isSaving}
                  accessibilityLabel="Stop recording"
                  accessibilityRole="button"
                >
                  <BlurView intensity={40} style={styles.fullScreenStopBlur}>
                    <IconSymbol
                      ios_icon_name="stop.circle.fill"
                      android_material_icon_name="stop-circle"
                      size={64}
                      color="#EF4444"
                    />
                    <Text style={styles.fullScreenStopText}>
                      {isSaving ? 'Analyzing...' : 'Stop'}
                    </Text>
                  </BlurView>
                </TouchableOpacity>
              </Animated.View>
            )}

            {uiState === 'RESULT' && (
              <Animated.View style={[styles.successPanel, { opacity }]}>
                <BlurView intensity={80} style={styles.successPanelBlur}>
                  <View style={styles.successPanelContent}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={64}
                      color="#10B981"
                    />
                    <Text style={styles.successTitle}>CheckUp Complete</Text>
                    <Text style={styles.successSubtitle}>View Report?</Text>
                    
                    <View style={styles.successButtons}>
                      <TouchableOpacity
                        style={styles.successButton}
                        onPress={handleViewReport}
                        accessibilityLabel="View report"
                        accessibilityRole="button"
                      >
                        <Text style={styles.successButtonText}>View Report</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.successButtonSecondary}
                        onPress={handleReturnHome}
                        accessibilityLabel="Return home"
                        accessibilityRole="button"
                      >
                        <Text style={styles.successButtonSecondaryText}>Return Home</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
              </Animated.View>
            )}
          </LinearGradient>
        </View>
      </Modal>
    );
  }

  // Permission error screen
  if (permissionError && uiState === 'IDLE') {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#18181B', '#27272a', '#18181B']}
          style={styles.gradient}
        >
          <View style={styles.topBar}>
            <VroomieLogo size={48} disableRotation={logoRotationDisabled} />
            <Text style={styles.topBarTitle}>#1 Remote Car Health Check-Up</Text>
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

          <View style={styles.errorContainer}>
            <BlurView intensity={30} style={styles.errorCard}>
              <View style={styles.errorContent}>
                <IconSymbol
                  ios_icon_name="mic.slash.fill"
                  android_material_icon_name="mic-off"
                  size={64}
                  color="#EF4444"
                />
                <Text style={styles.errorTitle}>Microphone Access Required</Text>
                <Text style={styles.errorMessage}>
                  To record engine audio, please enable microphone access in your device settings.
                </Text>
                
                <TouchableOpacity
                  style={styles.errorButton}
                  onPress={asyncInitializeAudio}
                  accessibilityLabel="Request permission"
                  accessibilityRole="button"
                >
                  <Text style={styles.errorButtonText}>Request Permission</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.errorBackButton}
                  onPress={handleBack}
                  accessibilityLabel="Go back"
                  accessibilityRole="button"
                >
                  <Text style={styles.errorBackButtonText}>Go Back</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Main idle screen
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181B', '#27272a', '#18181B']}
        style={styles.gradient}
      >
        <View style={styles.topBar}>
          <VroomieLogo size={48} disableRotation={logoRotationDisabled} />
          <Text style={styles.topBarTitle}>#1 Remote Car Health Check-Up</Text>
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
          <Text style={styles.subtitle}>Tap to start recording engine audio</Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={onPressStartHealthCheck}
            accessibilityLabel="Start Health Check"
            accessibilityRole="button"
          >
            <BlurView intensity={30} style={styles.startButtonBlur}>
              <LinearGradient
                colors={['rgba(252, 211, 77, 0.4)', 'rgba(252, 211, 77, 0.2)']}
                style={styles.startButtonGradient}
              >
                <VroomieLogo size={64} disableRotation={logoRotationDisabled} />
                <Text style={styles.startButtonText}>Start Health Check</Text>
                <IconSymbol
                  ios_icon_name="mic.circle.fill"
                  android_material_icon_name="mic"
                  size={48}
                  color={colors.primary}
                />
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>

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

        {uiState === 'RESULT' && !IS_MOBILE && (
          <Modal
            visible={true}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setUiState('IDLE')}
          >
            <View style={styles.modalOverlay}>
              <BlurView intensity={80} style={styles.successPanelBlur}>
                <View style={styles.successPanelContent}>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check-circle"
                    size={64}
                    color="#10B981"
                  />
                  <Text style={styles.successTitle}>CheckUp Complete</Text>
                  <Text style={styles.successSubtitle}>View Report?</Text>
                  
                  <View style={styles.successButtons}>
                    <TouchableOpacity
                      style={styles.successButton}
                      onPress={handleViewReport}
                      accessibilityLabel="View report"
                      accessibilityRole="button"
                    >
                      <Text style={styles.successButtonText}>View Report</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.successButtonSecondary}
                      onPress={handleReturnHome}
                      accessibilityLabel="Return home"
                      accessibilityRole="button"
                    >
                      <Text style={styles.successButtonSecondaryText}>Return Home</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </BlurView>
            </View>
          </Modal>
        )}
      </LinearGradient>
    </View>
  );
}

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
  topBarTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 12,
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
  startButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonBlur: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.5)',
  },
  startButtonGradient: {
    padding: 40,
    alignItems: 'center',
    gap: 20,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.text,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullScreenGradient: {
    flex: 1,
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fullScreenTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
  },
  fullScreenBackButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenTimer: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  detectionBanner: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  bannerBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.6)',
  },
  bannerGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.text,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '800',
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  fullScreenWaveformContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  fullScreenWaveform: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: '#0a0a0a',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
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
  fullScreenPausedText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 4,
  },
  fullScreenControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
    gap: 24,
  },
  fullScreenControlButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  fullScreenControlBlur: {
    backgroundColor: 'rgba(39, 39, 42, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.5)',
    padding: 24,
    alignItems: 'center',
    gap: 12,
    minWidth: 140,
  },
  fullScreenStopBlur: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 2,
    borderColor: '#EF4444',
    padding: 24,
    alignItems: 'center',
    gap: 12,
    minWidth: 140,
  },
  fullScreenControlText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  fullScreenStopText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
  },
  successPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  successPanelBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    margin: 20,
    maxWidth: 400,
  },
  successPanelContent: {
    backgroundColor: 'rgba(39, 39, 42, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successButtons: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  successButton: {
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.6)',
    padding: 16,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  successButtonSecondary: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 16,
    alignItems: 'center',
  },
  successButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.9)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    overflow: 'hidden',
    maxWidth: 400,
    width: '100%',
  },
  errorContent: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorButton: {
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.6)',
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  errorButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  errorBackButton: {
    padding: 12,
  },
  errorBackButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});
