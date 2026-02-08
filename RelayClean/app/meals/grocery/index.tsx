import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from '../components/MealsShell';
import { GroceryGroup, GroceryItem, fallbackGroupForInput, useMealsStore } from '../meals-context';

const groups: GroceryGroup[] = ['Produce', 'Meat', 'Dairy', 'Pantry', 'Frozen', 'Other'];

export default function GroceryListScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ optimize?: string }>();
  const { state: relayState } = useRelayStore();
  const { state, optimizeGrocery, toggleGroceryItem, addGroceryItem, updateGroceryItem, deleteGroceryItem } = useMealsStore();

  const [talkOpen, setTalkOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<GroceryItem | null>(null);
  const [quickItem, setQuickItem] = useState<GroceryItem | null>(null);
  const [newItem, setNewItem] = useState('');
  const [newQty, setNewQty] = useState('1');

  useEffect(() => {
    if (params.optimize === 'true') {
      optimizeGrocery();
    }
  }, [optimizeGrocery, params.optimize]);

  const grouped = useMemo(() => {
    return groups.map((group) => ({
      group,
      items: state.groceryItems.filter((item) => item.group === group),
    }));
  }, [state.groceryItems]);

  return (
    <MealsShell
      title="Grocery List"
      subtitle={`${state.groceryItems.filter((item) => !item.checked).length} items remaining`}
      onBack={() => router.back()}
      headerActions={relayState.familyModeEnabled ? [{ icon: 'share-outline', label: 'Share', onPress: () => router.push('/meals/grocery/share') }] : [{ icon: 'download-outline', label: 'Export', onPress: () => router.push('/meals/grocery/export') }]}
    >
      <GlassCard blur style={styles.inputCard}>
        <TextInput
          value={newItem}
          onChangeText={setNewItem}
          placeholder="Add item"
          placeholderTextColor="#8A95AD"
          style={styles.input}
        />
        <TextInput
          value={newQty}
          onChangeText={setNewQty}
          placeholder="Qty"
          placeholderTextColor="#8A95AD"
          style={[styles.input, styles.qtyInput]}
        />
        <BubbleChip
          icon="add"
          label="Add"
          tone="primary"
          onPress={() => {
            if (!newItem.trim()) return;
            addGroceryItem({
              name: newItem.trim(),
              quantity: newQty || '1',
              group: fallbackGroupForInput(newItem),
            });
            setNewItem('');
            setNewQty('1');
          }}
        />
      </GlassCard>

      <PrimaryButton label="Optimize list" onPress={optimizeGrocery} />
      <SecondaryButton label="Pantry staples" onPress={() => router.push('/meals/pantry')} />
      {relayState.familyModeEnabled ? (
        <SecondaryButton label="Share list" onPress={() => router.push('/meals/grocery/share')} />
      ) : null}
      <SecondaryButton label="Export" onPress={() => router.push('/meals/grocery/export')} />

      {state.groceryItems.length ? (
        <View style={styles.groupStack}>
          {grouped.map(({ group, items }) => (
            <GlassCard blur key={group}>
              <Text style={styles.groupTitle}>{group}</Text>
              {items.length ? (
                <View style={styles.itemStack}>
                  {items.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.itemRow}
                      onPress={() => setDetailItem(item)}
                      onLongPress={() => setQuickItem(item)}
                    >
                      <BubbleChip
                        icon={item.checked ? 'checkmark' : 'ellipse-outline'}
                        label=""
                        tone={item.checked ? 'success' : 'neutral'}
                        onPress={() => toggleGroceryItem(item.id)}
                      />
                      <View style={styles.itemTextWrap}>
                        <Text style={[styles.itemName, item.checked ? styles.itemNameChecked : null]}>{item.name}</Text>
                        <Text style={styles.itemMeta}>{item.quantity}{item.unit ? ` ${item.unit}` : ''}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyGroup}>No items in this group.</Text>
              )}
            </GlassCard>
          ))}
        </View>
      ) : (
        <EmptyState title="No groceries yet" body="Build from week plan or add your first item." />
      )}

      <VoiceHintRow label="Say 'Add tomatoes and spinach to grocery list'" onAsk={() => setTalkOpen(true)} />

      <SheetModal visible={!!detailItem} onClose={() => setDetailItem(null)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Grocery item</Text>
          <FormField
            label="Item"
            value={detailItem?.name || ''}
            onChangeText={(value) => setDetailItem((prev) => (prev ? { ...prev, name: value } : prev))}
          />
          <FormField
            label="Quantity"
            value={detailItem?.quantity || ''}
            onChangeText={(value) => setDetailItem((prev) => (prev ? { ...prev, quantity: value } : prev))}
          />
          <FormField
            label="Store"
            value={detailItem?.store || ''}
            onChangeText={(value) => setDetailItem((prev) => (prev ? { ...prev, store: value } : prev))}
          />
          <FormField
            label="Notes"
            value={detailItem?.notes || ''}
            onChangeText={(value) => setDetailItem((prev) => (prev ? { ...prev, notes: value } : prev))}
          />

          <View style={styles.sheetActions}>
            <BubbleChip
              icon="checkmark"
              label="Save"
              tone="success"
              onPress={() => {
                if (!detailItem) return;
                updateGroceryItem(detailItem.id, detailItem);
                setDetailItem(null);
              }}
            />
            <BubbleChip icon="close" label="Close" tone="neutral" onPress={() => setDetailItem(null)} />
          </View>
        </View>
      </SheetModal>

      <SheetModal visible={!!quickItem} onClose={() => setQuickItem(null)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Quick actions</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="swap-horizontal"
              label="Move group"
              tone="primary"
              onPress={() => {
                if (!quickItem) return;
                const index = groups.indexOf(quickItem.group);
                const nextGroup = groups[(index + 1) % groups.length];
                updateGroceryItem(quickItem.id, { group: nextGroup });
                setQuickItem(null);
              }}
            />
            <BubbleChip
              icon="trash-outline"
              label="Delete"
              tone="danger"
              onPress={() => {
                if (!quickItem) return;
                deleteGroceryItem(quickItem.id);
                setQuickItem(null);
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setQuickItem(null)} />
          </View>
        </View>
      </SheetModal>

      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  input: {
    flex: 1,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
    color: ds.colors.text,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
  },
  qtyInput: {
    maxWidth: 70,
  },
  groupStack: {
    gap: ds.spacing.s8,
  },
  groupTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  itemStack: {
    gap: ds.spacing.s8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemName: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '600',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: ds.colors.textMuted,
  },
  itemMeta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  emptyGroup: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
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
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
