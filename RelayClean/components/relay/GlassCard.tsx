import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ds } from '@/constants/design-system';

export function GlassCard({
  children,
  style,
  blur = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  blur?: boolean;
}) {
  if (blur) {
    return (
      <BlurView intensity={24} tint="light" style={[styles.base, style]}>
        {children}
      </BlurView>
    );
  }

  return <View style={[styles.base, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: ds.colors.border,
    borderRadius: ds.radius.surface,
    padding: ds.spacing.s16,
    overflow: 'hidden',
    ...ds.shadow.soft,
  },
});
