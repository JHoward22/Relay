import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { PetsShell } from '../../../../components/PetsShell';
import { usePetsStore } from '../../../../pets-context';

export default function WalkEditScreen() {
  const router = useRouter() as any;
  const { id, walkId } = useLocalSearchParams<{ id: string; walkId: string }>();
  const { state, updateWalk, logWalk } = usePetsStore();

  const walk = useMemo(
    () => state.walks.find((item) => item.id === walkId && item.petId === id),
    [id, state.walks, walkId]
  );

  const [title, setTitle] = useState(walk?.title ?? '');
  const [dateISO, setDateISO] = useState(walk?.dateISO ?? '');
  const [timeLabel, setTimeLabel] = useState(walk?.timeLabel ?? '');
  const [durationMin, setDurationMin] = useState(String(walk?.durationMin ?? 0));
  const [notes, setNotes] = useState(walk?.notes ?? '');

  if (!walk) {
    return (
      <PetsShell title="Edit Walk" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/walks`)}>
        <EmptyState title="Walk entry not found" body="Return to walk log." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title="Edit Walk" subtitle={walk.title} onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Date (YYYY-MM-DD)" value={dateISO} onChangeText={setDateISO} />
      <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
      <FormField label="Duration (min)" value={durationMin} onChangeText={setDurationMin} keyboardType="number-pad" />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          updateWalk(walk.id, {
            title,
            dateISO,
            timeLabel,
            durationMin: Number(durationMin || 0),
            notes: notes.trim() || undefined,
          });
          router.replace(`/pets/profile/${id}/walks`);
        }}
      />
      <PrimaryButton label="Mark complete" onPress={() => { logWalk(walk.id); router.replace(`/pets/profile/${id}/walks`); }} />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </PetsShell>
  );
}
