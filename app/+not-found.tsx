
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Link, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import VroomieLogo from '@/components/VroomieLogo';
import { colors } from '@/styles/commonStyles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <LinearGradient
          colors={['#18181B', '#27272a', '#18181B']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <VroomieLogo size={120} />
            <Text style={styles.title}>Page Not Found</Text>
            <Text style={styles.subtitle}>
              The page you&apos;re looking for doesn&apos;t exist
            </Text>
            
            <Link href="/" asChild>
              <TouchableOpacity style={styles.button} accessibilityLabel="Go to home screen">
                <BlurView intensity={30} style={styles.buttonBlur}>
                  <LinearGradient
                    colors={['rgba(252, 211, 77, 0.3)', 'rgba(252, 211, 77, 0.1)']}
                    style={styles.buttonGradient}
                  >
                    <IconSymbol
                      ios_icon_name="house.fill"
                      android_material_icon_name="home"
                      size={24}
                      color={colors.primary}
                    />
                    <Text style={styles.buttonText}>Go to Dashboard</Text>
                  </LinearGradient>
                </BlurView>
              </TouchableOpacity>
            </Link>
          </View>
        </LinearGradient>
      </View>
    </>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 24,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonBlur: {
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
});
