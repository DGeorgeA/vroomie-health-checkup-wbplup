
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import TopNavigation from '@/components/TopNavigation';
import { colors } from '@/styles/commonStyles';
import { mockAnalyses, mockVehicles, mockReports } from '@/data/mockData';
import { Anomaly } from '@/types/entities';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnalysisDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const analysis = mockAnalyses.find(a => a.id === id);
  const vehicle = analysis ? mockVehicles.find(v => v.id === analysis.vehicle_id) : null;
  const reports = analysis ? mockReports.filter(r => r.analysis_id === analysis.id) : [];

  if (!analysis || !vehicle) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#18181b', '#27272a', '#18181b']}
          style={styles.gradient}
        >
          <TopNavigation />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Analysis not found</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const getStatusInfo = () => {
    if (analysis.anomaly_score >= 80) {
      return { label: 'Critical', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.2)' };
    } else if (analysis.anomaly_score >= 60) {
      return { label: 'Warning', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.2)' };
    } else if (analysis.anomaly_score >= 30) {
      return { label: 'Caution', color: '#FBBF24', bgColor: 'rgba(251, 191, 36, 0.2)' };
    } else {
      return { label: 'Healthy', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.2)' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#FBBF24';
      case 'medium': return '#F97316';
      case 'high': return '#DC2626';
      case 'critical': return '#C026D3';
      default: return colors.textSecondary;
    }
  };

  const statusInfo = getStatusInfo();

  const generateMechanicReport = () => {
    Alert.alert(
      'Generate Mechanic Report',
      'This will create a detailed mechanic report based on the analysis.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Generate', 
          onPress: () => {
            Alert.alert('Success', 'Mechanic report generated successfully!');
            router.push('/reports');
          }
        },
      ]
    );
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

          <Text style={styles.title}>Analysis Report</Text>
          <Text style={styles.subtitle}>
            {new Date(analysis.created_at).toLocaleDateString()} at{' '}
            {new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          {/* Two Column Layout */}
          <View style={styles.columnsContainer}>
            {/* Left Column - Summary */}
            <View style={styles.leftColumn}>
              <BlurView intensity={20} style={styles.summaryCard}>
                <View style={styles.summaryContent}>
                  <View style={styles.vehicleInfo}>
                    <IconSymbol
                      ios_icon_name="car.fill"
                      android_material_icon_name="directions-car"
                      size={32}
                      color={colors.primary}
                    />
                    <View style={styles.vehicleDetails}>
                      <Text style={styles.vehicleName}>
                        {vehicle.make} {vehicle.model}
                      </Text>
                      <Text style={styles.vehicleYear}>{vehicle.year}</Text>
                    </View>
                  </View>

                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Duration</Text>
                      <Text style={styles.statValue}>{analysis.duration_seconds}s</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Anomaly Score</Text>
                      <Text style={[styles.statValue, { color: statusInfo.color }]}>
                        {analysis.anomaly_score}/100
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                    <IconSymbol
                      ios_icon_name={analysis.anomaly_detected ? 'exclamationmark.triangle.fill' : 'checkmark.circle.fill'}
                      android_material_icon_name={analysis.anomaly_detected ? 'warning' : 'check-circle'}
                      size={24}
                      color={statusInfo.color}
                    />
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {statusInfo.label}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.generateButton}
                    onPress={generateMechanicReport}
                  >
                    <BlurView intensity={30} style={styles.generateButtonBlur}>
                      <View style={styles.generateButtonContent}>
                        <IconSymbol
                          ios_icon_name="doc.text.fill"
                          android_material_icon_name="description"
                          size={24}
                          color={colors.primary}
                        />
                        <Text style={styles.generateButtonText}>Generate Mechanic Report</Text>
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                </View>
              </BlurView>

              {/* Mini Waveform */}
              <BlurView intensity={20} style={styles.waveformCard}>
                <View style={styles.waveformCardContent}>
                  <Text style={styles.waveformCardTitle}>Waveform Analysis</Text>
                  <MiniWaveform anomalies={analysis.anomalies} duration={analysis.duration_seconds} />
                </View>
              </BlurView>
            </View>

            {/* Right Column - Anomalies */}
            <View style={styles.rightColumn}>
              <BlurView intensity={20} style={styles.anomaliesCard}>
                <View style={styles.anomaliesContent}>
                  <View style={styles.anomaliesHeader}>
                    <Text style={styles.anomaliesTitle}>Detected Anomalies</Text>
                    <View style={styles.anomalyCountBadge}>
                      <Text style={styles.anomalyCountText}>{analysis.anomalies.length}</Text>
                    </View>
                  </View>

                  {analysis.anomalies.length === 0 ? (
                    <View style={styles.noAnomalies}>
                      <IconSymbol
                        ios_icon_name="checkmark.circle.fill"
                        android_material_icon_name="check-circle"
                        size={48}
                        color="#10B981"
                      />
                      <Text style={styles.noAnomaliesText}>No anomalies detected</Text>
                      <Text style={styles.noAnomaliesSubtext}>Engine sounds healthy</Text>
                    </View>
                  ) : (
                    <ScrollView style={styles.anomaliesList} showsVerticalScrollIndicator={false}>
                      {analysis.anomalies.map((anomaly, index) => (
                        <React.Fragment key={index}>
                          <View
                            style={[
                              styles.anomalyItem,
                              { borderColor: getSeverityColor(anomaly.severity) },
                            ]}
                          >
                            <View style={styles.anomalyHeader}>
                              <View
                                style={[
                                  styles.severityBadge,
                                  { backgroundColor: `${getSeverityColor(anomaly.severity)}20` },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.severityText,
                                    { color: getSeverityColor(anomaly.severity) },
                                  ]}
                                >
                                  {anomaly.severity.toUpperCase()}
                                </Text>
                              </View>
                              <Text style={styles.anomalyTime}>
                                {(anomaly.timestamp_ms / 1000).toFixed(1)}s
                              </Text>
                            </View>
                            <Text style={styles.anomalyFrequency}>{anomaly.frequency_range}</Text>
                          </View>
                        </React.Fragment>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </BlurView>

              {/* Existing Reports */}
              {reports.length > 0 && (
                <BlurView intensity={20} style={styles.reportsCard}>
                  <View style={styles.reportsContent}>
                    <Text style={styles.reportsTitle}>Mechanic Reports</Text>
                    {reports.map((report, index) => (
                      <React.Fragment key={index}>
                        <View style={styles.reportItem}>
                          <View style={styles.reportHeader}>
                            <IconSymbol
                              ios_icon_name="wrench.fill"
                              android_material_icon_name="build"
                              size={20}
                              color={colors.primary}
                            />
                            <Text style={styles.reportDate}>
                              {new Date(report.created_at).toLocaleDateString()}
                            </Text>
                          </View>
                          <Text style={styles.reportSummary} numberOfLines={2}>
                            {report.issue_summary}
                          </Text>
                          <Text style={styles.reportCost}>
                            Est. Cost: ${report.estimated_cost}
                          </Text>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                </BlurView>
              )}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// Mini waveform component with anomaly markers
const MiniWaveform = ({ anomalies, duration }: { anomalies: Anomaly[]; duration: number }) => {
  return (
    <View style={styles.miniWaveform}>
      <View style={styles.miniWaveformBars}>
        {[...Array(60)].map((_, index) => {
          const height = 20 + Math.random() * 40;
          return (
            <View
              key={index}
              style={[
                styles.miniWaveformBar,
                { height },
              ]}
            />
          );
        })}
      </View>
      
      {/* Anomaly markers */}
      {anomalies.map((anomaly, index) => {
        const position = (anomaly.timestamp_ms / (duration * 1000)) * 100;
        const color = 
          anomaly.severity === 'critical' ? '#C026D3' :
          anomaly.severity === 'high' ? '#DC2626' :
          anomaly.severity === 'medium' ? '#F97316' : '#FBBF24';
        
        return (
          <View
            key={index}
            style={[
              styles.anomalyMarker,
              { left: `${position}%`, backgroundColor: color },
            ]}
          />
        );
      })}
    </View>
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
  columnsContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 20,
  },
  leftColumn: {
    flex: 1,
    gap: 20,
  },
  rightColumn: {
    flex: 1,
    gap: 20,
  },
  summaryCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
  },
  summaryContent: {
    padding: 20,
    gap: 20,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.2)',
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  vehicleYear: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonBlur: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.5)',
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 12,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  waveformCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
  },
  waveformCardContent: {
    padding: 20,
  },
  waveformCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  miniWaveform: {
    height: 100,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  miniWaveformBars: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 4,
    gap: 1,
  },
  miniWaveformBar: {
    flex: 1,
    backgroundColor: 'rgba(252, 211, 77, 0.4)',
    borderRadius: 1,
  },
  anomalyMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  anomaliesCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    minHeight: 400,
  },
  anomaliesContent: {
    padding: 20,
    flex: 1,
  },
  anomaliesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  anomaliesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  anomalyCountBadge: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  anomalyCountText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  noAnomalies: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noAnomaliesText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  noAnomaliesSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  anomaliesList: {
    flex: 1,
  },
  anomalyItem: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  anomalyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  anomalyTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  anomalyFrequency: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  reportsCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
  },
  reportsContent: {
    padding: 20,
  },
  reportsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  reportItem: {
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reportSummary: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  reportCost: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.text,
  },
});
