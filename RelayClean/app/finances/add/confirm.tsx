import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { FinancesShell } from '../components/FinancesShell';
import { useFinancesStore } from '../finances-context';

export default function AddItemConfirmationScreen() {
  const router = useRouter() as any;
  const { type, payload } = useLocalSearchParams<{ type?: 'income' | 'expense'; payload?: string }>();
  const { addIncome, addTransaction } = useFinancesStore();

  const parsed = useMemo(() => {
    if (!payload) return null;
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }, [payload]);

  return (
    <FinancesShell title="Confirm" subtitle="Review before add" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>You are adding {type}</Text>
        <Text style={styles.body}>{parsed ? JSON.stringify(parsed, null, 2) : 'No details found.'}</Text>
      </GlassCard>

      <View style={styles.row}>
        <BubbleChip
          icon="checkmark"
          label="Confirm"
          tone="success"
          onPress={() => {
            if (type === 'income' && parsed) {
              addIncome({
                sourceName: parsed.sourceName || 'Income',
                amount: Number(parsed.amount) || 0,
                dateISO: parsed.dateISO || new Date().toISOString().slice(0, 10),
                recurring: false,
                frequency: 'one-time',
                notes: parsed.notes || '',
              });
            }

            if (type === 'expense' && parsed) {
              addTransaction({
                type: 'expense',
                title: parsed.title || 'Expense',
                amount: Number(parsed.amount) || 0,
                dateISO: parsed.dateISO || new Date().toISOString().slice(0, 10),
                categoryId: parsed.categoryId || 'cat-food',
                source: 'manual',
                notes: parsed.notes || '',
              });
            }

            router.replace({ pathname: '/finances/add/success', params: { type: type || 'expense' } });
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
    fontSize: 12,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    flexWrap: 'wrap',
  },
});
