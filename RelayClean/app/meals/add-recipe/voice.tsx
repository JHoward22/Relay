import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { MealsShell, MealsTalkSheet } from '../components/MealsShell';

export default function VoiceRecipeCaptureScreen() {
  const router = useRouter() as any;
  const [talkOpen, setTalkOpen] = useState(true);

  return (
    <MealsShell title="Voice Capture" subtitle="Describe recipe naturally" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>Voice-first recipe capture</Text>
        <Text style={styles.body}>Relay will extract ingredients, steps, and tags from your transcript before saving.</Text>
        <View style={styles.row}>
          <BubbleChip icon="mic" label="Start listening" tone="primary" onPress={() => setTalkOpen(true)} />
          <BubbleChip icon="checkmark" label="Review text" tone="neutral" onPress={() => router.push('/meals/add-recipe/manual')} />
        </View>
      </GlassCard>

      <PrimaryButton label="Back to add options" onPress={() => router.replace('/meals/add-recipe')} />
      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: ds.spacing.s12 },
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
