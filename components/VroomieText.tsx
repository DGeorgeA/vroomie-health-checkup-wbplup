
import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface VroomieTextProps {
  size?: number;
  shouldAnimate?: boolean;
}

const VroomieText: React.FC<VroomieTextProps> = ({ 
  size = 60,
  shouldAnimate = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (shouldAnimate) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldAnimate, scaleAnim]);

  return (
    <Animated.Text
      style={[
        styles.text,
        {
          fontSize: size,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      VRoomie
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontWeight: '900',
    fontStyle: 'italic',
    color: colors.primary,
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
  },
});

export default VroomieText;
