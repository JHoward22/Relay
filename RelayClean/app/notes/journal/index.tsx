import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { NotesSectionCard, NotesShell, NotesTalkSheet, NotesVoiceHint } from '../components/NotesShell';
import { MoodTag, useNotesStore } from '../notes-context';

export default function JournalScreen() {
  const router = useRouter() as any;
  const { state, addJournalEntry } = useNotesStore();

  const [talkOpen, setTalkOpen] = useState(false);
  const [mood, setMood] = useState<MoodTag>('calm');

  const entries = useMemo(
    () => state.journalEntries.filter((entry) => !entry.archived).sort((a, b) => b.dateISO.localeCompare(a.dateISO)),
    [state.journalEntries]
  );

  return (
    <NotesShell title="Journal" subtitle="Daily reflection space" onBack={() => router.back()}>
      <NotesSectionCard title="Mood Tag">
        <View style={styles.moodRow}>
          {(['calm', 'good', 'stressed', 'tired', 'focused'] as const).map((entry) => (
            <BubbleChip
              key={entry}
              icon={mood === entry ? 'checkmark' : 'happy-outline'}
              label={entry}
              tone={mood === entry ? 'primary' : 'neutral'}
              onPress={() => setMood(entry)}
            />
          ))}
        </View>
      </NotesSectionCard>

      <NotesSectionCard title="Daily Entries" rightLabel="New entry" onRightPress={() => {
        const id = addJournalEntry({
          title: `Journal ${new Date().toLocaleDateString()}`,
          body: 'Start writing...',
          mood,
          dateISO: new Date().toISOString().slice(0, 10),
          tagIds: [],
          archived: false,
          source: 'manual',
          aiReflection: 'Relay will summarize patterns after a few entries.',
        });
        router.push(`/notes/journal/entry/${id}`);
      }}>
        {entries.length ? entries.map((entry) => (
          <View key={entry.id} style={styles.rowWrap}>
            <ListRow
              icon="book-outline"
              label={entry.title}
              body={`${entry.dateISO} · Mood ${entry.mood}`}
              onPress={() => router.push(`/notes/journal/entry/${entry.id}`)}
            />
          </View>
        )) : <EmptyState title="No journal entries" body="Write your first entry and let Relay reflect patterns." />}
      </NotesSectionCard>

      <NotesSectionCard title="AI Reflection">
        <Text style={styles.reflection}>
          Relay noticed your calmest days happen when tasks are planned earlier in the day.
        </Text>
      </NotesSectionCard>

      <NotesVoiceHint label="Try saying: 'Start my journal entry for today'" onAsk={() => setTalkOpen(true)} />
      <NotesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  reflection: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
  },
});
