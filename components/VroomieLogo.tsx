
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '@/styles/commonStyles';

interface VroomieLogoProps {
  size?: number;
}

const VroomieLogo: React.FC<VroomieLogoProps> = ({ size = 100 }) => {
  const [rotation] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(1));
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) {
      Animated.parallel([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1.1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(rotation, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isHovered, rotation, scale]);

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const AnimatedView = Animated.View;

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      onMouseEnter={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
      onMouseLeave={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
    >
      <AnimatedView
        style={{
          transform: [{ rotate: rotateInterpolate }, { scale }],
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" fill="none" stroke={colors.primary} strokeWidth="3" />
          <Circle cx="50" cy="50" r="35" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.5" />
          <Path
            d="M 30 50 Q 50 30, 70 50 Q 50 70, 30 50"
            fill={colors.primary}
            opacity="0.8"
          />
          <Circle cx="40" cy="45" r="3" fill={colors.background} />
          <Circle cx="60" cy="45" r="3" fill={colors.background} />
          <Path
            d="M 35 60 Q 50 70, 65 60"
            fill="none"
            stroke={colors.background}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VroomieLogo;
