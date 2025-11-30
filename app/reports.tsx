
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  Modal,
  Animated,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import VroomieLogo from '@/components/VroomieLogo';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session } from '@/types/entities';

type SeverityFilter = 'All' | 'Warning' | 'Critical';

export default function ReportsScreen() {
  const router = useRouter();
  const [logoRotationDisabled, setLogoRotationDisabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const modalAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadSettings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem('logoRotationDisabled');
    if (saved) {
      setLogoRotationDisabled(JSON.parse(saved));
    }
  };

  const loadSessions = async () => {
    const savedSessions = await AsyncStorage.getItem('sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  };

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

  const handleSessionPress = (session: Session) => {
    setSelectedSession(session);
    setModalVisible(true);
    Animated.spring(modalAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedSession(null);
    });
  };

  const handleDeleteSession = async () => {
    if (!selectedSession) return;

    const updatedSessions = sessions.filter(s => s.id !== selectedSession.id);
    setSessions(updatedSessions);
    await AsyncStorage.setItem('sessions', JSON.stringify(updatedSessions));
    closeModal();
  };

  const handleReturnHome = () => {
    closeModal();
    router.back();
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSeverity = 
      severityFilter === 'All' ||
      (severityFilter === 'Warning' && session.anomalyScore >= 21 && session.anomalyScore < 51) ||
      (severityFilter === 'Critical' && session.anomalyScore >= 51);

    const matchesSearch = 
      searchQuery === '' ||
      session.anomalyScore.toString().includes(searchQuery) ||
      (session.detectedAnomalyName && session.detectedAnomalyName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSeverity && matchesSearch;
  });

  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

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

          <View style={styles.filtersContainer}>
            <BlurView intensity={20} style={styles.filterCard}>
              <View style={styles.filterContent}>
                <Text style={styles.filterLabel}>Severity Filter</Text>
                <View style={styles.filterButtons}>
                  {(['All', 'Warning', 'Critical'] as SeverityFilter[]).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterButton,
                        severityFilter === filter && styles.filterButtonActive,
                      ]}
                      onPress={() => setSeverityFilter(filter)}
                      accessibilityLabel={`Filter by ${filter}`}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.filterButtonText,
                          severityFilter === filter && styles.filterButtonTextActive,
                        ]}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </BlurView>

            <BlurView intensity={20} style={styles.searchCard}>
              <View style={styles.searchContent}>
                <IconSymbol
                  ios_icon_name="magnifyingglass"
                  android_material_icon_name="search"
                  size={20}
                  color={colors.textSecondary}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by score or anomaly..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    accessibilityLabel="Clear search"
                    accessibilityRole="button"
                  >
                    <IconSymbol
                      ios_icon_name="xmark.circle.fill"
                      android_material_icon_name="cancel"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </BlurView>
          </View>

          {filteredSessions.length === 0 ? (
            <BlurView intensity={20} style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <IconSymbol
                  ios_icon_name="doc.text"
                  android_material_icon_name="description"
                  size={64}
                  color={colors.textSecondary}
                />
                <Text style={styles.emptyTitle}>No reports found</Text>
                <Text style={styles.emptyText}>
                  {sessions.length === 0 
                    ? 'Start a health checkup to generate your first report'
                    : 'Try adjusting your filters'
                  }
                </Text>
              </View>
            </BlurView>
          ) : (
            <View style={styles.reportsList}>
              {filteredSessions.map((session, index) => {
                const severityColor = getSeverityColor(session.anomalyScore);
                const severityLabel = getSeverityLabel(session.anomalyScore);

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSessionPress(session)}
                    activeOpacity={0.8}
                    accessibilityLabel={`View session details`}
                    accessibilityRole="button"
                  >
                    <BlurView intensity={20} style={styles.reportCard}>
                      <View style={styles.reportContent}>
                        <View style={styles.reportHeader}>
                          <View style={styles.reportHeaderLeft}>
                            <IconSymbol
                              ios_icon_name={session.anomalyScore >= 51 ? 'exclamationmark.triangle.fill' : 'checkmark.circle.fill'}
                              android_material_icon_name={session.anomalyScore >= 51 ? 'warning' : 'check-circle'}
                              size={32}
                              color={severityColor}
                            />
                            <View style={styles.reportHeaderInfo}>
                              <Text style={styles.reportDate}>
                                {new Date(session.timestamp).toLocaleDateString()}
                              </Text>
                              <Text style={styles.reportTime}>
                                {new Date(session.timestamp).toLocaleTimeString([], { 
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
                              {session.anomalyScore}/100
                            </Text>
                          </View>
                          <View style={styles.reportStat}>
                            <Text style={styles.reportStatLabel}>Duration</Text>
                            <Text style={styles.reportStatValue}>{session.duration_seconds}s</Text>
                          </View>
                          <View style={styles.reportStat}>
                            <Text style={styles.reportStatLabel}>Anomalies</Text>
                            <Text style={styles.reportStatValue}>{session.anomalies.length}</Text>
                          </View>
                        </View>

                        {session.detectedAnomalyName && (
                          <View style={styles.detectedAnomalyContainer}>
                            <IconSymbol
                              ios_icon_name="exclamationmark.triangle.fill"
                              android_material_icon_name="warning"
                              size={16}
                              color={colors.primary}
                            />
                            <Text style={styles.detectedAnomalyText}>
                              Detected: {session.detectedAnomalyName}
                            </Text>
                          </View>
                        )}
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/health-checkup')}
          accessibilityLabel="Start new checkup"
          accessibilityRole="button"
        >
          <LinearGradient
            colors={['rgba(252, 211, 77, 0.4)', 'rgba(252, 211, 77, 0.2)']}
            style={styles.fabGradient}
          >
            <IconSymbol
              ios_icon_name="plus.circle.fill"
              android_material_icon_name="add-circle"
              size={32}
              color={colors.text}
            />
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            onPress={closeModal}
            activeOpacity={1}
          />
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: modalScale }],
                opacity: modalAnim,
              }
            ]}
          >
            <BlurView intensity={80} style={styles.modalBlur}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Session Summary</Text>
                  <TouchableOpacity
                    onPress={closeModal}
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

                {selectedSession && (
                  <ScrollView 
                    style={styles.modalScroll}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.modalBody}>
                      <View style={styles.modalScoreContainer}>
                        <Text style={styles.modalScoreLabel}>Anomaly Score</Text>
                        <Text 
                          style={[
                            styles.modalScoreValue,
                            { color: getSeverityColor(selectedSession.anomalyScore) }
                          ]}
                        >
                          {selectedSession.anomalyScore}/100
                        </Text>
                      </View>

                      {selectedSession.detectedAnomalyName ? (
                        <View style={styles.modalDetectionContainer}>
                          <VroomieLogo size={40} disableRotation={logoRotationDisabled} />
                          <Text style={styles.modalDetectionText}>
                            Suspecting {selectedSession.detectedAnomalyName}. Seek a mechanic consultation!! – Go VROOmie!!
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.modalHealthyContainer}>
                          <IconSymbol
                            ios_icon_name="checkmark.circle.fill"
                            android_material_icon_name="check-circle"
                            size={48}
                            color="#10B981"
                          />
                          <Text style={styles.modalHealthyText}>
                            No issues identified — Go VROOMIIEE!!
                          </Text>
                        </View>
                      )}

                      {selectedSession.anomalies.length > 0 && (
                        <View style={styles.modalAnomaliesContainer}>
                          <Text style={styles.modalAnomaliesTitle}>Detected Anomalies</Text>
                          {selectedSession.anomalies.map((anomaly, index) => (
                            <View key={index} style={styles.modalAnomalyItem}>
                              <View
                                style={[
                                  styles.modalAnomalySeverity,
                                  {
                                    backgroundColor: getSeverityColor(
                                      anomaly.severity === 'critical' ? 90 :
                                      anomaly.severity === 'high' ? 70 :
                                      anomaly.severity === 'medium' ? 40 : 15
                                    ) + '30',
                                    borderColor: getSeverityColor(
                                      anomaly.severity === 'critical' ? 90 :
                                      anomaly.severity === 'high' ? 70 :
                                      anomaly.severity === 'medium' ? 40 : 15
                                    ),
                                  }
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.modalAnomalySeverityText,
                                    {
                                      color: getSeverityColor(
                                        anomaly.severity === 'critical' ? 90 :
                                        anomaly.severity === 'high' ? 70 :
                                        anomaly.severity === 'medium' ? 40 : 15
                                      ),
                                    }
                                  ]}
                                >
                                  {anomaly.severity.toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.modalAnomalyDetails}>
                                <Text style={styles.modalAnomalyTime}>
                                  @ {(anomaly.timestamp_ms / 1000).toFixed(1)}s
                                </Text>
                                <Text style={styles.modalAnomalyFreq}>
                                  {anomaly.frequency_range}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={styles.modalActionButton}
                        onPress={closeModal}
                        accessibilityLabel="Close"
                        accessibilityRole="button"
                      >
                        <Text style={styles.modalActionButtonText}>Close</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalActionButtonDanger}
                        onPress={handleDeleteSession}
                        accessibilityLabel="Delete session"
                        accessibilityRole="button"
                      >
                        <Text style={styles.modalActionButtonDangerText}>Delete Session</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.modalActionButtonSecondary}
                        onPress={handleReturnHome}
                        accessibilityLabel="Return home"
                        accessibilityRole="button"
                      >
                        <Text style={styles.modalActionButtonSecondaryText}>Return Home</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )}
              </View>
            </BlurView>
          </Animated.View>
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
    fontSize: 14,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 12,
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
    paddingBottom: 100,
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
    marginBottom: 24,
  },
  filtersContainer: {
    gap: 12,
    marginBottom: 24,
  },
  filterCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    overflow: 'hidden',
  },
  filterContent: {
    padding: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderColor: 'rgba(252, 211, 77, 0.6)',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.text,
  },
  searchCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    overflow: 'hidden',
  },
  searchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
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
  detectedAnomalyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(252, 211, 77, 0.1)',
  },
  detectedAnomalyText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    fontStyle: 'italic',
    color: colors.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.6)',
    borderRadius: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  modalContent: {
    backgroundColor: 'rgba(39, 39, 42, 0.95)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(252, 211, 77, 0.1)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalBody: {
    padding: 24,
  },
  modalScoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalScoreLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalScoreValue: {
    fontSize: 48,
    fontWeight: '800',
  },
  modalDetectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    marginBottom: 24,
  },
  modalDetectionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    fontStyle: 'italic',
    color: colors.text,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  modalHealthyContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: 24,
  },
  modalHealthyText: {
    fontSize: 18,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#10B981',
    marginTop: 12,
  },
  modalAnomaliesContainer: {
    gap: 12,
  },
  modalAnomaliesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalAnomalyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(252, 211, 77, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
  },
  modalAnomalySeverity: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalAnomalySeverityText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  modalAnomalyDetails: {
    flex: 1,
  },
  modalAnomalyTime: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  modalAnomalyFreq: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  modalActions: {
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(252, 211, 77, 0.1)',
  },
  modalActionButton: {
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.6)',
    padding: 16,
    alignItems: 'center',
  },
  modalActionButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalActionButtonDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#EF4444',
    padding: 16,
    alignItems: 'center',
  },
  modalActionButtonDangerText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
  },
  modalActionButtonSecondary: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 16,
    alignItems: 'center',
  },
  modalActionButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
});
