import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function HomeCreateIndexScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Create" subtitle="Choose what Relay should add" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Add to Relay" />

          <View style={styles.rowWrap}>
            <ListRow
              icon="checkmark-done-outline"
              label="Task"
              body="Add to Tasks"
              onPress={() => router.push('/home/create/task')}
            />
          </View>
          <View style={styles.rowWrap}>
            <ListRow
              icon="alarm-outline"
              label="Reminder"
              body="Set timing for follow-through"
              onPress={() => router.push('/home/create/reminder')}
            />
          </View>
          <View style={styles.rowWrap}>
            <ListRow
              icon="calendar-outline"
              label="Event"
              body="Add to Calendar"
              onPress={() => router.push('/home/create/event')}
            />
          </View>
          <ListRow
            icon="mail-outline"
            label="Follow-up Message"
            body="Track waiting responses"
            onPress={() => router.push('/home/create/message')}
          />
        </GlassCard>
      </ScrollView>
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
});
