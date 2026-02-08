import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { PetsShell, PetsTalkSheet } from '../../../components/PetsShell';
import { usePetsStore } from '../../../pets-context';

export default function WalkCreateScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addWalk } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const [title, setTitle] = useState('Evening walk');
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [timeLabel, setTimeLabel] = useState('6:45 PM');
  const [durationMin, setDurationMin] = useState('30');
  const [notes, setNotes] = useState('');

  return (
    <PetsShell title="Add Walk" subtitle="Create walk plan" onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Date (YYYY-MM-DD)" value={dateISO} onChangeText={setDateISO} />
      <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
      <FormField label="Duration (min)" value={durationMin} onChangeText={setDurationMin} keyboardType="number-pad" />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          const walkId = addWalk({
            petId: id,
            title,
            dateISO,
            timeLabel,
            durationMin: Number(durationMin || 0),
            notes: notes.trim() || undefined,
            createdBy: 'manual',
          });
          router.replace(`/pets/profile/${id}/walks/${walkId}/edit`);
        }}
      />
      <SecondaryButton label="Use voice" onPress={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}
