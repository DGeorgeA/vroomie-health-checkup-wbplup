
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface VroomieLogoProps {
  size?: number;
}

const VroomieLogo: React.FC<VroomieLogoProps> = ({ size = 100 }) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(rotation, { 
          toValue: 1, 
          duration: 3000, 
          useNativeDriver: true 
        }),
        Animated.sequence([
          Animated.timing(scale, { 
            toValue: 1.1, 
            duration: 1500, 
            useNativeDriver: true 
          }),
          Animated.timing(scale, { 
            toValue: 1, 
            duration: 1500, 
            useNativeDriver: true 
          }),
        ]),
      ])
    ).start();
  }, [rotation, scale]);

  const rotate = rotation.interpolate({ 
    inputRange: [0, 1], 
    outputRange: ['0deg', '360deg'] 
  });

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ rotate }, { scale }] }}>
        <Svg height={size} width={size} viewBox="0 0 100 100">
          {/* Outer circle */}
          <Circle 
            cx="50" 
            cy="50" 
            r="45" 
            stroke="#FCD34D" 
            strokeWidth="3" 
            fill="none" 
          />
          
          {/* Inner gear-like pattern */}
          <Circle 
            cx="50" 
            cy="50" 
            r="35" 
            stroke="#FCD34D" 
            strokeWidth="2" 
            fill="rgba(252, 211, 77, 0.1)" 
          />
          
          {/* Center V shape */}
          <Path
            d="M 35 30 L 50 55 L 65 30"
            stroke="#FCD34D"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Waveform lines */}
          <Path
            d="M 30 65 Q 35 60, 40 65 T 50 65 T 60 65 T 70 65"
            stroke="#FCD34D"
            strokeWidth="2"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
});

export default VroomieLogo;
