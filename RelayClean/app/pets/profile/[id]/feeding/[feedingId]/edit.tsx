import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { PetsShell } from '../../../../components/PetsShell';
import { usePetsStore } from '../../../../pets-context';

export default function FeedingEditScreen() {
  const router = useRouter() as any;
  const { id, feedingId } = useLocalSearchParams<{ id: string; feedingId: string }>();
  const { state, updateFeeding, logFeeding } = usePetsStore();

  const feeding = useMemo(
    () => state.feedings.find((item) => item.id === feedingId && item.petId === id),
    [feedingId, id, state.feedings]
  );

  const [title, setTitle] = useState(feeding?.title ?? '');
  const [dateISO, setDateISO] = useState(feeding?.dateISO ?? '');
  const [timeLabel, setTimeLabel] = useState(feeding?.timeLabel ?? '');
  const [foodType, setFoodType] = useState(feeding?.foodType ?? '');
  const [portion, setPortion] = useState(feeding?.portion ?? '');
  const [notes, setNotes] = useState(feeding?.notes ?? '');

  if (!feeding) {
    return (
      <PetsShell title="Edit Feeding" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/feeding`)}>
        <EmptyState title="Feeding entry not found" body="Return to feeding log." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title="Edit Feeding" subtitle={feeding.title} onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Date (YYYY-MM-DD)" value={dateISO} onChangeText={setDateISO} />
      <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
      <FormField label="Food type" value={foodType} onChangeText={setFoodType} />
      <FormField label="Portion" value={portion} onChangeText={setPortion} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          updateFeeding(feeding.id, {
            title,
            dateISO,
            timeLabel,
            foodType,
            portion,
            notes: notes.trim() || undefined,
          });
          router.replace(`/pets/profile/${id}/feeding`);
        }}
      />
      <PrimaryButton label="Mark complete" onPress={() => { logFeeding(feeding.id); router.replace(`/pets/profile/${id}/feeding`); }} />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </PetsShell>
  );
}
