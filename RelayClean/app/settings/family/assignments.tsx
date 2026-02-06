import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function AssignmentHistoryScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Assignment History" subtitle="Recent family coordination" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="This week" />
          <ListRow variant="compact" label="Michael completed school pickup" body="Today · 4:45 PM" />
          <ListRow variant="compact" label="Amy submitted signed form" body="Yesterday · 7:10 PM" />
          <ListRow variant="compact" label="Buddy grooming reminder acknowledged" body="Monday · 9:00 AM" />
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
});
