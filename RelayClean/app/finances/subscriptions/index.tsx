import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { PrimaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { fmtCurrency, subscriptionRenewalLabel, useFinancesStore } from '../finances-context';
import { FinancesShell } from '../components/FinancesShell';

export default function SubscriptionsHubScreen() {
  const router = useRouter() as any;
  const { state } = useFinancesStore();

  const active = useMemo(() => state.subscriptions.filter((sub) => sub.status === 'active'), [state.subscriptions]);

  return (
    <FinancesShell title="Subscriptions" subtitle="Recurring services" onBack={() => router.back()}>
      <GlassCard blur>
        <SectionHeader title="Active" />
        {active.length ? (
          <View style={styles.stack}>
            {active.map((sub) => (
              <ListRow
                key={sub.id}
                icon="layers-outline"
                label={sub.name}
                body={`${fmtCurrency(sub.cost)} / ${sub.frequency} · ${subscriptionRenewalLabel(sub)}`}
                rightText={sub.usageFlag === 'rarely-used' ? 'Rarely used' : sub.usageFlag === 'high-cost' ? 'High cost' : 'Active'}
                onPress={() => router.push(`/finances/subscriptions/${sub.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No active subscriptions" body="Add one to start tracking renewals." />
        )}
      </GlassCard>

      <PrimaryButton label="Add Subscription" onPress={() => router.push('/finances/subscriptions/create')} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: ds.spacing.s8,
  },
});
