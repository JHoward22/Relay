import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function CreateTaskFromHomeScreen() {
  const router = useRouter() as any;
  const { addTask } = useRelayStore();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('Tomorrow');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('General');
  const [assignedTo, setAssignedTo] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Create Task" subtitle="Add to your life inbox" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Task" />
          <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Call the vet" />
          <FormField label="Due date" value={dueDate} onChangeText={setDueDate} />
          <FormField
            label="Priority"
            value={priority}
            onChangeText={(value) => {
              if (value === 'low' || value === 'medium' || value === 'high') setPriority(value);
            }}
          />
          <FormField label="Category" value={category} onChangeText={setCategory} />
          <FormField label="Assigned person" value={assignedTo} onChangeText={setAssignedTo} />
        </GlassCard>

        <PrimaryButton
          label="Save task"
          onPress={() => {
            addTask({
              title: title || 'Untitled task',
              dueDate,
              priority,
              category,
              assignedTo: assignedTo || undefined,
              recurring: false,
            });
            router.replace('/(tabs)/tasks');
          }}
        />
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ds.colors.bg },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
});
