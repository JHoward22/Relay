import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { FamilyShell } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

export default function FamilyTaskCreateScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ memberId?: string }>();
  const { addTask, state } = useFamilyStore();

  const fallbackMemberId = useMemo(() => params.memberId ?? state.members[0]?.id ?? 'fm-1', [params.memberId, state.members]);

  const [title, setTitle] = useState('');
  const [dueDateISO, setDueDateISO] = useState(new Date().toISOString().slice(0, 10));
  const [assignTo, setAssignTo] = useState(fallbackMemberId);
  const [recurringRule, setRecurringRule] = useState('');

  return (
    <FamilyShell title="Create Task" subtitle="Shared family task" onBack={() => router.back()}>
      <GlassCard blur>
        <FormField label="Task" value={title} onChangeText={setTitle} placeholder="Take out recycling" />
        <FormField label="Due date" value={dueDateISO} onChangeText={setDueDateISO} />
        <FormField label="Assign to (member id)" value={assignTo} onChangeText={setAssignTo} />
        <FormField label="Recurring (optional)" value={recurringRule} onChangeText={setRecurringRule} placeholder="Weekly" />
      </GlassCard>

      <PrimaryButton
        label="Add task"
        onPress={() => {
          const id = addTask({
            title: title || 'New family task',
            dueDateISO,
            assignedMemberIds: [assignTo || fallbackMemberId],
            recurringRule: recurringRule || undefined,
            createdByMemberId: state.members[0]?.id ?? fallbackMemberId,
          });
          router.replace(`/family/tasks/${id}`);
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FamilyShell>
  );
}
