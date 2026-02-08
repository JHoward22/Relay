import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from '../components/MealsShell';

export default function AddRecipeScreen() {
  const router = useRouter() as any;
  const [talkOpen, setTalkOpen] = useState(false);

  return (
    <MealsShell title="Add Recipe" subtitle="Choose how to capture this recipe" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Capture options</Text>
        <Text style={styles.body}>Relay can structure recipe details automatically after you confirm.</Text>
      </GlassCard>

      <PrimaryButton label="Manual recipe entry" onPress={() => router.push('/meals/add-recipe/manual')} />
      <SecondaryButton label="Import from link" onPress={() => router.push('/meals/import-link')} />
      <SecondaryButton label="Save from voice" onPress={() => router.push('/meals/add-recipe/voice')} />
      <SecondaryButton label="Upload photo" onPress={() => router.push('/meals/add-recipe/upload')} />

      <VoiceHintRow
        label="Say 'Save this as my weeknight pasta recipe'"
        onAsk={() => setTalkOpen(true)}
      />

      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
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
