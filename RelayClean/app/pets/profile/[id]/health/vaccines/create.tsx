import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { PetsShell, PetsTalkSheet } from '../../../../components/PetsShell';
import { usePetsStore } from '../../../../pets-context';

export default function VaccineCreateScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addVaccine } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const [name, setName] = useState('');
  const [dueISO, setDueISO] = useState(new Date().toISOString().slice(0, 10));
  const [provider, setProvider] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <PetsShell title="Add Vaccine" subtitle="Set due date and status" onBack={() => router.back()}>
      <FormField label="Vaccine name" value={name} onChangeText={setName} placeholder="Rabies booster" />
      <FormField label="Due date (YYYY-MM-DD)" value={dueISO} onChangeText={setDueISO} />
      <FormField label="Provider" value={provider} onChangeText={setProvider} placeholder="Clinic name" />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          const vaccineId = addVaccine({
            petId: id,
            name: name.trim() || 'Vaccine',
            dueISO,
            provider: provider.trim() || undefined,
            notes: notes.trim() || undefined,
          });
          router.replace(`/pets/profile/${id}/health/vaccines/${vaccineId}`);
        }}
      />
      <SecondaryButton label="Use voice" onPress={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}
