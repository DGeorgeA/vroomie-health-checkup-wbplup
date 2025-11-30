
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Toast, ToastType, toast } from './Toast';

interface ToastData {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const unsubscribe = toast.subscribe(({ message, type, duration }) => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts(prev => [...prev, { id, message, type: type || 'success', duration: duration || 3000 }]);
    });

    return unsubscribe;
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map(t => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          duration={t.duration}
          onHide={() => removeToast(t.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
});
