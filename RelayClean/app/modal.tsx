import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function HelpCenterScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Help Center" subtitle="Support and guidance" onBack={() => router.back()} />

        <GlassCard>
          <SectionHeader title="Popular topics" />
          <ListRow label="Using Talk to Relay" body="Voice and typing workflows" onPress={() => router.push('/help/talk')} />
          <ListRow label="Managing recurring reminders" body="Cadence and follow-up controls" onPress={() => router.push('/help/recurring')} />
          <ListRow label="Privacy and data controls" body="How Relay learns and what it cannot access" onPress={() => router.push('/trust')} />
        </GlassCard>

        <GlassCard>
          <SectionHeader title="Need more help?" />
          <ListRow label="Contact support" body="support@relayapp.ai" onPress={() => router.push('/help/contact')} />
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
