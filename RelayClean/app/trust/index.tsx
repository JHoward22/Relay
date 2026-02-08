import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

const GUARDRAILS = [
  'Relay only acts on what you add in the app.',
  'Relay does not read messages, emails, or data without permission.',
  'You can edit or delete anything.',
  'You can opt out of smart suggestions at any time.',
];

export default function TrustScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="How Relay uses AI"
          subtitle="Clear boundaries in plain language."
          onBack={() => router.back()}
        />

        <GlassCard blur>
          <SectionHeader title="Your control" />
          {GUARDRAILS.map((line) => (
            <ListRow key={line} icon="shield-checkmark-outline" label={line} variant="compact" />
          ))}
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
});
