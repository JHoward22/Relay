import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ds } from '@/constants/design-system';

export function BottomMicBar({
  onMicPress,
  onDone,
  onLater,
  onViewAll,
}: {
  onMicPress: () => void;
  onDone?: () => void;
  onLater?: () => void;
  onViewAll?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.micHalo}>
        <Pressable style={styles.micButton} onPress={onMicPress}>
          <Ionicons name="mic" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
      <Text style={styles.micLabel}>Talk to Relay</Text>

      <View style={styles.utilityBar}>
        <Pressable style={styles.utilityItem} onPress={onDone}>
          <Text style={styles.utilityText}>Done</Text>
        </Pressable>
        <View style={styles.utilityDivider} />
        <Pressable style={styles.utilityItem} onPress={onLater}>
          <Text style={styles.utilityText}>Later</Text>
        </Pressable>
        <View style={styles.utilityDivider} />
        <Pressable style={styles.utilityItem} onPress={onViewAll}>
          <Text style={styles.utilityText}>View All</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: ds.spacing.s12,
    alignItems: 'center',
  },
  micHalo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: ds.colors.border,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: ds.radius.mic,
    backgroundColor: ds.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D9E3FB',
    ...ds.shadow.card,
  },
  micLabel: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    fontWeight: '600',
    color: ds.colors.text,
  },
  utilityBar: {
    marginTop: ds.spacing.s12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: ds.radius.surface,
    backgroundColor: ds.colors.card,
    borderWidth: 1,
    borderColor: ds.colors.border,
    paddingVertical: ds.spacing.s8,
    paddingHorizontal: ds.spacing.s12,
    ...ds.shadow.soft,
  },
  utilityItem: {
    paddingHorizontal: ds.spacing.s12,
  },
  utilityText: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    fontWeight: '500',
    color: ds.colors.textMuted,
  },
  utilityDivider: {
    width: 1,
    height: 16,
    backgroundColor: ds.colors.border,
  },
});
