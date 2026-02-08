import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { followUpsData, remindersData } from './demo-data';
import { useRelayStore } from '@/store/relay-store';

export default function DaySummaryScreen() {
  const router = useRouter() as any;
  const { state } = useRelayStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const timeline = useMemo(() => {
    const tasks = state.tasks.slice(0, 3).map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      body: task.dueDate,
      icon: 'checkbox-outline' as const,
      route: `/tasks/${task.id}`,
    }));

    const events = state.events.slice(0, 3).map((event) => ({
      id: `event-${event.id}`,
      title: event.title,
      body: `${event.date} · ${event.time}`,
      icon: 'calendar-outline' as const,
      route: `/calendar/event/${event.id}`,
    }));

    const reminders = remindersData.slice(0, 2).map((item) => ({
      id: `reminder-${item.id}`,
      title: item.title,
      body: item.dueLabel,
      icon: 'alarm-outline' as const,
      route: `/home/reminders/${item.id}`,
    }));

    const followUps = followUpsData.slice(0, 2).map((item) => ({
      id: `follow-${item.id}`,
      title: item.title,
      body: item.dueLabel,
      icon: 'mail-outline' as const,
      route: `/home/follow-ups/${item.id}`,
    }));

    return [...events, ...tasks, ...reminders, ...followUps];
  }, [state.events, state.tasks]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Day Summary" subtitle="Everything that matters today" onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Timeline" rightLabel="Summarize" onRightPress={() => router.push('/home/summary/config')} />
          {timeline.map((item) => (
            <View key={item.id} style={styles.rowWrap}>
              <ListRow icon={item.icon} label={item.title} body={item.body} onPress={() => router.push(item.route)} />
            </View>
          ))}
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Plan support" />
          <Text style={styles.hint}>Relay can reorganize this day by urgency, time, or energy level.</Text>
          <PrimaryButton label="Summarize" onPress={() => router.push('/home/summary/config')} />
          <SecondaryButton label="Make a plan" onPress={() => setTalkOpen(true)} />
        </GlassCard>
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
  hint: {
    marginBottom: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
