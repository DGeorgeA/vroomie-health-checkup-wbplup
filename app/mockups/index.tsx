
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function MockupsIndex() {
  const router = useRouter();

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

          <View style={styles.mockupsGrid}>
            {mockups.map((mockup, index) => (
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
});
