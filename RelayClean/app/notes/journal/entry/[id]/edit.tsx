import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { ds } from '@/constants/design-system';
import { NotesShell, NotesTalkSheet } from '../../../components/NotesShell';
import { MoodTag, useNotesStore } from '../../../notes-context';

export default function JournalEntryEditScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getJournalEntry, updateJournalEntry } = useNotesStore();

  const [talkOpen, setTalkOpen] = useState(false);
  const entry = useMemo(() => getJournalEntry(id), [getJournalEntry, id]);

  const [title, setTitle] = useState(entry?.title ?? '');
  const [body, setBody] = useState(entry?.body ?? '');
  const [mood, setMood] = useState<MoodTag>(entry?.mood ?? 'calm');

  if (!entry) {
    return (
      <NotesShell title="Edit Journal" subtitle="Not found" onBack={() => router.replace('/notes/journal')}>
        <EmptyState title="Entry not found" body="Return to Journal." />
      </NotesShell>
    );
  }

  return (
    <NotesShell title="Edit Journal" subtitle={entry.title} onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Body" value={body} onChangeText={setBody} multiline numberOfLines={10} />

      <View style={styles.moodRow}>
        {(['calm', 'good', 'stressed', 'tired', 'focused'] as const).map((entryMood) => (
          <BubbleChip
            key={entryMood}
            icon={mood === entryMood ? 'checkmark' : 'happy-outline'}
            label={entryMood}
            tone={mood === entryMood ? 'primary' : 'neutral'}
            onPress={() => setMood(entryMood)}
          />
        ))}
      </View>

      <PrimaryButton
        label="Save"
        onPress={() => {
          updateJournalEntry(entry.id, { title: title.trim() || entry.title, body: body.trim() || entry.body, mood });
          router.replace(`/notes/journal/entry/${entry.id}`);
        }}
      />
      <SecondaryButton label="Voice journaling" onPress={() => setTalkOpen(true)} />

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
});
