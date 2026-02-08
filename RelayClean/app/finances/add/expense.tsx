import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { FinancesShell } from '../components/FinancesShell';

export default function AddExpenseScreen() {
  const router = useRouter() as any;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [categoryId, setCategoryId] = useState('cat-food');
  const [notes, setNotes] = useState('');

  return (
    <FinancesShell title="Add Expense" subtitle="Capture outgoing spend" onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Groceries" />
      <FormField label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
      <FormField label="Date" value={dateISO} onChangeText={setDateISO} />
      <FormField label="Category ID" value={categoryId} onChangeText={setCategoryId} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />

      <PrimaryButton
        label="Continue"
        onPress={() =>
          router.push({
            pathname: '/finances/add/confirm',
            params: {
              type: 'expense',
              payload: JSON.stringify({ title, amount, dateISO, categoryId, notes }),
            },
          })
        }
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FinancesShell>
  );
}
