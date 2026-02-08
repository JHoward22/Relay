import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../../components/FamilyShell';
import { useFamilyStore } from '../../family-context';

export default function FamilyShoppingListDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getList, toggleListItem } = useFamilyStore();

  const list = getList(id);

  if (!list) {
    return (
      <FamilyShell title="List" onBack={() => router.back()}>
        <EmptyState title="List not found" body="This shopping list may have been removed." />
      </FamilyShell>
    );
  }

  return (
    <FamilyShell
      title={list.name}
      subtitle={`${list.items.filter((item) => !item.done).length} remaining`}
      onBack={() => router.back()}
      headerActions={[{ icon: 'add', label: 'Add item', onPress: () => router.push(`/family/shopping/item/new?listId=${list.id}`) }]}
    >
      <FamilySectionCard title="Items" rightLabel="Add" onRightPress={() => router.push(`/family/shopping/item/new?listId=${list.id}`)}>
        {list.items.length ? (
          <View style={styles.listWrap}>
            {list.items.map((item) => (
              <ListRow
                key={item.id}
                icon={item.done ? 'checkmark-circle' : 'ellipse-outline'}
                label={item.title}
                body={`${item.quantity}${item.assignedMemberId ? ` · Assigned` : ''}`}
                onPress={() => router.push(`/family/shopping/item/${item.id}?listId=${list.id}`)}
                trailing={
                  <BubbleChip
                    compact
                    icon={item.done ? 'arrow-undo-outline' : 'checkmark'}
                    tone={item.done ? 'neutral' : 'success'}
                    onPress={() => toggleListItem(list.id, item.id)}
                  />
                }
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No items yet" body="Add the first item to this shared list." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Actions">
        <View style={styles.actions}>
          <BubbleChip icon="add-circle-outline" label="Add item" tone="primary" onPress={() => router.push(`/family/shopping/item/new?listId=${list.id}`)} />
          <BubbleChip icon="sparkles-outline" label="Optimize" tone="neutral" onPress={() => router.push('/family/voice-summary')} />
          <BubbleChip icon="share-social-outline" label="Share" tone="neutral" onPress={() => router.push('/family/voice-summary')} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'Who still needs to buy groceries?'" onAsk={() => router.push('/family/voice-summary')} />
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
});
