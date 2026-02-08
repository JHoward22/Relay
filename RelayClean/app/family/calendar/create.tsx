import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { FamilyShell } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

export default function FamilyEventCreateScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ memberId?: string }>();
  const { addEvent, state } = useFamilyStore();

  const defaultMemberId = useMemo(() => params.memberId ?? state.members[0]?.id ?? 'fm-1', [params.memberId, state.members]);

  const [title, setTitle] = useState('');
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [timeLabel, setTimeLabel] = useState('6:00 PM');
  const [location, setLocation] = useState('');
  const [repeatRule, setRepeatRule] = useState('');

  return (
    <FamilyShell title="Create Event" subtitle="Shared family calendar event" onBack={() => router.back()}>
      <GlassCard blur>
        <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Recital" />
        <FormField label="Date" value={dateISO} onChangeText={setDateISO} />
        <FormField label="Time" value={timeLabel} onChangeText={setTimeLabel} />
        <FormField label="Location" value={location} onChangeText={setLocation} placeholder="School Hall" />
        <FormField label="Repeat (optional)" value={repeatRule} onChangeText={setRepeatRule} placeholder="Weekly" />
      </GlassCard>

      <PrimaryButton
        label="Save event"
        onPress={() => {
          const id = addEvent({
            title: title || 'New family event',
            dateISO,
            timeLabel,
            location: location || undefined,
            repeatRule: repeatRule || undefined,
            affectedMemberIds: [defaultMemberId],
            type: 'event',
          });
          router.replace(`/family/calendar/event/${id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FamilyShell>
  );
}
