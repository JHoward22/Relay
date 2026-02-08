import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function ProCheckoutScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Upgrade to Relay Pro" subtitle="Preview checkout experience" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Plan summary" />
          <ListRow variant="compact" label="Relay Pro" rightText="$8 / month" />
          <ListRow variant="compact" label="Billing" rightText="Monthly" />
          <ListRow variant="compact" label="Trial" rightText="7 days" />
        </GlassCard>

        <PrimaryButton label="Confirm Upgrade (Demo)" onPress={() => router.replace('/pro')} />
        <SecondaryButton label="Not now" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ds.colors.bg },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
});
