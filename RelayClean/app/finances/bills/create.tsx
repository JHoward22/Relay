import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { FinanceVoiceHint, FinancesShell, FinancesTalkSheet } from '../components/FinancesShell';
import { useFinancesStore } from '../finances-context';

export default function AddBillScreen() {
  const router = useRouter() as any;
  const { addBill } = useFinancesStore();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDateISO, setDueDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState<'monthly' | 'annual' | 'one-time'>('monthly');
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [talkOpen, setTalkOpen] = useState(false);

  return (
    <FinancesShell title="Add Bill" subtitle="Manual entry with confirmation" onBack={() => router.back()}>
      <FormField label="Bill name" value={name} onChangeText={setName} placeholder="Internet bill" />
      <FormField label="Amount" value={amount} onChangeText={setAmount} placeholder="95" keyboardType="decimal-pad" />
      <FormField label="Due date (YYYY-MM-DD)" value={dueDateISO} onChangeText={setDueDateISO} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />

      <View style={styles.row}>
        {(['monthly', 'annual', 'one-time'] as const).map((item) => (
          <BubbleChip
            key={item}
            icon="repeat-outline"
            label={item}
            tone={frequency === item ? 'primary' : 'neutral'}
            onPress={() => setFrequency(item)}
          />
        ))}
      </View>

      <PrimaryButton label="Continue" onPress={() => setConfirmOpen(true)} />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />

      <FinanceVoiceHint text="Try 'Add a monthly internet bill for $95'" onAsk={() => setTalkOpen(true)} />

      <SheetModal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <View style={styles.sheetWrap}>
          <BubbleChip
            icon="checkmark"
            label="Confirm"
            tone="success"
            onPress={() => {
              addBill({
                name: name || 'Untitled bill',
                amount: Number(amount) || 0,
                dueDateISO,
                frequency,
                autopay: false,
                categoryId: 'cat-housing',
                notes,
              });
              setConfirmOpen(false);
              router.replace('/finances/add/success?type=bill');
            }}
          />
          <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => setConfirmOpen(false)} />
          <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setConfirmOpen(false)} />
        </View>
      </SheetModal>

      <FinancesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  sheetWrap: {
    gap: ds.spacing.s8,
  },
});
