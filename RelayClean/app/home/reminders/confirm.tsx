import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import {
  completeReminderRecord,
  createReminderRecord,
  snoozeReminderRecord,
  updateReminderRecord,
} from '../demo-data';

export default function ReminderConfirmScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    due?: string;
    repeat?: string;
    mode?: string;
    notes?: string;
  }>();

  const title = params.title ?? 'Reminder';
  const due = params.due ?? 'Soon';
  const repeat = params.repeat ?? 'None';
  const mode = params.mode ?? 'create';
  const id = params.id;

  const onConfirm = () => {
    if (mode === 'done' && id) {
      completeReminderRecord(id);
    } else if (mode === 'snooze' && id) {
      snoozeReminderRecord(id, due);
    } else if (mode === 'edit' && id) {
      updateReminderRecord(id, {
        title,
        dueLabel: due,
        repeat,
        context: params.notes ?? 'Relay reminder',
      });
    } else if (mode === 'edit' || mode === 'create' || mode === 'snooze') {
      createReminderRecord({
        title,
        dueLabel: due,
        repeat,
        context: params.notes ?? 'Relay reminder',
      });
    }

    router.replace({
      pathname: '/home/reminders',
      params: {
        created: '1',
        action: mode,
        refresh: String(Date.now()),
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Confirm Reminder" subtitle="Relay understood:" onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Parsed action" />
          <View style={styles.itemRow}>
            <Text style={styles.itemBullet}>•</Text>
            <View style={styles.itemTextWrap}>
              <Text style={styles.itemTitle}>{title}</Text>
              <Text style={styles.itemMeta}>{due}</Text>
            </View>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemBullet}>•</Text>
            <View style={styles.itemTextWrap}>
              <Text style={styles.itemTitle}>Repeat</Text>
              <Text style={styles.itemMeta}>{repeat}</Text>
            </View>
          </View>
        </GlassCard>

        <PrimaryButton label="Confirm" onPress={onConfirm} />
        <SecondaryButton label="Edit" onPress={() => router.back()} />
        {mode !== 'snooze' ? <SecondaryButton label="Cancel" onPress={() => router.replace('/home/reminders')} /> : null}
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
  },
  itemBullet: {
    marginTop: 1,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  itemTextWrap: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  itemMeta: {
    marginTop: 2,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
