
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

export default function PhoneScreenshot1() {
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
          'Right-click the image and save it as phone-screenshot-1-1080x1920.png',
          [{ text: 'OK' }]
        );
      } else {
        const fileName = `phone-screenshot-1-1080x1920-${Date.now()}.png`;
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
        
        <Text style={styles.title}>Phone Screenshot 1</Text>
        
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
                <VroomieLogo size={60} disableRotation />
                <Text style={styles.phoneTopBarTitle}>#1 Remote Car Health Check-Up</Text>
                <View style={styles.phoneSettingsButton}>
                  <IconSymbol
                    ios_icon_name="gearshape.fill"
                    android_material_icon_name="settings"
                    size={28}
                    color={colors.primary}
                  />
                </View>
              </View>

              {/* Hero Area */}
              <View style={styles.phoneHeroArea}>
                <VroomieText size={120} />
              </View>

              {/* CTAs */}
              <View style={styles.phoneCtaContainer}>
                <View style={styles.phonePrimaryCta}>
                  <BlurView intensity={30} style={styles.phoneCtaBlur}>
                    <LinearGradient
                      colors={['rgba(252, 211, 77, 0.3)', 'rgba(252, 211, 77, 0.1)']}
                      style={styles.phoneCtaGradient}
                    >
                      <IconSymbol
                        ios_icon_name="waveform.circle.fill"
                        android_material_icon_name="graphic-eq"
                        size={64}
                        color={colors.primary}
                      />
                      <Text style={styles.phoneCtaTitle}>Start Health CheckUp</Text>
                    </LinearGradient>
                  </BlurView>
                </View>

                <View style={styles.phoneSecondaryCta}>
                  <BlurView intensity={30} style={styles.phoneCtaBlur}>
                    <LinearGradient
                      colors={['rgba(252, 211, 77, 0.2)', 'rgba(252, 211, 77, 0.05)']}
                      style={styles.phoneCtaGradient}
                    >
                      <IconSymbol
                        ios_icon_name="doc.text.fill"
                        android_material_icon_name="description"
                        size={64}
                        color={colors.primary}
                      />
                      <Text style={styles.phoneCtaTitle}>View Reports</Text>
                    </LinearGradient>
                  </BlurView>
                </View>
              </View>

              {/* Info Cards */}
              <View style={styles.phoneInfoCards}>
                <BlurView intensity={20} style={styles.phoneInfoCard}>
                  <View style={styles.phoneInfoCardContent}>
                    <IconSymbol
                      ios_icon_name="checkmark.circle.fill"
                      android_material_icon_name="check-circle"
                      size={32}
                      color="#10B981"
                    />
                    <Text style={styles.phoneInfoCardLabel}>Last Result</Text>
                    <Text style={[styles.phoneInfoCardValue, { color: '#10B981' }]}>
                      Healthy
                    </Text>
                  </View>
                </BlurView>

                <BlurView intensity={20} style={styles.phoneInfoCard}>
                  <View style={styles.phoneInfoCardContent}>
                    <IconSymbol
                      ios_icon_name="chart.bar.fill"
                      android_material_icon_name="bar-chart"
                      size={32}
                      color={colors.primary}
                    />
                    <Text style={styles.phoneInfoCardLabel}>Total Sessions</Text>
                    <Text style={styles.phoneInfoCardValue}>24</Text>
                  </View>
                </BlurView>

                <BlurView intensity={20} style={styles.phoneInfoCard}>
                  <View style={styles.phoneInfoCardContent}>
                    <IconSymbol
                      ios_icon_name="exclamationmark.triangle.fill"
                      android_material_icon_name="warning"
                      size={32}
                      color="#F97316"
                    />
                    <Text style={styles.phoneInfoCardLabel}>Latest Severity</Text>
                    <Text style={styles.phoneInfoCardValue}>32/100</Text>
                  </View>
                </BlurView>
              </View>

              {/* Caption */}
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>
                  AI-powered vehicle diagnostics at your fingertips
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Google Play Requirements:</Text>
          <Text style={styles.infoText}>- Size: 1080 x 1920 px (portrait)</Text>
          <Text style={styles.infoText}>- Format: PNG or JPG</Text>
          <Text style={styles.infoText}>- Minimum 2 screenshots required</Text>
          <Text style={styles.infoText}>- Shows: Dashboard with CTAs</Text>
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
  phoneTopBarTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  phoneSettingsButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneHeroArea: {
    alignItems: 'center',
    marginVertical: 80,
  },
  phoneCtaContainer: {
    gap: 24,
    marginBottom: 48,
  },
  phonePrimaryCta: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  phoneSecondaryCta: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  phoneCtaBlur: {
    borderWidth: 3,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  phoneCtaGradient: {
    padding: 48,
    alignItems: 'center',
    gap: 16,
  },
  phoneCtaTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  phoneInfoCards: {
    gap: 20,
  },
  phoneInfoCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    overflow: 'hidden',
  },
  phoneInfoCardContent: {
    padding: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  phoneInfoCardLabel: {
    flex: 1,
    fontSize: 22,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  phoneInfoCardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  captionContainer: {
    marginTop: 60,
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
