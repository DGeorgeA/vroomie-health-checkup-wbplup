
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import TopNavigation from '@/components/TopNavigation';
import { colors } from '@/styles/commonStyles';
import { mockReports, mockAnalyses, mockVehicles } from '@/data/mockData';

export default function ReportsScreen() {
  const router = useRouter();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return colors.textSecondary;
    }
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

          <Text style={styles.title}>Diagnostic Reports</Text>
          <Text style={styles.subtitle}>View your vehicle analysis history</Text>

          {mockReports.length === 0 ? (
            <BlurView intensity={20} style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <IconSymbol
                  ios_icon_name="doc.text"
                  android_material_icon_name="description"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyTitle}>No Reports Yet</Text>
                <Text style={styles.emptyText}>
                  Start a health checkup to generate your first diagnostic report
                </Text>
              </View>
            </BlurView>
          ) : (
            <View style={styles.reportsList}>
              {mockReports.map((report, index) => {
                const analysis = mockAnalyses.find(a => a.id === report.analysis_id);
                const vehicle = mockVehicles.find(v => v.id === analysis?.vehicle_id);
                
                return (
                  <React.Fragment key={index}>
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
                              <Text style={styles.reportDate}>
                                {new Date(report.created_at).toLocaleDateString()}
                              </Text>
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

                        <Text style={styles.issueSummary}>{report.issue_summary}</Text>

                        <View style={styles.costContainer}>
                          <IconSymbol
                            ios_icon_name="dollarsign.circle"
                            android_material_icon_name="attach-money"
                            size={20}
                            color={colors.primary}
                          />
                          <Text style={styles.costText}>
                            Estimated Cost: ${report.estimated_cost}
                          </Text>
                        </View>

                        <View style={styles.actionsContainer}>
                          <Text style={styles.actionsTitle}>Recommended Actions:</Text>
                          {report.recommended_actions.map((action, actionIndex) => (
                            <React.Fragment key={actionIndex}>
                              <Text style={styles.actionItem}>• {action}</Text>
                            </React.Fragment>
                          ))}
                        </View>

                        {analysis && (
                          <View style={styles.analysisInfo}>
                            <View style={styles.analysisInfoItem}>
                              <Text style={styles.analysisInfoLabel}>Anomaly Score</Text>
                              <Text style={styles.analysisInfoValue}>
                                {analysis.anomaly_score}/100
                              </Text>
                            </View>
                            <View style={styles.analysisInfoItem}>
                              <Text style={styles.analysisInfoLabel}>Duration</Text>
                              <Text style={styles.analysisInfoValue}>
                                {analysis.duration_seconds}s
                              </Text>
                            </View>
                            <View style={styles.analysisInfoItem}>
                              <Text style={styles.analysisInfoLabel}>Anomalies</Text>
                              <Text style={styles.analysisInfoValue}>
                                {analysis.anomalies.length}
                              </Text>
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
  reportDate: {
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
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
  },
  costText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  actionItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  analysisInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(252, 211, 77, 0.2)',
  },
  analysisInfoItem: {
    alignItems: 'center',
  },
  analysisInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  analysisInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
