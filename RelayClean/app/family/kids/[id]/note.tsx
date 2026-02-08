import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { FamilyShell } from '../../components/FamilyShell';
import { useFamilyStore } from '../../family-context';

export default function KidNoteCreateScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getChild, updateChild } = useFamilyStore();

  const child = getChild(id);

  const [note, setNote] = useState('');

  return (
    <FamilyShell title="Add Kid Note" subtitle={child?.name ?? 'Child'} onBack={() => router.back()}>
      <GlassCard blur>
        <FormField
          label="Note"
          value={note}
          onChangeText={setNote}
          placeholder="Behavior, school reminders, or health notes"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </GlassCard>

      <PrimaryButton
        label="Save note"
        onPress={() => {
          updateChild(id, {
            notes: [child?.notes, note].filter(Boolean).join('\n\n'),
          });
          router.replace(`/family/kids/${id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FamilyShell>
  );
}
