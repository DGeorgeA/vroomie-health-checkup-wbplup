
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import VroomieLogo from '@/components/VroomieLogo';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import * as FileSystem from 'expo-file-system/legacy';
import Svg, { Path, Line } from 'react-native-svg';

export default function PhoneScreenshot2() {
  const router = useRouter();
  const viewRef = useRef<View>(null);

  const captureScreenshot = async () => {
    try {
      if (!viewRef.current) {
        console.log('View ref not available');
        return;
      }

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        width: 1080,
        height: 1920,
      });

      console.log('Screenshot captured:', uri);
      
      if (Platform.OS === 'web') {
        Alert.alert(
          'Screenshot Captured',
          'Right-click the image and save it as phone-screenshot-2-1080x1920.png',
          [{ text: 'OK' }]
        );
      } else {
        const fileName = `phone-screenshot-2-1080x1920-${Date.now()}.png`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: uri, to: newPath });
        
        Alert.alert(
          'Success',
          `Screenshot saved to: ${newPath}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      Alert.alert('Error', 'Failed to capture screenshot');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Phone Screenshot 2</Text>
        
        <TouchableOpacity
          style={styles.captureButton}
          onPress={captureScreenshot}
          accessibilityLabel="Capture screenshot"
          accessibilityRole="button"
        >
          <IconSymbol
            ios_icon_name="camera.fill"
            android_material_icon_name="camera"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.mockupContainer}>
          <View ref={viewRef} style={styles.phoneContainer}>
            <LinearGradient
              colors={['#18181B', '#27272a', '#18181B']}
              style={styles.phoneGradient}
            >
              {/* Top Bar */}
              <View style={styles.phoneTopBar}>
                <VroomieLogo size={48} disableRotation />
                <Text style={styles.phoneTimer}>00:15</Text>
                <View style={styles.phoneStopButton}>
                  <IconSymbol
                    ios_icon_name="stop.fill"
                    android_material_icon_name="stop"
                    size={32}
                    color="#EF4444"
                  />
                </View>
              </View>

              {/* Waveform Area */}
              <View style={styles.waveformContainer}>
                <BlurView intensity={20} style={styles.waveformBlur}>
                  <View style={styles.waveformContent}>
                    <Text style={styles.waveformTitle}>Recording Audio...</Text>
                    
                    {/* ECG-style waveform */}
                    <View style={styles.waveformCanvas}>
                      <Svg width="100%" height="400" viewBox="0 0 1000 400">
                        {/* Grid lines */}
                        {[...Array(10)].map((_, i) => (
                          <React.Fragment key={`grid-${i}`}>
                            <Line
                              x1="0"
                              y1={i * 40}
                              x2="1000"
                              y2={i * 40}
                              stroke="rgba(252, 211, 77, 0.1)"
                              strokeWidth="1"
                            />
                          </React.Fragment>
                        ))}
                        
                        {/* Waveform */}
                        <Path
                          d="M 0 200 L 50 200 L 70 120 L 90 280 L 110 200 L 150 200 L 170 160 L 190 240 L 210 200 L 250 200 L 270 140 L 290 260 L 310 200 L 350 200 L 370 180 L 390 220 L 410 200 L 450 200 L 470 100 L 490 300 L 510 200 L 550 200 L 570 170 L 590 230 L 610 200 L 650 200 L 670 150 L 690 250 L 710 200 L 750 200 L 770 190 L 790 210 L 810 200 L 850 200 L 870 130 L 890 270 L 910 200 L 950 200 L 1000 200"
                          fill="none"
                          stroke="#FCD34D"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    </View>
                    
                    <View style={styles.waveformStats}>
                      <View style={styles.statItem}>
                        <IconSymbol
                          ios_icon_name="waveform"
                          android_material_icon_name="graphic-eq"
                          size={24}
                          color={colors.primary}
                        />
                        <Text style={styles.statLabel}>Frequency</Text>
                        <Text style={styles.statValue}>2.4 kHz</Text>
                      </View>
                      
                      <View style={styles.statItem}>
                        <IconSymbol
                          ios_icon_name="chart.bar.fill"
                          android_material_icon_name="bar-chart"
                          size={24}
                          color={colors.primary}
                        />
                        <Text style={styles.statLabel}>Amplitude</Text>
                        <Text style={styles.statValue}>-18 dB</Text>
                      </View>
                    </View>
                  </View>
                </BlurView>
              </View>

              {/* Controls */}
              <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.controlButton}>
                  <IconSymbol
                    ios_icon_name="pause.fill"
                    android_material_icon_name="pause"
                    size={40}
                    color={colors.primary}
                  />
                  <Text style={styles.controlLabel}>Pause</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.controlButton, styles.stopButton]}>
                  <IconSymbol
                    ios_icon_name="stop.fill"
                    android_material_icon_name="stop"
                    size={40}
                    color="#FFFFFF"
                  />
                  <Text style={[styles.controlLabel, { color: '#FFFFFF' }]}>Stop</Text>
                </TouchableOpacity>
              </View>

              {/* Caption */}
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>
                  Real-time audio analysis with ECG-style visualization
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Google Play Requirements:</Text>
          <Text style={styles.infoText}>- Size: 1080 x 1920 px (portrait)</Text>
          <Text style={styles.infoText}>- Format: PNG or JPG</Text>
          <Text style={styles.infoText}>- Shows: Health CheckUp recording</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.2)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  captureButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  mockupContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  phoneContainer: {
    width: 1080,
    height: 1920,
    backgroundColor: 'transparent',
  },
  phoneGradient: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  phoneTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(252, 211, 77, 0.1)',
  },
  phoneTimer: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  phoneStopButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    flex: 1,
    marginVertical: 40,
    borderRadius: 32,
    overflow: 'hidden',
  },
  waveformBlur: {
    flex: 1,
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  waveformContent: {
    flex: 1,
    padding: 40,
  },
  waveformTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  waveformCanvas: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  waveformStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  statLabel: {
    fontSize: 18,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    minWidth: 180,
  },
  stopButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  controlLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 12,
  },
  captionContainer: {
    paddingTop: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(252, 211, 77, 0.2)',
  },
  captionText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 20,
    marginTop: 20,
    width: '100%',
    maxWidth: 600,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
