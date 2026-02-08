import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ds } from '@/constants/design-system';
import { RelayText } from '@/theme/restyle';

export function AppHeader({
  title,
  subtitle,
  onBack,
  rightLabel,
  onRightPress,
  rightNode,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightLabel?: string;
  onRightPress?: () => void;
  rightNode?: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.circleButton}>
          <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.sheen} />
          <Ionicons name="chevron-back" size={18} color={ds.colors.text} />
        </Pressable>
      ) : (
        <View style={styles.sideSpacer} />
      )}

      <View style={styles.titleWrap}>
        <RelayText variant="header" style={styles.title}>
          {title}
        </RelayText>
        {subtitle ? (
          <RelayText variant="body" style={styles.subtitle}>
            {subtitle}
          </RelayText>
        ) : null}
      </View>

      {rightNode ? (
        rightNode
      ) : rightLabel ? (
        <Pressable onPress={onRightPress} style={styles.rightButton}>
          <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.sheen} />
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
    minHeight: 46,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    overflow: 'hidden',
    ...ds.shadow.soft,
  },
  rightButton: {
    minHeight: 44,
    minWidth: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ds.spacing.s12,
    overflow: 'hidden',
    ...ds.shadow.soft,
  },
  rightText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  sideSpacer: {
    width: 44,
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
    color: ds.colors.text,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 19,
    color: ds.colors.textMuted,
    fontWeight: '500',
    textAlign: 'left',
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
