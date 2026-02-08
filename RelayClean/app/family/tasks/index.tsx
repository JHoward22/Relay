import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

const FILTERS = ['open', 'done', 'archived'] as const;
type FilterKey = (typeof FILTERS)[number];

export default function FamilyTasksScreen() {
  const router = useRouter() as any;
  const { state, toggleTask } = useFamilyStore();
  const [filter, setFilter] = useState<FilterKey>('open');

  const list = useMemo(() => {
    if (filter === 'archived') return state.tasks.filter((task) => task.archived);
    if (filter === 'done') return state.tasks.filter((task) => task.status === 'done' && !task.archived);
    return state.tasks.filter((task) => task.status === 'open' && !task.archived);
  }, [filter, state.tasks]);

  return (
    <FamilyShell
      title="Shared Tasks"
      subtitle="Assign and track household work"
      onBack={() => router.back()}
      headerActions={[
        { icon: 'add', label: 'Add', onPress: () => router.push('/family/tasks/create') },
        { icon: 'archive-outline', label: 'Archive', onPress: () => router.push('/family/archive') },
      ]}
    >
      <FamilySectionCard title="Filters">
        <View style={styles.segmentWrap}>
          {FILTERS.map((key) => {
            const active = filter === key;
            return (
              <Pressable key={key} style={[styles.segment, active ? styles.segmentActive : null]} onPress={() => setFilter(key)}>
                <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>
                  {key[0].toUpperCase() + key.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </FamilySectionCard>

      <FamilySectionCard title="Task list" rightLabel="New task" onRightPress={() => router.push('/family/tasks/create')}>
        {list.length ? (
          <View style={styles.listWrap}>
            {list.map((task) => {
              const assigneeNames = task.assignedMemberIds
                .map((memberId) => state.members.find((member) => member.id === memberId)?.name)
                .filter(Boolean)
                .join(', ');

              return (
                <ListRow
                  key={task.id}
                  icon={task.status === 'done' ? 'checkmark-circle' : 'ellipse-outline'}
                  iconTint={task.status === 'done' ? ds.colors.success : ds.colors.family}
                  label={task.title}
                  body={`${task.dueDateISO}${assigneeNames ? ` · ${assigneeNames}` : ''}`}
                  rightText={task.status === 'done' ? 'Done' : 'Open'}
                  onPress={() => router.push(`/family/tasks/${task.id}`)}
                  trailing={
                    <BubbleChip
                      compact
                      icon={task.status === 'done' ? 'arrow-undo-outline' : 'checkmark'}
                      tone={task.status === 'done' ? 'neutral' : 'success'}
                      onPress={() => toggleTask(task.id)}
                    />
                  }
                />
              );
            })}
          </View>
        ) : (
          <EmptyState title="No tasks in this view" body="Create or reassign a shared task to keep the household aligned." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Quick actions">
        <View style={styles.actions}>
          <BubbleChip icon="add-circle-outline" label="Create task" tone="primary" onPress={() => router.push('/family/tasks/create')} />
          <BubbleChip icon="swap-horizontal-outline" label="Reassign" tone="neutral" onPress={() => router.push('/family/voice-summary')} />
          <BubbleChip icon="calendar-outline" label="View calendar" tone="neutral" onPress={() => router.push('/family/calendar')} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'What chores are still open tonight?'" onAsk={() => router.push('/family/voice-summary')} />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  segmentWrap: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  segment: {
    flex: 1,
    minHeight: 38,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    borderColor: 'rgba(80, 152, 255, 0.5)',
    backgroundColor: 'rgba(80, 152, 255, 0.18)',
  },
  segmentText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: ds.colors.primary,
    fontWeight: '700',
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
