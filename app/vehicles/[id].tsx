
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import TopNavigation from '@/components/TopNavigation';
import { colors } from '@/styles/commonStyles';
import { mockVehicles, mockAnalyses } from '@/data/mockData';

export default function VehicleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const vehicle = mockVehicles.find(v => v.id === id);
  const vehicleAnalyses = mockAnalyses.filter(a => a.vehicle_id === id);

  if (!vehicle) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#18181b', '#27272a', '#18181b']}
          style={styles.gradient}
        >
          <TopNavigation />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Vehicle not found</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

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

          <BlurView intensity={20} style={styles.vehicleHeader}>
            <View style={styles.vehicleHeaderContent}>
              <View style={styles.vehicleIconLarge}>
                <IconSymbol
                  ios_icon_name="car.fill"
                  android_material_icon_name="directions-car"
                  size={48}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.vehicleTitle}>
                {vehicle.make} {vehicle.model}
              </Text>
              <Text style={styles.vehicleYear}>{vehicle.year}</Text>
              <View style={styles.registrationBadge}>
                <Text style={styles.registrationText}>{vehicle.registration_number}</Text>
              </View>
            </View>
          </BlurView>

          <Text style={styles.sectionTitle}>Analysis History</Text>
          
          {vehicleAnalyses.length === 0 ? (
            <BlurView intensity={20} style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <IconSymbol
                  ios_icon_name="waveform"
                  android_material_icon_name="graphic-eq"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyText}>No analyses yet</Text>
              </View>
            </BlurView>
          ) : (
            <View style={styles.analysesList}>
              {vehicleAnalyses.map((analysis, index) => (
                <React.Fragment key={index}>
                  <BlurView intensity={20} style={styles.analysisCard}>
                    <View style={styles.analysisContent}>
                      <View style={styles.analysisHeader}>
                        <View style={styles.analysisHeaderLeft}>
                          <IconSymbol
                            ios_icon_name={analysis.anomaly_detected ? 'exclamationmark.triangle.fill' : 'checkmark.circle.fill'}
                            android_material_icon_name={analysis.anomaly_detected ? 'warning' : 'check-circle'}
                            size={24}
                            color={analysis.anomaly_detected ? '#F97316' : '#10B981'}
                          />
                          <Text style={styles.analysisDate}>
                            {new Date(analysis.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.scoreBadge,
                            {
                              backgroundColor: analysis.anomaly_detected
                                ? 'rgba(249, 115, 22, 0.2)'
                                : 'rgba(16, 185, 129, 0.2)',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.scoreText,
                              {
                                color: analysis.anomaly_detected ? '#F97316' : '#10B981',
                              },
                            ]}
                          >
                            {analysis.anomaly_score}/100
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.analysisStats}>
                        <View style={styles.analysisStat}>
                          <Text style={styles.analysisStatLabel}>Duration</Text>
                          <Text style={styles.analysisStatValue}>{analysis.duration_seconds}s</Text>
                        </View>
                        <View style={styles.analysisStat}>
                          <Text style={styles.analysisStatLabel}>Anomalies</Text>
                          <Text style={styles.analysisStatValue}>{analysis.anomalies.length}</Text>
                        </View>
                        <View style={styles.analysisStat}>
                          <Text style={styles.analysisStatLabel}>Status</Text>
                          <Text style={styles.analysisStatValue}>
                            {analysis.anomaly_detected ? 'Issue' : 'Healthy'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </BlurView>
                </React.Fragment>
              ))}
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
  vehicleHeader: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    marginBottom: 32,
  },
  vehicleHeaderContent: {
    padding: 32,
    alignItems: 'center',
  },
  vehicleIconLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  vehicleTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  vehicleYear: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  registrationBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  registrationText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
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
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  analysesList: {
    gap: 12,
  },
  analysisCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
  },
  analysisContent: {
    padding: 16,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  analysisDate: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '700',
  },
  analysisStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analysisStat: {
    alignItems: 'center',
  },
  analysisStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  analysisStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
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
