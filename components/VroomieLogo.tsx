
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Image, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface VroomieLogoProps {
  size?: number;
  disableRotation?: boolean;
  onRotate?: () => void;
}

const VroomieLogo: React.FC<VroomieLogoProps> = ({ 
  size = 100, 
  disableRotation = false,
  onRotate 
}) => {
  const [rotation] = useState(new Animated.Value(0));
  const [pulse] = useState(new Animated.Value(1));

  const handlePress = () => {
    if (disableRotation) return;

    // Trigger callback if provided
    if (onRotate) {
      onRotate();
    }

    // Rotate 360 degrees with GPU-accelerated transform
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
        toValue: 1.15,
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
          width: size,
          height: size,
        }}
      >
        <Image
          source={require('@/assets/images/d2ca792b-7544-44b6-bec0-7ed32f16f9ab.png')}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="contain"
        />
        {/* Glow effect */}
        <View style={[styles.glow, { width: size * 1.2, height: size * 1.2 }]} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 8,
  },
  glow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    backgroundColor: colors.primary,
    opacity: 0.1,
    borderRadius: 100,
    zIndex: -1,
  },
});

export default VroomieLogo;
