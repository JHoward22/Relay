import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { PetsSectionCard, PetsShell, PetsTalkSheet } from '../../../components/PetsShell';
import { usePetsStore } from '../../../pets-context';

export default function PetNotesScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPet, state } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const pet = getPet(id);
  const notes = state.notes.filter((item) => item.petId === id);

  return (
    <PetsShell title="Pet Notes" subtitle={pet?.name ?? 'Pet'} onBack={() => router.back()}>
      <PetsSectionCard title="Observations">
        {notes.length ? notes.map((note) => (
          <View key={note.id} style={{ marginBottom: 8 }}>
            <ListRow
              icon="document-text-outline"
              label={note.title}
              body={note.body}
              rightText={new Date(note.updatedAtISO).toLocaleDateString()}
              onPress={() => router.push(`/pets/profile/${id}/notes/${note.id}`)}
            />
          </View>
        )) : <EmptyState title="No notes yet" body="Track behavior, symptoms, and questions for your vet." />}
      </PetsSectionCard>

      <PrimaryButton label="Create note" onPress={() => router.push(`/pets/profile/${id}/notes/create`)} />
      <SecondaryButton label="Voice dictation" onPress={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}
