import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ds } from '@/constants/design-system';

export function SectionTitle({
  title,
  rightLabel,
  onRightPress,
}: {
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {rightLabel ? (
        <Pressable onPress={onRightPress}>
          <Text style={styles.right}>{rightLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ds.spacing.s8,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    fontWeight: '600',
    color: ds.colors.text,
  },
  right: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.primary,
    fontWeight: '600',
  },
});
