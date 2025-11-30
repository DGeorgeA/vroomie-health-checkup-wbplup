
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { IconSymbol } from './IconSymbol';
import { colors } from '@/styles/commonStyles';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onPress?: () => void;
}

export default function ListItem({ title, subtitle, icon, onPress }: ListItemProps) {
  const content = (
    <BlurView intensity={20} style={styles.container}>
      <View style={styles.content}>
        {icon && (
          <View style={styles.iconContainer}>
            <IconSymbol
              ios_icon_name={icon}
              android_material_icon_name={icon}
              size={24}
              color={colors.primary}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <IconSymbol
          ios_icon_name="chevron.right"
          android_material_icon_name="chevron-right"
          size={20}
          color={colors.textSecondary}
        />
      </View>
    </BlurView>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(252, 211, 77, 0.3)',
    overflow: 'hidden',
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(252, 211, 77, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
