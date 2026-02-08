import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { FinancesShell } from '../components/FinancesShell';

export default function BudgetSuccessScreen() {
  const router = useRouter() as any;

  return (
    <FinancesShell title="Budget Updated" subtitle="You are in control" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Budget saved</Text>
        <Text style={styles.body}>Relay will use these limits in category insights and warnings.</Text>
      </GlassCard>

      <PrimaryButton label="Go to Finances" onPress={() => router.replace('/finances')} />
      <SecondaryButton label="View categories" onPress={() => router.push('/finances/summary')} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: ds.spacing.s8,
  },
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
