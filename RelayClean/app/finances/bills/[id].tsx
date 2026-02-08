import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { billDueLabel, fmtCurrency, useFinancesStore } from '../finances-context';
import { FinanceVoiceHint, FinancesShell, FinancesTalkSheet } from '../components/FinancesShell';

export default function BillDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, markBillPaid, addReminderLink, deleteBill } = useFinancesStore();
  const [confirmPay, setConfirmPay] = useState(false);
  const [confirmReminder, setConfirmReminder] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [talkOpen, setTalkOpen] = useState(false);

  const bill = useMemo(() => state.bills.find((entry) => entry.id === id), [id, state.bills]);

  if (!bill) {
    return (
      <FinancesShell title="Bill" subtitle="Not found" onBack={() => router.back()}>
        <EmptyState title="Bill not found" body="This item may have been deleted." />
      </FinancesShell>
    );
  }

  return (
    <FinancesShell title={bill.name} subtitle={`${fmtCurrency(bill.amount)} · ${billDueLabel(bill)}`} onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.label}>Bill info</Text>
        <Text style={styles.body}>Due: {bill.dueDateISO}</Text>
        <Text style={styles.body}>Frequency: {bill.frequency}</Text>
        <Text style={styles.body}>Autopay: {bill.autopay ? 'On' : 'Off'}</Text>
        <Text style={styles.body}>Notes: {bill.notes || 'None'}</Text>
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.label}>Payment history</Text>
        <View style={styles.stack}>
          {bill.history.length ? (
            bill.history.map((entry) => (
              <ListRow
                key={entry.id}
                icon="time-outline"
                label={`${entry.dateISO}`}
                body={`${fmtCurrency(entry.amount)} · ${entry.status}`}
              />
            ))
          ) : (
            <Text style={styles.meta}>No history yet.</Text>
          )}
        </View>
      </GlassCard>

      <View style={styles.primaryActions}>
        <PrimaryButton label="Edit" onPress={() => router.push(`/finances/bills/edit/${bill.id}`)} style={styles.flex} />
        <SecondaryButton label="Mark paid" onPress={() => setConfirmPay(true)} style={styles.flex} />
      </View>

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.sheetActions}>
          <BubbleChip icon="repeat-outline" label="Recurring Reminder" tone="neutral" onPress={() => setConfirmReminder(true)} />
          <BubbleChip icon="mic-outline" label="Ask Relay" tone="neutral" onPress={() => setTalkOpen(true)} />
          <BubbleChip icon="trash-outline" label="Delete Bill" tone="danger" onPress={() => setConfirmDelete(true)} />
        </View>
      </GlassCard>

      <FinanceVoiceHint text="Try 'Remind me two days before this bill'" onAsk={() => setTalkOpen(true)} />

      <SheetModal visible={confirmPay} onClose={() => setConfirmPay(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Mark this bill as paid?</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="checkmark"
              label="Confirm"
              tone="success"
              onPress={() => {
                markBillPaid(bill.id);
                setConfirmPay(false);
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setConfirmPay(false)} />
          </View>
        </View>
      </SheetModal>

      <SheetModal visible={confirmReminder} onClose={() => setConfirmReminder(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Create recurring reminder?</Text>
          <Text style={styles.meta}>Relay will remind you 1 day before each due date.</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="checkmark"
              label="Create"
              tone="success"
              onPress={() => {
                addReminderLink({
                  sourceType: 'bill',
                  sourceId: bill.id,
                  remindAtISO: bill.dueDateISO,
                  leadTime: '1 day before',
                  enabled: true,
                });
                setConfirmReminder(false);
                router.push('/home/reminders/confirm');
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setConfirmReminder(false)} />
          </View>
        </View>
      </SheetModal>

      <SheetModal visible={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Delete this bill?</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="trash-outline"
              label="Delete"
              tone="danger"
              onPress={() => {
                deleteBill(bill.id);
                setConfirmDelete(false);
                router.replace('/finances/bills');
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setConfirmDelete(false)} />
          </View>
        </View>
      </SheetModal>

      <FinancesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
    marginBottom: ds.spacing.s8,
  },
  meta: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  stack: {
    gap: ds.spacing.s8,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  toolsTitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: ds.spacing.s8,
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
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
