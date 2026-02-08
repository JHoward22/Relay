import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from '../components/MealsShell';
import { fallbackGroupForInput, useMealsStore } from '../meals-context';

export default function ManualRecipeEntryScreen() {
  const router = useRouter() as any;
  const { createRecipe } = useMealsStore();

  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [tags, setTags] = useState('quick,balanced');
  const [talkOpen, setTalkOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const submit = () => {
    const sourceId = `manual-${Date.now()}`;
    const ingredientRows = ingredients
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => ({
        id: `ing-manual-${idx}`,
        name: line,
        quantity: '1',
        group: fallbackGroupForInput(line),
      }));

    createRecipe({
      title: title.trim() || 'Untitled Recipe',
      imageUri: undefined,
      sourceId,
      sourceLabel: 'Manual',
      prepMinutes: 15,
      cookMinutes: 25,
      servings: 4,
      tags: tags
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
      ingredients: ingredientRows,
      steps: steps
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      notes: '',
      isFavorite: false,
      collections: ['Quick meals'],
      sourceUrl: undefined,
    });

    setConfirmOpen(false);
    router.replace('/meals/recipe-book');
  };

  return (
    <MealsShell title="Manual Recipe" subtitle="Add details once, reuse forever" onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} placeholder="Turkey taco bowls" />
      <FormField
        label="Ingredients (one per line)"
        value={ingredients}
        onChangeText={setIngredients}
        placeholder="Ground turkey\nRice\nBlack beans"
        multiline
      />
      <FormField
        label="Steps (one per line)"
        value={steps}
        onChangeText={setSteps}
        placeholder="Cook rice\nBrown turkey\nAssemble bowls"
        multiline
      />
      <FormField label="Tags (comma separated)" value={tags} onChangeText={setTags} />

      <PrimaryButton label="Review & save" onPress={() => setConfirmOpen(true)} />
      <SecondaryButton label="Cancel" onPress={() => router.back()} />

      <VoiceHintRow label="Say 'Add this recipe and save to favorites'" onAsk={() => setTalkOpen(true)} />

      <SheetModal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Save recipe?</Text>
          <Text style={styles.sheetBody}>{title || 'Untitled recipe'} will be added to your recipe book.</Text>
          <View style={styles.actions}>
            <BubbleChip icon="checkmark" label="Confirm" tone="success" onPress={submit} />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setConfirmOpen(false)} />
          </View>
        </View>
      </SheetModal>

      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  sheetWrap: {
    gap: ds.spacing.s12,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetBody: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    flexWrap: 'wrap',
  },
});
