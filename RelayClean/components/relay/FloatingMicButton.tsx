import React, { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ds } from '@/constants/design-system';

export function FloatingMicButton({
  onPress,
  bottom = 22,
  align = 'center',
  compact = false,
  listening = false,
}: {
  onPress: () => void;
  bottom?: number;
  align?: 'center' | 'right';
  compact?: boolean;
  listening?: boolean;
}) {
  const pulse = useSharedValue(0);
  const haloSize = compact ? 72 : 130;
  const buttonSize = compact ? 54 : 108;

  useEffect(() => {
    if (listening) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        -1,
        true
      );
      return;
    }

    pulse.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) });
  }, [listening, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.08 }],
    opacity: 0.9 - pulse.value * 0.35,
  }));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        align === 'right' ? styles.right : { left: '50%', marginLeft: -haloSize / 2 },
        { bottom },
      ]}
    >
      <Animated.View
        style={[
          styles.pulseRing,
          { width: haloSize, height: haloSize, borderRadius: haloSize / 2 },
          pulseStyle,
        ]}
      />
      <BlurView
        intensity={36}
        tint="light"
        pointerEvents="box-none"
        style={[
          styles.halo,
          { width: haloSize, height: haloSize, borderRadius: haloSize / 2 },
        ]}
      >
        <View style={styles.sheen} />
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.button,
            {
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
            },
            pressed && styles.pressed,
          ]}
        >
          <LinearGradient
            colors={['#6CC0FF', '#2F92FF', '#1575F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Ionicons name="mic" size={compact ? 22 : 40} color="#FFFFFF" />
            {!compact ? <Text style={styles.micLabel}>Talk to Relay</Text> : null}
          </LinearGradient>
        </Pressable>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    right: 18,
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: 'rgba(89, 170, 255, 0.28)',
  },
  halo: {
    borderWidth: 1,
    borderColor: 'rgba(182, 214, 255, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...ds.shadow.card,
  },
  sheen: {
    position: 'absolute',
    left: 2,
    right: 2,
    top: 2,
    height: 1,
    borderRadius: 2,
    backgroundColor: ds.colors.glassHighlight,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#DAE8FF',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ds.spacing.s8,
  },
  micLabel: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 17,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
});
