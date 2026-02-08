import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { ds } from '@/constants/design-system';
import { MealsShell } from '../components/MealsShell';
import { getSlotLabel, useMealsStore } from '../meals-context';

export default function PlanGeneratedPreviewScreen() {
  const router = useRouter() as any;
  const { scope, day } = useLocalSearchParams<{ scope?: string; day?: string }>();
  const { state, generatePlanDraft } = useMealsStore();

  const draft = state.generatedDraft;

  return (
    <MealsShell title="Generated Plan" subtitle="Review Relay proposal" onBack={() => router.back()}>
      {!draft ? (
        <EmptyState title="No generated plan" body="Start from preferences to generate a plan." />
      ) : (
        <View style={styles.stack}>
          {draft.days
            .filter((entry) => (scope === 'day' && day ? entry.dateISO === day : true))
            .map((entry) => {
              const slots = draft.slots.filter((slot) => slot.dayISO === entry.dateISO);
              return (
                <View key={entry.id} style={styles.dayCard}>
                  <Text style={styles.dayTitle}>{new Date(`${entry.dateISO}T00:00:00`).toDateString()}</Text>
                  <View style={styles.slotList}>
                    {slots.map((slot) => {
                      const recipe = state.recipes.find((recipe) => recipe.id === slot.recipeId);
                      return (
                        <ListRow
                          key={slot.id}
                          icon="restaurant-outline"
                          label={`${getSlotLabel(slot.slotType)} · ${recipe?.title || 'Custom meal'}`}
                          body={`${slot.servings} servings`}
                        />
                      );
                    })}
                  </View>
                </View>
              );
            })}
        </View>
      )}

      <PrimaryButton label="Accept plan" onPress={() => router.push('/meals/plan-generator/confirm')} />
      <SecondaryButton label="Edit plan" onPress={() => router.push('/meals/weekly')} />
      <SecondaryButton
        label="Regenerate"
        onPress={() => {
          const prefs = draft?.preferences;
          if (!prefs) return;
          generatePlanDraft(prefs);
        }}
      />
      <View style={styles.row}>
        <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => router.replace('/meals')} />
      </View>
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: ds.spacing.s8,
  },
  dayCard: {
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    padding: ds.spacing.s12,
    gap: ds.spacing.s8,
  },
  dayTitle: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  slotList: {
    gap: ds.spacing.s8,
  },
  row: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
});
