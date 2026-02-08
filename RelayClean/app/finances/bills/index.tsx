import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { billDueLabel, fmtCurrency, useFinancesStore } from '../finances-context';
import { FinancesShell } from '../components/FinancesShell';

export default function BillsHubScreen() {
  const router = useRouter() as any;
  const { state } = useFinancesStore();

  const upcoming = useMemo(() => state.bills.filter((bill) => bill.status === 'upcoming'), [state.bills]);
  const monthly = useMemo(() => state.bills.filter((bill) => bill.frequency === 'monthly'), [state.bills]);
  const annual = useMemo(() => state.bills.filter((bill) => bill.frequency === 'annual'), [state.bills]);

  return (
    <FinancesShell title="Bills" subtitle="Upcoming, monthly, and annual" onBack={() => router.back()}>
      <GlassCard blur>
        <SectionHeader title="Upcoming" />
        {upcoming.length ? (
          <View style={styles.stack}>
            {upcoming.map((bill) => (
              <ListRow
                key={bill.id}
                icon="receipt-outline"
                label={bill.name}
                body={`${fmtCurrency(bill.amount)} · ${billDueLabel(bill)}`}
                onPress={() => router.push(`/finances/bills/${bill.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No upcoming bills" body="You are caught up." />
        )}
      </GlassCard>

      <GlassCard blur>
        <SectionHeader title="Monthly" />
        <View style={styles.stack}>
          {monthly.map((bill) => (
            <ListRow
              key={bill.id}
              icon="repeat-outline"
              label={bill.name}
              body={`${fmtCurrency(bill.amount)} · ${bill.dueDateISO}`}
              onPress={() => router.push(`/finances/bills/${bill.id}`)}
            />
          ))}
        </View>
      </GlassCard>

      <GlassCard blur>
        <SectionHeader title="Annual" />
        {annual.length ? (
          <View style={styles.stack}>
            {annual.map((bill) => (
              <ListRow
                key={bill.id}
                icon="calendar-outline"
                label={bill.name}
                body={`${fmtCurrency(bill.amount)} · ${bill.dueDateISO}`}
                onPress={() => router.push(`/finances/bills/${bill.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No annual bills" body="Add one if needed." />
        )}
      </GlassCard>

      <PrimaryButton label="Add Bill" onPress={() => router.push('/finances/bills/create')} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: ds.spacing.s8,
  },
});
