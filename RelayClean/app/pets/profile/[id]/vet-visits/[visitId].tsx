import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsShell, PetsTalkSheet } from '../../../components/PetsShell';
import { formatDateLong, usePetsStore } from '../../../pets-context';

export default function VetVisitDetailScreen() {
  const router = useRouter() as any;
  const { id, visitId } = useLocalSearchParams<{ id: string; visitId: string }>();
  const { state, completeVetVisit } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const visit = useMemo(
    () => state.vetVisits.find((item) => item.id === visitId && item.petId === id),
    [id, state.vetVisits, visitId]
  );

  if (!visit) {
    return (
      <PetsShell title="Vet Visit" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/vet-visits`)}>
        <EmptyState title="Visit not found" body="Return to vet visits list." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title={visit.reason} subtitle="Vet visit detail" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.meta}>Clinic: {visit.clinicName}</Text>
        <Text style={styles.meta}>Date: {formatDateLong(visit.dateISO)} · {visit.timeLabel}</Text>
        <Text style={styles.meta}>Status: {visit.status}</Text>
        <Text style={styles.meta}>Follow-up: {formatDateLong(visit.followUpDateISO)}</Text>
      </GlassCard>

      {visit.notes ? (
        <GlassCard blur>
          <Text style={styles.notes}>{visit.notes}</Text>
        </GlassCard>
      ) : null}

      <GlassCard blur style={styles.actions}>
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.push(`/pets/profile/${id}/vet-visits/${visit.id}/edit`)} />
        <BubbleChip icon="checkmark" label="Mark complete" tone="success" onPress={() => completeVetVisit(visit.id)} />
        <BubbleChip icon="mic" label="Ask Relay" tone="neutral" onPress={() => setTalkOpen(true)} />
      </GlassCard>

      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  meta: {
    marginBottom: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '500',
  },
  notes: {
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
