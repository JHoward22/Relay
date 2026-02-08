import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { PetsShell, PetsTalkSheet } from '../../../components/PetsShell';
import { usePetsStore } from '../../../pets-context';

export default function PetNoteCreateScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addNote } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  return (
    <PetsShell title="Create Note" subtitle="Capture observation" onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Behavior note" />
      <FormField label="Details" value={body} onChangeText={setBody} placeholder="Symptoms, context, questions" multiline numberOfLines={6} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          const noteId = addNote({
            petId: id,
            title: title.trim() || 'Untitled note',
            body: body.trim() || 'No details yet.',
            source: 'manual',
          });
          router.replace(`/pets/profile/${id}/notes/${noteId}`);
        }}
      />
      <SecondaryButton label="Save by voice" onPress={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}
