import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { FinanceVoiceHint, FinancesShell, FinancesTalkSheet } from './components/FinancesShell';

export default function VoiceSummaryScreen() {
  const router = useRouter() as any;
  const [talkOpen, setTalkOpen] = useState(true);

  return (
    <FinancesShell title="Voice Summary" subtitle="Relay finance narration" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Relay says:</Text>
        <Text style={styles.body}>
          Your housing remained stable, food spend rose this week, and two subscriptions renew soon. Your remaining cushion is healthy if bills stay on schedule.
        </Text>
      </GlassCard>

      <View style={styles.row}>
        <BubbleChip icon="document-text-outline" label="Save" tone="neutral" onPress={() => router.push('/notes/create')} />
        <BubbleChip icon="checkbox-outline" label="Turn into task" tone="primary" onPress={() => router.push('/tasks/create')} />
        <BubbleChip icon="help-outline" label="Ask follow-up" tone="primary" onPress={() => setTalkOpen(true)} />
      </View>

      <PrimaryButton label="Back to summary" onPress={() => router.replace('/finances/summary')} />
      <SecondaryButton label="Back to finances" onPress={() => router.replace('/finances')} />

      <FinanceVoiceHint text="Try 'What should I fix first?'" onAsk={() => setTalkOpen(true)} />
      <FinancesTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </FinancesShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: ds.spacing.s8,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
