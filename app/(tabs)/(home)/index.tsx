
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import VroomieLogo from '@/components/VroomieLogo';
import GlassCard from '@/components/GlassCard';
import TopNavigation from '@/components/TopNavigation';
import { Footer } from '@/components/Footer';
import { colors } from '@/styles/commonStyles';
import { mockVehicles, mockAnalyses } from '@/data/mockData';

export default function DashboardScreen() {
  const router = useRouter();

  const totalVehicles = mockVehicles.length;
  const totalAnalyses = mockAnalyses.length;
  const totalAnomalies = mockAnalyses.filter(a => a.anomaly_detected).length;

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
          <View style={styles.logoContainer}>
            <VroomieLogo size={140} />
            <Text style={styles.appTitle}>Vroomie Health CheckUp</Text>
            <Text style={styles.appSubtitle}>AI-Powered Vehicle Diagnostics</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalVehicles}</Text>
              <Text style={styles.statLabel}>Vehicles</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalAnalyses}</Text>
              <Text style={styles.statLabel}>Analyses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalAnomalies}</Text>
              <Text style={styles.statLabel}>Anomalies</Text>
            </View>
          </View>

          <View style={styles.cardsContainer}>
            <GlassCard
              title="Start Health CheckUp"
              description="Record engine audio for analysis"
              icon="waveform"
              onPress={() => router.push('/health-checkup')}
              delay={100}
            />
            <GlassCard
              title="Recent Diagnostics"
              description="View analysis history and reports"
              icon="list-bullet"
              onPress={() => router.push('/reports')}
              delay={200}
            />
            <GlassCard
              title="Your Vehicles"
              description="Manage your vehicle fleet"
              icon="car"
              onPress={() => router.push('/vehicles')}
              delay={300}
            />
          </View>
        </ScrollView>

        <Footer />
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
    paddingBottom: 120,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    padding: 16,
    alignItems: 'center',
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
  cardsContainer: {
    gap: 8,
  },
});
