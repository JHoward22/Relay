import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { ds } from '@/constants/design-system';
import { GlassCard } from './GlassCard';

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard blur style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    fontWeight: '600',
    color: ds.colors.text,
    textAlign: 'center',
  },
  body: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    textAlign: 'center',
    fontWeight: '400',
  },
});
