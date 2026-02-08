import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { FamilyShell } from '../../components/FamilyShell';
import { useFamilyStore } from '../../family-context';

export default function KidTaskCreateScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getChild, state, addTask } = useFamilyStore();

  const child = getChild(id);

  const [title, setTitle] = useState(`Task for ${child?.name ?? 'child'}`);
  const [dueDateISO, setDueDateISO] = useState(new Date().toISOString().slice(0, 10));

  return (
    <FamilyShell title="Add Child Task" subtitle={child?.name ?? 'Child'} onBack={() => router.back()}>
      <GlassCard blur>
        <FormField label="Task" value={title} onChangeText={setTitle} />
        <FormField label="Due date" value={dueDateISO} onChangeText={setDueDateISO} />
      </GlassCard>

      <PrimaryButton
        label="Assign"
        onPress={() => {
          addTask({
            title,
            dueDateISO,
            assignedMemberIds: child?.memberId ? [child.memberId] : [state.members[0]?.id ?? 'fm-1'],
            createdByMemberId: state.members[0]?.id ?? 'fm-1',
          });
          router.replace(`/family/kids/${id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FamilyShell>
  );
}
