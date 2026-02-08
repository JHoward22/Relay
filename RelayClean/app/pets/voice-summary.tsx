import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsShell } from './components/PetsShell';

export default function PetsVoiceSummaryScreen() {
  const router = useRouter() as any;

  return (
    <PetsShell title="Relay Response" subtitle="Pet health summary" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.quote}>“Buddy is on track this week. Luna has one overdue vaccine and a follow-up suggestion.”</Text>
      </GlassCard>

      <GlassCard blur style={styles.actions}>
        <BubbleChip icon="save-outline" label="Save" tone="neutral" onPress={() => router.push('/notes/create')} />
        <BubbleChip icon="checkbox-outline" label="Turn into task" tone="primary" onPress={() => router.push('/tasks/create')} />
        <BubbleChip icon="calendar-outline" label="Turn into event" tone="primary" onPress={() => router.push('/calendar/create')} />
        <BubbleChip icon="share-outline" label="Share" tone="neutral" onPress={() => router.push('/help/contact')} />
      </GlassCard>

      <PrimaryButton label="Back to Pets" onPress={() => router.replace('/pets')} />
      <SecondaryButton label="Open pet health" onPress={() => router.replace('/pets')} />
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  quote: {
    fontFamily: ds.font,
    fontSize: 17,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
