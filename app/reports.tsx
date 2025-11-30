
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import TopNavigation from '@/components/TopNavigation';
import { Footer } from '@/components/Footer';
import { SkeletonCard } from '@/components/SkeletonLoader';
import { colors } from '@/styles/commonStyles';
import { mockReports, mockAnalyses, mockVehicles } from '@/data/mockData';
import { MechanicReport } from '@/types/entities';

export default function ReportsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'severity'>('date');
  const [selectedReport, setSelectedReport] = useState<MechanicReport | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const toggleSeverity = (severity: string) => {
    setSelectedSeverities(prev =>
      prev.includes(severity)
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };

  const filteredReports = useMemo(() => {
    let filtered = [...mockReports];

    if (selectedSeverities.length > 0) {
      filtered = filtered.filter(r => selectedSeverities.includes(r.severity));
    }

    if (selectedVehicleId) {
      filtered = filtered.filter(r => {
        const analysis = mockAnalyses.find(a => a.id === r.analysis_id);
        return analysis?.vehicle_id === selectedVehicleId;
      });
    }

    if (dateRange.start) {
      filtered = filtered.filter(r => new Date(r.created_at) >= new Date(dateRange.start));
    }

    if (dateRange.end) {
      filtered = filtered.filter(r => new Date(r.created_at) <= new Date(dateRange.end));
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'cost') {
        return b.estimated_cost - a.estimated_cost;
      } else {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
    });

    return filtered;
  }, [selectedSeverities, selectedVehicleId, dateRange, sortBy]);

  const stats = useMemo(() => {
    const totalReports = mockReports.length;
    const severityCounts = {
      low: mockReports.filter(r => r.severity === 'low').length,
      medium: mockReports.filter(r => r.severity === 'medium').length,
      high: mockReports.filter(r => r.severity === 'high').length,
      critical: mockReports.filter(r => r.severity === 'critical').length,
    };
    const avgCost = mockReports.reduce((sum, r) => sum + r.estimated_cost, 0) / totalReports || 0;
    const vehiclesWithIssues = new Set(
      mockReports.map(r => {
        const analysis = mockAnalyses.find(a => a.id === r.analysis_id);
        return analysis?.vehicle_id;
      })
    ).size;
    const percentFlagged = (vehiclesWithIssues / mockVehicles.length) * 100 || 0;

    return { totalReports, severityCounts, avgCost, percentFlagged };
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#C026D3';
      case 'high': return '#DC2626';
      case 'medium': return '#F97316';
      case 'low': return '#FBBF24';
      default: return colors.textSecondary;
    }
  };

  const viewFullReport = (report: MechanicReport) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  const clearFilters = () => {
    setSelectedSeverities([]);
    setSelectedVehicleId('');
    setDateRange({ start: '', end: '' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181b', '#27272a', '#18181b']}
        style={styles.gradient}
      >
        <TopNavigation />

        <View style={styles.mainContent}>
          {Platform.OS === 'web' && (
            <View style={styles.filterPanel}>
              <BlurView intensity={20} style={styles.filterPanelBlur}>
                <View style={styles.filterPanelContent}>
                  <Text style={styles.filterTitle}>Filters</Text>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Severity</Text>
                    {['low', 'medium', 'high', 'critical'].map((severity, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.checkboxRow}
                        onPress={() => toggleSeverity(severity)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            selectedSeverities.includes(severity) && styles.checkboxChecked,
                            { borderColor: getSeverityColor(severity) },
                          ]}
                        >
                          {selectedSeverities.includes(severity) && (
                            <IconSymbol
                              ios_icon_name="checkmark"
                              android_material_icon_name="check"
                              size={16}
                              color={getSeverityColor(severity)}
                            />
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>{severity.charAt(0).toUpperCase() + severity.slice(1)}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Vehicle</Text>
                    <View style={styles.selectContainer}>
                      <TouchableOpacity
                        style={styles.select}
                        onPress={() => setSelectedVehicleId('')}
                      >
                        <Text style={styles.selectText}>
                          {selectedVehicleId
                            ? mockVehicles.find(v => v.id === selectedVehicleId)?.make + ' ' +
                              mockVehicles.find(v => v.id === selectedVehicleId)?.model
                            : 'All Vehicles'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                    <Text style={styles.clearButtonText}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          )}

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

            <Text style={styles.title}>Reports Center</Text>
            <Text style={styles.subtitle}>Mechanic reports and diagnostics</Text>

            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              <View style={styles.sortButtons}>
                {[
                  { key: 'date', label: 'Date' },
                  { key: 'cost', label: 'Cost' },
                  { key: 'severity', label: 'Severity' },
                ].map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.sortButton,
                      sortBy === option.key && styles.sortButtonActive,
                    ]}
                    onPress={() => setSortBy(option.key as any)}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        sortBy === option.key && styles.sortButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredReports.length === 0 ? (
              <BlurView intensity={20} style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <IconSymbol
                    ios_icon_name="doc.text"
                    android_material_icon_name="description"
                    size={64}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.emptyTitle}>No mechanic reports available</Text>
                  <Text style={styles.emptyText}>
                    {selectedSeverities.length > 0 || selectedVehicleId
                      ? 'Try adjusting your filters'
                      : 'Generate reports from your health checkup analyses'}
                  </Text>
                </View>
              </BlurView>
            ) : (
              <View style={styles.reportsList}>
                {filteredReports.map((report, index) => {
                  const analysis = mockAnalyses.find(a => a.id === report.analysis_id);
                  const vehicle = mockVehicles.find(v => v.id === analysis?.vehicle_id);

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => viewFullReport(report)}
                      activeOpacity={0.8}
                    >
                      <BlurView intensity={20} style={styles.reportCard}>
                        <View style={styles.reportContent}>
                          <View style={styles.reportHeader}>
                            <View style={styles.reportHeaderLeft}>
                              <IconSymbol
                                ios_icon_name="car"
                                android_material_icon_name="directions-car"
                                size={24}
                                color={colors.primary}
                              />
                              <View>
                                <Text style={styles.vehicleName}>
                                  {vehicle?.make} {vehicle?.model}
                                </Text>
                                <Text style={styles.vehicleYear}>{vehicle?.year}</Text>
                              </View>
                            </View>
                            <View
                              style={[
                                styles.severityBadge,
                                { backgroundColor: getSeverityColor(report.severity) + '20' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.severityText,
                                  { color: getSeverityColor(report.severity) },
                                ]}
                              >
                                {report.severity.toUpperCase()}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.issueSummary} numberOfLines={2}>
                            {report.issue_summary}
                          </Text>

                          <View style={styles.reportFooter}>
                            <View style={styles.costContainer}>
                              <IconSymbol
                                ios_icon_name="dollarsign.circle"
                                android_material_icon_name="attach-money"
                                size={20}
                                color={colors.primary}
                              />
                              <Text style={styles.costText}>${report.estimated_cost}</Text>
                            </View>
                            <Text style={styles.reportDate}>
                              {new Date(report.created_at).toLocaleDateString()}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => viewFullReport(report)}
                          >
                            <Text style={styles.viewButtonText}>View Full Report</Text>
                            <IconSymbol
                              ios_icon_name="chevron.right"
                              android_material_icon_name="chevron-right"
                              size={16}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        </View>
                      </BlurView>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {Platform.OS === 'web' && (
            <View style={styles.statsPanel}>
              <BlurView intensity={20} style={styles.statsPanelBlur}>
                <View style={styles.statsPanelContent}>
                  <Text style={styles.statsTitle}>Quick Stats</Text>

                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.totalReports}</Text>
                    <Text style={styles.statLabel}>Total Reports</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statLabel}>By Severity</Text>
                    <View style={styles.severityStats}>
                      {Object.entries(stats.severityCounts).map(([severity, count], index) => (
                        <View key={index} style={styles.severityStatRow}>
                          <View
                            style={[
                              styles.severityDot,
                              { backgroundColor: getSeverityColor(severity) },
                            ]}
                          />
                          <Text style={styles.severityStatLabel}>
                            {severity.charAt(0).toUpperCase() + severity.slice(1)}
                          </Text>
                          <Text style={styles.severityStatValue}>{count}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>${stats.avgCost.toFixed(2)}</Text>
                    <Text style={styles.statLabel}>Avg. Cost</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats.percentFlagged.toFixed(1)}%</Text>
                    <Text style={styles.statLabel}>Vehicles Flagged</Text>
                  </View>
                </View>
              </BlurView>
            </View>
          )}
        </View>

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
                {selectedReport && (
                  <>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Full Report</Text>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        style={styles.modalClose}
                      >
                        <IconSymbol
                          ios_icon_name="xmark.circle.fill"
                          android_material_icon_name="cancel"
                          size={28}
                          color={colors.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Vehicle</Text>
                      <Text style={styles.modalSectionText}>
                        {mockVehicles.find(v =>
                          v.id === mockAnalyses.find(a => a.id === selectedReport.analysis_id)?.vehicle_id
                        )?.make}{' '}
                        {mockVehicles.find(v =>
                          v.id === mockAnalyses.find(a => a.id === selectedReport.analysis_id)?.vehicle_id
                        )?.model}{' '}
                        {mockVehicles.find(v =>
                          v.id === mockAnalyses.find(a => a.id === selectedReport.analysis_id)?.vehicle_id
                        )?.year}
                      </Text>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Severity</Text>
                      <View
                        style={[
                          styles.severityBadge,
                          { backgroundColor: getSeverityColor(selectedReport.severity) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.severityText,
                            { color: getSeverityColor(selectedReport.severity) },
                          ]}
                        >
                          {selectedReport.severity.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Estimated Cost</Text>
                      <Text style={styles.modalCost}>${selectedReport.estimated_cost}</Text>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Issue Summary</Text>
                      <Text style={styles.modalSectionText}>{selectedReport.issue_summary}</Text>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Recommended Actions</Text>
                      {selectedReport.recommended_actions.map((action, index) => (
                        <View key={index} style={styles.actionRow}>
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check-circle"
                            size={20}
                            color={colors.primary}
                          />
                          <Text style={styles.actionText}>{action}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Linked Analysis</Text>
                      <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => {
                          setModalVisible(false);
                          router.push(`/analysis/${selectedReport.analysis_id}` as any);
                        }}
                      >
                        <Text style={styles.linkButtonText}>View Analysis Details</Text>
                        <IconSymbol
                          ios_icon_name="arrow.right.circle.fill"
                          android_material_icon_name="arrow-forward"
                          size={20}
                          color={colors.primary}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Created</Text>
                      <Text style={styles.modalSectionText}>
                        {new Date(selectedReport.created_at).toLocaleString()}
                      </Text>
                    </View>
                  </>
                )}
              </ScrollView>
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
  mainContent: {
    flex: 1,
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    marginTop: Platform.OS === 'android' ? 80 : 0,
  },
  filterPanel: {
    width: 280,
    borderRightWidth: 1,
    borderRightColor: 'rgba(252, 211, 77, 0.2)',
  },
  filterPanelBlur: {
    flex: 1,
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
  },
  filterPanelContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 20,
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.text,
  },
  selectContainer: {
    marginTop: 8,
  },
  select: {
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 12,
  },
  selectText: {
    fontSize: 14,
    color: colors.text,
  },
  clearButton: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 24,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
  },
  sortButtonActive: {
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderColor: 'rgba(252, 211, 77, 0.5)',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortButtonTextActive: {
    color: colors.text,
  },
  emptyCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  reportsList: {
    gap: 16,
  },
  reportCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
  },
  reportContent: {
    padding: 20,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  vehicleYear: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  issueSummary: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  costText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  reportDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 12,
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  statsPanel: {
    width: 280,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(252, 211, 77, 0.2)',
  },
  statsPanelBlur: {
    flex: 1,
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
  },
  statsPanelContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 100 : 20,
    gap: 16,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  statCard: {
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    padding: 16,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  severityStats: {
    marginTop: 12,
    gap: 8,
  },
  severityStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  severityStatLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  severityStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
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
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalSectionText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  modalCost: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 16,
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
