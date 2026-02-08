import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { NotesShell } from './components/NotesShell';

export default function NotesVoiceSummaryScreen() {
  const router = useRouter() as any;

  return (
    <NotesShell title="Relay Insight" subtitle="Notes and docs summary" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.quote}>“You created 4 items this week. Most are health and family related. One older document may be ready to archive.”</Text>
      </GlassCard>

      <GlassCard blur style={styles.actions}>
        <BubbleChip icon="save-outline" label="Save as note" tone="neutral" onPress={() => router.push('/notes/create?mode=mixed')} />
        <BubbleChip icon="checkbox-outline" label="Turn into task" tone="primary" onPress={() => router.push('/tasks/create')} />
        <BubbleChip icon="calendar-outline" label="Turn into event" tone="primary" onPress={() => router.push('/calendar/create')} />
        <BubbleChip icon="share-outline" label="Share" tone="neutral" onPress={() => router.push('/help/contact')} />
      </GlassCard>

      <PrimaryButton label="Back to Notes" onPress={() => router.replace('/notes')} />
      <SecondaryButton label="Open Archive" onPress={() => router.replace('/notes/archive')} />
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  quote: {
    fontFamily: ds.font,
    fontSize: 17,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
