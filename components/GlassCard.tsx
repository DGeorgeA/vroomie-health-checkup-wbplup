
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface GlassCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  delay?: number;
}

const GlassCard: React.FC<GlassCardProps> = ({ title, description, icon, onPress, delay = 0 }) => {
  const [opacity] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(0.9));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        delay,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [opacity, scale, delay]);

  const getIconNames = (iconName: string) => {
    const iconMap: Record<string, { ios: string; android: string }> = {
      'waveform': { ios: 'waveform', android: 'graphic-eq' },
      'list-bullet': { ios: 'list.bullet', android: 'list' },
      'car': { ios: 'car.fill', android: 'directions-car' },
    };
    return iconMap[iconName] || { ios: iconName, android: iconName };
  };

  const iconNames = getIconNames(icon);

  return (
    <Animated.View style={{ opacity, transform: [{ scale }] }}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <BlurView intensity={20} style={styles.cardContainer}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name={iconNames.ios}
              android_material_icon_name={iconNames.android}
              size={32}
              color={colors.primary}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <IconSymbol
            ios_icon_name="chevron.right"
            android_material_icon_name="chevron-right"
            size={24}
            color={colors.textSecondary}
          />
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default GlassCard;
