import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
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
import { useRelayStore } from '@/store/relay-store';

export default function TaskArchiveScreen() {
  const router = useRouter() as any;
  const { state, deleteTask, updateTask } = useRelayStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const archivedTasks = useMemo(() => state.tasks.filter((task) => task.archived), [state.tasks]);

  const restoreAll = async () => {
    await Haptics.selectionAsync();
    archivedTasks.forEach((task) => updateTask(task.id, { archived: false, completed: false }));
  };

  const clearAll = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    archivedTasks.forEach((task) => deleteTask(task.id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Archive" subtitle={`${archivedTasks.length} completed tasks`} onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Completed" />
          {archivedTasks.length ? (
            archivedTasks.map((task) => (
              <View key={task.id} style={styles.rowWrap}>
                <ListRow
                  icon="checkmark-circle-outline"
                  label={task.title}
                  body={task.dueDate}
                  onPress={() => router.push(`/tasks/${task.id}`)}
                />
                <View style={styles.rowActions}>
                  <SecondaryButton
                    label="Restore"
                    onPress={() => updateTask(task.id, { archived: false, completed: false })}
                    style={styles.flex}
                  />
                  <SecondaryButton label="Delete" onPress={() => deleteTask(task.id)} style={styles.flex} />
                </View>
              </View>
            ))
          ) : (
            <EmptyState title="No archived tasks." body="Completed tasks will appear here." />
          )}
        </GlassCard>

        {archivedTasks.length ? (
          <GlassCard blur>
            <PrimaryButton label="Restore all" onPress={restoreAll} />
            <SecondaryButton label="Delete all permanently" onPress={clearAll} />
            <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />
            <Text style={styles.hint}>You can still edit restored tasks in Task Detail.</Text>
          </GlassCard>
        ) : null}
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
  rowActions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  hint: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
});
