import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, typography } from '../design-system';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export const AppButton = ({
  label,
  onPress,
  variant = 'primary',
  style,
  textStyle,
}: AppButtonProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.base,
      styles[variant],
      pressed && styles.pressed,
      style,
    ]}
  >
    <Text style={[styles.label, styles[`label_${variant}`], textStyle]}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.accentSoft,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  label: {
    ...typography.bodyBold,
  },
  label_primary: {
    color: colors.surface,
  },
  label_secondary: {
    color: colors.accent,
  },
  label_ghost: {
    color: colors.textSecondary,
  },
  pressed: {
    opacity: 0.85,
  },
});
