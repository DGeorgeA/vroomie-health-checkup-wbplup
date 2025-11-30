
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '@/styles/commonStyles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary';
}

export default function Button({ 
  title, 
  onPress, 
  style, 
  textStyle,
  variant = 'primary' 
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <BlurView intensity={20} style={styles.blurContainer}>
        <Text style={[
          styles.text,
          variant === 'secondary' && styles.textSecondary,
          textStyle
        ]}>
          {title}
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  blurContainer: {
    backgroundColor: 'rgba(252, 211, 77, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.5)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  textSecondary: {
    color: colors.text,
  },
});
