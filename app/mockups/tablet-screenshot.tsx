
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import VroomieLogo from '@/components/VroomieLogo';
import VroomieText from '@/components/VroomieText';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import * as FileSystem from 'expo-file-system/legacy';

export default function TabletScreenshot() {
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
        width: 1200,
        height: 1920,
      });

      console.log('Screenshot captured:', uri);
      
      if (Platform.OS === 'web') {
        Alert.alert(
          'Screenshot Captured',
          'Right-click the image and save it as tablet-screenshot-1200x1920.png',
          [{ text: 'OK' }]
        );
      } else {
        const fileName = `tablet-screenshot-1200x1920-${Date.now()}.png`;
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
        
        <Text style={styles.title}>Tablet Screenshot</Text>
        
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
          <View ref={viewRef} style={styles.tabletContainer}>
            <LinearGradient
              colors={['#18181B', '#27272a', '#18181B']}
              style={styles.tabletGradient}
            >
              {/* Top Bar */}
              <View style={styles.tabletTopBar}>
                <VroomieLogo size={64} disableRotation />
                <Text style={styles.tabletTopBarTitle}>#1 Remote Car Health Check-Up</Text>
                <View style={styles.tabletSettingsButton}>
                  <IconSymbol
                    ios_icon_name="gearshape.fill"
                    android_material_icon_name="settings"
                    size={32}
                    color={colors.primary}
                  />
                </View>
              </View>

              {/* Two Column Layout */}
              <View style={styles.tabletContent}>
                {/* Left Column - Hero */}
                <View style={styles.leftColumn}>
                  <View style={styles.tabletHeroArea}>
                    <VroomieText size={140} />
                  </View>
                  
                  <View style={styles.statsGrid}>
                    <BlurView intensity={20} style={styles.statCard}>
                      <View style={styles.statCardContent}>
                        <IconSymbol
                          ios_icon_name="checkmark.circle.fill"
                          android_material_icon_name="check-circle"
                          size={40}
                          color="#10B981"
                        />
                        <Text style={styles.statLabel}>Last Result</Text>
                        <Text style={[styles.statValue, { color: '#10B981' }]}>Healthy</Text>
                      </View>
                    </BlurView>
                    
                    <BlurView intensity={20} style={styles.statCard}>
                      <View style={styles.statCardContent}>
                        <IconSymbol
                          ios_icon_name="chart.bar.fill"
                          android_material_icon_name="bar-chart"
                          size={40}
                          color={colors.primary}
                        />
                        <Text style={styles.statLabel}>Sessions</Text>
                        <Text style={styles.statValue}>24</Text>
                      </View>
                    </BlurView>
                  </View>
                </View>

                {/* Right Column - CTAs */}
                <View style={styles.rightColumn}>
                  <TouchableOpacity style={styles.tabletPrimaryCta}>
                    <BlurView intensity={30} style={styles.tabletCtaBlur}>
                      <LinearGradient
                        colors={['rgba(252, 211, 77, 0.3)', 'rgba(252, 211, 77, 0.1)']}
                        style={styles.tabletCtaGradient}
                      >
                        <IconSymbol
                          ios_icon_name="waveform.circle.fill"
                          android_material_icon_name="graphic-eq"
                          size={80}
                          color={colors.primary}
                        />
                        <Text style={styles.tabletCtaTitle}>Start Health CheckUp</Text>
                        <Text style={styles.tabletCtaSubtitle}>
                          Analyze your vehicle&apos;s sounds in real-time
                        </Text>
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.tabletSecondaryCta}>
                    <BlurView intensity={30} style={styles.tabletCtaBlur}>
                      <LinearGradient
                        colors={['rgba(252, 211, 77, 0.2)', 'rgba(252, 211, 77, 0.05)']}
                        style={styles.tabletCtaGradient}
                      >
                        <IconSymbol
                          ios_icon_name="doc.text.fill"
                          android_material_icon_name="description"
                          size={80}
                          color={colors.primary}
                        />
                        <Text style={styles.tabletCtaTitle}>View Reports</Text>
                        <Text style={styles.tabletCtaSubtitle}>
                          Review your diagnostic history
                        </Text>
                      </LinearGradient>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Caption */}
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>
                  Optimized for tablets - Expanded dashboard view
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Google Play Requirements:</Text>
          <Text style={styles.infoText}>- Size: 1200 x 1920 px (portrait)</Text>
          <Text style={styles.infoText}>- Format: PNG or JPG</Text>
          <Text style={styles.infoText}>- Shows: Tablet-optimized layout</Text>
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
  tabletContainer: {
    width: 1200,
    height: 1920,
    backgroundColor: 'transparent',
  },
  tabletGradient: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 60,
  },
  tabletTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 32,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(252, 211, 77, 0.1)',
  },
  tabletTopBarTitle: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  tabletSettingsButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabletContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 40,
    paddingVertical: 60,
  },
  leftColumn: {
    flex: 1,
    gap: 40,
  },
  rightColumn: {
    flex: 1,
    gap: 32,
  },
  tabletHeroArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statsGrid: {
    gap: 24,
  },
  statCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    overflow: 'hidden',
  },
  statCardContent: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  statLabel: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
  },
  tabletPrimaryCta: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
  },
  tabletSecondaryCta: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
  },
  tabletCtaBlur: {
    flex: 1,
    borderWidth: 3,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  tabletCtaGradient: {
    flex: 1,
    padding: 48,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  tabletCtaTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  tabletCtaSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  captionContainer: {
    paddingTop: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(252, 211, 77, 0.2)',
  },
  captionText: {
    fontSize: 32,
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
