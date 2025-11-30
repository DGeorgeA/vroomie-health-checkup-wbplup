
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import VroomieLogo from '@/components/VroomieLogo';
import VroomieText from '@/components/VroomieText';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@/types/entities';

export default function DashboardScreen() {
  const router = useRouter();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [logoRotationDisabled, setLogoRotationDisabled] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    loadSettings();
    loadSessions();
  }, []);

  const loadSettings = async () => {
    const savedRotation = await AsyncStorage.getItem('logoRotationDisabled');
    const savedMotion = await AsyncStorage.getItem('reduceMotion');
    const savedContrast = await AsyncStorage.getItem('highContrast');
    
    if (savedRotation) setLogoRotationDisabled(JSON.parse(savedRotation));
    if (savedMotion) setReduceMotion(JSON.parse(savedMotion));
    if (savedContrast) setHighContrast(JSON.parse(savedContrast));
  };

  const loadSessions = async () => {
    const savedSessions = await AsyncStorage.getItem('sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  };

  const toggleLogoRotation = async () => {
    const newValue = !logoRotationDisabled;
    setLogoRotationDisabled(newValue);
    await AsyncStorage.setItem('logoRotationDisabled', JSON.stringify(newValue));
  };

  const toggleReduceMotion = async () => {
    const newValue = !reduceMotion;
    setReduceMotion(newValue);
    await AsyncStorage.setItem('reduceMotion', JSON.stringify(newValue));
  };

  const toggleHighContrast = async () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    await AsyncStorage.setItem('highContrast', JSON.stringify(newValue));
  };

  const totalSessions = sessions.length;
  const lastCheck = sessions.length > 0 ? sessions[0] : null;
  const latestSeverity = lastCheck 
    ? lastCheck.anomalyScore >= 51 ? 'Issues Found' : 'Healthy'
    : 'No Data';
  const latestSeverityColor = lastCheck 
    ? lastCheck.anomalyScore >= 51 ? '#F97316' : '#10B981'
    : colors.textSecondary;

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
            style={styles.settingsButton}
            onPress={() => setSettingsVisible(true)}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <IconSymbol
              ios_icon_name="gearshape.fill"
              android_material_icon_name="settings"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heroArea}>
            <View style={styles.shimmeringBackground} />
            <VroomieText size={80} />
          </View>

          <View style={styles.ctaContainer}>
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => router.push('/health-checkup')}
              activeOpacity={0.8}
              accessibilityLabel="Start Health CheckUp"
              accessibilityRole="button"
            >
              <BlurView intensity={30} style={styles.ctaBlur}>
                <LinearGradient
                  colors={['rgba(252, 211, 77, 0.3)', 'rgba(252, 211, 77, 0.1)']}
                  style={styles.ctaGradient}
                >
                  <IconSymbol
                    ios_icon_name="waveform.circle.fill"
                    android_material_icon_name="graphic-eq"
                    size={48}
                    color={colors.primary}
                  />
                  <Text style={styles.ctaTitle}>Start Health CheckUp</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryCta}
              onPress={() => router.push('/reports')}
              activeOpacity={0.8}
              accessibilityLabel="View Reports"
              accessibilityRole="button"
            >
              <BlurView intensity={30} style={styles.ctaBlur}>
                <LinearGradient
                  colors={['rgba(252, 211, 77, 0.2)', 'rgba(252, 211, 77, 0.05)']}
                  style={styles.ctaGradient}
                >
                  <IconSymbol
                    ios_icon_name="doc.text.fill"
                    android_material_icon_name="description"
                    size={48}
                    color={colors.primary}
                  />
                  <Text style={styles.ctaTitle}>View Reports</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCards}>
            <BlurView intensity={20} style={styles.infoCard}>
              <View style={styles.infoCardContent}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={24}
                  color={latestSeverityColor}
                />
                <Text style={styles.infoCardLabel}>Last Result</Text>
                <Text style={[styles.infoCardValue, { color: latestSeverityColor }]}>
                  {latestSeverity}
                </Text>
              </View>
            </BlurView>

            <BlurView intensity={20} style={styles.infoCard}>
              <View style={styles.infoCardContent}>
                <IconSymbol
                  ios_icon_name="chart.bar.fill"
                  android_material_icon_name="bar-chart"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.infoCardLabel}>Total Sessions</Text>
                <Text style={styles.infoCardValue}>{totalSessions}</Text>
              </View>
            </BlurView>

            <BlurView intensity={20} style={styles.infoCard}>
              <View style={styles.infoCardContent}>
                <IconSymbol
                  ios_icon_name="exclamationmark.triangle.fill"
                  android_material_icon_name="warning"
                  size={24}
                  color="#F97316"
                />
                <Text style={styles.infoCardLabel}>Latest Severity</Text>
                <Text style={styles.infoCardValue}>
                  {lastCheck ? `${lastCheck.anomalyScore}/100` : 'N/A'}
                </Text>
              </View>
            </BlurView>
          </View>
        </ScrollView>
      </LinearGradient>

      <Modal
        visible={settingsVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} style={styles.modalBlur}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Settings</Text>
                <TouchableOpacity
                  onPress={() => setSettingsVisible(false)}
                  style={styles.modalClose}
                  accessibilityLabel="Close settings"
                  accessibilityRole="button"
                >
                  <IconSymbol
                    ios_icon_name="xmark.circle.fill"
                    android_material_icon_name="cancel"
                    size={28}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Disable Mascot Rotation</Text>
                  <Text style={styles.settingDescription}>
                    Turn off mascot rotation for accessibility
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, logoRotationDisabled && styles.toggleActive]}
                  onPress={toggleLogoRotation}
                  accessibilityLabel={`Mascot rotation ${logoRotationDisabled ? 'disabled' : 'enabled'}`}
                  accessibilityRole="switch"
                >
                  <View style={[styles.toggleThumb, logoRotationDisabled && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Reduce Motion</Text>
                  <Text style={styles.settingDescription}>
                    Minimize animations and transitions
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, reduceMotion && styles.toggleActive]}
                  onPress={toggleReduceMotion}
                  accessibilityLabel={`Reduce motion ${reduceMotion ? 'enabled' : 'disabled'}`}
                  accessibilityRole="switch"
                >
                  <View style={[styles.toggleThumb, reduceMotion && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>High Contrast Mode</Text>
                  <Text style={styles.settingDescription}>
                    Increase contrast for better visibility
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, highContrast && styles.toggleActive]}
                  onPress={toggleHighContrast}
                  accessibilityLabel={`High contrast ${highContrast ? 'enabled' : 'disabled'}`}
                  accessibilityRole="switch"
                >
                  <View style={[styles.toggleThumb, highContrast && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>
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
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  heroArea: {
    alignItems: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  shimmeringBackground: {
    position: 'absolute',
    top: -40,
    left: -40,
    right: -40,
    bottom: -40,
    backgroundColor: 'rgba(252, 211, 77, 0.05)',
    borderRadius: 200,
    opacity: 0.5,
  },
  ctaContainer: {
    gap: 16,
    marginBottom: 32,
  },
  primaryCta: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  secondaryCta: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  ctaBlur: {
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  ctaGradient: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  infoCards: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    overflow: 'hidden',
  },
  infoCardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  infoCardLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  infoCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBlur: {
    width: Platform.OS === 'web' ? '90%' : '90%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    margin: 20,
  },
  modalContainer: {
    backgroundColor: 'rgba(39, 39, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  modalClose: {
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  toggle: {
    width: 56,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: 'rgba(252, 211, 77, 0.4)',
    borderColor: 'rgba(252, 211, 77, 0.6)',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textSecondary,
  },
  toggleThumbActive: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
});
