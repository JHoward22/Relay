import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { FamilyShell } from '../../components/FamilyShell';
import { useFamilyStore } from '../../family-context';

export default function KidEventCreateScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getChild, state, addEvent } = useFamilyStore();

  const child = getChild(id);

  const [title, setTitle] = useState(`${child?.name ?? 'Child'} activity`);
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [timeLabel, setTimeLabel] = useState('5:00 PM');

  return (
    <FamilyShell title="Add Child Event" subtitle={child?.name ?? 'Child'} onBack={() => router.back()}>
      <GlassCard blur>
        <FormField label="Event" value={title} onChangeText={setTitle} />
        <FormField label="Date" value={dateISO} onChangeText={setDateISO} />
        <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
      </GlassCard>

      <PrimaryButton
        label="Save event"
        onPress={() => {
          addEvent({
            title,
            dateISO,
            timeLabel,
            affectedMemberIds: child?.memberId ? [child.memberId] : [state.members[0]?.id ?? 'fm-1'],
            type: 'event',
          });
          router.replace(`/family/kids/${id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FamilyShell>
  );
}
