import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const textStyle = variant === 'primary' ? styles.primaryText : styles.secondaryText;

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPressIn={() => {
          scale.value = withTiming(0.985, { duration: ds.motion.pressDuration });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: ds.motion.pressDuration });
        }}
        onPress={async () => {
          await Haptics.selectionAsync();
          onPress();
        }}
        style={[styles.base, variant === 'primary' ? styles.primaryWrap : styles.secondaryWrap]}
      >
        <BlurView intensity={16} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.innerHighlight} />

        {variant === 'primary' ? (
          <LinearGradient
            colors={['#66BBFF', '#2E90FF', '#1977F8']}
            start={{ x: 0, y: 0.1 }}
            end={{ x: 1, y: 0.9 }}
            style={styles.primary}
          >
            <Text style={textStyle}>{label}</Text>
          </LinearGradient>
        ) : (
          <Text style={textStyle}>{label}</Text>
        )}
      </Pressable>
    </Animated.View>
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
    minHeight: 44,
    borderRadius: ds.radius.r16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  primaryWrap: {
    borderColor: 'rgba(182, 214, 255, 0.95)',
    backgroundColor: 'rgba(49,139,255,0.2)',
    ...ds.shadow.card,
  },
  primary: {
    width: '100%',
    minHeight: 44,
    paddingVertical: ds.spacing.s12,
    paddingHorizontal: ds.spacing.s16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryWrap: {
    borderColor: ds.colors.glassBorder,
    backgroundColor: 'rgba(250,253,255,0.86)',
    paddingVertical: ds.spacing.s12,
    paddingHorizontal: ds.spacing.s16,
    ...ds.shadow.soft,
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
  primaryText: {
    fontFamily: ds.font,
    color: '#FFFFFF',
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    fontWeight: '700',
  },
  secondaryText: {
    fontFamily: ds.font,
    color: ds.colors.textSoft,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    fontWeight: '600',
  },
});
