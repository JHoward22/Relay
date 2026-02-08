import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { FinanceVoiceHint, FinancesShell, FinancesTalkSheet } from './components/FinancesShell';
import { findCategoryName, fmtCurrency, useFinancesStore } from './finances-context';

export default function FinancialSummaryScreen() {
  const router = useRouter() as any;
  const { state } = useFinancesStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const totals = useMemo(() => {
    const income = state.incomes.reduce((sum, item) => sum + item.amount, 0);
    const spent = state.transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    const remain = income - spent;
    return { income, spent, remain };
  }, [state.incomes, state.transactions]);

  return (
    <FinancesShell title="Financial Summary" subtitle="Natural-language overview" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.summaryTitle}>Here is what happened this month</Text>
        <Text style={styles.summaryBody}>
          You brought in {fmtCurrency(totals.income)} and spent {fmtCurrency(totals.spent)}. Remaining: {fmtCurrency(totals.remain)}.
          Housing stayed steady, while food came in above plan.
        </Text>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.sectionTitle}>Category breakdown</Text>
        <View style={styles.rowWrap}>
          {state.categories.map((cat) => (
            <ListRow
              key={cat.id}
              icon={cat.icon as any}
              iconTint={cat.color}
              label={cat.name}
              body={`${fmtCurrency(cat.spent)} of ${fmtCurrency(cat.budgetLimit)}`}
              rightText={`${cat.trendDeltaPercent > 0 ? '+' : ''}${cat.trendDeltaPercent}%`}
              onPress={() => router.push(`/finances/categories/${cat.id}`)}
            />
          ))}
        </View>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.sectionTitle}>Recent transactions</Text>
        <View style={styles.rowWrap}>
          {state.transactions.slice(0, 8).map((tx) => (
            <ListRow
              key={tx.id}
              icon={tx.type === 'income' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
              iconTint={tx.type === 'income' ? ds.colors.success : ds.colors.warning}
              label={tx.title}
              body={`${findCategoryName(state.categories, tx.categoryId)} · ${tx.dateISO}`}
              rightText={fmtCurrency(tx.amount)}
            />
          ))}
        </View>
      </GlassCard>

      <PrimaryButton label="Summarize by voice" onPress={() => setTalkOpen(true)} />
      <SecondaryButton label="Save summary as note" onPress={() => router.push('/notes/create')} />
      <SecondaryButton label="Ask follow-up" onPress={() => setTalkOpen(true)} />

      <FinanceVoiceHint text="Try 'What changed most this week?'" onAsk={() => setTalkOpen(true)} />

      <FinancesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  summaryTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  summaryBody: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  rowWrap: {
    gap: ds.spacing.s8,
  },
});
