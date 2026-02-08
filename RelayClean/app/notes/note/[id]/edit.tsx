import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { ds } from '@/constants/design-system';
import { NotesShell, NotesTalkSheet } from '../../components/NotesShell';
import { useNotesStore } from '../../notes-context';

export default function EditNoteScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNote, updateNote } = useNotesStore();

  const note = useMemo(() => getNote(id), [getNote, id]);

  const [talkOpen, setTalkOpen] = useState(false);
  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');
  const [checklistText, setChecklistText] = useState('');

  if (!note) {
    return (
      <NotesShell title="Edit Note" subtitle="Not found" onBack={() => router.replace('/notes')}>
        <EmptyState title="Note not found" body="Return to Notes home." />
      </NotesShell>
    );
  }

  return (
    <NotesShell title="Edit Note" subtitle={note.title} onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Body" value={body} onChangeText={setBody} multiline numberOfLines={10} />
      <FormField
        label="Checklist item"
        value={checklistText}
        onChangeText={setChecklistText}
        placeholder="Type and tap Add to checklist"
      />

      <View style={styles.quickActions}>
        <BubbleChip
          icon="add"
          label="Add checklist"
          tone="neutral"
          onPress={() => {
            if (!checklistText.trim()) return;
            updateNote(note.id, {
              checklist: [...note.checklist, { id: `ck-${Date.now()}`, title: checklistText.trim(), done: false }],
            });
            setChecklistText('');
          }}
        />
        <BubbleChip
          icon="mic-outline"
          label="Inline dictation"
          tone="primary"
          onPress={() => {
            setBody((prev) => `${prev}${prev ? '\n' : ''}Voice dictation inserted (demo).`);
            setTalkOpen(true);
          }}
        />
        <BubbleChip icon="color-wand-outline" label="Highlight" tone="neutral" onPress={() => setBody((prev) => `${prev}\n[Highlight] `)} />
      </View>

      <PrimaryButton
        label="Save"
        onPress={() => {
          updateNote(note.id, {
            title: title.trim() || note.title,
            body: body.trim() || note.body,
          });
          router.replace(`/notes/note/${note.id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />

      <NotesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </NotesShell>
  );
}

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
