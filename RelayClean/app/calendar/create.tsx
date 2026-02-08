import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

function recurrenceSuggestion(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('dentist')) return 'Relay suggests every 6 months';
  if (lower.includes('vet')) return 'Relay suggests annually';
  if (lower.includes('pickup') || lower.includes('school')) return 'Relay suggests weekdays';
  if (lower.includes('bill')) return 'Relay suggests monthly';
  return '';
}

export default function CreateEventScreen() {
  const router = useRouter() as any;
  const { addEvent } = useRelayStore();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-02-14');
  const [time, setTime] = useState('2:00 PM');
  const [location, setLocation] = useState('');
  const [repeat, setRepeat] = useState('None');
  const [reminder, setReminder] = useState('1 hour before');
  const [talkOpen, setTalkOpen] = useState(false);

  const suggestion = useMemo(() => recurrenceSuggestion(title), [title]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="New Event" subtitle="Manual creation, AI fills in the rest" onBack={() => router.back()} />

        <GlassCard blur>
          <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Dentist appointment" />
          <FormField label="Date" value={date} onChangeText={setDate} />
          <FormField label="Time" value={time} onChangeText={setTime} />
          <FormField label="Optional location" value={location} onChangeText={setLocation} />
        </GlassCard>

        {suggestion ? (
          <GlassCard blur>
            <Text style={styles.suggestionTitle}>AI suggestion</Text>
            <Text style={styles.suggestionBody}>{suggestion}</Text>
            <SecondaryButton
              label="Use suggestion"
              onPress={() => setRepeat(suggestion.replace('Relay suggests ', ''))}
            />
          </GlassCard>
        ) : null}

        <GlassCard blur>
          <Text style={styles.suggestionTitle}>Smart reminder</Text>
          <Text style={styles.suggestionBody}>Relay suggests: {reminder}</Text>
          <SecondaryButton label="Set 2 hours before" onPress={() => setReminder('2 hours before')} />
          <SecondaryButton label="Set 1 day before" onPress={() => setReminder('1 day before')} />
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
              repeat,
              createdBy: 'manual',
              shared: false,
              notes: 'Created manually. Relay can enrich this later.',
            });
            router.replace('/calendar');
          }}
        />
        <SecondaryButton label="Use voice instead" onPress={() => setTalkOpen(true)} />
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
      </ScrollView>

      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
  suggestionTitle: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textSoft,
    fontWeight: '700',
  },
  suggestionBody: {
    marginBottom: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
