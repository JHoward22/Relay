import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ds } from '@/constants/design-system';

type ListRowProps = {
  label: string;
  body?: string;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  iconTint?: string;
  badge?: string;
  rightText?: string;
  trailing?: React.ReactNode;
  variant?: 'card' | 'compact';
  style?: StyleProp<ViewStyle>;
};

export function ListRow({
  label,
  body,
  onPress,
  icon,
  iconTint,
  badge,
  rightText,
  trailing,
  variant = 'card',
  style,
}: ListRowProps) {
  const tint = iconTint ?? ds.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'card' ? styles.card : styles.compact,
        pressed && onPress ? styles.pressed : null,
        style,
      ]}
    >
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: `${tint}1A` }]}>
          <Ionicons name={icon} size={16} color={tint} />
        </View>
      ) : null}

      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
      {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={16} color={ds.colors.secondary} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s12,
  },
  card: {
    backgroundColor: ds.colors.card,
    borderRadius: ds.radius.card,
    borderWidth: 1,
    borderColor: ds.colors.border,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    ...ds.shadow.soft,
  },
  compact: {
    borderRadius: ds.radius.surface,
    paddingHorizontal: ds.spacing.s4,
    paddingVertical: ds.spacing.s12,
  },
  pressed: {
    opacity: 0.9,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: ds.radius.surface / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '600',
  },
  body: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  badge: {
    marginTop: ds.spacing.s8,
    alignSelf: 'flex-start',
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s4,
    borderRadius: ds.radius.pill,
    backgroundColor: ds.colors.primarySoft,
  },
  badgeText: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.primary,
    fontWeight: '600',
  },
  rightText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
