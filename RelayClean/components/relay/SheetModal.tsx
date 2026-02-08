import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ds } from '@/constants/design-system';

export function SheetModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progress.value = withSpring(1, {
        damping: 24,
        stiffness: 220,
        mass: 0.9,
      });
      return;
    }

    progress.value = withTiming(0, {
      duration: ds.motion.modalDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 88 }],
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheetWrap, animatedStyle]}>
          <BlurView intensity={34} tint="light" style={styles.sheet}>
            <View style={styles.sheen} />
            {children}
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: ds.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheetWrap: {
    paddingHorizontal: ds.spacing.s12,
    paddingBottom: ds.spacing.s16,
  },
  sheet: {
    borderRadius: ds.radius.surface,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
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
});
