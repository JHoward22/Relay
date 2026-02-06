import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function TaskDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, addEvent, addTask, toggleTask, updateTask } = useRelayStore();

  const task = useMemo(() => state.tasks.find((entry) => entry.id === id), [id, state.tasks]);

  const [title, setTitle] = useState(task?.title ?? '');
  const [note, setNote] = useState(task?.note ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? 'Tomorrow');

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.missing}>Task not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Task Detail" subtitle={task.category} onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Task" />
          <FormField label="Title" value={title} onChangeText={setTitle} />
          <FormField label="Due date" value={dueDate} onChangeText={setDueDate} />
          <FormField label="Notes" value={note} onChangeText={setNote} multiline />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Status" />
          <ListRow variant="compact" label="Priority" rightText={task.priority} />
          <ListRow variant="compact" label="Assigned" rightText={task.assignedTo ?? 'Not assigned'} />
          <ListRow variant="compact" label="Recurring" rightText={task.recurring ? task.cadence ?? 'Yes' : 'No'} />
        </GlassCard>

        <PrimaryButton
          label={task.completed ? 'Mark Incomplete' : 'Mark Complete'}
          onPress={() => toggleTask(task.id)}
        />
        <SecondaryButton
          label="Save edits"
          onPress={() => {
            updateTask(task.id, { title, note, dueDate });
            router.back();
          }}
        />
        <SecondaryButton
          label="Convert to event"
          onPress={() => {
            addEvent({
              title,
              date: '2026-02-21',
              time: dueDate,
              location: 'TBD',
              reminder: '1 hour before',
              notes: note,
              repeat: 'None',
            });
            router.replace('/(tabs)/calendar');
          }}
        />
        <SecondaryButton
          label="Add reminder"
          onPress={() => {
            addTask({
              title: `Reminder: ${title}`,
              dueDate: `Reminder · ${dueDate}`,
              priority: 'medium',
              category: 'Reminder',
              recurring: false,
              note,
            });
            router.replace('/(tabs)/tasks');
          }}
        />
        <SecondaryButton
          label={task.recurring ? 'Make one-time task' : 'Make recurring'}
          onPress={() => updateTask(task.id, { recurring: !task.recurring, cadence: 'Weekly' })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ds.colors.bg },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
  missing: {
    marginTop: ds.spacing.s24,
    textAlign: 'center',
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
  },
});
