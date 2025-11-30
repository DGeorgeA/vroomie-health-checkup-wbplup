
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import VroomieLogo from '@/components/VroomieLogo';
import { colors } from '@/styles/commonStyles';
import { mockAnalyses } from '@/data/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ReportsScreen() {
  const router = useRouter();
  const [logoRotationDisabled, setLogoRotationDisabled] = useState(false);

  React.useEffect(() => {
    const loadSettings = async () => {
      const saved = await AsyncStorage.getItem('logoRotationDisabled');
      if (saved) {
        setLogoRotationDisabled(JSON.parse(saved));
      }
    };
    loadSettings();
  }, []);

  const getSeverityColor = (score: number) => {
    if (score >= 81) return '#C026D3';
    if (score >= 51) return '#DC2626';
    if (score >= 21) return '#F97316';
    return '#10B981';
  };

  const getSeverityLabel = (score: number) => {
    if (score >= 81) return 'Critical';
    if (score >= 51) return 'High';
    if (score >= 21) return 'Medium';
    return 'Healthy';
  };

  const handleBack = () => {
    router.back();
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
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>Past health checkup results</Text>

          {mockAnalyses.length === 0 ? (
            <BlurView intensity={20} style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <IconSymbol
                  ios_icon_name="doc.text"
                  android_material_icon_name="description"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyTitle}>No reports yet</Text>
                <Text style={styles.emptyText}>
                  Start a health checkup to generate your first report
                </Text>
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={() => router.push('/health-checkup')}
                  accessibilityLabel="Start health checkup"
                  accessibilityRole="button"
                >
                  <Text style={styles.emptyButtonText}>Start CheckUp</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          ) : (
            <View style={styles.reportsList}>
              {mockAnalyses.map((analysis, index) => {
                const severityColor = getSeverityColor(analysis.anomaly_score);
                const severityLabel = getSeverityLabel(analysis.anomaly_score);

                return (
                  <React.Fragment key={index}>
                    <BlurView intensity={20} style={styles.reportCard}>
                      <View style={styles.reportContent}>
                        <View style={styles.reportHeader}>
                          <View style={styles.reportHeaderLeft}>
                            <IconSymbol
                              ios_icon_name={analysis.anomaly_detected ? 'exclamationmark.triangle.fill' : 'checkmark.circle.fill'}
                              android_material_icon_name={analysis.anomaly_detected ? 'warning' : 'check-circle'}
                              size={32}
                              color={severityColor}
                            />
                            <View style={styles.reportHeaderInfo}>
                              <Text style={styles.reportDate}>
                                {new Date(analysis.created_at).toLocaleDateString()}
                              </Text>
                              <Text style={styles.reportTime}>
                                {new Date(analysis.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.severityBadge,
                              { backgroundColor: `${severityColor}20` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.severityText,
                                { color: severityColor },
                              ]}
                            >
                              {severityLabel}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.reportStats}>
                          <View style={styles.reportStat}>
                            <Text style={styles.reportStatLabel}>Score</Text>
                            <Text style={[styles.reportStatValue, { color: severityColor }]}>
                              {analysis.anomaly_score}/100
                            </Text>
                          </View>
                          <View style={styles.reportStat}>
                            <Text style={styles.reportStatLabel}>Duration</Text>
                            <Text style={styles.reportStatValue}>{analysis.duration_seconds}s</Text>
                          </View>
                          <View style={styles.reportStat}>
                            <Text style={styles.reportStatLabel}>Anomalies</Text>
                            <Text style={styles.reportStatValue}>{analysis.anomalies.length}</Text>
                          </View>
                        </View>

                        {analysis.anomalies.length > 0 && (
                          <View style={styles.anomaliesPreview}>
                            <Text style={styles.anomaliesPreviewTitle}>Detected Issues:</Text>
                            <View style={styles.anomaliesPreviewList}>
                              {analysis.anomalies.slice(0, 3).map((anomaly, aIndex) => (
                                <View
                                  key={aIndex}
                                  style={[
                                    styles.anomalyChip,
                                    { borderColor: getSeverityColor(
                                      anomaly.severity === 'critical' ? 90 :
                                      anomaly.severity === 'high' ? 70 :
                                      anomaly.severity === 'medium' ? 40 : 15
                                    )},
                                  ]}
                                >
                                  <Text style={styles.anomalyChipText}>
                                    {anomaly.severity} @ {(anomaly.timestamp_ms / 1000).toFixed(1)}s
                                  </Text>
                                </View>
                              ))}
                              {analysis.anomalies.length > 3 && (
                                <Text style={styles.moreAnomalies}>
                                  +{analysis.anomalies.length - 3} more
                                </Text>
                              )}
                            </View>
                          </View>
                        )}
                      </View>
                    </BlurView>
                  </React.Fragment>
                );
              })}
            </View>
          )}
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
  emptyCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    padding: 48,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.5)',
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  reportsList: {
    gap: 16,
  },
  reportCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  reportContent: {
    padding: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  reportHeaderInfo: {
    flex: 1,
  },
  reportDate: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  reportTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  severityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(252, 211, 77, 0.1)',
  },
  reportStat: {
    alignItems: 'center',
  },
  reportStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reportStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  anomaliesPreview: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(252, 211, 77, 0.1)',
  },
  anomaliesPreviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  anomaliesPreviewList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  anomalyChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(252, 211, 77, 0.05)',
  },
  anomalyChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  moreAnomalies: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
