import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

export default function KidsListScreen() {
  const router = useRouter() as any;
  const { state } = useFamilyStore();

  return (
    <FamilyShell
      title="Kids"
      subtitle={state.children.length ? `${state.children.length} child profiles` : 'Add your first child profile'}
      onBack={() => router.back()}
      headerActions={[{ icon: 'add', label: 'Add', onPress: () => router.push('/family/kids/create') }]}
    >
      <FamilySectionCard title="Profiles">
        {state.children.length ? (
          <View style={styles.listWrap}>
            {state.children.map((child) => (
              <ListRow
                key={child.id}
                icon="happy-outline"
                iconTint={child.colorTag}
                label={child.name}
                body={`Age ${child.age} · ${child.school}`}
                badge={child.healthReminders[0] ?? 'No reminders'}
                onPress={() => router.push(`/family/kids/${child.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No kids yet" body="Add a child profile to track school events and shared responsibilities." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Actions">
        <View style={styles.actions}>
          <BubbleChip icon="add-circle-outline" label="Add child" tone="primary" onPress={() => router.push('/family/kids/create')} />
          <BubbleChip icon="calendar-outline" label="Family calendar" tone="neutral" onPress={() => router.push('/family/calendar')} />
          <BubbleChip icon="checkbox-outline" label="Shared tasks" tone="neutral" onPress={() => router.push('/family/tasks')} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'Add a soccer event for Amy this Thursday.'" onAsk={() => router.push('/family/voice-summary')} />
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
