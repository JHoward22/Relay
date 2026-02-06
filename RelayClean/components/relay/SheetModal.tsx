import { BlurView } from 'expo-blur';
import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
    progress.value = withTiming(visible ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 80 }],
    opacity: progress.value,
  }));

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View style={[styles.sheetWrap, animatedStyle]}>
          <BlurView intensity={30} tint="light" style={styles.sheet}>
            {children}
          </BlurView>
        </Animated.View>
      </View>
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
    borderColor: ds.colors.border,
    backgroundColor: 'rgba(255,255,255,0.88)',
    ...ds.shadow.card,
  },
});
