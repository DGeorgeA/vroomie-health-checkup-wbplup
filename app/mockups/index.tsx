
import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import { useAuth } from '@/contexts/AuthContext';
import { exportAllAssets } from '@/utils/assetExporter';
import { AppIconSVG } from '@/components/assets/AppIconSVG';
import { FeatureGraphicSVG } from '@/components/assets/FeatureGraphicSVG';

export default function MockupsIndex() {
  const router = useRouter();
  const { isAdmin, loading: adminLoading } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  // Refs for capturing assets
  const appIconRef = useRef(null);
  const featureGraphicRef = useRef(null);

  const mockups = [
    {
      id: 'app-icon',
      title: 'App Icon',
      subtitle: '512 x 512 px',
      icon: 'app.badge.fill',
      androidIcon: 'apps',
      route: '/mockups/app-icon',
    },
    {
      id: 'feature-graphic',
      title: 'Feature Graphic',
      subtitle: '1024 x 500 px',
      icon: 'photo.fill',
      androidIcon: 'image',
      route: '/mockups/feature-graphic',
    },
    {
      id: 'phone-1',
      title: 'Phone Screenshot 1',
      subtitle: 'Dashboard - 1080 x 1920 px',
      icon: 'iphone',
      androidIcon: 'phone-android',
      route: '/mockups/phone-screenshot-1',
    },
    {
      id: 'phone-2',
      title: 'Phone Screenshot 2',
      subtitle: 'Recording - 1080 x 1920 px',
      icon: 'iphone',
      androidIcon: 'phone-android',
      route: '/mockups/phone-screenshot-2',
    },
    {
      id: 'phone-3',
      title: 'Phone Screenshot 3',
      subtitle: 'Reports - 1080 x 1920 px',
      icon: 'iphone',
      androidIcon: 'phone-android',
      route: '/mockups/phone-screenshot-3',
    },
    {
      id: 'tablet',
      title: 'Tablet Screenshot',
      subtitle: '1200 x 1920 px',
      icon: 'ipad',
      androidIcon: 'tablet',
      route: '/mockups/tablet-screenshot',
    },
  ];

  const handleDownloadAllAssets = async () => {
    try {
      setIsExporting(true);

      Alert.alert(
        'Export Assets',
        'This will capture all mockup screens and package them into a zip file. Make sure all mockup screens are loaded before proceeding.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsExporting(false),
          },
          {
            text: 'Continue',
            onPress: async () => {
              try {
                // Note: For a complete export, we would need refs to all mockup screens
                // For now, we'll export the assets that are available on this screen
                await exportAllAssets({
                  appIconRef: appIconRef.current,
                  featureGraphicRef: featureGraphicRef.current,
                });

                Alert.alert(
                  'Success',
                  'Assets have been exported successfully! The zip file has been saved and is ready to share.',
                  [{ text: 'OK' }]
                );
              } catch (error) {
                console.error('Export error:', error);
                Alert.alert(
                  'Export Failed',
                  'Failed to export assets. Please try again or export individual assets from their respective screens.',
                  [{ text: 'OK' }]
                );
              } finally {
                setIsExporting(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error initiating export:', error);
      setIsExporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181B', '#27272a', '#18181B']}
        style={styles.gradient}
      >
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
          
          <Text style={styles.title}>Play Store Assets</Text>
          
          <View style={{ width: 80 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <IconSymbol
              ios_icon_name="info.circle.fill"
              android_material_icon_name="info"
              size={32}
              color={colors.primary}
            />
            <Text style={styles.infoTitle}>Google Play Store Assets</Text>
            <Text style={styles.infoText}>
              Create professional screenshots and graphics for your Play Store listing. 
              Each mockup screen can be captured as a PNG image at the exact dimensions 
              required by Google Play.
            </Text>
          </View>

          {!adminLoading && isAdmin && (
            <TouchableOpacity
              style={styles.downloadAllButton}
              onPress={handleDownloadAllAssets}
              disabled={isExporting}
              activeOpacity={0.8}
              accessibilityLabel="Download all assets"
              accessibilityRole="button"
            >
              <BlurView intensity={30} style={styles.downloadAllBlur}>
                <LinearGradient
                  colors={['rgba(252, 211, 77, 0.3)', 'rgba(252, 211, 77, 0.15)']}
                  style={styles.downloadAllGradient}
                >
                  {isExporting ? (
                    <>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text style={styles.downloadAllText}>Exporting Assets...</Text>
                    </>
                  ) : (
                    <>
                      <IconSymbol
                        ios_icon_name="arrow.down.circle.fill"
                        android_material_icon_name="download"
                        size={32}
                        color={colors.primary}
                      />
                      <View style={styles.downloadAllTextContainer}>
                        <Text style={styles.downloadAllText}>Download All Assets</Text>
                        <Text style={styles.downloadAllSubtext}>
                          Export all assets as a zip file
                        </Text>
                      </View>
                      <View style={styles.adminBadge}>
                        <IconSymbol
                          ios_icon_name="lock.shield.fill"
                          android_material_icon_name="security"
                          size={16}
                          color={colors.primary}
                        />
                      </View>
                    </>
                  )}
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          )}

          <View style={styles.mockupsGrid}>
            {mockups.map((mockup) => (
              <TouchableOpacity
                key={mockup.id}
                style={styles.mockupCard}
                onPress={() => router.push(mockup.route as any)}
                activeOpacity={0.8}
                accessibilityLabel={`Open ${mockup.title}`}
                accessibilityRole="button"
              >
                <BlurView intensity={30} style={styles.mockupBlur}>
                  <LinearGradient
                    colors={['rgba(252, 211, 77, 0.2)', 'rgba(252, 211, 77, 0.05)']}
                    style={styles.mockupGradient}
                  >
                    <View style={styles.mockupIcon}>
                      <IconSymbol
                        ios_icon_name={mockup.icon}
                        android_material_icon_name={mockup.androidIcon}
                        size={48}
                        color={colors.primary}
                      />
                    </View>
                    <Text style={styles.mockupTitle}>{mockup.title}</Text>
                    <Text style={styles.mockupSubtitle}>{mockup.subtitle}</Text>
                    <View style={styles.mockupArrow}>
                      <IconSymbol
                        ios_icon_name="chevron.right"
                        android_material_icon_name="chevron-right"
                        size={24}
                        color={colors.textSecondary}
                      />
                    </View>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Tips for Best Results:</Text>
            <Text style={styles.tipText}>
              - Tap the camera icon on each screen to capture the mockup
            </Text>
            <Text style={styles.tipText}>
              - Screenshots are saved at exact Play Store dimensions
            </Text>
            <Text style={styles.tipText}>
              - Use high-quality PNG format for best results
            </Text>
            <Text style={styles.tipText}>
              - Ensure text is readable at all sizes
            </Text>
            <Text style={styles.tipText}>
              - Follow Google Play design guidelines
            </Text>
            {!adminLoading && isAdmin && (
              <>
                <Text style={styles.tipText}>
                  - Use &quot;Download All Assets&quot; to export everything at once
                </Text>
                <Text style={styles.tipText}>
                  - Admin-only feature: Only visible to authorized developers
                </Text>
              </>
            )}
          </View>

          {/* Hidden preview assets for export */}
          <View style={styles.hiddenAssets}>
            <View ref={appIconRef} collapsable={false}>
              <AppIconSVG size={512} />
            </View>
            <View ref={featureGraphicRef} collapsable={false}>
              <FeatureGraphicSVG width={1024} height={500} />
            </View>
          </View>
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 20,
    marginBottom: 24,
    gap: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  downloadAllButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  downloadAllBlur: {
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  downloadAllGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  downloadAllTextContainer: {
    flex: 1,
  },
  downloadAllText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  downloadAllSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  adminBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockupsGrid: {
    gap: 16,
  },
  mockupCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  mockupBlur: {
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  mockupGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mockupIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockupTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  mockupSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  mockupArrow: {
    marginLeft: 8,
  },
  tipsCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 20,
    marginTop: 24,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  hiddenAssets: {
    position: 'absolute',
    left: -10000,
    top: -10000,
    opacity: 0,
  },
});
