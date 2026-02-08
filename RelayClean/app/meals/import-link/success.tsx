import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { MealsShell } from '../components/MealsShell';

export default function SavedRecipeSuccessScreen() {
  const router = useRouter() as any;

  return (
    <MealsShell title="Saved" subtitle="Recipe added to your book" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Saved to Recipe Book</Text>
        <Text style={styles.body}>Relay kept ingredients and tags so you can plan this in one tap.</Text>
      </GlassCard>

      <PrimaryButton label="Plan it for a day" onPress={() => router.push('/meals/weekly')} />
      <SecondaryButton label="Add ingredients to grocery list" onPress={() => router.push('/meals/grocery')} />
      <SecondaryButton label="Done" onPress={() => router.replace('/meals')} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: ds.spacing.s8 },
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
