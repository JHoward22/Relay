import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function RecurringDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, updateTask, deleteTask } = useRelayStore();

  const task = useMemo(() => state.tasks.find((entry) => entry.id === id), [id, state.tasks]);
  const [cadence, setCadence] = useState(task?.cadence ?? 'Weekly');
  const [nextRun, setNextRun] = useState(task?.dueDate ?? 'Tomorrow');
  const [talkOpen, setTalkOpen] = useState(false);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.missing}>Recurring task not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Recurring Detail" subtitle={task.title} onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Cadence" />
          <FormField label="Schedule cadence" value={cadence} onChangeText={setCadence} />
          <FormField label="Next occurrence" value={nextRun} onChangeText={setNextRun} />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Status" />
          <ListRow variant="compact" label="Task category" rightText={task.category} />
          <ListRow variant="compact" label="Assigned" rightText={task.assignedTo ?? 'Not assigned'} />
        </GlassCard>

        <PrimaryButton
          label="Save cadence"
          onPress={() => {
            updateTask(task.id, { cadence, dueDate: nextRun, recurring: true });
            router.back();
          }}
        />
        <SecondaryButton
          label="Pause recurring"
          onPress={() => {
            updateTask(task.id, { recurring: false });
            router.back();
          }}
        />
        <SecondaryButton
          label="Delete"
          onPress={() => {
            deleteTask(task.id);
            router.replace('/tasks/recurring');
          }}
        />
        <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />
      </ScrollView>

      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
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
