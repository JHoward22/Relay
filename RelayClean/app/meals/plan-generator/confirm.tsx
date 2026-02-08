import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { MealsShell } from '../components/MealsShell';
import { useMealsStore } from '../meals-context';

export default function PlanConfirmationScreen() {
  const router = useRouter() as any;
  const { state, acceptPlanDraft, clearPlanDraft } = useMealsStore();
  const draft = state.generatedDraft;

  return (
    <MealsShell title="Confirm Plan" subtitle="Nothing is saved until you confirm" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.text}>Relay will create:</Text>
        <Text style={styles.text}>• {draft?.days.length ?? 0} days of meal plans</Text>
        <Text style={styles.text}>• {draft?.slots.length ?? 0} meal slots</Text>
        <Text style={styles.text}>• Preferences: {draft?.preferences.dietPreference ?? 'balanced'}</Text>
      </GlassCard>

      <View style={styles.row}>
        <BubbleChip
          icon="checkmark"
          label="Confirm"
          tone="success"
          onPress={() => {
            acceptPlanDraft();
            router.replace('/meals/plan-generator/success');
          }}
        />
        <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => router.back()} />
        <BubbleChip
          icon="close"
          label="Cancel"
          tone="neutral"
          onPress={() => {
            clearPlanDraft();
            router.replace('/meals');
          }}
        />
      </View>
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: ds.spacing.s8 },
  text: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    flexWrap: 'wrap',
  },
});
