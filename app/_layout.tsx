
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, TouchableWithoutFeedback, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [logoRotationDisabled, setLogoRotationDisabled] = useState(false);

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
      // Trigger logo rotation via event or state management
      // For now, individual logos handle their own rotation on tap
      console.log('Global tap detected');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={handleGlobalTap}>
      <View style={{ flex: 1 }}>
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
          <Stack.Screen name="+not-found" />
        </Stack>
      </View>
    </TouchableWithoutFeedback>
  );
}
