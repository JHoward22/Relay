import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

export default function FamilyHubScreen() {
  const router = useRouter() as any;
  const { state } = useRelayStore();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppHeader title="Family Hub" subtitle="Shared responsibilities and events" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Members" />
          {state.members.map((member) => (
            <View key={member.id} style={styles.rowWrap}>
              <ListRow
                icon={member.role.toLowerCase() === 'pet' ? 'paw-outline' : 'person-circle-outline'}
                label={member.name}
                body={member.role}
                onPress={() => router.push(`/settings/family/member/${member.id}`)}
              />
            </View>
          ))}
          <PrimaryButton label="Add member" onPress={() => router.push('/settings/family/add-member')} />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Assignments" rightLabel="History" onRightPress={() => router.push('/settings/family/assignments')} />
          <ListRow variant="compact" label="School pickup" body="Assigned to Michael · Today 4:30 PM" />
          <ListRow variant="compact" label="Vet check reminder" body="Assigned to Buddy · Monthly" />
          <ListRow variant="compact" label="Signed permission slip" body="Assigned to Amy · Friday" />
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
