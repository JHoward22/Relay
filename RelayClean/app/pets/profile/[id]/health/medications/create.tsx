import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { PetsShell, PetsTalkSheet } from '../../../../components/PetsShell';
import { usePetsStore } from '../../../../pets-context';

export default function MedicationCreateScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addMedication } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('1 tablet');
  const [schedule, setSchedule] = useState('Daily');
  const [timeLabel, setTimeLabel] = useState('8:00 AM');
  const [startISO, setStartISO] = useState(new Date().toISOString().slice(0, 10));
  const [nextDueISO, setNextDueISO] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  return (
    <PetsShell title="Add Medication" subtitle="Create medication plan" onBack={() => router.back()}>
      <FormField label="Medication name" value={name} onChangeText={setName} placeholder="Flea + tick" />
      <FormField label="Dosage" value={dosage} onChangeText={setDosage} />
      <FormField label="Schedule" value={schedule} onChangeText={setSchedule} placeholder="Daily / Weekly" />
      <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
      <FormField label="Start date (YYYY-MM-DD)" value={startISO} onChangeText={setStartISO} />
      <FormField label="Next due (YYYY-MM-DD)" value={nextDueISO} onChangeText={setNextDueISO} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional" multiline numberOfLines={3} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          const medId = addMedication({
            petId: id,
            name: name.trim() || 'Medication',
            dosage,
            schedule,
            timeLabel,
            startISO,
            nextDueISO,
            notes: notes.trim() || undefined,
          });
          router.replace(`/pets/profile/${id}/health/medications/${medId}`);
        }}
      />
      <SecondaryButton label="Use voice" onPress={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}
