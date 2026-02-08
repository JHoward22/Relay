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

export default function EditBillScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, updateBill } = useFinancesStore();

  const bill = useMemo(() => state.bills.find((entry) => entry.id === id), [id, state.bills]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [name, setName] = useState(bill?.name || '');
  const [amount, setAmount] = useState(String(bill?.amount || ''));
  const [dueDateISO, setDueDateISO] = useState(bill?.dueDateISO || '');
  const [notes, setNotes] = useState(bill?.notes || '');

  if (!bill) {
    return (
      <FinancesShell title="Edit Bill" subtitle="Not found" onBack={() => router.back()}>
        <EmptyState title="Bill not found" body="This item may have been removed." />
      </FinancesShell>
    );
  }

  return (
    <FinancesShell title="Edit Bill" subtitle={bill.name} onBack={() => router.back()}>
      <FormField label="Bill name" value={name} onChangeText={setName} />
      <FormField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <FormField label="Due date" value={dueDateISO} onChangeText={setDueDateISO} />
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
              updateBill(bill.id, {
                name,
                amount: Number(amount) || bill.amount,
                dueDateISO,
                notes,
              });
              setConfirmOpen(false);
              router.replace(`/finances/bills/${bill.id}`);
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
