import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { FinancesShell } from '../components/FinancesShell';

export default function AddItemSuccessScreen() {
  const router = useRouter() as any;
  const { type } = useLocalSearchParams<{ type?: string }>();

  return (
    <FinancesShell title="Saved" subtitle="Finance item added" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>{type || 'Item'} added successfully</Text>
        <Text style={styles.body}>Relay included this in your monthly overview and upcoming insights.</Text>
      </GlassCard>

      <PrimaryButton label="Go to Finances" onPress={() => router.replace('/finances')} />
      <SecondaryButton label="Add another" onPress={() => router.replace('/finances/add')} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: ds.spacing.s8 },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
