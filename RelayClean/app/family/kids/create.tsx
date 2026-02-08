import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { FamilyShell } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

export default function CreateKidScreen() {
  const router = useRouter() as any;
  const { addChild } = useFamilyStore();

  const [name, setName] = useState('');
  const [age, setAge] = useState('8');
  const [school, setSchool] = useState('');

  return (
    <FamilyShell title="Add Child" subtitle="Create a shared child profile" onBack={() => router.back()}>
      <GlassCard blur>
        <FormField label="Name" value={name} onChangeText={setName} placeholder="Amy" />
        <FormField label="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
        <FormField label="School" value={school} onChangeText={setSchool} placeholder="Valley Elementary" />
      </GlassCard>

      <PrimaryButton
        label="Save child"
        onPress={() => {
          addChild({
            name: name || 'New Child',
            age: Number(age) || 8,
            school: school || 'School',
            notes: '',
            healthReminders: [],
            colorTag: '#D48A47',
          });
          router.replace('/family/kids');
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />
    </FamilyShell>
  );
}
