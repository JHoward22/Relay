import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { fmtCurrency, subscriptionRenewalLabel, useFinancesStore } from '../finances-context';
import { FinanceVoiceHint, FinancesShell, FinancesTalkSheet } from '../components/FinancesShell';

export default function SubscriptionDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, cancelSubscription, addReminderLink } = useFinancesStore();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmReminder, setConfirmReminder] = useState(false);
  const [talkOpen, setTalkOpen] = useState(false);

  const subscription = useMemo(() => state.subscriptions.find((entry) => entry.id === id), [id, state.subscriptions]);

  if (!subscription) {
    return (
      <FinancesShell title="Subscription" subtitle="Not found" onBack={() => router.back()}>
        <EmptyState title="Subscription not found" body="This item may have been removed." />
      </FinancesShell>
    );
  }

  return (
    <FinancesShell title={subscription.name} subtitle={subscriptionRenewalLabel(subscription)} onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.label}>Subscription details</Text>
        <Text style={styles.body}>Cost: {fmtCurrency(subscription.cost)} / {subscription.frequency}</Text>
        <Text style={styles.body}>Status: {subscription.status}</Text>
        <Text style={styles.body}>Usage signal: {subscription.usageFlag}</Text>
        <Text style={styles.body}>Notes: {subscription.notes || 'None'}</Text>
      </GlassCard>

      <PrimaryButton label="Edit" onPress={() => router.push(`/finances/subscriptions/edit/${subscription.id}`)} />
      <SecondaryButton label="Cancel (mock)" onPress={() => setConfirmCancel(true)} />
      <SecondaryButton label="Remind before renewal" onPress={() => setConfirmReminder(true)} />
      <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />

      <FinanceVoiceHint text="Try 'Remind me 2 days before this renewal'" onAsk={() => setTalkOpen(true)} />

      <SheetModal visible={confirmCancel} onClose={() => setConfirmCancel(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Cancel this subscription?</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="checkmark"
              label="Confirm"
              tone="danger"
              onPress={() => {
                cancelSubscription(subscription.id);
                setConfirmCancel(false);
                router.replace('/finances/subscriptions');
              }}
            />
            <BubbleChip icon="close" label="Keep" tone="neutral" onPress={() => setConfirmCancel(false)} />
          </View>
        </View>
      </SheetModal>

      <SheetModal visible={confirmReminder} onClose={() => setConfirmReminder(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Set reminder before renewal?</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="checkmark"
              label="Create"
              tone="success"
              onPress={() => {
                addReminderLink({
                  sourceType: 'subscription',
                  sourceId: subscription.id,
                  remindAtISO: subscription.renewDateISO,
                  leadTime: '2 days before',
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
