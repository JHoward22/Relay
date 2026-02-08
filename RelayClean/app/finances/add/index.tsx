import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ListRow } from '@/components/relay/ListRow';
import { FinancesShell } from '../components/FinancesShell';
import { ds } from '@/constants/design-system';

export default function AddFinancialItemChooser() {
  const router = useRouter() as any;

  return (
    <FinancesShell title="Add Financial Item" subtitle="Choose what to add" onBack={() => router.back()}>
      <View style={styles.stack}>
        <ListRow icon="receipt-outline" label="Add bill" body="Track due dates and reminders" onPress={() => router.push('/finances/bills/create')} />
        <ListRow icon="layers-outline" label="Add subscription" body="Track renewals and usage" onPress={() => router.push('/finances/subscriptions/create')} />
        <ListRow icon="arrow-down-circle-outline" label="Add income" body="Capture money in" onPress={() => router.push('/finances/add/income')} />
        <ListRow icon="arrow-up-circle-outline" label="Add expense" body="Capture money out" onPress={() => router.push('/finances/add/expense')} />
      </View>
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: ds.spacing.s8,
  },
});
