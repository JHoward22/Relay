import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { ListRow } from '@/components/relay/ListRow';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

export default function FamilyShoppingScreen() {
  const router = useRouter() as any;
  const { state, addList } = useFamilyStore();

  const [createOpen, setCreateOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  return (
    <FamilyShell
      title="Shopping"
      subtitle="Shared lists and completion tracking"
      onBack={() => router.back()}
      headerActions={[{ icon: 'add', label: 'Add list', onPress: () => setCreateOpen(true) }]}
    >
      <FamilySectionCard title="Lists" rightLabel="New" onRightPress={() => setCreateOpen(true)}>
        {state.shoppingLists.length ? (
          <View style={styles.listWrap}>
            {state.shoppingLists.map((list) => {
              const remaining = list.items.filter((item) => !item.done).length;
              return (
                <ListRow
                  key={list.id}
                  icon="cart-outline"
                  label={list.name}
                  body={`${remaining} remaining · ${list.items.length} total`}
                  onPress={() => router.push(`/family/shopping/list/${list.id}`)}
                />
              );
            })}
          </View>
        ) : (
          <EmptyState title="No shared lists yet" body="Create your first grocery or household checklist." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Actions">
        <View style={styles.actions}>
          <BubbleChip icon="add-circle-outline" label="New list" tone="primary" onPress={() => setCreateOpen(true)} />
          <BubbleChip icon="share-social-outline" label="Share" tone="neutral" onPress={() => router.push('/family/voice-summary')} />
          <BubbleChip icon="sparkles-outline" label="Optimize" tone="neutral" onPress={() => router.push('/family/voice-summary')} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'Add milk and diapers to the family grocery list.'" onAsk={() => router.push('/family/voice-summary')} />

      <SheetModal visible={createOpen} onClose={() => setCreateOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Create list</Text>
          <FormField label="List name" value={newListName} onChangeText={setNewListName} placeholder="Weekend groceries" />
          <View style={styles.actions}>
            <BubbleChip
              icon="checkmark"
              label="Create"
              tone="success"
              onPress={() => {
                const id = addList(newListName.trim() || 'New family list');
                setNewListName('');
                setCreateOpen(false);
                router.push(`/family/shopping/list/${id}`);
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setCreateOpen(false)} />
          </View>
        </View>
      </SheetModal>
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  listWrap: {
    gap: ds.spacing.s8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  sheetContent: {
    paddingHorizontal: ds.spacing.s16,
    paddingVertical: ds.spacing.s16,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: 20,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
});
