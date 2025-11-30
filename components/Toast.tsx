
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  duration = 3000,
  onHide 
}) => {
  const [opacity] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onHide) onHide();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [opacity, translateY, duration, onHide]);

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { 
          ios: 'checkmark.circle.fill', 
          android: 'check-circle', 
          color: '#10B981' 
        };
      case 'error':
        return { 
          ios: 'xmark.circle.fill', 
          android: 'error', 
          color: '#EF4444' 
        };
      case 'warning':
        return { 
          ios: 'exclamationmark.triangle.fill', 
          android: 'warning', 
          color: '#F59E0B' 
        };
      case 'info':
      default:
        return { 
          ios: 'info.circle.fill', 
          android: 'info', 
          color: '#3B82F6' 
        };
    }
  };

  const { ios, android, color } = getIconAndColor();

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <BlurView intensity={40} style={styles.blurContainer}>
        <View style={[styles.content, { borderLeftColor: color }]}>
          <IconSymbol
            ios_icon_name={ios}
            android_material_icon_name={android}
            size={24}
            color={color}
          />
          <Text style={styles.message}>{message}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : Platform.OS === 'android' ? 100 : 20,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  blurContainer: {
    backgroundColor: 'rgba(39, 39, 42, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
});

// Toast Manager
class ToastManager {
  private listeners: Array<(toast: ToastProps) => void> = [];

  subscribe(listener: (toast: ToastProps) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show(message: string, type: ToastType = 'success', duration = 3000) {
    this.listeners.forEach(listener => {
      listener({ message, type, duration });
    });
  }

  success(message: string, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 3000) {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration = 3000) {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration = 3000) {
    this.show(message, 'info', duration);
  }
}

export const toast = new ToastManager();
