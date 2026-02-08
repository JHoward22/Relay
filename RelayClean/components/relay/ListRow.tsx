import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
  thumbnail?: React.ReactNode;
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
  thumbnail,
}: ListRowProps) {
  const tint = iconTint ?? ds.colors.primary;
  const scale = useSharedValue(1);

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animated}>
      <Pressable
        onPressIn={() => {
          if (!onPress) return;
          scale.value = withTiming(0.99, { duration: ds.motion.pressDuration });
        }}
        onPressOut={() => {
          if (!onPress) return;
          scale.value = withTiming(1, { duration: ds.motion.pressDuration });
        }}
        onPress={onPress}
        style={[
          styles.base,
          variant === 'card' ? styles.card : styles.compact,
          onPress ? styles.pressable : null,
          style,
        ]}
      >
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.sheen} />

        {thumbnail ??
          (icon ? (
            <View style={[styles.iconWrap, { backgroundColor: `${tint}1A` }]}>
              <Ionicons name={icon} size={16} color={tint} />
            </View>
          ) : null)}

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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s12,
    overflow: 'hidden',
  },
  card: {
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    ...ds.shadow.soft,
  },
  compact: {
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: 'rgba(202, 218, 242, 0.8)',
    backgroundColor: 'rgba(255,255,255,0.62)',
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s12,
  },
  pressable: {
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
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
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
