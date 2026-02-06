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

export default function EventDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, addTask, deleteEvent, updateEvent } = useRelayStore();

  const event = useMemo(() => state.events.find((entry) => entry.id === id), [id, state.events]);

  const [title, setTitle] = useState(event?.title ?? '');
  const [time, setTime] = useState(event?.time ?? '');
  const [location, setLocation] = useState(event?.location ?? '');
  const [notes, setNotes] = useState(event?.notes ?? '');
  const [date, setDate] = useState(event?.date ?? '');

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.missing}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Event Detail" subtitle={event.repeat ?? 'One-time'} onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Event" />
          <FormField label="Title" value={title} onChangeText={setTitle} />
          <FormField label="Date" value={date} onChangeText={setDate} />
          <FormField label="Time" value={time} onChangeText={setTime} />
          <FormField label="Location" value={location} onChangeText={setLocation} />
          <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Reminders" />
          <ListRow variant="compact" label="Reminder timing" rightText={event.reminder ?? 'None'} />
          <ListRow variant="compact" label="Repeat" rightText={event.repeat ?? 'None'} />
        </GlassCard>

        <PrimaryButton
          label="Save edits"
          onPress={() => {
            updateEvent(event.id, { title, date, time, location, notes });
            router.back();
          }}
        />
        <SecondaryButton
          label="Delete event"
          onPress={() => {
            deleteEvent(event.id);
            router.replace('/(tabs)/calendar');
          }}
        />
        <SecondaryButton
          label="Convert to task"
          onPress={() => {
            addTask({
              title,
              dueDate: `${date} · ${time}`,
              priority: 'medium',
              category: 'Event follow-up',
              recurring: false,
              note: notes,
            });
            router.replace('/(tabs)/tasks');
          }}
        />
        <SecondaryButton
          label="Add follow-up reminder"
          onPress={() => {
            addTask({
              title: `Follow up: ${title}`,
              dueDate: 'Tomorrow',
              priority: 'medium',
              category: 'Follow-up',
              recurring: false,
              note: notes,
            });
            router.replace('/(tabs)/tasks');
          }}
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
