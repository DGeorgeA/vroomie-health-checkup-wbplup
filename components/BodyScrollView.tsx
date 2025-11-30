
import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface BodyScrollViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export default function BodyScrollView({ 
  children, 
  style, 
  contentContainerStyle 
}: BodyScrollViewProps) {
  return (
    <ScrollView
      style={[styles.scrollView, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
