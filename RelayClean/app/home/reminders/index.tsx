import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { remindersData } from '../demo-data';

export default function RemindersHubScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ created?: string; action?: string; refresh?: string }>();
  const [talkOpen, setTalkOpen] = useState(false);

  const today = remindersData.filter((item) => item.group === 'today');
  const upcoming = remindersData.filter((item) => item.group === 'upcoming');
  const recurring = remindersData.filter((item) => item.group === 'recurring');
  const banner =
    params.action === 'done'
      ? 'Done. Relay cleared that reminder.'
      : params.action === 'snooze'
        ? 'Snoozed. Relay moved it to tomorrow.'
        : params.created
          ? 'Saved. Relay added your reminder.'
          : '';

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Reminders"
          subtitle="Today, upcoming, and recurring"
          onBack={() => router.back()}
          rightLabel="Create"
          onRightPress={() => router.push('/home/reminders/create')}
        />

        {banner ? <Text style={styles.banner}>{banner}</Text> : null}

        <GlassCard blur>
          <SectionHeader title="Today" />
          {today.length ? (
            today.map((item) => (
              <View key={item.id} style={styles.rowWrap}>
                <ListRow
                  icon="alarm-outline"
                  label={item.title}
                  body={`${item.dueLabel} · ${item.context}`}
                  onPress={() => router.push(`/home/reminders/${item.id}`)}
                />
              </View>
            ))
          ) : (
            <EmptyState title="No reminders today" body="Capture one with voice in a few seconds." />
          )}
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Upcoming" />
          {upcoming.map((item) => (
            <View key={item.id} style={styles.rowWrap}>
              <ListRow
                icon="time-outline"
                label={item.title}
                body={`${item.dueLabel} · ${item.context}`}
                onPress={() => router.push(`/home/reminders/${item.id}`)}
              />
            </View>
          ))}
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Recurring" />
          {recurring.map((item) => (
            <View key={item.id} style={styles.rowWrap}>
              <ListRow
                icon="repeat-outline"
                label={item.title}
                body={`${item.repeat ?? 'Recurring'} · ${item.context}`}
                onPress={() => router.push(`/home/reminders/${item.id}`)}
              />
            </View>
          ))}
        </GlassCard>

        <PrimaryButton label="Create reminder" onPress={() => router.push('/home/reminders/create')} />
        <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />
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
  banner: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(157, 209, 177, 0.9)',
    backgroundColor: 'rgba(229, 248, 236, 0.9)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.success,
    fontWeight: '600',
  },
});
