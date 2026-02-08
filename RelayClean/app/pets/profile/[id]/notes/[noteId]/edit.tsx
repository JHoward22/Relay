import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { PetsShell } from '../../../../components/PetsShell';
import { usePetsStore } from '../../../../pets-context';

export default function PetNoteEditScreen() {
  const router = useRouter() as any;
  const { id, noteId } = useLocalSearchParams<{ id: string; noteId: string }>();
  const { state, updateNote } = usePetsStore();

  const note = useMemo(
    () => state.notes.find((item) => item.id === noteId && item.petId === id),
    [id, noteId, state.notes]
  );

  const [title, setTitle] = useState(note?.title ?? '');
  const [body, setBody] = useState(note?.body ?? '');

  if (!note) {
    return (
      <PetsShell title="Edit Note" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/notes`)}>
        <EmptyState title="Note not found" body="Return to notes list." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title="Edit Note" subtitle={note.title} onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Details" value={body} onChangeText={setBody} multiline numberOfLines={6} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          updateNote(note.id, {
            title: title.trim() || note.title,
            body: body.trim() || note.body,
          });
          router.replace(`/pets/profile/${id}/notes/${note.id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </PetsShell>
  );
}
