import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export function LiquidBackdrop() {
  const speckles = Array.from({ length: 22 }).map((_, index) => {
    const size = 8 + ((index * 7) % 18);
    return (
      <View
        key={index}
        style={[
          styles.speckle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: 12 + ((index * 63) % 680),
            left: 16 + ((index * 41) % 340),
            opacity: 0.06 + ((index % 4) * 0.02),
          },
        ]}
      />
    );
  });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#DDE3EC', '#D5DCE7', '#CBD3E0']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={['rgba(244,247,252,0.6)', 'rgba(221,229,240,0.54)', 'rgba(234,239,247,0.58)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <LinearGradient
        colors={['rgba(35,50,75,0.08)', 'rgba(35,50,75,0.03)', 'rgba(35,50,75,0.08)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.blob, styles.blobA]}>
        <BlurView intensity={34} tint="light" style={styles.blobInner} />
      </View>
      <View style={[styles.blob, styles.blobB]}>
        <BlurView intensity={30} tint="light" style={styles.blobInner} />
      </View>
      <View style={[styles.blob, styles.blobC]}>
        <BlurView intensity={26} tint="light" style={styles.blobInner} />
      </View>
      <View style={styles.speckleLayer}>{speckles}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
  },
  blobInner: {
    flex: 1,
  },
  blobA: {
    width: 260,
    height: 260,
    top: -80,
    left: -40,
    backgroundColor: 'rgba(196, 205, 219, 0.18)',
  },
  blobB: {
    width: 240,
    height: 240,
    top: 140,
    right: -80,
    backgroundColor: 'rgba(184, 196, 214, 0.14)',
  },
  blobC: {
    width: 220,
    height: 220,
    bottom: -60,
    left: 40,
    backgroundColor: 'rgba(205, 215, 229, 0.16)',
  },
  speckleLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  speckle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
