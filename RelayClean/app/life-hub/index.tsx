import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';

export default function LifeHubScreen() {
  const router = useRouter() as any;

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Life Hub" subtitle="Everything beyond tasks and calendar" onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Meals" />
          <ListRow variant="compact" icon="restaurant-outline" label="Weekly meal plan" body="3 dinners planned" />
          <ListRow variant="compact" icon="basket-outline" label="Grocery snapshot" body="8 essentials to buy" />
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Budget" />
          <ListRow variant="compact" icon="wallet-outline" label="This week spending" body="$286 tracked · On target" />
          <ListRow variant="compact" icon="receipt-outline" label="Bills due soon" body="Internet bill · Friday" />
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Documents & Contacts" />
          <ListRow variant="compact" icon="document-text-outline" label="Important docs" body="Insurance card, school forms" />
          <ListRow variant="compact" icon="people-circle-outline" label="Quick contacts" body="Pediatrician, vet, school office" />
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Pets & Locations" />
          <ListRow variant="compact" icon="paw-outline" label="Pet routines" body="Buddy grooming due next month" />
          <ListRow variant="compact" icon="location-outline" label="Saved places" body="Clinic, school, grocery store" />
        </GlassCard>

        <View style={styles.bottomSpacer} />
        <Text style={styles.hint}>Relay keeps these life details organized in one calm place.</Text>
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
  hint: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: ds.spacing.s8,
  },
});
