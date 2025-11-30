
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface IconCircleProps {
  icon: string;
  size?: number;
  iconSize?: number;
  color?: string;
  backgroundColor?: string;
}

export default function IconCircle({ 
  icon, 
  size = 64, 
  iconSize = 32,
  color = colors.primary,
  backgroundColor = 'rgba(252, 211, 77, 0.1)'
}: IconCircleProps) {
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
      }
    ]}>
      <IconSymbol
        ios_icon_name={icon}
        android_material_icon_name={icon}
        size={iconSize}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
});
