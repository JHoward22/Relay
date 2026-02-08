import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function CreateReminderFromHomeScreen() {
  const router = useRouter() as any;
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('Next week');
  const [assignedTo, setAssignedTo] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Create Reminder" subtitle="Gentle follow-through" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Reminder" />
          <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Take vitamins" />
          <FormField label="When" value={dueDate} onChangeText={setDueDate} />
          <FormField label="Assign person (optional)" value={assignedTo} onChangeText={setAssignedTo} />
        </GlassCard>

        <PrimaryButton
          label="Save reminder"
          onPress={() =>
            router.push({
              pathname: '/home/reminders/confirm',
              params: {
                mode: 'create',
                title: title || 'Untitled reminder',
                due: dueDate,
                repeat: 'None',
                assignedTo,
              },
            })
          }
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
