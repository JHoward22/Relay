import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../../components/FamilyShell';
import { useFamilyStore } from '../../family-context';

export default function KidDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, getChild } = useFamilyStore();

  const child = getChild(id);

  const tasks = useMemo(
    () => state.tasks.filter((task) => task.title.toLowerCase().includes((child?.name ?? '').toLowerCase())),
    [child?.name, state.tasks]
  );

  const events = useMemo(
    () => state.events.filter((event) => event.title.toLowerCase().includes((child?.name ?? '').toLowerCase())),
    [child?.name, state.events]
  );

  if (!child) {
    return (
      <FamilyShell title="Child" onBack={() => router.back()}>
        <EmptyState title="Profile not found" body="This child profile is unavailable." />
      </FamilyShell>
    );
  }

  return (
    <FamilyShell title={child.name} subtitle={`Age ${child.age} · ${child.school}`} onBack={() => router.back()}>
      <FamilySectionCard title="Overview">
        <Text style={styles.body}>{child.notes || 'No notes yet. Add schedules, reminders, and context for the household.'}</Text>
      </FamilySectionCard>

      <FamilySectionCard title="Schedule" rightLabel="Add event" onRightPress={() => router.push(`/family/kids/${child.id}/event`)}>
        {events.length ? (
          <View style={styles.listWrap}>
            {events.map((event) => (
              <ListRow
                key={event.id}
                icon="calendar-outline"
                label={event.title}
                body={`${event.dateISO} · ${event.timeLabel}`}
                onPress={() => router.push(`/family/calendar/event/${event.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No events yet" body="Add school events and activities for this child." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Tasks" rightLabel="Assign" onRightPress={() => router.push(`/family/kids/${child.id}/task`)}>
        {tasks.length ? (
          <View style={styles.listWrap}>
            {tasks.map((task) => (
              <ListRow
                key={task.id}
                icon="checkbox-outline"
                label={task.title}
                body={task.dueDateISO}
                rightText={task.status === 'done' ? 'Done' : 'Open'}
                onPress={() => router.push(`/family/tasks/${task.id}`)}
              />
            ))}
          </View>
        ) : (
          <EmptyState title="No tasks assigned" body="Add chores or shared responsibilities for this child." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Actions">
        <View style={styles.actions}>
          <BubbleChip icon="add-circle-outline" label="Add task" tone="primary" onPress={() => router.push(`/family/kids/${child.id}/task`)} />
          <BubbleChip icon="calendar-outline" label="Add event" tone="primary" onPress={() => router.push(`/family/kids/${child.id}/event`)} />
          <BubbleChip icon="create-outline" label="Add note" tone="neutral" onPress={() => router.push(`/family/kids/${child.id}/note`)} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'Add piano practice for Amy on Thursday at 5 PM.'" onAsk={() => router.push('/family/voice-summary')} />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '500',
  },
  listWrap: {
    gap: ds.spacing.s8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
