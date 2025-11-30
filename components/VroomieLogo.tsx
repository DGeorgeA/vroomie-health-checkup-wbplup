
import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import Svg, { Path, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { colors } from '@/styles/commonStyles';

interface VroomieLogoProps {
  size?: number;
  disableRotation?: boolean;
}

const VroomieLogo: React.FC<VroomieLogoProps> = ({ size = 100, disableRotation = false }) => {
  const [rotation] = useState(new Animated.Value(0));
  const [pulse] = useState(new Animated.Value(1));
  const rotationRef = useRef(rotation);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  const handlePress = () => {
    if (disableRotation) return;

    // Rotate 360 degrees
    Animated.timing(rotation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      rotation.setValue(0);
    });

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[styles.container, { width: size, height: size }]}
      accessibilityLabel="Vroomie logo"
      accessibilityRole="button"
      accessibilityHint={disableRotation ? undefined : "Tap to rotate logo"}
    >
      <Animated.View
        style={{
          transform: [{ rotate: rotateInterpolate }, { scale: pulse }],
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 120 120">
          <Defs>
            <SvgLinearGradient id="carGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.primary} stopOpacity="1" />
              <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.6" />
            </SvgLinearGradient>
          </Defs>

          {/* Speed streaks */}
          <G opacity="0.6">
            <Path
              d="M 15 45 L 35 45"
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M 10 55 L 30 55"
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <Path
              d="M 12 65 L 32 65"
              stroke={colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </G>

          {/* Car silhouette */}
          <G>
            {/* Car body */}
            <Path
              d="M 40 70 L 45 55 L 55 50 L 75 50 L 85 55 L 90 70 Z"
              fill="url(#carGradient)"
              stroke={colors.primary}
              strokeWidth="2"
            />
            
            {/* Windshield */}
            <Path
              d="M 55 50 L 58 58 L 72 58 L 75 50"
              fill="rgba(24, 24, 27, 0.8)"
              stroke={colors.primary}
              strokeWidth="1.5"
            />

            {/* Wheels */}
            <G>
              {/* Front wheel */}
              <Path
                d="M 50 70 A 8 8 0 1 1 50 70.01"
                fill={colors.background}
                stroke={colors.primary}
                strokeWidth="3"
              />
              <Path
                d="M 50 70 A 4 4 0 1 1 50 70.01"
                fill={colors.primary}
              />
              
              {/* Rear wheel */}
              <Path
                d="M 80 70 A 8 8 0 1 1 80 70.01"
                fill={colors.background}
                stroke={colors.primary}
                strokeWidth="3"
              />
              <Path
                d="M 80 70 A 4 4 0 1 1 80 70.01"
                fill={colors.primary}
              />
            </G>

            {/* Motion lines behind car */}
            <G opacity="0.4">
              <Path
                d="M 35 60 L 40 60"
                stroke={colors.primary}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <Path
                d="M 32 65 L 38 65"
                stroke={colors.primary}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </G>
          </G>
        </Svg>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VroomieLogo;
