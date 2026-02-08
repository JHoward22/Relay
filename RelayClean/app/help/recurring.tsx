import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function HelpRecurringScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Recurring Reminders" subtitle="Cadence and control" onBack={() => router.back()} />
        <GlassCard>
          <SectionHeader title="Best practices" />
          <ListRow variant="compact" label="Use clear cadence" body="Examples: daily, weekly, monthly." />
          <ListRow variant="compact" label="Assign for shared tasks" body="Family mode supports ownership and visibility." />
          <ListRow variant="compact" label="Pause anytime" body="Recurring detail lets you pause or delete safely." />
        </GlassCard>
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
