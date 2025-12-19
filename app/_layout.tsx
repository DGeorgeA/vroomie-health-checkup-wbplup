
import { Stack } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { View, TouchableWithoutFeedback, Platform, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '@/contexts/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [logoRotationDisabled, setLogoRotationDisabled] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    SplashScreen.hideAsync();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await AsyncStorage.getItem('logoRotationDisabled');
    if (saved) {
      setLogoRotationDisabled(JSON.parse(saved));
    }
  };

  const handleGlobalTap = () => {
    if (!logoRotationDisabled) {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      console.log('Global tap detected - logo rotation triggered');
    }
  };

  return (
    <AuthProvider>
      <TouchableWithoutFeedback onPress={handleGlobalTap}>
        <Animated.View style={{ flex: 1, transform: [{ scale: pulseAnim }] }}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="health-checkup" />
            <Stack.Screen name="reports" />
            <Stack.Screen name="admin-login" />
            <Stack.Screen name="admin" />
            <Stack.Screen name="mockups" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </Animated.View>
      </TouchableWithoutFeedback>
    </AuthProvider>
  );
}
