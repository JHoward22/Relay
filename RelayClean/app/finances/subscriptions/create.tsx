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

export default function AddSubscriptionScreen() {
  const router = useRouter() as any;
  const { addSubscription } = useFinancesStore();

  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [renewDateISO, setRenewDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>('monthly');
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [talkOpen, setTalkOpen] = useState(false);

  return (
    <FinancesShell title="Add Subscription" subtitle="Track recurring renewals" onBack={() => router.back()}>
      <FormField label="Name" value={name} onChangeText={setName} placeholder="Streaming service" />
      <FormField label="Cost" value={cost} onChangeText={setCost} placeholder="12" keyboardType="decimal-pad" />
      <FormField label="Renewal date" value={renewDateISO} onChangeText={setRenewDateISO} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />

      <View style={styles.row}>
        {(['monthly', 'annual'] as const).map((item) => (
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

      <FinanceVoiceHint text="Try 'Add a monthly music subscription for $16'" onAsk={() => setTalkOpen(true)} />

      <SheetModal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <View style={styles.sheetWrap}>
          <BubbleChip
            icon="checkmark"
            label="Confirm"
            tone="success"
            onPress={() => {
              addSubscription({
                name: name || 'Untitled subscription',
                cost: Number(cost) || 0,
                renewDateISO,
                frequency,
                notes,
              });
              setConfirmOpen(false);
              router.replace('/finances/add/success?type=subscription');
            }}
          />
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
