import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { PetsShell, PetsTalkSheet } from '../../../components/PetsShell';

export default function VetVisitCreateScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const [talkOpen, setTalkOpen] = useState(false);

  const [clinicName, setClinicName] = useState('Dr. Williams Vet Clinic');
  const [reason, setReason] = useState('Annual wellness exam');
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [timeLabel, setTimeLabel] = useState('9:30 AM');
  const [notes, setNotes] = useState('');

  return (
    <PetsShell title="Schedule Vet Visit" subtitle="Add appointment details" onBack={() => router.back()}>
      <FormField label="Vet / Clinic" value={clinicName} onChangeText={setClinicName} />
      <FormField label="Reason" value={reason} onChangeText={setReason} />
      <FormField label="Date (YYYY-MM-DD)" value={dateISO} onChangeText={setDateISO} />
      <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

      <PrimaryButton
        label="Continue"
        onPress={() =>
          router.push({
            pathname: `/pets/profile/${id}/vet-visits/confirm`,
            params: { clinicName, reason, dateISO, timeLabel, notes },
          })
        }
      />
      <SecondaryButton label="Use voice" onPress={() => setTalkOpen(true)} />
      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}
