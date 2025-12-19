
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { IconSymbol } from '@/components/IconSymbol';
import VroomieLogo from '@/components/VroomieLogo';
import { colors } from '@/styles/commonStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { signIn, isAdmin, loading: authLoading } = useAuth();
  const [logoRotationDisabled, setLogoRotationDisabled] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // If already admin, redirect to admin panel
    if (!authLoading && isAdmin) {
      router.replace('/admin');
    }
  }, [isAdmin, authLoading]);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem('logoRotationDisabled');
    if (saved) {
      setLogoRotationDisabled(JSON.parse(saved));
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        console.error('Login error:', error);
        Alert.alert(
          'Login Failed',
          error.message || 'Invalid email or password. Please try again.'
        );
        setIsLoading(false);
        return;
      }

      // Wait a moment for admin status to be checked
      setTimeout(() => {
        setIsLoading(false);
        // Navigation will happen automatically via useEffect when isAdmin becomes true
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginContainer}>
            <BlurView intensity={30} style={styles.loginCard}>
              <View style={styles.loginContent}>
                <IconSymbol
                  ios_icon_name="lock.shield.fill"
                  android_material_icon_name="security"
                  size={64}
                  color={colors.primary}
                />
                <Text style={styles.loginTitle}>Admin Login</Text>
                <Text style={styles.loginSubtitle}>
                  Sign in to access administrative features
                </Text>

                <View style={styles.formContainer}>
                  <View style={styles.inputContainer}>
                    <IconSymbol
                      ios_icon_name="envelope.fill"
                      android_material_icon_name="email"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor={colors.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <IconSymbol
                      ios_icon_name="lock.fill"
                      android_material_icon_name="lock"
                      size={20}
                      color={colors.textSecondary}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor={colors.textSecondary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                    >
                      <IconSymbol
                        ios_icon_name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                        android_material_icon_name={showPassword ? 'visibility-off' : 'visibility'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                    accessibilityLabel="Login"
                    accessibilityRole="button"
                  >
                    {isLoading ? (
                      <ActivityIndicator color={colors.text} />
                    ) : (
                      <>
                        <IconSymbol
                          ios_icon_name="arrow.right.circle.fill"
                          android_material_icon_name="login"
                          size={24}
                          color={colors.text}
                        />
                        <Text style={styles.loginButtonText}>Sign In</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                  <IconSymbol
                    ios_icon_name="info.circle.fill"
                    android_material_icon_name="info"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text style={styles.infoText}>
                    Admin accounts are created by system administrators only. 
                    Contact your system administrator if you need access.
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.9)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    overflow: 'hidden',
    maxWidth: 500,
    width: '100%',
  },
  loginContent: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loginTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  formContainer: {
    width: '100%',
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(252, 211, 77, 0.3)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(252, 211, 77, 0.6)',
    padding: 16,
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(252, 211, 77, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.2)',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
