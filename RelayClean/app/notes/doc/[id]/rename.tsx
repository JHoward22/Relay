import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { NotesShell } from '../../components/NotesShell';
import { useNotesStore } from '../../notes-context';

export default function RenameDocScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDocument, updateDocument } = useNotesStore();

  const doc = useMemo(() => getDocument(id), [getDocument, id]);
  const [name, setName] = useState(doc?.name ?? '');

  if (!doc) {
    return (
      <NotesShell title="Rename Document" subtitle="Not found" onBack={() => router.replace('/notes')}>
        <EmptyState title="Document not found" body="Return to Notes home." />
      </NotesShell>
    );
  }

  return (
    <NotesShell title="Rename Document" subtitle={doc.name} onBack={() => router.back()}>
      <FormField label="Name" value={name} onChangeText={setName} />
      <PrimaryButton
        label="Save"
        onPress={() => {
          updateDocument(doc.id, { name: name.trim() || doc.name });
          router.replace(`/notes/doc/${doc.id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </NotesShell>
  );
}
