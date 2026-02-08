import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { MealsShell } from '../components/MealsShell';

export default function PlanGeneratorSuccessScreen() {
  const router = useRouter() as any;

  return (
    <MealsShell title="Plan Added" subtitle="Your week is ready" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Week plan added</Text>
        <Text style={styles.body}>Relay created your meal schedule. You can adjust slots anytime.</Text>
      </GlassCard>

      <PrimaryButton label="View week" onPress={() => router.replace('/meals/weekly')} />
      <SecondaryButton label="Build grocery list" onPress={() => router.push('/meals/grocery')} />
      <SecondaryButton label="Done" onPress={() => router.replace('/meals')} />
    </MealsShell>
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
});
