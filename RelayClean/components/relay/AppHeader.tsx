import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ds } from '@/constants/design-system';

export function AppHeader({
  title,
  subtitle,
  onBack,
  rightLabel,
  onRightPress,
  center = false,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  center?: boolean;
}) {
  return (
    <View style={[styles.wrap, center && styles.centerWrap]}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={18} color={ds.colors.text} />
        </Pressable>
      ) : (
        <View style={styles.sideSpacer} />
      )}

      <View style={styles.titleWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightLabel ? (
        <Pressable onPress={onRightPress} style={styles.rightButton}>
          <Text style={styles.rightText}>{rightLabel}</Text>
        </Pressable>
      ) : (
        <View style={styles.sideSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ds.spacing.s16,
    minHeight: 44,
  },
  centerWrap: {
    justifyContent: 'space-between',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ds.colors.card,
    borderWidth: 1,
    borderColor: ds.colors.border,
  },
  rightButton: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  rightText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  sideSpacer: {
    width: 32,
  },
  titleWrap: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: ds.spacing.s8,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.title.fontSize,
    lineHeight: ds.type.title.lineHeight,
    letterSpacing: -0.2,
    color: ds.colors.text,
    fontWeight: '600',
  },
  subtitle: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '400',
    textAlign: 'left',
  },
});
