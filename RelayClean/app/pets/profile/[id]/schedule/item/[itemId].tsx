import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsShell } from '../../../../components/PetsShell';
import { usePetsStore } from '../../../../pets-context';

export default function ScheduleItemDetailScreen() {
  const router = useRouter() as any;
  const { id, itemId } = useLocalSearchParams<{ id: string; itemId: string }>();
  const { getScheduleForPet } = usePetsStore();

  const item = useMemo(() => getScheduleForPet(id).find((entry) => entry.id === itemId), [getScheduleForPet, id, itemId]);

  if (!item) {
    return (
      <PetsShell title="Schedule Item" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/schedule`)}>
        <EmptyState title="Schedule item missing" body="Return to schedule list." />
      </PetsShell>
    );
  }

  const editRoute =
    item.kind === 'feeding'
      ? `/pets/profile/${id}/feeding/${item.id.replace('feeding-', '')}/edit`
      : item.kind === 'walk'
        ? `/pets/profile/${id}/walks/${item.id.replace('walk-', '')}/edit`
        : item.kind === 'medication'
          ? `/pets/profile/${id}/health/medications/${item.id.replace('medication-', '')}`
          : item.kind === 'vaccine'
            ? `/pets/profile/${id}/health/vaccines/${item.id.replace('vaccine-', '')}`
            : `/pets/profile/${id}/vet-visits/${item.id.replace('vet-visit-', '')}`;

  return (
    <PetsShell title={item.title} subtitle="Schedule detail" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>{item.whenLabel}</Text>
        <Text style={styles.meta}>Status: {item.statusLabel}</Text>
      </GlassCard>

      <GlassCard blur style={styles.actions}>
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.push(editRoute)} />
        <BubbleChip icon="checkmark" label="Done" tone="success" onPress={() => router.push(editRoute)} />
        <BubbleChip icon="arrow-undo-outline" label="Back to schedule" tone="neutral" onPress={() => router.replace(`/pets/profile/${id}/schedule`)} />
      </GlassCard>
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  meta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
