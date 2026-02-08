import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { FamilyShell } from '../../components/FamilyShell';
import { useFamilyStore } from '../../family-context';

export default function FamilyShoppingItemScreen() {
  const router = useRouter() as any;
  const { id, listId } = useLocalSearchParams<{ id: string; listId: string }>();
  const { getList, addListItem, updateListItem } = useFamilyStore();

  const list = getList(listId);
  const item = useMemo(() => list?.items.find((entry) => entry.id === id), [id, list?.items]);
  const isCreate = id === 'new' || !item;

  const [title, setTitle] = useState(item?.title ?? '');
  const [quantity, setQuantity] = useState(item?.quantity ?? '1');

  if (!list) {
    return (
      <FamilyShell title="Item" onBack={() => router.back()}>
        <EmptyState title="List not found" body="Open a shopping list first." />
      </FamilyShell>
    );
  }

  return (
    <FamilyShell title={isCreate ? 'Add Item' : 'Edit Item'} subtitle={list.name} onBack={() => router.back()}>
      <GlassCard blur>
        <FormField label="Item" value={title} onChangeText={setTitle} placeholder="Milk" />
        <FormField label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="1 gallon" />
      </GlassCard>

      <PrimaryButton
        label={isCreate ? 'Add item' : 'Save changes'}
        onPress={() => {
          if (isCreate) {
            addListItem(list.id, { title: title || 'New item', quantity: quantity || '1' });
          } else {
            updateListItem(list.id, id, { title: title || item?.title, quantity: quantity || item?.quantity });
          }
          router.replace(`/family/shopping/list/${list.id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FamilyShell>
  );
}
