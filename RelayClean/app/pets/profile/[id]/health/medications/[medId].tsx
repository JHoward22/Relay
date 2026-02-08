import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { PetsShell, PetsTalkSheet } from '../../../../components/PetsShell';
import { formatDateLong, usePetsStore } from '../../../../pets-context';

export default function MedicationDetailScreen() {
  const router = useRouter() as any;
  const { id, medId } = useLocalSearchParams<{ id: string; medId: string }>();
  const { state, markMedicationGiven, addReminder } = usePetsStore();
  const [talkOpen, setTalkOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  const medication = useMemo(
    () => state.medications.find((item) => item.id === medId && item.petId === id),
    [id, medId, state.medications]
  );

  if (!medication) {
    return (
      <PetsShell title="Medication" subtitle="Not found" onBack={() => router.replace(`/pets/profile/${id}/health/medications`)}>
        <EmptyState title="Medication not found" body="Return to medication list." />
      </PetsShell>
    );
  }

  return (
    <PetsShell title={medication.name} subtitle="Medication detail" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.title}>{medication.dosage}</Text>
        <Text style={styles.meta}>{medication.schedule} · {medication.timeLabel}</Text>
        <Text style={styles.meta}>Next due {formatDateLong(medication.nextDueISO)}</Text>
        <Text style={styles.meta}>Last given {formatDateLong(medication.lastGivenISO)}</Text>
      </GlassCard>

      {medication.notes ? (
        <GlassCard blur>
          <Text style={styles.note}>{medication.notes}</Text>
        </GlassCard>
      ) : null}

      <GlassCard blur style={styles.actions}>
        <BubbleChip icon="checkmark" label="Mark given" tone="success" onPress={() => markMedicationGiven(medication.id)} />
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.push(`/pets/profile/${id}/health/medications/${medication.id}/edit`)} />
        <BubbleChip icon="alarm-outline" label="Set reminders" tone="neutral" onPress={() => setReminderOpen(true)} />
        <BubbleChip icon="mic" label="Ask Relay" tone="neutral" onPress={() => setTalkOpen(true)} />
      </GlassCard>

      <PetsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />

      <SheetModal visible={reminderOpen} onClose={() => setReminderOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Create reminder for this medication?</Text>
          <Text style={styles.sheetBody}>Relay will remind before the next dose.</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="checkmark"
              label="Create"
              tone="success"
              onPress={() => {
                addReminder({
                  petId: id,
                  entityType: 'medication',
                  entityId: medication.id,
                  title: `Give ${medication.name}`,
                  dueAtISO: medication.nextDueISO,
                  repeatRule: medication.schedule,
                });
                setReminderOpen(false);
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setReminderOpen(false)} />
          </View>
        </View>
      </SheetModal>
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
  note: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  sheetWrap: {
    gap: ds.spacing.s12,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetBody: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
