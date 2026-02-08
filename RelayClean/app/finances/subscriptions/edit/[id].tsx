import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { FinancesShell } from '../../components/FinancesShell';
import { useFinancesStore } from '../../finances-context';

export default function EditSubscriptionScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, updateSubscription } = useFinancesStore();

  const subscription = useMemo(() => state.subscriptions.find((entry) => entry.id === id), [id, state.subscriptions]);

  const [name, setName] = useState(subscription?.name || '');
  const [cost, setCost] = useState(String(subscription?.cost || ''));
  const [renewDateISO, setRenewDateISO] = useState(subscription?.renewDateISO || '');
  const [notes, setNotes] = useState(subscription?.notes || '');
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!subscription) {
    return (
      <FinancesShell title="Edit Subscription" subtitle="Not found" onBack={() => router.back()}>
        <EmptyState title="Subscription not found" body="This item may have been removed." />
      </FinancesShell>
    );
  }

  return (
    <FinancesShell title="Edit Subscription" subtitle={subscription.name} onBack={() => router.back()}>
      <FormField label="Name" value={name} onChangeText={setName} />
      <FormField label="Cost" value={cost} onChangeText={setCost} keyboardType="decimal-pad" />
      <FormField label="Renewal date" value={renewDateISO} onChangeText={setRenewDateISO} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />

      <PrimaryButton label="Save changes" onPress={() => setConfirmOpen(true)} />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />

      <SheetModal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <View style={styles.sheetWrap}>
          <BubbleChip
            icon="checkmark"
            label="Confirm"
            tone="success"
            onPress={() => {
              updateSubscription(subscription.id, {
                name,
                cost: Number(cost) || subscription.cost,
                renewDateISO,
                notes,
              });
              setConfirmOpen(false);
              router.replace(`/finances/subscriptions/${subscription.id}`);
            }}
          />
          <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setConfirmOpen(false)} />
        </View>
      </SheetModal>
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  sheetWrap: {
    gap: ds.spacing.s8,
  },
});
