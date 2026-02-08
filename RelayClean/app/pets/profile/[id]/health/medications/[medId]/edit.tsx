import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { PetsShell } from '../../../../../components/PetsShell';
import { usePetsStore } from '../../../../../pets-context';

export default function MedicationEditScreen() {
  const router = useRouter() as any;
  const { id, medId } = useLocalSearchParams<{ id: string; medId: string }>();
  const { state, updateMedication } = usePetsStore();

  const medication = useMemo(
    () => state.medications.find((item) => item.id === medId && item.petId === id),
    [id, medId, state.medications]
  );

  const [dosage, setDosage] = useState(medication?.dosage ?? '');
  const [schedule, setSchedule] = useState(medication?.schedule ?? '');
  const [timeLabel, setTimeLabel] = useState(medication?.timeLabel ?? '');
  const [nextDueISO, setNextDueISO] = useState(medication?.nextDueISO ?? '');
  const [notes, setNotes] = useState(medication?.notes ?? '');

  if (!medication) {
    return (
      <PetsShell title="Edit Medication" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/health/medications`)}>
        <EmptyState title="Medication not found" body="Return to medication list." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title="Edit Medication" subtitle={medication.name} onBack={() => router.back()}>
      <FormField label="Dosage" value={dosage} onChangeText={setDosage} />
      <FormField label="Schedule" value={schedule} onChangeText={setSchedule} />
      <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
      <FormField label="Next due (YYYY-MM-DD)" value={nextDueISO} onChangeText={setNextDueISO} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          updateMedication(medication.id, {
            dosage,
            schedule,
            timeLabel,
            nextDueISO,
            notes: notes.trim() || undefined,
          });
          router.replace(`/pets/profile/${id}/health/medications/${medication.id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </PetsShell>
  );
}
