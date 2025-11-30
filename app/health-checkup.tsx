
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import TopNavigation from '@/components/TopNavigation';
import { colors } from '@/styles/commonStyles';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import { mockAnalyses, mockVehicles } from '@/data/mockData';
import { AudioAnalysis, Anomaly } from '@/types/entities';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const WAVEFORM_WIDTH = Platform.OS === 'web' ? SCREEN_WIDTH * 0.5 : SCREEN_WIDTH - 40;
const WAVEFORM_HEIGHT = Platform.OS === 'web' ? 300 : 200;

export default function HealthCheckUpScreen() {
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [analyses, setAnalyses] = useState<AudioAnalysis[]>(mockAnalyses);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(mockVehicles[0]?.id || '1');
  
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const recordingStartTime = useRef<number>(0);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - recordingStartTime.current) / 1000));
      }, 100);
    } else {
      setRecordingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

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
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      setIsRecording(false);
      console.log('Recording stopped');
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
      const anomalyCount = Math.floor(Math.random() * 4) + 1; // 1-4 anomalies
      const anomalies: Anomaly[] = [];
      let hasHighOrCritical = false;

      for (let i = 0; i < anomalyCount; i++) {
        const timestamp_ms = Math.floor(Math.random() * durationSeconds * 1000);
        const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
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
        vehicle_id: selectedVehicleId,
        audio_file_url: audioRecorder.uri,
        duration_seconds: durationSeconds,
        anomaly_detected: hasHighOrCritical,
        anomaly_score: anomalyScore,
        anomalies,
        created_at: new Date().toISOString(),
      };

      setAnalyses(prev => [newAnalysis, ...prev]);
      
      setTimeout(() => {
        setIsSaving(false);
        Alert.alert(
          'Health CheckUp Completed',
          'View Report',
          [
            { text: 'View Now', onPress: () => router.push(`/analysis/${newAnalysis.id}` as any) },
            { text: 'Later', style: 'cancel' },
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181b', '#27272a', '#18181b']}
        style={styles.gradient}
      >
        <TopNavigation />
        
        <View style={styles.mainContent}>
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

            {/* Waveform Container */}
            <BlurView intensity={20} style={styles.waveformContainer}>
              <View style={styles.waveformContent}>
                <Text style={styles.waveformTitle}>Live Audio Monitor</Text>
                
                <View style={styles.waveformCanvas}>
                  <View style={styles.gridLines}>
                    {[...Array(5)].map((_, i) => (
                      <View key={i} style={styles.gridLine} />
                    ))}
                  </View>
                  
                  <View style={styles.waveform}>
                    {[...Array(40)].map((_, index) => (
                      <React.Fragment key={index}>
                        <WaveBar 
                          index={index} 
                          isRecording={isRecording}
                          time={recordingTime}
                        />
                      </React.Fragment>
                    ))}
                  </View>
                </View>

                {isRecording && (
                  <View style={styles.recordingIndicator}>
                    <View style={styles.recordingDot} />
                    <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
                  </View>
                )}

                {!isRecording && recordingTime === 0 && (
                  <Text style={styles.waveformHint}>Press Start Recording to begin</Text>
                )}
              </View>
            </BlurView>

            {/* Controls */}
            <View style={styles.controls}>
              {!isRecording && !recorderState.isRecording ? (
                <TouchableOpacity
                  style={styles.recordButton}
                  onPress={startRecording}
                  disabled={!hasPermission}
                >
                  <BlurView intensity={30} style={styles.recordButtonBlur}>
                    <View style={styles.recordButtonContent}>
                      <IconSymbol
                        ios_icon_name="mic.circle.fill"
                        android_material_icon_name="mic"
                        size={48}
                        color={hasPermission ? colors.primary : colors.textSecondary}
                      />
                      <Text style={styles.recordButtonText}>
                        {hasPermission ? 'Start Recording' : 'Permission Required'}
                      </Text>
                    </View>
                  </BlurView>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.recordButton, styles.stopButton]}
                    onPress={stopRecording}
                  >
                    <BlurView intensity={30} style={styles.stopButtonBlur}>
                      <View style={styles.recordButtonContent}>
                        <IconSymbol
                          ios_icon_name="stop.circle.fill"
                          android_material_icon_name="stop-circle"
                          size={48}
                          color="#EF4444"
                        />
                        <Text style={styles.recordButtonText}>Stop Recording</Text>
                      </View>
                    </BlurView>
                  </TouchableOpacity>

                  {audioRecorder.uri && !isRecording && (
                    <TouchableOpacity
                      style={styles.saveButton}
                      onPress={saveAnalysis}
                      disabled={isSaving}
                    >
                      <BlurView intensity={30} style={styles.saveButtonBlur}>
                        <View style={styles.saveButtonContent}>
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check-circle"
                            size={32}
                            color={colors.primary}
                          />
                          <Text style={styles.saveButtonText}>
                            {isSaving ? 'Analyzing...' : 'Save Analysis'}
                          </Text>
                        </View>
                      </BlurView>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Instructions */}
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
                  <Text style={styles.instructionItem}>- Start your engine and let it idle</Text>
                  <Text style={styles.instructionItem}>- Hold phone near engine bay</Text>
                  <Text style={styles.instructionItem}>- Record for 30-60 seconds</Text>
                  <Text style={styles.instructionItem}>- Minimize background noise</Text>
                </View>
              </View>
            </BlurView>
          </ScrollView>

          {/* History Panel */}
          <View style={[styles.historyPanel, Platform.OS === 'web' && styles.historyPanelWeb]}>
            <BlurView intensity={30} style={styles.historyPanelBlur}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Recent Analyses</Text>
                <IconSymbol
                  ios_icon_name="clock.fill"
                  android_material_icon_name="history"
                  size={20}
                  color={colors.primary}
                />
              </View>
              
              <ScrollView 
                style={styles.historyList}
                showsVerticalScrollIndicator={false}
              >
                {analyses.slice(0, 5).map((analysis, index) => (
                  <React.Fragment key={index}>
                    <TouchableOpacity
                      style={styles.historyItem}
                      onPress={() => router.push(`/analysis/${analysis.id}` as any)}
                    >
                      <View style={styles.historyItemLeft}>
                        <IconSymbol
                          ios_icon_name={analysis.anomaly_detected ? 'exclamationmark.triangle.fill' : 'checkmark.circle.fill'}
                          android_material_icon_name={analysis.anomaly_detected ? 'warning' : 'check-circle'}
                          size={20}
                          color={analysis.anomaly_detected ? '#F97316' : '#10B981'}
                        />
                        <View style={styles.historyItemInfo}>
                          <Text style={styles.historyItemTime}>
                            {new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          <Text style={styles.historyItemStatus}>
                            {analysis.anomaly_detected ? 'Issues Found' : 'Healthy'}
                          </Text>
                        </View>
                      </View>
                      <IconSymbol
                        ios_icon_name="chevron.right"
                        android_material_icon_name="chevron-right"
                        size={16}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </React.Fragment>
                ))}
              </ScrollView>
            </BlurView>
          </View>
        </View>
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
  mainContent: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    marginTop: Platform.OS === 'android' ? 80 : 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 20,
    paddingBottom: Platform.OS === 'web' ? 40 : 200,
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
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    marginBottom: 24,
    height: Platform.OS === 'web' ? 350 : 280,
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
    borderRadius: 12,
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
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  waveformHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  controls: {
    gap: 12,
    marginBottom: 24,
  },
  recordButton: {
    borderRadius: 16,
    overflow: 'hidden',
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
  stopButton: {
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  stopButtonBlur: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 0,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  saveButtonBlur: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.5)',
  },
  saveButtonContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  saveButtonText: {
    fontSize: 16,
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
  historyPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  historyPanelWeb: {
    position: 'relative',
    width: 320,
    height: 'auto',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderRadius: 16,
    margin: 20,
    marginTop: Platform.OS === 'ios' ? 100 : 20,
  },
  historyPanelBlur: {
    flex: 1,
    backgroundColor: 'rgba(39, 39, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.2)',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.1)',
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  historyItemStatus: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
