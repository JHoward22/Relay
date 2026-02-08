import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { MealsShell, VoiceHintRow, MealsTalkSheet } from '../components/MealsShell';
import { BudgetLevel, DietTag, PlanPreferences, useMealsStore } from '../meals-context';

export default function PlanPreferencesScreen() {
  const router = useRouter() as any;
  const { state: relayState } = useRelayStore();
  const { generatePlanDraft } = useMealsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const [prefs, setPrefs] = useState<PlanPreferences>({
    mealsPerDay: 1,
    daysToPlan: 7,
    dietPreference: 'balanced',
    budgetLevel: 'medium',
    maxCookMinutes: 35,
    familySize: relayState.familyModeEnabled ? 3 : 1,
  });

  return (
    <MealsShell title="Plan Preferences" subtitle="Tune your generated week" onBack={() => router.back()}>
      <FormField
        label="Meals per day"
        value={String(prefs.mealsPerDay)}
        onChangeText={(value) => setPrefs((prev) => ({ ...prev, mealsPerDay: Number(value) || 1 }))}
        keyboardType="number-pad"
      />
      <FormField
        label="Days to plan"
        value={String(prefs.daysToPlan)}
        onChangeText={(value) => setPrefs((prev) => ({ ...prev, daysToPlan: Number(value) || 7 }))}
        keyboardType="number-pad"
      />
      <FormField
        label="Max cooking minutes"
        value={String(prefs.maxCookMinutes)}
        onChangeText={(value) => setPrefs((prev) => ({ ...prev, maxCookMinutes: Number(value) || 30 }))}
        keyboardType="number-pad"
      />

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Diet preference</Text>
        <View style={styles.row}>
          {(['balanced', 'high-protein', 'vegetarian', 'quick'] as DietTag[]).map((tag) => (
            <BubbleChip
              key={tag}
              icon="nutrition-outline"
              label={tag}
              tone={prefs.dietPreference === tag ? 'primary' : 'neutral'}
              onPress={() => setPrefs((prev) => ({ ...prev, dietPreference: tag }))}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text style={styles.groupLabel}>Budget level</Text>
        <View style={styles.row}>
          {(['low', 'medium', 'flex'] as BudgetLevel[]).map((budget) => (
            <BubbleChip
              key={budget}
              icon="wallet-outline"
              label={budget}
              tone={prefs.budgetLevel === budget ? 'primary' : 'neutral'}
              onPress={() => setPrefs((prev) => ({ ...prev, budgetLevel: budget }))}
            />
          ))}
        </View>
      </View>

      {relayState.familyModeEnabled ? (
        <FormField
          label="Family size"
          value={String(prefs.familySize)}
          onChangeText={(value) => setPrefs((prev) => ({ ...prev, familySize: Number(value) || 1 }))}
          keyboardType="number-pad"
        />
      ) : null}

      <PrimaryButton
        label="Generate"
        onPress={() => {
          generatePlanDraft(prefs);
          router.push('/meals/plan-generator/preview');
        }}
      />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />

      <VoiceHintRow label="Say 'Generate a quick low-budget week'" onAsk={() => setTalkOpen(true)} />
      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: ds.spacing.s8,
  },
  groupLabel: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
