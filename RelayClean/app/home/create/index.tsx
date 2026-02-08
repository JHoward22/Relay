import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function HomeCreateIndexScreen() {
  const router = useRouter() as any;
  const { state } = useRelayStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Create" subtitle="Choose what Relay should add" onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Core actions" />

          <View style={styles.rowWrap}>
            <ListRow
              icon="checkmark-done-outline"
              label="Task"
              body="Add to Tasks"
              onPress={() => router.push('/tasks/create')}
            />
          </View>
          <View style={styles.rowWrap}>
            <ListRow
              icon="alarm-outline"
              label="Reminder"
              body="Set timing for follow-through"
              onPress={() => router.push('/home/reminders/create')}
            />
          </View>
          <View style={styles.rowWrap}>
            <ListRow
              icon="calendar-outline"
              label="Event"
              body="Add to Calendar"
              onPress={() => router.push('/calendar/create')}
            />
          </View>
          <ListRow
            icon="mail-outline"
            label="Follow-up Message"
            body="Track waiting responses"
            onPress={() => router.push('/home/follow-ups')}
          />
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Life domains" />

          <View style={styles.rowWrap}>
            <ListRow
              icon="restaurant-outline"
              label="Meal Plan"
              body="Add a meal to this week"
              onPress={() => router.push('/meals/add-recipe')}
            />
          </View>
          <View style={styles.rowWrap}>
            <ListRow
              icon="wallet-outline"
              label="Bill Reminder"
              body="Track due amount and date"
              onPress={() => router.push('/finances/add')}
            />
          </View>
          <View style={styles.rowWrap}>
            <ListRow
              icon="paw-outline"
              label="Pet Reminder"
              body="Routine or medication follow-through"
              onPress={() => router.push('/pets')}
            />
          </View>
          <ListRow
            icon="document-text-outline"
            label="Note"
            body="Save a quick summary or reference"
            onPress={() => router.push('/notes/create')}
          />
        </GlassCard>

        {state.familyModeEnabled ? (
          <GlassCard blur>
            <SectionHeader title="Family" />
            <ListRow
              icon="megaphone-outline"
              label="Family Announcement"
              body="Post a shared update"
              onPress={() => router.push('/family/voice-summary')}
            />
          </GlassCard>
        ) : null}

        <GlassCard blur>
          <SectionHeader title="Need a full view?" />
          <ListRow
            icon="home-outline"
            label="Open Home command center"
            body="Return to dashboard"
            onPress={() => router.replace('/')}
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
