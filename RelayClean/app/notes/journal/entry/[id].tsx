import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { NotesShell } from '../../components/NotesShell';
import { useNotesStore } from '../../notes-context';

export default function JournalEntryDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getJournalEntry, archiveJournalEntry } = useNotesStore();

  const entry = useMemo(() => getJournalEntry(id), [getJournalEntry, id]);

  if (!entry) {
    return (
      <NotesShell title="Journal Entry" subtitle="Not found" onBack={() => router.replace('/notes/journal')}>
        <EmptyState title="Entry not found" body="Return to Journal." />
      </NotesShell>
    );
  }

  return (
    <NotesShell title={entry.title} subtitle="Journal entry" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.meta}>{entry.dateISO} · Mood {entry.mood}</Text>
        <Text style={styles.body}>{entry.body}</Text>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.sectionTitle}>AI Reflection</Text>
        <Text style={styles.body}>{entry.aiReflection}</Text>
      </GlassCard>

      <View style={styles.actions}>
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.push(`/notes/journal/entry/${entry.id}/edit`)} />
        <BubbleChip icon="archive-outline" label="Archive" tone="danger" onPress={() => { archiveJournalEntry(entry.id, true); router.replace('/notes/journal'); }} />
        <BubbleChip icon="arrow-back-outline" label="Back" tone="neutral" onPress={() => router.back()} />
      </View>
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
    marginBottom: ds.spacing.s8,
  },
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
