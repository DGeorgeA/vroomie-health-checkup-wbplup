
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#18181b', '#27272a', '#18181b']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <IconSymbol
            ios_icon_name="exclamationmark.triangle"
            android_material_icon_name="error"
            size={80}
            color={colors.primary}
          />
          <Text style={styles.title}>404</Text>
          <Text style={styles.subtitle}>Page Not Found</Text>
          <Text style={styles.description}>
            The page you&apos;re looking for doesn&apos;t exist.
          </Text>
          
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/')}
          >
            <BlurView intensity={20} style={styles.buttonBlur}>
              <View style={styles.buttonContent}>
                <IconSymbol
                  ios_icon_name="house.fill"
                  android_material_icon_name="home"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.buttonText}>Go to Dashboard</Text>
              </View>
            </BlurView>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 72,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonBlur: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});
