import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { ds } from '@/constants/design-system';

function BaseButton({
  label,
  onPress,
  variant,
  style,
}: {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={variant === 'primary' ? styles.primaryText : styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton(props: { label: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return <BaseButton {...props} variant="primary" />;
}

export function SecondaryButton(props: { label: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return <BaseButton {...props} variant="secondary" />;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: ds.radius.surface,
    paddingVertical: ds.spacing.s12,
    paddingHorizontal: ds.spacing.s16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: ds.colors.primary,
    ...ds.shadow.soft,
  },
  secondary: {
    backgroundColor: ds.colors.bgAlt,
    borderWidth: 1,
    borderColor: ds.colors.border,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  primaryText: {
    fontFamily: ds.font,
    color: '#FFFFFF',
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    fontWeight: '600',
  },
  secondaryText: {
    fontFamily: ds.font,
    color: ds.colors.text,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    fontWeight: '600',
  },
});
