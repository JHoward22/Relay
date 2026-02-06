import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function MemberDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state } = useRelayStore();

  const member = useMemo(() => state.members.find((item) => item.id === id), [id, state.members]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title={member?.name ?? 'Member'} subtitle={member?.role ?? 'Member detail'} onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Current assignments" />
          <ListRow variant="compact" label="School pickup support" body="Tuesday · 4:30 PM" />
          <ListRow variant="compact" label="Weekly household reset" body="Sunday · 10:00 AM" />
          {member?.role.toLowerCase() === 'pet' ? (
            <ListRow variant="compact" label="Monthly vet check reminder" body="Every 4 weeks" />
          ) : null}
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
