import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { FinancesShell } from '../components/FinancesShell';

export default function AddIncomeScreen() {
  const router = useRouter() as any;

  const [sourceName, setSourceName] = useState('');
  const [amount, setAmount] = useState('');
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  return (
    <FinancesShell title="Add Income" subtitle="Capture incoming money" onBack={() => router.back()}>
      <FormField label="Source" value={sourceName} onChangeText={setSourceName} placeholder="Salary" />
      <FormField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <FormField label="Date" value={dateISO} onChangeText={setDateISO} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />

      <PrimaryButton
        label="Continue"
        onPress={() =>
          router.push({
            pathname: '/finances/add/confirm',
            params: {
              type: 'income',
              payload: JSON.stringify({ sourceName, amount, dateISO, notes }),
            },
          })
        }
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FinancesShell>
  );
}
