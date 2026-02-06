import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function CreateTaskScreen() {
  const router = useRouter() as any;
  const { addTask } = useRelayStore();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('Tomorrow');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [category, setCategory] = useState('General');
  const [assignedTo, setAssignedTo] = useState('');
  const [note, setNote] = useState('');
  const [recurring, setRecurring] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Create Task" subtitle="Capture once, organize automatically" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Task" />
          <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Reply to Emma's teacher" />
          <FormField label="Due date" value={dueDate} onChangeText={setDueDate} />
          <FormField
            label="Priority (low, medium, high)"
            value={priority}
            onChangeText={(value) => {
              if (value === 'low' || value === 'medium' || value === 'high') setPriority(value);
            }}
            autoCapitalize="none"
          />
          <FormField label="Category" value={category} onChangeText={setCategory} />
          <FormField label="Assign person (optional)" value={assignedTo} onChangeText={setAssignedTo} />
          <FormField label="Notes" value={note} onChangeText={setNote} multiline />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Behavior" />
          <ListRow
            variant="compact"
            label="Recurring task"
            trailing={
              <Switch
                value={recurring}
                onValueChange={setRecurring}
                trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
                thumbColor={recurring ? ds.colors.primary : '#FFFFFF'}
              />
            }
          />
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
              recurring,
              cadence: recurring ? 'Weekly' : undefined,
              note: note || undefined,
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
