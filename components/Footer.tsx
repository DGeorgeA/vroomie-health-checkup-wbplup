
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { colors } from '@/styles/commonStyles';

export const Footer: React.FC = () => {
  const router = useRouter();

  return (
    <BlurView intensity={30} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={styles.poweredBy}>Powered by Vroomie</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>
        
        <View style={styles.linksSection}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.link}>Dashboard</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>•</Text>
          <TouchableOpacity onPress={() => router.push('/health-checkup')}>
            <Text style={styles.link}>Health CheckUp</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>•</Text>
          <TouchableOpacity onPress={() => router.push('/reports')}>
            <Text style={styles.link}>Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(39, 39, 42, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(252, 211, 77, 0.2)',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  poweredBy: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  version: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  linksSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  separator: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
