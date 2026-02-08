import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { billDueLabel, fmtCurrency, subscriptionRenewalLabel, useFinancesStore } from './finances-context';
import { FinanceVoiceHint, FinancesShell, FinancesTalkSheet } from './components/FinancesShell';

export default function FinancesHomeScreen() {
  const router = useRouter() as any;
  const { state, insights, dismissInsight } = useFinancesStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const totalIncome = state.incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalSpent = state.transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const remaining = totalIncome - totalSpent;
  const spentRatio = totalIncome > 0 ? Math.min(1, totalSpent / totalIncome) : 0;

  const dueSoonBills = useMemo(
    () => state.bills.filter((bill) => bill.status !== 'paid').slice(0, 3),
    [state.bills]
  );

  const renewalSoon = useMemo(
    () => state.subscriptions.filter((sub) => sub.status === 'active').slice(0, 2),
    [state.subscriptions]
  );

  const topInsight = insights[0] ?? null;

  return (
    <FinancesShell
      title="Finances"
      subtitle="Calm monthly view"
      headerActions={[
        { icon: 'add', label: 'Add', onPress: () => router.push('/finances/add') },
        { icon: 'mic-outline', label: 'Ask', onPress: () => setTalkOpen(true) },
      ]}
    >
      <GlassCard blur>
        <SectionHeader title="This Month Snapshot" rightLabel="Details" onRightPress={() => router.push('/finances/summary')} />

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Income</Text>
            <Text style={styles.metricValue}>{fmtCurrency(totalIncome)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Spent</Text>
            <Text style={styles.metricValue}>{fmtCurrency(totalSpent)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Left</Text>
            <Text style={[styles.metricValue, remaining < 0 ? styles.warn : null]}>{fmtCurrency(remaining)}</Text>
          </View>
        </View>

        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(spentRatio * 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{Math.round(spentRatio * 100)}% of income used</Text>
        </View>

        <View style={styles.primaryActions}>
          <PrimaryButton label="Explain This Month" onPress={() => router.push('/finances/summary')} style={styles.flex} />
          <SecondaryButton label="Upcoming Bills" onPress={() => router.push('/finances/bills')} style={styles.flex} />
        </View>
      </GlassCard>

      <GlassCard blur>
        <SectionHeader title="Needs Attention" rightLabel="Open all" onRightPress={() => router.push('/finances/bills')} />

        {dueSoonBills.length === 0 && renewalSoon.length === 0 ? (
          <EmptyState title="Nothing urgent right now" body="You are clear for the next few days." />
        ) : (
          <View style={styles.stack}>
            {dueSoonBills.map((bill) => (
              <Pressable key={bill.id} style={styles.row} onPress={() => router.push(`/finances/bills/${bill.id}`)}>
                <View style={styles.rowIcon}>
                  <Ionicons name="receipt-outline" size={14} color={ds.colors.primary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{bill.name}</Text>
                  <Text style={styles.rowBody}>{fmtCurrency(bill.amount)} · {billDueLabel(bill)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color={ds.colors.secondary} />
              </Pressable>
            ))}

            {renewalSoon.map((sub) => (
              <Pressable key={sub.id} style={styles.row} onPress={() => router.push(`/finances/subscriptions/${sub.id}`)}>
                <View style={styles.rowIcon}>
                  <Ionicons name="sync-outline" size={14} color={ds.colors.primary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{sub.name}</Text>
                  <Text style={styles.rowBody}>{fmtCurrency(sub.cost)} / {sub.frequency} · {subscriptionRenewalLabel(sub)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={15} color={ds.colors.secondary} />
              </Pressable>
            ))}
          </View>
        )}
      </GlassCard>

      {topInsight ? (
        <GlassCard blur>
          <Text style={styles.insightEyebrow}>Top Insight</Text>
          <Text style={styles.insightTitle}>{topInsight.title}</Text>
          <Text style={styles.insightBody}>{topInsight.body}</Text>
          <View style={styles.chipsRow}>
            <BubbleChip icon="sparkles-outline" label="Explain" tone="primary" onPress={() => setTalkOpen(true)} />
            <BubbleChip icon="open-outline" label="Fix" tone="success" onPress={() => router.push(topInsight.actionRoute)} />
            <BubbleChip icon="close" label="Dismiss" tone="neutral" onPress={() => dismissInsight(topInsight.id)} />
          </View>
        </GlassCard>
      ) : null}

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.chipsRow}>
          <BubbleChip icon="add-circle-outline" label="Add Bill" tone="neutral" onPress={() => router.push('/finances/bills/create')} />
          <BubbleChip icon="repeat-outline" label="Subscriptions" tone="neutral" onPress={() => router.push('/finances/subscriptions')} />
          <BubbleChip icon="pie-chart-outline" label="Set Budget" tone="neutral" onPress={() => router.push('/finances/budgets/setup')} />
          <BubbleChip icon="cash-outline" label="Add Income" tone="neutral" onPress={() => router.push('/finances/add/income')} />
        </View>
      </GlassCard>

      <FinanceVoiceHint text="Try 'what should I worry about this week?'" onAsk={() => setTalkOpen(true)} />
      <FinancesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  metricsRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  metricCard: {
    flex: 1,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    padding: ds.spacing.s8,
  },
  metricLabel: {
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: ds.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metricValue: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 21,
    color: ds.colors.text,
    fontWeight: '700',
  },
  warn: {
    color: '#C25151',
  },
  progressWrap: {
    marginTop: ds.spacing.s12,
  },
  progressTrack: {
    height: 8,
    borderRadius: ds.radius.pill,
    backgroundColor: 'rgba(42,134,255,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: ds.radius.pill,
    backgroundColor: ds.colors.primary,
  },
  progressLabel: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  primaryActions: {
    marginTop: ds.spacing.s12,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  stack: {
    gap: ds.spacing.s8,
  },
  row: {
    minHeight: 56,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  rowIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: 'rgba(42,134,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  rowBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  insightEyebrow: {
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: ds.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  insightTitle: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 21,
    color: ds.colors.text,
    fontWeight: '700',
  },
  insightBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  toolsTitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
    marginTop: ds.spacing.s8,
  },
});
