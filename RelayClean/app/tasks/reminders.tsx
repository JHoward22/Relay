import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { EmptyState } from '@/components/relay/EmptyState';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

function isReminderCategory(category: string) {
  const normalized = category.toLowerCase();
  return normalized.includes('reminder') || normalized.includes('health') || normalized.includes('follow-up');
}

export default function TaskRemindersScreen() {
  const router = useRouter() as any;
  const { state } = useRelayStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const reminders = useMemo(
    () => state.tasks.filter((task) => !task.archived && isReminderCategory(task.category)),
    [state.tasks]
  );
  const recurring = useMemo(
    () => reminders.filter((task) => task.recurring),
    [reminders]
  );
  const oneTime = useMemo(
    () => reminders.filter((task) => !task.recurring),
    [reminders]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Reminders"
          subtitle="Health and follow-through"
          onBack={() => router.back()}
          rightLabel="Add"
          onRightPress={() => router.push('/home/reminders/create')}
        />

        <GlassCard>
          <SectionHeader title="One-time reminders" />
          {oneTime.length ? (
            oneTime.map((task) => (
              <View key={task.id} style={styles.rowWrap}>
                <ListRow
                  icon="alarm-outline"
                  label={task.title}
                  body={task.dueDate}
                  onPress={() => router.push(`/tasks/${task.id}`)}
                />
              </View>
            ))
          ) : (
            <EmptyState title="No one-time reminders." body="Add one from Home or Talk to Relay." />
          )}
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Recurring reminders" rightLabel="View all" onRightPress={() => router.push('/tasks/recurring')} />
          {recurring.length ? (
            recurring.map((task) => (
              <View key={task.id} style={styles.rowWrap}>
                <ListRow
                  icon="repeat-outline"
                  label={task.title}
                  body={task.cadence ?? task.dueDate}
                  onPress={() => router.push(`/tasks/recurring/${task.id}`)}
                />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recurring reminders yet.</Text>
          )}
        </GlassCard>

        <PrimaryButton label="Create reminder" onPress={() => router.push('/home/reminders/create')} />
        <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />
        <SecondaryButton label="Open calendar" onPress={() => router.push('/calendar')} />
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
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  emptyText: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
