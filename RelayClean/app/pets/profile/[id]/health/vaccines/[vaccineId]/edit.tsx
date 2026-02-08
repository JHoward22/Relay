import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { PetsShell } from '../../../../../components/PetsShell';
import { usePetsStore } from '../../../../../pets-context';

export default function VaccineEditScreen() {
  const router = useRouter() as any;
  const { id, vaccineId } = useLocalSearchParams<{ id: string; vaccineId: string }>();
  const { state, updateVaccine } = usePetsStore();

  const vaccine = useMemo(
    () => state.vaccines.find((item) => item.id === vaccineId && item.petId === id),
    [id, state.vaccines, vaccineId]
  );

  const [dueISO, setDueISO] = useState(vaccine?.dueISO ?? '');
  const [provider, setProvider] = useState(vaccine?.provider ?? '');
  const [notes, setNotes] = useState(vaccine?.notes ?? '');

  if (!vaccine) {
    return (
      <PetsShell title="Edit Vaccine" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/health/vaccines`)}>
        <EmptyState title="Vaccine not found" body="Return to vaccine list." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title="Edit Vaccine" subtitle={vaccine.name} onBack={() => router.back()}>
      <FormField label="Due date (YYYY-MM-DD)" value={dueISO} onChangeText={setDueISO} />
      <FormField label="Provider" value={provider} onChangeText={setProvider} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          updateVaccine(vaccine.id, {
            dueISO,
            provider: provider.trim() || undefined,
            notes: notes.trim() || undefined,
          });
          router.replace(`/pets/profile/${id}/health/vaccines/${vaccine.id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </PetsShell>
  );
}
