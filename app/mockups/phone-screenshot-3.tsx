
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

export default function PhoneScreenshot3() {
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
          'Right-click the image and save it as phone-screenshot-3-1080x1920.png',
          [{ text: 'OK' }]
        );
      } else {
        const fileName = `phone-screenshot-3-1080x1920-${Date.now()}.png`;
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

  const reports = [
    { id: 1, score: 85, severity: 'Critical', time: '2 hours ago', anomaly: 'Belt Squeal' },
    { id: 2, score: 42, severity: 'Warning', time: '1 day ago', anomaly: 'Engine Knock' },
    { id: 3, score: 18, severity: 'Healthy', time: '3 days ago', anomaly: null },
  ];

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
        
        <Text style={styles.title}>Phone Screenshot 3</Text>
        
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
                <Text style={styles.phoneTopBarTitle}>Health Reports</Text>
                <View style={styles.phoneFilterButton}>
                  <IconSymbol
                    ios_icon_name="line.3.horizontal.decrease.circle.fill"
                    android_material_icon_name="filter-list"
                    size={28}
                    color={colors.primary}
                  />
                </View>
              </View>

              {/* Reports List */}
              <View style={styles.reportsContainer}>
                <Text style={styles.sectionTitle}>Recent Diagnostics</Text>
                
                {reports.map((report, index) => (
                  <BlurView key={report.id} intensity={20} style={styles.reportCard}>
                    <View style={styles.reportContent}>
                      <View style={styles.reportHeader}>
                        <View style={[
                          styles.severityBadge,
                          report.severity === 'Critical' && styles.criticalBadge,
                          report.severity === 'Warning' && styles.warningBadge,
                          report.severity === 'Healthy' && styles.healthyBadge,
                        ]}>
                          <Text style={styles.severityText}>{report.severity}</Text>
                        </View>
                        <Text style={styles.reportTime}>{report.time}</Text>
                      </View>
                      
                      <View style={styles.reportBody}>
                        <View style={styles.scoreContainer}>
                          <Text style={styles.scoreLabel}>Anomaly Score</Text>
                          <Text style={[
                            styles.scoreValue,
                            report.score >= 51 ? styles.scoreHigh : styles.scoreLow
                          ]}>
                            {report.score}/100
                          </Text>
                        </View>
                        
                        {report.anomaly && (
                          <View style={styles.anomalyContainer}>
                            <IconSymbol
                              ios_icon_name="exclamationmark.triangle.fill"
                              android_material_icon_name="warning"
                              size={24}
                              color="#F97316"
                            />
                            <Text style={styles.anomalyText}>
                              Detected: {report.anomaly}
                            </Text>
                          </View>
                        )}
                        
                        {!report.anomaly && (
                          <View style={styles.healthyContainer}>
                            <IconSymbol
                              ios_icon_name="checkmark.circle.fill"
                              android_material_icon_name="check-circle"
                              size={24}
                              color="#10B981"
                            />
                            <Text style={styles.healthyText}>
                              No issues identified — Go VROOMIIEE!!
                            </Text>
                          </View>
                        )}
                      </View>
                      
                      <TouchableOpacity style={styles.viewButton}>
                        <Text style={styles.viewButtonText}>View Details</Text>
                        <IconSymbol
                          ios_icon_name="chevron.right"
                          android_material_icon_name="chevron-right"
                          size={20}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>
                  </BlurView>
                ))}
              </View>

              {/* FAB */}
              <View style={styles.fabContainer}>
                <TouchableOpacity style={styles.fab}>
                  <IconSymbol
                    ios_icon_name="plus"
                    android_material_icon_name="add"
                    size={32}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Caption */}
              <View style={styles.captionContainer}>
                <Text style={styles.captionText}>
                  Track your vehicle&apos;s health history
                </Text>
              </View>
            </LinearGradient>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Google Play Requirements:</Text>
          <Text style={styles.infoText}>- Size: 1080 x 1920 px (portrait)</Text>
          <Text style={styles.infoText}>- Format: PNG or JPG</Text>
          <Text style={styles.infoText}>- Shows: Reports screen with history</Text>
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
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  phoneFilterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportsContainer: {
    flex: 1,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 32,
  },
  reportCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  reportContent: {
    padding: 32,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  severityBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
  },
  criticalBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#EF4444',
  },
  warningBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    borderColor: '#F97316',
  },
  healthyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  severityText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  reportTime: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  reportBody: {
    gap: 20,
    marginBottom: 24,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  scoreLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreHigh: {
    color: '#EF4444',
  },
  scoreLow: {
    color: '#10B981',
  },
  anomalyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  anomalyText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#F97316',
  },
  healthyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  healthyText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
    fontStyle: 'italic',
  },
  viewButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  viewButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: 40,
  },
  fab: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
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
