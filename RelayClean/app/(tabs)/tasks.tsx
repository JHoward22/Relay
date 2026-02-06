import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ProFeatureModal } from '@/components/pro-feature-modal';
import { AppHeader } from '@/components/relay/AppHeader';
import { BottomMicBar } from '@/components/relay/BottomMicBar';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionTitle } from '@/components/relay/SectionTitle';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { TaskListRow } from '@/components/relay/TaskListRow';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

function isToday(dueDate: string) {
  return dueDate.toLowerCase().includes('today');
}

export default function TasksScreen() {
  const router = useRouter() as any;
  const { state, toggleTask, markInboxDone, snoozeInbox } = useRelayStore();
  const [proModalOpen, setProModalOpen] = useState(false);
  const [relayOpen, setRelayOpen] = useState(false);

  const today = useMemo(() => state.tasks.filter((task) => isToday(task.dueDate)), [state.tasks]);
  const upcoming = useMemo(
    () => state.tasks.filter((task) => !isToday(task.dueDate) && !task.recurring),
    [state.tasks]
  );
  const recurring = useMemo(() => state.tasks.filter((task) => task.recurring), [state.tasks]);
  const firstOpen = useMemo(() => state.inbox.find((item) => !item.done), [state.inbox]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.paperMargin} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Tasks"
          subtitle="Today and upcoming"
          rightLabel="Add"
          onRightPress={() => router.push('/tasks/create')}
        />

        <GlassCard>
          <SectionTitle title="Today" />
          {today.length ? (
            today.map((task, index) => (
              <Animated.View key={task.id} entering={FadeInDown.delay(index * 32).duration(180)}>
                <TaskListRow
                  title={task.title}
                  dueDate={task.dueDate}
                  completed={task.completed}
                  onPress={() => router.push(`/tasks/${task.id}`)}
                  onToggle={() => toggleTask(task.id)}
                />
              </Animated.View>
            ))
          ) : (
            <EmptyState title="Nothing due today." body="Use Talk to Relay to capture something quickly." />
          )}
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Upcoming" />
          {upcoming.length ? (
            upcoming.map((task) => (
              <TaskListRow
                key={task.id}
                title={task.title}
                dueDate={task.dueDate}
                completed={task.completed}
                onPress={() => router.push(`/tasks/${task.id}`)}
                onToggle={() => toggleTask(task.id)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming tasks.</Text>
          )}
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Recurring" rightLabel="View all" onRightPress={() => router.push('/tasks/recurring')} />
          {recurring.map((task) => (
            <View key={task.id} style={styles.rowWrap}>
              <ListRow
                icon="repeat-outline"
                label={task.title}
                body={task.cadence ?? 'Weekly'}
                badge="Pro feature"
                onPress={() => router.push(`/tasks/recurring/${task.id}`)}
                trailing={
                  <Pressable onPress={() => setProModalOpen(true)}>
                    <Text style={styles.badgeAction}>Unlock</Text>
                  </Pressable>
                }
              />
            </View>
          ))}
          {!recurring.length ? <Text style={styles.emptyText}>No recurring tasks yet.</Text> : null}
        </GlassCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomMicBar
        onMicPress={() => setRelayOpen(true)}
        onDone={() => {
          if (firstOpen) markInboxDone(firstOpen.id);
        }}
        onLater={() => {
          if (firstOpen) snoozeInbox(firstOpen.id);
        }}
        onViewAll={() => router.push('/home/inbox')}
      />

      <ProFeatureModal
        visible={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onSeePro={() => {
          setProModalOpen(false);
          router.push('/pro');
        }}
      />
      <TalkToRelaySheet visible={relayOpen} onClose={() => setRelayOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  paperMargin: {
    position: 'absolute',
    left: 24,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#E4EAF5',
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: 220,
    gap: ds.spacing.s12,
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  badgeAction: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    fontWeight: '600',
    color: ds.colors.primary,
  },
  emptyText: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: ds.spacing.s16,
  },
});
