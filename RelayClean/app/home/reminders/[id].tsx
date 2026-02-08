import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { SheetModal } from '@/components/relay/SheetModal';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { getReminderById } from '../demo-data';

export default function ReminderDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const reminder = useMemo(() => getReminderById(id ?? ''), [id]);
  const [title, setTitle] = useState(reminder?.title ?? 'Reminder');
  const [due, setDue] = useState(reminder?.dueLabel ?? 'Tomorrow');
  const [notes, setNotes] = useState(reminder?.context ?? '');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [talkOpen, setTalkOpen] = useState(false);

  if (!reminder) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LiquidBackdrop />
        <View style={styles.center}>
          <Text style={styles.empty}>Reminder not found.</Text>
          <PrimaryButton label="Back to reminders" onPress={() => router.replace('/home/reminders')} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Reminder Detail" subtitle={reminder.group.toUpperCase()} onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Reminder" />
          <FormField label="Title" value={title} onChangeText={setTitle} />
          <FormField label="Due" value={due} onChangeText={setDue} />
          <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />
        </GlassCard>

        <PrimaryButton label="Mark done" onPress={() => setConfirmOpen(true)} />
        <SecondaryButton
          label="Snooze"
          onPress={() =>
            router.push({
              pathname: '/home/reminders/confirm',
              params: {
                mode: 'snooze',
                id: reminder.id,
                title,
                due: 'Tomorrow · 9:00 AM',
                repeat: 'None',
                notes,
              },
            })
          }
        />
        <SecondaryButton
          label="Save edits"
          onPress={() =>
            router.push({
              pathname: '/home/reminders/confirm',
              params: { mode: 'edit', id: reminder.id, title, due, repeat: reminder.repeat ?? 'None', notes },
            })
          }
        />
        <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />
      </ScrollView>

      <SheetModal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Mark reminder done?</Text>
          <Text style={styles.sheetBody}>Relay will remove it from active reminders.</Text>
          <PrimaryButton
            label="Confirm"
            onPress={() =>
              router.push({
                pathname: '/home/reminders/confirm',
                params: {
                  mode: 'done',
                  id: reminder.id,
                  title: reminder.title,
                  due: reminder.dueLabel,
                  repeat: reminder.repeat ?? 'None',
                  notes,
                },
              })
            }
          />
          <SecondaryButton label="Cancel" onPress={() => setConfirmOpen(false)} />
        </View>
      </SheetModal>

      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ds.spacing.s16,
    gap: ds.spacing.s12,
  },
  empty: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  sheetContent: {
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    gap: ds.spacing.s8,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: 18,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetBody: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
