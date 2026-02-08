import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ds } from '@/constants/design-system';
import { RelayBox } from '@/theme/restyle';

export function GlassCard({
  children,
  style,
  blur = false,
  tone = 'light',
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  blur?: boolean;
  tone?: 'light' | 'dark';
}) {
  const useDarkSurface = tone === 'dark';
  const fill = useDarkSurface ? ds.colors.darkGlassFill : ds.colors.glassFill;
  const softFill = useDarkSurface ? 'rgba(23,34,56,0.62)' : ds.colors.glassFillSoft;
  const border = useDarkSurface ? ds.colors.darkGlassBorder : ds.colors.glassBorder;

  if (blur) {
    return (
      <BlurView
        intensity={useDarkSurface ? 24 : 30}
        tint={useDarkSurface ? 'dark' : 'light'}
        style={[styles.base, { borderColor: border }, style]}
      >
        <LinearGradient
          colors={[fill, softFill]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.sheen} />
        {children}
      </BlurView>
    );
  }

  return (
    <RelayBox backgroundColor="card" style={[styles.base, { borderColor: border }, style]}>
      <LinearGradient
        colors={[fill, softFill]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.sheen} />
      {children}
    </RelayBox>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(250, 252, 255, 0.8)',
    borderWidth: 1,
    borderRadius: ds.radius.card,
    padding: ds.spacing.s12,
    overflow: 'hidden',
    ...ds.shadow.card,
  },
  sheen: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    height: 1,
    borderRadius: 2,
    backgroundColor: ds.colors.glassHighlight,
  },
});
