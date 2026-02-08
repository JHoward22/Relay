import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function CreateTaskScreen() {
  const router = useRouter() as any;
  const { addTask } = useRelayStore();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('Tomorrow');
  const [talkOpen, setTalkOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="New Task" subtitle="Manual capture with AI follow-through" onBack={() => router.back()} />

        <GlassCard blur>
          <FormField label="Task title" value={title} onChangeText={setTitle} placeholder="Book vet appointment" />
          <FormField label="Optional due date" value={dueDate} onChangeText={setDueDate} />
          <Text style={styles.helper}>
            Relay will assign category, context, and priority automatically after save.
          </Text>
        </GlassCard>

        <PrimaryButton
          label="Save task"
          onPress={() => {
            addTask({
              title: title || 'Untitled task',
              dueDate,
              priority: 'medium',
              recurring: false,
              category: 'General',
              createdBy: 'manual',
            });
            router.replace('/tasks');
          }}
        />
        <SecondaryButton label="Use voice instead" onPress={() => setTalkOpen(true)} />
        <SecondaryButton label="Cancel" onPress={() => router.back()} />
      </ScrollView>

      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
  helper: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
