import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { FamilyShell } from './components/FamilyShell';
import { useFamilyStore } from './family-context';

export default function FamilyVoiceSummaryScreen() {
  const router = useRouter() as any;
  const { addTask, addEvent, state } = useFamilyStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const member = state.members[0];

  return (
    <FamilyShell title="Ask Relay" subtitle="Shared household voice actions" onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.label}>Listening transcript</Text>
        <Text style={styles.transcript}>
          “Assign dishes to Alex tonight and add school pickup at 4:30 PM tomorrow.”
        </Text>
        <Text style={styles.status}>Relay is organizing your family plan…</Text>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.label}>Relay understood</Text>
        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>Dishes after dinner</Text>
          <Text style={styles.itemMeta}>Task • Tonight • Assigned to {member?.name ?? 'Alex'}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemTitle}>School pickup</Text>
          <Text style={styles.itemMeta}>Event • Tomorrow • 4:30 PM</Text>
        </View>
        <View style={styles.actions}>
          <BubbleChip icon="checkmark" label="Confirm" tone="success" onPress={() => setConfirmOpen(true)} />
          <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.push('/family/tasks/create')} />
          <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => router.back()} />
        </View>
      </GlassCard>

      <SheetModal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Apply Relay actions?</Text>
          <Text style={styles.sheetBody}>Relay will create one shared task and one family event.</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="checkmark"
              label="Add"
              tone="success"
              onPress={() => {
                addTask({
                  title: 'Dishes after dinner',
                  assignedMemberIds: [member?.id ?? state.members[0]?.id ?? 'fm-1'],
                  dueDateISO: new Date().toISOString().slice(0, 10),
                  createdByMemberId: member?.id ?? state.members[0]?.id ?? 'fm-1',
                });
                addEvent({
                  title: 'School pickup',
                  dateISO: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                  timeLabel: '4:30 PM',
                  affectedMemberIds: [member?.id ?? state.members[0]?.id ?? 'fm-1'],
                  type: 'event',
                });
                setConfirmOpen(false);
                router.replace('/family');
              }}
            />
            <BubbleChip icon="close" label="Back" tone="neutral" onPress={() => setConfirmOpen(false)} />
          </View>
        </View>
      </SheetModal>
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.primary,
    fontWeight: '700',
    marginBottom: ds.spacing.s4,
  },
  transcript: {
    fontFamily: ds.font,
    fontSize: 22,
    lineHeight: 30,
    color: ds.colors.text,
    fontWeight: '700',
  },
  status: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  itemRow: {
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
    marginTop: ds.spacing.s8,
  },
  itemTitle: {
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  itemMeta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    marginTop: ds.spacing.s12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  sheetContent: {
    paddingHorizontal: ds.spacing.s16,
    paddingVertical: ds.spacing.s16,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: 20,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetBody: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  sheetActions: {
    marginTop: ds.spacing.s16,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
});
