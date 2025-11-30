
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface VroomieLogoProps {
  size?: number;
}

export default function VroomieLogo({ size = 120 }: VroomieLogoProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [rotation, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View style={[styles.logoCircle, animatedStyle]}>
        <LinearGradient
          colors={['#FCD34D', '#F59E0B', '#FCD34D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.innerCircle}>
            <View style={styles.vShape} />
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: '85%',
    height: '85%',
    borderRadius: 1000,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vShape: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderTopWidth: 35,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FCD34D',
  },
});
