import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function HelpContactScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Contact Support" subtitle="We’re here to help" onBack={() => router.back()} />
        <GlassCard>
          <SectionHeader title="Support channels" />
          <ListRow variant="compact" label="Email" body="support@relayapp.ai" />
          <ListRow variant="compact" label="Response time" body="Usually within 24 hours" />
          <ListRow variant="compact" label="Include in your message" body="App version, issue summary, and screenshots" />
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
