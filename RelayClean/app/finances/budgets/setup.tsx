import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { ds } from '@/constants/design-system';
import { FinancesShell } from '../components/FinancesShell';
import { Budget, FinanceTimeRange, useFinancesStore } from '../finances-context';

export default function BudgetSetupScreen() {
  const router = useRouter() as any;
  const { state } = useFinancesStore();

  const existing = state.budgets[0];

  const [timeframe, setTimeframe] = useState<FinanceTimeRange>(existing?.timeframe || 'month');
  const [totalLimit, setTotalLimit] = useState(String(existing?.totalLimit || 4000));
  const [limits, setLimits] = useState<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    state.categories.forEach((cat) => {
      out[cat.id] = String(cat.budgetLimit);
    });
    return out;
  });

  const aiSuggestion = useMemo(() => {
    return state.categories.reduce((sum, cat) => sum + Math.round(cat.spent * 1.05), 0);
  }, [state.categories]);

  return (
    <FinancesShell title="Budget Setup" subtitle="Set limits with AI guidance" onBack={() => router.back()}>
      <View style={styles.row}>
        {(['week', 'month', 'custom'] as FinanceTimeRange[]).map((range) => (
          <BubbleChip
            key={range}
            icon="calendar-outline"
            label={range}
            tone={timeframe === range ? 'primary' : 'neutral'}
            onPress={() => setTimeframe(range)}
          />
        ))}
      </View>

      <FormField label="Total limit" value={totalLimit} onChangeText={setTotalLimit} keyboardType="decimal-pad" />

      <Text style={styles.label}>Category limits</Text>
      <View style={styles.stack}>
        {state.categories.map((cat) => (
          <FormField
            key={cat.id}
            label={cat.name}
            value={limits[cat.id] || '0'}
            onChangeText={(value) => setLimits((prev) => ({ ...prev, [cat.id]: value }))}
            keyboardType="decimal-pad"
          />
        ))}
      </View>

      <SecondaryButton
        label={`Use AI suggestion (${aiSuggestion})`}
        onPress={() => {
          setTotalLimit(String(aiSuggestion));
          setLimits((prev) => {
            const next = { ...prev };
            state.categories.forEach((cat) => {
              next[cat.id] = String(Math.round(cat.spent * 1.05));
            });
            return next;
          });
        }}
      />

      <PrimaryButton
        label="Confirm budget"
        onPress={() => {
          const payload: Budget = {
            id: existing?.id || 'budget-main',
            timeframe,
            startISO: existing?.startISO || new Date().toISOString().slice(0, 10),
            endISO: existing?.endISO || new Date().toISOString().slice(0, 10),
            totalLimit: Number(totalLimit) || 0,
            categoryLimits: state.categories.map((cat) => ({
              categoryId: cat.id,
              limit: Number(limits[cat.id] || cat.budgetLimit),
            })),
            spentToDate: state.categories.reduce((sum, cat) => sum + cat.spent, 0),
          };

          router.push({
            pathname: '/finances/budgets/confirm',
            params: {
              payload: JSON.stringify(payload),
            },
          });
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  label: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '700',
  },
  stack: {
    gap: ds.spacing.s8,
  },
});
