import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { MealsShell } from '../../components/MealsShell';
import { fallbackGroupForInput, useMealsStore } from '../../meals-context';

export default function EditRecipeScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, updateRecipe, deleteRecipe } = useMealsStore();

  const recipe = useMemo(() => state.recipes.find((entry) => entry.id === id), [id, state.recipes]);

  const [title, setTitle] = useState(recipe?.title || '');
  const [ingredients, setIngredients] = useState(
    recipe?.ingredients.map((ingredient) => `${ingredient.name} (${ingredient.quantity})`).join('\n') || ''
  );
  const [steps, setSteps] = useState(recipe?.steps.join('\n') || '');
  const [notes, setNotes] = useState(recipe?.notes || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!recipe) {
    return (
      <MealsShell title="Edit recipe" subtitle="Not found" onBack={() => router.back()}>
        <EmptyState title="Recipe not found" body="This recipe may have already been removed." />
      </MealsShell>
    );
  }

  return (
    <MealsShell title="Edit Recipe" subtitle={recipe.title} onBack={() => router.back()}>
      <FormField label="Title" value={title} onChangeText={setTitle} />
      <FormField label="Ingredients" value={ingredients} onChangeText={setIngredients} multiline />
      <FormField label="Steps" value={steps} onChangeText={setSteps} multiline />
      <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />

      <PrimaryButton
        label="Save changes"
        onPress={() => {
          updateRecipe(recipe.id, {
            title: title.trim() || recipe.title,
            ingredients: ingredients
              .split('\n')
              .map((line, idx) => line.trim())
              .filter(Boolean)
              .map((line, idx) => ({
                id: `${recipe.id}-i-${idx}`,
                name: line.replace(/\s*\([^)]*\)\s*$/, ''),
                quantity: (line.match(/\(([^)]*)\)/)?.[1] || '1').trim(),
                group: fallbackGroupForInput(line),
              })),
            steps: steps
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
            notes,
          });
          router.replace(`/meals/recipe/${recipe.id}`);
        }}
      />
      <SecondaryButton label="Delete recipe" onPress={() => setConfirmDelete(true)} />

      <SheetModal visible={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Delete recipe?</Text>
          <Text style={styles.sheetBody}>This removes the recipe from your book and planned slots.</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="trash-outline"
              label="Delete"
              tone="danger"
              onPress={() => {
                deleteRecipe(recipe.id);
                setConfirmDelete(false);
                router.replace('/meals/recipe-book');
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setConfirmDelete(false)} />
          </View>
        </View>
      </SheetModal>
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
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
