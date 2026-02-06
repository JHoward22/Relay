import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

const REMIND_AGAIN = ['In 2 hours', 'Tomorrow morning', 'Next week'];

function nextType(type: string) {
  if (type === 'task') return 'event';
  if (type === 'event') return 'task';
  if (type === 'reminder') return 'task';
  if (type === 'message') return 'task';
  return 'task';
}

export default function HomeItemDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    state,
    addEvent,
    addTask,
    markInboxDone,
    snoozeInbox,
    updateInbox,
    updateTask,
    updateEvent,
  } = useRelayStore();

  const item = useMemo(() => state.inbox.find((entry) => entry.id === id), [id, state.inbox]);
  const sourceTask = useMemo(
    () => (item?.sourceType === 'task' ? state.tasks.find((entry) => entry.id === item.sourceId) : undefined),
    [item, state.tasks]
  );
  const sourceEvent = useMemo(
    () => (item?.sourceType === 'event' ? state.events.find((entry) => entry.id === item.sourceId) : undefined),
    [item, state.events]
  );

  const [draftTitle, setDraftTitle] = useState(item?.title ?? '');
  const [draftNote, setDraftNote] = useState(item?.note ?? sourceTask?.note ?? sourceEvent?.notes ?? '');

  if (!item) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.empty}>Item not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const destinationType = nextType(item.type);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Item Detail" subtitle={item.type.toUpperCase()} onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Details" />
          <FormField label="Title" value={draftTitle} onChangeText={setDraftTitle} />
          <FormField label="Notes" value={draftNote} onChangeText={setDraftNote} multiline />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Metadata" />
          <ListRow variant="compact" label="Category" rightText={sourceTask?.category ?? item.type} />
          <ListRow variant="compact" label="Date / time" rightText={sourceEvent ? `${sourceEvent.date} · ${sourceEvent.time}` : item.subtitle} />
          {sourceTask?.assignedTo ? <ListRow variant="compact" label="Assigned" rightText={sourceTask.assignedTo} /> : null}
          {sourceEvent?.location ? <ListRow variant="compact" label="Location" rightText={sourceEvent.location} /> : null}
          {item.type === 'message' ? <ListRow variant="compact" label="Contact" rightText="Emma's teacher" /> : null}
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Remind me again" />
          {REMIND_AGAIN.map((label) => (
            <ListRow
              key={label}
              variant="compact"
              label={label}
              onPress={() => updateInbox(item.id, { subtitle: label, filter: 'upcoming' })}
            />
          ))}
        </GlassCard>

        <PrimaryButton
          label="Mark Done"
          onPress={() => {
            markInboxDone(item.id);
            if (sourceTask && !sourceTask.completed) updateTask(sourceTask.id, { completed: true });
            router.back();
          }}
        />
        <SecondaryButton
          label="Snooze"
          onPress={() => {
            snoozeInbox(item.id);
            router.back();
          }}
        />
        <SecondaryButton
          label="Save edits"
          onPress={() => {
            updateInbox(item.id, { title: draftTitle, note: draftNote });
            if (sourceTask) updateTask(sourceTask.id, { title: draftTitle, note: draftNote });
            if (sourceEvent) updateEvent(sourceEvent.id, { title: draftTitle, notes: draftNote });
          }}
        />
        <SecondaryButton
          label={`Convert to ${destinationType}`}
          onPress={() => {
            if (destinationType === 'event') {
              addEvent({
                title: draftTitle,
                date: '2026-02-20',
                time: item.subtitle,
                location: sourceEvent?.location ?? 'TBD',
                reminder: '1 hour before',
                notes: draftNote,
                repeat: 'None',
              });
              updateInbox(item.id, { type: 'event', subtitle: 'Converted to event' });
            } else {
              addTask({
                title: draftTitle,
                dueDate: item.subtitle,
                priority: sourceTask?.priority ?? 'medium',
                category: sourceTask?.category ?? 'General',
                assignedTo: sourceTask?.assignedTo,
                recurring: false,
                note: draftNote,
              });
              updateInbox(item.id, { type: 'task', subtitle: 'Converted to task' });
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
});
