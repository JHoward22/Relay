import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { PetsShell, PetsTalkSheet } from '../../../components/PetsShell';
import { usePetsStore } from '../../../pets-context';

export default function FeedingCreateScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addFeeding } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const [title, setTitle] = useState('Evening feeding');
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [timeLabel, setTimeLabel] = useState('6:30 PM');
  const [foodType, setFoodType] = useState('Kibble mix');
  const [portion, setPortion] = useState('1 cup');
  const [notes, setNotes] = useState('');

  return (
    <PetsShell title="Add Feeding" subtitle="Create feeding record" onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Date (YYYY-MM-DD)" value={dateISO} onChangeText={setDateISO} />
      <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
      <FormField label="Food type" value={foodType} onChangeText={setFoodType} />
      <FormField label="Portion" value={portion} onChangeText={setPortion} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          const feedingId = addFeeding({
            petId: id,
            title,
            dateISO,
            timeLabel,
            foodType,
            portion,
            notes: notes.trim() || undefined,
            createdBy: 'manual',
          });
          router.replace(`/pets/profile/${id}/feeding/${feedingId}/edit`);
        }}
      />
      <SecondaryButton label="Use voice" onPress={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}
