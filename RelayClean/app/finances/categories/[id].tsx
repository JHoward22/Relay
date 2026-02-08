import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { findCategoryName, fmtCurrency, useFinancesStore } from '../finances-context';
import { FinanceVoiceHint, FinancesShell, FinancesTalkSheet } from '../components/FinancesShell';

export default function CategoryDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, updateCategoryBudget } = useFinancesStore();
  const [talkOpen, setTalkOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const category = useMemo(() => state.categories.find((entry) => entry.id === id), [id, state.categories]);
  const txs = useMemo(() => state.transactions.filter((tx) => tx.categoryId === id), [id, state.transactions]);
  const [budgetInput, setBudgetInput] = useState(String(category?.budgetLimit || 0));

  if (!category) {
    return (
      <FinancesShell title="Category" subtitle="Not found" onBack={() => router.back()}>
        <EmptyState title="Category not found" body="This category may have been removed." />
      </FinancesShell>
    );
  }

  return (
    <FinancesShell title={category.name} subtitle="Spend vs budget" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.title}>{fmtCurrency(category.spent)} / {fmtCurrency(category.budgetLimit)}</Text>
        <Text style={styles.body}>
          {category.trendDeltaPercent > 0 ? 'This category increased' : 'This category decreased'} by {Math.abs(category.trendDeltaPercent)}%.
        </Text>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.label}>Transactions</Text>
        <View style={styles.stack}>
          {txs.map((tx) => (
            <ListRow
              key={tx.id}
              icon={tx.type === 'income' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'}
              iconTint={tx.type === 'income' ? ds.colors.success : ds.colors.warning}
              label={tx.title}
              body={`${tx.dateISO} · ${findCategoryName(state.categories, tx.categoryId)}`}
              rightText={fmtCurrency(tx.amount)}
            />
          ))}
        </View>
      </GlassCard>

      <PrimaryButton label="Adjust budget" onPress={() => setBudgetOpen(true)} />
      <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />

      <FinanceVoiceHint text="Try 'Why did this category increase?'" onAsk={() => setTalkOpen(true)} />

      <SheetModal visible={budgetOpen} onClose={() => setBudgetOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Adjust budget</Text>
          <View style={styles.sheetActions}>
            <BubbleChip icon="remove" label="-25" tone="neutral" onPress={() => setBudgetInput(String(Math.max(0, Number(budgetInput || 0) - 25)))} />
            <BubbleChip icon="add" label="+25" tone="neutral" onPress={() => setBudgetInput(String(Number(budgetInput || 0) + 25))} />
            <BubbleChip
              icon="checkmark"
              label={`Set ${budgetInput}`}
              tone="success"
              onPress={() => {
                updateCategoryBudget({ categoryId: category.id, budgetLimit: Number(budgetInput) || category.budgetLimit });
                setBudgetOpen(false);
              }}
            />
          </View>
        </View>
      </SheetModal>

      <FinancesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.title.fontSize,
    lineHeight: ds.type.title.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  body: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  label: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  stack: {
    gap: ds.spacing.s8,
  },
  sheetWrap: {
    gap: ds.spacing.s12,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
