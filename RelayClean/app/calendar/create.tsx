import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function CreateEventScreen() {
  const router = useRouter() as any;
  const { addEvent } = useRelayStore();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-02-14');
  const [time, setTime] = useState('2:00 PM');
  const [location, setLocation] = useState('');
  const [reminder, setReminder] = useState('1 hour before');
  const [notes, setNotes] = useState('');
  const [repeat, setRepeat] = useState('None');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Create Event" subtitle="Place it on your timeline" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Event" />
          <FormField label="Title" value={title} onChangeText={setTitle} />
          <FormField label="Date" value={date} onChangeText={setDate} />
          <FormField label="Time" value={time} onChangeText={setTime} />
          <FormField label="Location" value={location} onChangeText={setLocation} />
          <FormField label="Reminder timing" value={reminder} onChangeText={setReminder} />
          <FormField label="Repeat rule" value={repeat} onChangeText={setRepeat} />
          <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />
        </GlassCard>

        <PrimaryButton
          label="Save event"
          onPress={() => {
            addEvent({
              title: title || 'Untitled event',
              date,
              time,
              location,
              reminder,
              notes,
              repeat,
            });
            router.replace('/(tabs)/calendar');
          }}
        />
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
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
});
