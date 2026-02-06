import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionTitle } from '@/components/relay/SectionTitle';
import { ds } from '@/constants/design-system';

export default function ExploreScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Insights" subtitle="Relay activity and suggestions" />

        <GlassCard>
          <SectionTitle title="This week" />
          <ListRow icon="sparkles-outline" label="4 tasks completed on time" variant="compact" />
          <ListRow icon="time-outline" label="2 follow-ups still waiting" variant="compact" />
          <ListRow icon="calendar-outline" label="1 event needs preparation today" variant="compact" />
        </GlassCard>

        <GlassCard blur>
          <SectionTitle title="Suggested actions" />
          <ListRow
            icon="add-circle-outline"
            label="Create a recurring reminder"
            body="Monthly dentist checkup"
            onPress={() => router.push('/tasks/create')}
          />
          <View style={styles.rowGap} />
          <ListRow
            icon="people-outline"
            label="Review family assignments"
            body="3 shared tasks this week"
            onPress={() => router.push('/settings/family')}
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
  rowGap: {
    height: ds.spacing.s8,
  },
});
