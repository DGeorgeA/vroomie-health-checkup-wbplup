
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface GlassCardProps {
  title: string;
  description?: string;
  icon: string;
  onPress?: () => void;
  delay?: number;
}

export default function GlassCard({ title, description, icon, onPress, delay = 0 }: GlassCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    setTimeout(() => {
      opacity.value = withSpring(1, { damping: 15 });
    }, delay);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const content = (
    <Animated.View style={[styles.card, animatedStyle]}>
      <BlurView intensity={20} style={styles.blurContainer}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name={icon}
              android_material_icon_name={icon}
              size={32}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </BlurView>
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  blurContainer: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
