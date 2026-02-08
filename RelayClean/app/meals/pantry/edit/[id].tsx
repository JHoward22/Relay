import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { MealsShell } from '../../components/MealsShell';
import { useMealsStore } from '../../meals-context';

export default function PantryItemEditScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, updatePantryItem, deletePantryItem } = useMealsStore();

  const item = useMemo(() => state.pantryItems.find((entry) => entry.id === id), [id, state.pantryItems]);
  const [name, setName] = useState(item?.name || '');
  const [quantity, setQuantity] = useState(item?.quantity || '');
  const [unit, setUnit] = useState(item?.unit || '');

  if (!item) {
    return (
      <MealsShell title="Pantry item" subtitle="Not found" onBack={() => router.back()}>
        <EmptyState title="Pantry item not found" body="It may have been removed." />
      </MealsShell>
    );
  }

  return (
    <MealsShell title="Edit Pantry Item" subtitle={item.name} onBack={() => router.back()}>
      <FormField label="Name" value={name} onChangeText={setName} />
      <FormField label="Quantity" value={quantity} onChangeText={setQuantity} />
      <FormField label="Unit" value={unit} onChangeText={setUnit} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          updatePantryItem(item.id, {
            name: name.trim() || item.name,
            quantity: quantity || item.quantity,
            unit: unit || undefined,
          });
          router.replace('/meals/pantry');
        }}
      />
      <SecondaryButton
        label={item.lowStock ? 'Mark in stock' : 'Mark low stock'}
        onPress={() => updatePantryItem(item.id, { lowStock: !item.lowStock })}
      />
      <SecondaryButton
        label="Delete"
        onPress={() => {
          deletePantryItem(item.id);
          router.replace('/meals/pantry');
        }}
      />
    </MealsShell>
  );
}
