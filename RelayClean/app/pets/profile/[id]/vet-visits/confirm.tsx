import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { PetsShell } from '../../../components/PetsShell';
import { usePetsStore } from '../../../pets-context';

export default function VetVisitConfirmScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{
    id: string;
    clinicName?: string;
    reason?: string;
    dateISO?: string;
    timeLabel?: string;
    notes?: string;
  }>();
  const { addVetVisit, addReminder } = usePetsStore();

  const petId = params.id;

  return (
    <PetsShell title="Confirm Vet Visit" subtitle="Relay understood this" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.row}><Text style={styles.label}>Clinic:</Text> {params.clinicName}</Text>
        <Text style={styles.row}><Text style={styles.label}>Reason:</Text> {params.reason}</Text>
        <Text style={styles.row}><Text style={styles.label}>Date:</Text> {params.dateISO}</Text>
        <Text style={styles.row}><Text style={styles.label}>Time:</Text> {params.timeLabel}</Text>
      </GlassCard>

      <View style={styles.actions}>
        <BubbleChip
          icon="checkmark"
          label="Confirm"
          tone="success"
          onPress={() => {
            const visitId = addVetVisit({
              petId,
              clinicName: params.clinicName || 'Vet Clinic',
              reason: params.reason || 'Checkup',
              dateISO: params.dateISO || new Date().toISOString().slice(0, 10),
              timeLabel: params.timeLabel || '10:00 AM',
              notes: params.notes || undefined,
            });

            addReminder({
              petId,
              entityType: 'vet-visit',
              entityId: visitId,
              title: `Vet visit: ${params.reason || 'Checkup'}`,
              dueAtISO: params.dateISO || new Date().toISOString().slice(0, 10),
              repeatRule: undefined,
            });

            router.replace(`/pets/profile/${petId}/vet-visits/${visitId}`);
          }}
        />
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.back()} />
        <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => router.replace(`/pets/profile/${petId}/vet-visits`)} />
      </View>
    </PetsShell>
  );
}

const styles = StyleSheet.create({
  row: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '500',
    marginBottom: ds.spacing.s8,
  },
  label: {
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
