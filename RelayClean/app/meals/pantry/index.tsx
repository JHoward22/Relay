import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { MealsShell } from '../components/MealsShell';
import { useMealsStore } from '../meals-context';

export default function PantryScreen() {
  const router = useRouter() as any;
  const { state, addPantryItem, updatePantryItem, deletePantryItem } = useMealsStore();
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('');

  return (
    <MealsShell title="Pantry" subtitle="Staples Relay should not re-add" onBack={() => router.back()}>
      {state.pantryItems.length ? (
        <View style={styles.list}>
          {state.pantryItems.map((item) => (
            <Pressable key={item.id} onLongPress={() => deletePantryItem(item.id)}>
              <ListRow
                icon="cube-outline"
                label={item.name}
                body={`${item.quantity}${item.unit ? ` ${item.unit}` : ''}${item.lowStock ? ' · low stock' : ''}`}
                onPress={() => router.push(`/meals/pantry/edit/${item.id}`)}
                trailing={
                  <BubbleChip
                    icon={item.lowStock ? 'alert-circle' : 'checkmark'}
                    label=""
                    tone={item.lowStock ? 'danger' : 'success'}
                    onPress={() => updatePantryItem(item.id, { lowStock: !item.lowStock })}
                  />
                }
              />
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState title="No pantry staples" body="Add staples to reduce grocery waste." />
      )}

      <PrimaryButton label="Add staple" onPress={() => setAddOpen(true)} />

      <SheetModal visible={addOpen} onClose={() => setAddOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Add pantry item</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Item name"
            placeholderTextColor="#8A95AD"
            style={styles.input}
          />
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Quantity"
            placeholderTextColor="#8A95AD"
            style={styles.input}
          />
          <TextInput
            value={unit}
            onChangeText={setUnit}
            placeholder="Unit (optional)"
            placeholderTextColor="#8A95AD"
            style={styles.input}
          />

          <View style={styles.row}>
            <BubbleChip
              icon="checkmark"
              label="Save"
              tone="success"
              onPress={() => {
                if (!name.trim()) return;
                addPantryItem({
                  name: name.trim(),
                  quantity: quantity || '1',
                  unit: unit || undefined,
                  lowStock: false,
                });
                setName('');
                setQuantity('1');
                setUnit('');
                setAddOpen(false);
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setAddOpen(false)} />
          </View>
        </View>
      </SheetModal>
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: ds.spacing.s8,
  },
  sheetWrap: {
    gap: ds.spacing.s12,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  input: {
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    color: ds.colors.text,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
  },
  row: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    flexWrap: 'wrap',
  },
});
