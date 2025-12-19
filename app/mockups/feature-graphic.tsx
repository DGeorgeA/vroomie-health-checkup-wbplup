
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import { FeatureGraphicSVG } from '@/components/assets/FeatureGraphicSVG';
import { IconSymbol } from '@/components/IconSymbol';
import { colors } from '@/styles/commonStyles';
import * as FileSystem from 'expo-file-system/legacy';

export default function FeatureGraphicMockup() {
  const router = useRouter();
  const viewRef = useRef<View>(null);

  const captureScreenshot = async () => {
    try {
      if (!viewRef.current) {
        console.log('View ref not available');
        return;
      }

      const uri = await captureRef(viewRef, {
        format: 'png',
        quality: 1,
        width: 1024,
        height: 500,
      });

      console.log('Screenshot captured:', uri);
      
      if (Platform.OS === 'web') {
        Alert.alert(
          'Screenshot Captured',
          'Right-click the image and save it as feature-graphic-1024x500.png',
          [{ text: 'OK' }]
        );
      } else {
        const fileName = `feature-graphic-1024x500-${Date.now()}.png`;
        const newPath = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: uri, to: newPath });
        
        Alert.alert(
          'Success',
          `Screenshot saved to: ${newPath}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      Alert.alert('Error', 'Failed to capture screenshot');
    }
  };

  return (
    <View style={styles.container}>
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
        
        <Text style={styles.title}>Feature Graphic</Text>
        
        <TouchableOpacity
          style={styles.captureButton}
          onPress={captureScreenshot}
          accessibilityLabel="Capture screenshot"
          accessibilityRole="button"
        >
          <IconSymbol
            ios_icon_name="camera.fill"
            android_material_icon_name="camera"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.mockupContainer}>
          <View ref={viewRef} style={styles.graphicContainer}>
            <FeatureGraphicSVG width={1024} height={500} />
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Google Play Requirements:</Text>
          <Text style={styles.infoText}>- Size: 1024 x 500 px</Text>
          <Text style={styles.infoText}>- Format: PNG or JPG</Text>
          <Text style={styles.infoText}>- Max size: 15 MB</Text>
          <Text style={styles.infoText}>- Used in Play Store listing header</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  captureButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  mockupContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  graphicContainer: {
    width: 1024,
    height: 500,
    backgroundColor: 'transparent',
  },
  infoCard: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    padding: 20,
    marginTop: 20,
    width: '100%',
    maxWidth: 600,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
