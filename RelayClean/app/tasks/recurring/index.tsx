import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function RecurringListScreen() {
  const router = useRouter() as any;
  const { state } = useRelayStore();
  const recurring = useMemo(() => state.tasks.filter((task) => task.recurring), [state.tasks]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Recurring" subtitle="Schedules Relay helps maintain" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Recurring tasks" />
          {recurring.length ? (
            recurring.map((task) => (
              <View key={task.id} style={styles.rowWrap}>
                <ListRow
                  icon="repeat-outline"
                  label={task.title}
                  body={`Next: ${task.dueDate} · ${task.cadence ?? 'Weekly'}`}
                  onPress={() => router.push(`/tasks/recurring/${task.id}`)}
                />
              </View>
            ))
          ) : (
            <EmptyState title="No recurring tasks yet." body="Create one from Tasks or Talk to Relay." />
          )}
        </GlassCard>
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
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
});
