
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, TextInput, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import TopNavigation from '@/components/TopNavigation';
import { Footer } from '@/components/Footer';
import { toast } from '@/components/Toast';
import { colors } from '@/styles/commonStyles';
import { mockAnalyses, mockVehicles, mockReports } from '@/data/mockData';
import { Anomaly, MechanicReport } from '@/types/entities';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RECOMMENDED_ACTIONS_OPTIONS = [
  'Inspect engine mounts',
  'Replace spark plugs',
  'Check belt tension',
  'Inspect timing chain',
  'Check engine oil level',
  'Replace air filter',
  'Inspect exhaust system',
  'Check coolant level',
  'Inspect brake system',
  'Replace fuel filter',
  'Check transmission fluid',
  'Inspect suspension components',
];

export default function AnalysisDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [analysis, setAnalysis] = useState(mockAnalyses.find(a => a.id === id));
  const vehicle = analysis ? mockVehicles.find(v => v.id === analysis.vehicle_id) : null;
  const [reports, setReports] = useState(mockReports.filter(r => r.analysis_id === id));
  
  const [modalVisible, setModalVisible] = useState(false);
  const [issueSummary, setIssueSummary] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!analysis || !vehicle) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#18181b', '#27272a', '#18181b']}
          style={styles.gradient}
        >
          <TopNavigation />
          <View style={styles.errorContainer}>
            <IconSymbol
              ios_icon_name="exclamationmark.triangle"
              android_material_icon_name="error"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={styles.errorTitle}>Analysis not found</Text>
            <Text style={styles.errorText}>The requested analysis could not be found</Text>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={() => router.back()}
            >
              <Text style={styles.errorButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const getStatusInfo = () => {
    if (analysis.anomaly_score >= 81) {
      return { label: 'Critical', color: '#C026D3', bgColor: 'rgba(192, 38, 211, 0.2)' };
    } else if (analysis.anomaly_score >= 51) {
      return { label: 'High', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.2)' };
    } else if (analysis.anomaly_score >= 21) {
      return { label: 'Medium', color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.2)' };
    } else {
      return { label: 'Low', color: '#FBBF24', bgColor: 'rgba(251, 191, 36, 0.2)' };
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

  const generateSeverity = (anomalyScore: number): 'low' | 'medium' | 'high' | 'critical' => {
    if (anomalyScore <= 20) return 'low';
    if (anomalyScore <= 50) return 'medium';
    if (anomalyScore <= 80) return 'high';
    return 'critical';
  };

  const handleGenerateReport = () => {
    setIssueSummary('');
    setEstimatedCost('');
    setSelectedActions([]);
    setModalVisible(true);
  };

  const toggleAction = (action: string) => {
    setSelectedActions(prev => 
      prev.includes(action) 
        ? prev.filter(a => a !== action)
        : [...prev, action]
    );
  };

  const handleSaveReport = () => {
    if (!issueSummary.trim()) {
      toast.error('Please enter an issue summary');
      return;
    }
    if (!estimatedCost || parseFloat(estimatedCost) <= 0) {
      toast.error('Please enter a valid estimated cost');
      return;
    }
    if (selectedActions.length === 0) {
      toast.error('Please select at least one recommended action');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      const severity = generateSeverity(analysis.anomaly_score);
      const newReport: MechanicReport = {
        id: `report-${Date.now()}`,
        analysis_id: analysis.id,
        severity,
        estimated_cost: parseFloat(estimatedCost),
        issue_summary: issueSummary,
        recommended_actions: selectedActions,
        created_at: new Date().toISOString(),
      };

      mockReports.push(newReport);
      setReports(prev => [...prev, newReport]);
      
      setIsSaving(false);
      setModalVisible(false);
      
      toast.success('Mechanic report generated successfully!');
      
      setTimeout(() => {
        router.push('/reports');
      }, 1000);
    }, 1500);
  };

  const statusInfo = getStatusInfo();

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

          <Text style={styles.title}>Analysis Report</Text>
          <Text style={styles.subtitle}>
            {new Date(analysis.created_at).toLocaleDateString()} at{' '}
            {new Date(analysis.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>

          <View style={styles.columnsContainer}>
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
                    onPress={handleGenerateReport}
                    accessibilityLabel="Generate mechanic report"
                    accessibilityRole="button"
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

              <BlurView intensity={20} style={styles.waveformCard}>
                <View style={styles.waveformCardContent}>
                  <Text style={styles.waveformCardTitle}>Waveform Analysis</Text>
                  <MiniWaveform anomalies={analysis.anomalies} duration={analysis.duration_seconds} />
                  <Text style={styles.waveformDescription} accessibilityLabel={`Waveform showing ${analysis.anomalies.length} anomalies detected`}>
                    {analysis.anomalies.length} anomaly markers displayed on timeline
                  </Text>
                </View>
              </BlurView>
            </View>

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
                        <View
                          key={index}
                          style={[
                            styles.anomalyItem,
                            { 
                              borderColor: getSeverityColor(anomaly.severity),
                              shadowColor: getSeverityColor(anomaly.severity),
                            },
                          ]}
                          accessibilityLabel={`Anomaly ${index + 1}: ${anomaly.severity} severity at ${(anomaly.timestamp_ms / 1000).toFixed(1)} seconds, frequency ${anomaly.frequency_range}`}
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
                      ))}
                    </ScrollView>
                  )}
                </View>
              </BlurView>

              {reports.length > 0 && (
                <BlurView intensity={20} style={styles.reportsCard}>
                  <View style={styles.reportsContent}>
                    <Text style={styles.reportsTitle}>Mechanic Reports</Text>
                    {reports.map((report, index) => (
                      <View key={index} style={styles.reportItem}>
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
                    ))}
                  </View>
                </BlurView>
              )}
            </View>
          </View>
        </ScrollView>

        <Footer />
      </LinearGradient>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={80} style={styles.modalBlur}>
            <View style={styles.modalContainer}>
              <ScrollView 
                style={styles.modalScroll}
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Generate Mechanic Report</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.modalClose}
                    accessibilityLabel="Close modal"
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

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Issue Summary *</Text>
                  <TextInput
                    style={styles.textArea}
                    value={issueSummary}
                    onChangeText={setIssueSummary}
                    placeholder="Describe the issues found..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    numberOfLines={4}
                    accessibilityLabel="Issue summary input"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Estimated Cost ($) *</Text>
                  <TextInput
                    style={styles.input}
                    value={estimatedCost}
                    onChangeText={setEstimatedCost}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="decimal-pad"
                    accessibilityLabel="Estimated cost input"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Recommended Actions *</Text>
                  <Text style={styles.formHint}>Select all that apply</Text>
                  <View style={styles.actionsGrid}>
                    {RECOMMENDED_ACTIONS_OPTIONS.map((action, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.actionChip,
                          selectedActions.includes(action) && styles.actionChipSelected,
                        ]}
                        onPress={() => toggleAction(action)}
                        accessibilityLabel={`${action}, ${selectedActions.includes(action) ? 'selected' : 'not selected'}`}
                        accessibilityRole="checkbox"
                      >
                        <Text
                          style={[
                            styles.actionChipText,
                            selectedActions.includes(action) && styles.actionChipTextSelected,
                          ]}
                        >
                          {action}
                        </Text>
                        {selectedActions.includes(action) && (
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check-circle"
                            size={16}
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                    accessibilityLabel="Cancel"
                    accessibilityRole="button"
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSaveReport}
                    disabled={isSaving}
                    accessibilityLabel={isSaving ? 'Saving report' : 'Save report'}
                    accessibilityRole="button"
                  >
                    <Text style={styles.saveButtonText}>
                      {isSaving ? 'Saving...' : 'Save Report'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
}

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
      
      {anomalies.map((anomaly, index) => {
        const position = (anomaly.timestamp_ms / (duration * 1000)) * 100;
        const color = getSeverityColor(anomaly.severity);
        
        return (
          <View
            key={index}
            style={[
              styles.anomalyMarker,
              { 
                left: `${position}%`, 
                backgroundColor: color,
                shadowColor: color,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low': return '#FBBF24';
    case 'medium': return '#F97316';
    case 'high': return '#DC2626';
    case 'critical': return '#C026D3';
    default: return '#71717a';
  }
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
    paddingBottom: 100,
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
    borderWidth: 2,
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  waveformDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 12,
    textAlign: 'center',
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
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
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.5)',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBlur: {
    width: Platform.OS === 'web' ? '90%' : '100%',
    maxWidth: 600,
    maxHeight: '90%',
    borderRadius: 24,
    overflow: 'hidden',
    margin: 20,
  },
  modalContainer: {
    backgroundColor: 'rgba(39, 39, 42, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    flex: 1,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
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
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  formHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionChipSelected: {
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderColor: 'rgba(252, 211, 77, 0.6)',
  },
  actionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  actionChipTextSelected: {
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.6)',
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
});
