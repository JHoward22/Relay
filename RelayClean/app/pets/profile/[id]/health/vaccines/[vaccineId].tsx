import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsShell, PetsTalkSheet } from '../../../../components/PetsShell';
import { formatDateLong, usePetsStore } from '../../../../pets-context';

export default function VaccineDetailScreen() {
  const router = useRouter() as any;
  const { id, vaccineId } = useLocalSearchParams<{ id: string; vaccineId: string }>();
  const { state, markVaccineComplete } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const vaccine = useMemo(
    () => state.vaccines.find((item) => item.id === vaccineId && item.petId === id),
    [id, state.vaccines, vaccineId]
  );

  if (!vaccine) {
    return (
      <PetsShell title="Vaccine" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/health/vaccines`)}>
        <EmptyState title="Vaccine not found" body="Return to vaccine list." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title={vaccine.name} subtitle="Vaccination detail" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.status}>{vaccine.status.toUpperCase()}</Text>
        <Text style={styles.meta}>Due {formatDateLong(vaccine.dueISO)}</Text>
        <Text style={styles.meta}>Provider {vaccine.provider || 'Not set'}</Text>
        <Text style={styles.meta}>Completed {formatDateLong(vaccine.completedISO)}</Text>
      </GlassCard>

      {vaccine.notes ? (
        <GlassCard blur>
          <Text style={styles.note}>{vaccine.notes}</Text>
        </GlassCard>
      ) : null}

      <GlassCard blur style={styles.actions}>
        <BubbleChip icon="checkmark" label="Mark complete" tone="success" onPress={() => markVaccineComplete(vaccine.id)} />
        <BubbleChip icon="calendar-outline" label="Reschedule" tone="primary" onPress={() => router.push(`/pets/profile/${id}/health/vaccines/${vaccine.id}/edit`)} />
        <BubbleChip icon="mic" label="Ask Relay" tone="neutral" onPress={() => setTalkOpen(true)} />
      </GlassCard>

      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  status: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.primary,
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
  note: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
