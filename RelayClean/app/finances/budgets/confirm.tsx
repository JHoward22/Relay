import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { FinancesShell } from '../components/FinancesShell';
import { Budget, fmtCurrency, useFinancesStore } from '../finances-context';

export default function BudgetConfirmationScreen() {
  const router = useRouter() as any;
  const { payload } = useLocalSearchParams<{ payload?: string }>();
  const { setBudget } = useFinancesStore();

  const budget = useMemo<Budget | null>(() => {
    if (!payload) return null;
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }, [payload]);

  return (
    <FinancesShell title="Budget Confirmation" subtitle="Review before save" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Summary</Text>
        <Text style={styles.body}>Timeframe: {budget?.timeframe ?? 'month'}</Text>
        <Text style={styles.body}>Total limit: {fmtCurrency(budget?.totalLimit || 0)}</Text>
        <Text style={styles.body}>Categories: {budget?.categoryLimits.length || 0}</Text>
      </GlassCard>

      <View style={styles.row}>
        <BubbleChip
          icon="checkmark"
          label="Confirm"
          tone="success"
          onPress={() => {
            if (budget) setBudget(budget);
            router.replace('/finances/budgets/success');
          }}
        />
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.back()} />
        <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => router.replace('/finances')} />
      </View>
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
