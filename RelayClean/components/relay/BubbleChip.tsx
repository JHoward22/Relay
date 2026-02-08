import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ds } from '@/constants/design-system';

type BubbleChipTone = 'primary' | 'neutral' | 'success' | 'danger';

const toneStyles: Record<BubbleChipTone, { bg: string; border: string; icon: string; text: string }> = {
  primary: {
    bg: 'rgba(37,132,255,0.14)',
    border: 'rgba(74,145,255,0.38)',
    icon: '#1F7AFF',
    text: '#1F7AFF',
  },
  neutral: {
    bg: 'rgba(255,255,255,0.74)',
    border: 'rgba(171,197,233,0.45)',
    icon: ds.colors.textSoft,
    text: ds.colors.textSoft,
  },
  success: {
    bg: 'rgba(44,155,109,0.16)',
    border: 'rgba(64,177,129,0.42)',
    icon: ds.colors.success,
    text: ds.colors.success,
  },
  danger: {
    bg: 'rgba(224,105,105,0.16)',
    border: 'rgba(229,132,132,0.42)',
    icon: '#D05D5D',
    text: '#C84E4E',
  },
};

export function BubbleChip({
  label,
  icon,
  tone = 'neutral',
  onPress,
  style,
  compact = false,
  onDark = false,
}: {
  label?: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone?: BubbleChipTone;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
  onDark?: boolean;
}) {
  const scale = useSharedValue(1);
  const [pressed, setPressed] = useState(false);
  const baseTone = toneStyles[tone];
  const t = onDark
    ? {
        bg:
          tone === 'success'
            ? 'rgba(74, 180, 133, 0.24)'
            : tone === 'danger'
              ? 'rgba(214, 100, 100, 0.24)'
              : tone === 'primary'
                ? 'rgba(70, 147, 255, 0.24)'
                : 'rgba(255,255,255,0.16)',
        border:
          tone === 'success'
            ? 'rgba(152, 231, 189, 0.52)'
            : tone === 'danger'
              ? 'rgba(238, 171, 171, 0.52)'
              : tone === 'primary'
                ? 'rgba(177, 215, 255, 0.52)'
                : 'rgba(217, 233, 255, 0.42)',
        icon: '#F4FAFF',
        text: '#F4FAFF',
      }
    : baseTone;

  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animated}>
      <Pressable
        onPressIn={() => {
          setPressed(true);
          scale.value = withTiming(0.985, { duration: ds.motion.pressDuration });
        }}
        onPressOut={() => {
          setPressed(false);
          scale.value = withTiming(1, { duration: ds.motion.pressDuration });
        }}
        onPress={async () => {
          await Haptics.selectionAsync();
          onPress();
        }}
        style={[
          styles.base,
          compact ? styles.compact : styles.regular,
          {
            backgroundColor: t.bg,
            borderColor: t.border,
          },
          pressed && styles.pressed,
          style,
        ]}
      >
        <BlurView intensity={18} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.innerHighlight} />
        <Ionicons name={icon} size={compact ? 14 : 16} color={t.icon} />
        {label ? <Text style={[styles.label, { color: t.text }]}>{label}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: ds.spacing.s4,
    overflow: 'hidden',
    ...ds.shadow.soft,
  },
  regular: {
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
  },
  compact: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  innerHighlight: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 2,
    height: 1,
    borderRadius: 2,
    backgroundColor: ds.colors.glassHighlight,
  },
  label: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  pressed: {
    ...ds.shadow.pressed,
  },
});
