
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import VroomieLogo from '@/components/VroomieLogo';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/app/integrations/supabase/client';
import { AnomalyPattern } from '@/types/entities';
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminScreen() {
  const router = useRouter();
  const { isAdmin, loading: authLoading, signOut, user } = useAuth();
  const [logoRotationDisabled, setLogoRotationDisabled] = useState(false);
  const [patterns, setPatterns] = useState<AnomalyPattern[]>([]);
  const [anomalyName, setAnomalyName] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showAdminInfo, setShowAdminInfo] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadPatterns = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('anomaly_patterns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading patterns:', error);
        showToastMessage('Failed to load patterns');
        return;
      }

      setPatterns(data || []);
    } catch (error) {
      console.error('Error loading patterns:', error);
      showToastMessage('Failed to load patterns');
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadPatterns();
    }
  }, [isAdmin, loadPatterns]);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem('logoRotationDisabled');
    if (saved) {
      setLogoRotationDisabled(JSON.parse(saved));
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking file:', error);
      showToastMessage('Failed to pick file');
    }
  };

  const handleUpload = async () => {
    if (!anomalyName.trim()) {
      Alert.alert('Error', 'Please enter an anomaly name');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select an audio file');
      return;
    }

    setIsUploading(true);

    try {
      const timestamp = Date.now();
      const fileName = `${anomalyName.replace(/\s+/g, '_')}_${timestamp}.${selectedFile.name.split('.').pop()}`;
      const storagePath = `patterns/${anomalyName}/${fileName}`;

      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.mimeType || 'audio/wav',
        name: fileName,
      } as any);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('anomaly-patterns')
        .upload(storagePath, formData);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        showToastMessage('Failed to upload file');
        setIsUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('anomaly-patterns')
        .getPublicUrl(storagePath);

      const { error: dbError } = await supabase
        .from('anomaly_patterns')
        .insert({
          anomaly_name: anomalyName.trim(),
          audio_file_url: urlData.publicUrl,
          storage_path: storagePath,
        });

      if (dbError) {
        console.error('Database error:', dbError);
        showToastMessage('Failed to save pattern');
        setIsUploading(false);
        return;
      }

      showToastMessage('Pattern uploaded successfully!');
      setAnomalyName('');
      setSelectedFile(null);
      await loadPatterns();
    } catch (error) {
      console.error('Error uploading:', error);
      showToastMessage('Failed to upload pattern');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePattern = async (pattern: AnomalyPattern) => {
    Alert.alert(
      'Delete Pattern',
      `Are you sure you want to delete "${pattern.anomaly_name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: storageError } = await supabase.storage
                .from('anomaly-patterns')
                .remove([pattern.storage_path]);

              if (storageError) {
                console.error('Storage delete error:', storageError);
              }

              const { error: dbError } = await supabase
                .from('anomaly_patterns')
                .delete()
                .eq('id', pattern.id);

              if (dbError) {
                console.error('Database delete error:', dbError);
                showToastMessage('Failed to delete pattern');
                return;
              }

              showToastMessage('Pattern deleted successfully');
              await loadPatterns();
            } catch (error) {
              console.error('Error deleting pattern:', error);
              showToastMessage('Failed to delete pattern');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleBack = () => {
    router.back();
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#18181B', '#27272a', '#18181B']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Checking authentication...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // Redirect to login if not admin
  if (!isAdmin) {
    return <Redirect href="/admin-login" />;
  }

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
          <View style={styles.headerSection}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Admin Panel</Text>
              <View style={styles.userBadge}>
                <IconSymbol
                  ios_icon_name="person.circle.fill"
                  android_material_icon_name="account-circle"
                  size={16}
                  color={colors.primary}
                />
                <Text style={styles.userEmail}>{user?.email}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => setShowAdminInfo(true)}
                accessibilityLabel="Admin info"
                accessibilityRole="button"
              >
                <IconSymbol
                  ios_icon_name="info.circle.fill"
                  android_material_icon_name="info"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                accessibilityLabel="Logout"
                accessibilityRole="button"
              >
                <IconSymbol
                  ios_icon_name="rectangle.portrait.and.arrow.right.fill"
                  android_material_icon_name="logout"
                  size={24}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.subtitle}>Manage anomaly pattern files</Text>

          <BlurView intensity={20} style={styles.uploadCard}>
            <View style={styles.uploadContent}>
              <Text style={styles.uploadTitle}>Upload New Pattern</Text>

              <TextInput
                style={styles.input}
                placeholder="Anomaly Name (e.g., Belt Squeal)"
                placeholderTextColor={colors.textSecondary}
                value={anomalyName}
                onChangeText={setAnomalyName}
              />

              <TouchableOpacity
                style={styles.filePickerButton}
                onPress={handleFilePick}
                accessibilityLabel="Pick audio file"
                accessibilityRole="button"
              >
                <IconSymbol
                  ios_icon_name="doc.badge.plus"
                  android_material_icon_name="attach-file"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.filePickerText}>
                  {selectedFile ? selectedFile.name : 'Select Audio File'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                onPress={handleUpload}
                disabled={isUploading}
                accessibilityLabel="Upload pattern"
                accessibilityRole="button"
              >
                {isUploading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <>
                    <IconSymbol
                      ios_icon_name="arrow.up.circle.fill"
                      android_material_icon_name="cloud-upload"
                      size={24}
                      color={colors.text}
                    />
                    <Text style={styles.uploadButtonText}>Upload Pattern</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>

          <View style={styles.patternsSection}>
            <Text style={styles.patternsTitle}>Uploaded Patterns ({patterns.length})</Text>

            {patterns.length === 0 ? (
              <BlurView intensity={20} style={styles.emptyCard}>
                <View style={styles.emptyContent}>
                  <IconSymbol
                    ios_icon_name="waveform.slash"
                    android_material_icon_name="music-off"
                    size={48}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.emptyText}>No patterns uploaded yet</Text>
                </View>
              </BlurView>
            ) : (
              <View style={styles.patternsList}>
                {patterns.map((pattern, index) => (
                  <React.Fragment key={index}>
                    <BlurView intensity={20} style={styles.patternCard}>
                      <View style={styles.patternContent}>
                        <View style={styles.patternHeader}>
                          <IconSymbol
                            ios_icon_name="waveform.circle.fill"
                            android_material_icon_name="graphic-eq"
                            size={32}
                            color={colors.primary}
                          />
                          <View style={styles.patternInfo}>
                            <Text style={styles.patternName}>{pattern.anomaly_name}</Text>
                            <Text style={styles.patternDate}>
                              {new Date(pattern.upload_date).toLocaleDateString()}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeletePattern(pattern)}
                            accessibilityLabel="Delete pattern"
                            accessibilityRole="button"
                          >
                            <IconSymbol
                              ios_icon_name="trash.fill"
                              android_material_icon_name="delete"
                              size={24}
                              color="#EF4444"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </BlurView>
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {showToast && (
          <View style={styles.toast}>
            <BlurView intensity={80} style={styles.toastBlur}>
              <View style={styles.toastContent}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check-circle"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.toastText}>{toastMessage}</Text>
              </View>
            </BlurView>
          </View>
        )}

        <Modal
          visible={showAdminInfo}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowAdminInfo(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={80} style={styles.infoModalBlur}>
              <View style={styles.infoModalContainer}>
                <View style={styles.infoModalHeader}>
                  <IconSymbol
                    ios_icon_name="lock.shield.fill"
                    android_material_icon_name="security"
                    size={32}
                    color={colors.primary}
                  />
                  <Text style={styles.infoModalTitle}>Admin Access Control</Text>
                  <TouchableOpacity
                    onPress={() => setShowAdminInfo(false)}
                    style={styles.infoModalClose}
                    accessibilityLabel="Close info"
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

                <ScrollView style={styles.infoModalScroll} showsVerticalScrollIndicator={false}>
                  <View style={styles.infoModalContent}>
                    <Text style={styles.infoModalText}>
                      Admin-only features are now protected with Supabase authentication and only visible to authorized users.
                    </Text>
                    
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Protected Features:</Text>
                      <Text style={styles.infoSectionText}>
                        - Play Store Assets button (Dashboard)
                      </Text>
                      <Text style={styles.infoSectionText}>
                        - Download All Assets button (Mockups page)
                      </Text>
                      <Text style={styles.infoSectionText}>
                        - Anomaly pattern management (This page)
                      </Text>
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>To add admin users:</Text>
                      <Text style={styles.infoSectionText}>
                        1. Create a user account in Supabase Auth
                      </Text>
                      <Text style={styles.infoSectionText}>
                        2. Get the user&apos;s ID from Supabase Auth
                      </Text>
                      <Text style={styles.infoSectionText}>
                        3. Insert into admin_users table:
                      </Text>
                      <View style={styles.codeBlock}>
                        <Text style={styles.codeText}>
                          INSERT INTO admin_users (user_id){'\n'}
                          VALUES (&apos;user-uuid-here&apos;);
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Session Management:</Text>
                      <Text style={styles.infoSectionText}>
                        - Admin sessions persist across app restarts
                      </Text>
                      <Text style={styles.infoSectionText}>
                        - Use the logout button to end your session
                      </Text>
                      <Text style={styles.infoSectionText}>
                        - Sessions are secured with Supabase Auth
                      </Text>
                    </View>

                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Current Setup:</Text>
                      <Text style={styles.infoSectionText}>
                        - Logged in as: {user?.email}
                      </Text>
                      <Text style={styles.infoSectionText}>
                        - Admin users table: admin_users
                      </Text>
                      <Text style={styles.infoSectionText}>
                        - RLS policies enabled
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </BlurView>
          </View>
        </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
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
    paddingBottom: 40,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    alignSelf: 'flex-start',
  },
  userEmail: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  uploadCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    marginBottom: 32,
  },
  uploadContent: {
    padding: 24,
    gap: 16,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 16,
  },
  filePickerText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.6)',
    padding: 16,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  patternsSection: {
    gap: 16,
  },
  patternsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  emptyCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    overflow: 'hidden',
    padding: 40,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  patternsList: {
    gap: 12,
  },
  patternCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    overflow: 'hidden',
  },
  patternContent: {
    padding: 16,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  patternInfo: {
    flex: 1,
  },
  patternName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  patternDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 32,
    left: 20,
    right: 20,
  },
  toastBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(39, 39, 42, 0.95)',
    padding: 16,
  },
  toastText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  infoModalBlur: {
    width: Platform.OS === 'web' ? '90%' : '90%',
    maxWidth: 500,
    maxHeight: '80%',
    borderRadius: 24,
    overflow: 'hidden',
    margin: 20,
  },
  infoModalContainer: {
    backgroundColor: 'rgba(39, 39, 42, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    padding: 24,
    maxHeight: '100%',
  },
  infoModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  infoModalTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  infoModalClose: {
    padding: 4,
  },
  infoModalScroll: {
    maxHeight: 400,
  },
  infoModalContent: {
    gap: 20,
  },
  infoModalText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  infoSection: {
    gap: 8,
  },
  infoSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  infoSectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
    padding: 12,
    marginTop: 8,
  },
  codeText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.primary,
    lineHeight: 18,
  },
});
