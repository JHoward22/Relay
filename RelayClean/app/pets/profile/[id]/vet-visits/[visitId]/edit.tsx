import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { PetsShell } from '../../../../components/PetsShell';
import { usePetsStore } from '../../../../pets-context';

export default function VetVisitEditScreen() {
  const router = useRouter() as any;
  const { id, visitId } = useLocalSearchParams<{ id: string; visitId: string }>();
  const { state, updateVetVisit } = usePetsStore();

  const visit = useMemo(
    () => state.vetVisits.find((item) => item.id === visitId && item.petId === id),
    [id, state.vetVisits, visitId]
  );

  const [clinicName, setClinicName] = useState(visit?.clinicName ?? '');
  const [reason, setReason] = useState(visit?.reason ?? '');
  const [dateISO, setDateISO] = useState(visit?.dateISO ?? '');
  const [timeLabel, setTimeLabel] = useState(visit?.timeLabel ?? '');
  const [notes, setNotes] = useState(visit?.notes ?? '');

  if (!visit) {
    return (
      <PetsShell title="Edit Visit" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/vet-visits`)}>
        <EmptyState title="Visit not found" body="Return to vet visits list." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title="Edit Vet Visit" subtitle={visit.reason} onBack={() => router.back()}>
      <FormField label="Clinic" value={clinicName} onChangeText={setClinicName} />
      <FormField label="Reason" value={reason} onChangeText={setReason} />
      <FormField label="Date (YYYY-MM-DD)" value={dateISO} onChangeText={setDateISO} />
      <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <PrimaryButton
        label="Save"
        onPress={() => {
          updateVetVisit(visit.id, {
            clinicName,
            reason,
            dateISO,
            timeLabel,
            notes: notes.trim() || undefined,
          });
          router.replace(`/pets/profile/${id}/vet-visits/${visit.id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </PetsShell>
  );
}
