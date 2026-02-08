import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from '../../components/MealsShell';
import { useMealsStore } from '../../meals-context';

export default function RecipeDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, addRecipeIngredientsToGrocery, toggleRecipeFavorite } = useMealsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const recipe = useMemo(() => state.recipes.find((entry) => entry.id === id), [id, state.recipes]);

  if (!recipe) {
    return (
      <MealsShell title="Recipe" subtitle="Not found" onBack={() => router.back()}>
        <EmptyState title="Recipe not found" body="This recipe may have been removed." />
      </MealsShell>
    );
  }

  return (
    <MealsShell title={recipe.title} subtitle={`${recipe.prepMinutes + recipe.cookMinutes} min • ${recipe.servings} servings`} onBack={() => router.back()}>
      <GlassCard blur>
        <Text style={styles.heading}>Recipe details</Text>
        <Text style={styles.body}>Source: {recipe.sourceLabel}{recipe.sourceUrl ? ` • ${recipe.sourceUrl}` : ''}</Text>
        <Text style={styles.body}>Tags: {recipe.tags.join(' · ')}</Text>
        {recipe.notes ? <Text style={styles.body}>Note: {recipe.notes}</Text> : null}
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.heading}>Ingredients</Text>
        {recipe.ingredients.map((ingredient) => (
          <ListRow
            key={ingredient.id}
            icon="ellipse"
            iconTint={ds.colors.secondary}
            label={ingredient.name}
            body={ingredient.quantity}
          />
        ))}
      </GlassCard>

      <GlassCard blur>
        <Text style={styles.heading}>Steps</Text>
        {recipe.steps.map((step, index) => (
          <Text key={`${recipe.id}-step-${index}`} style={styles.stepText}>
            {index + 1}. {step}
          </Text>
        ))}
      </GlassCard>

      <PrimaryButton label="Add to plan" onPress={() => router.push(`/meals/choose?recipe=${recipe.id}`)} />
      <SecondaryButton
        label="Add ingredients to grocery list"
        onPress={() => {
          addRecipeIngredientsToGrocery([recipe.id]);
          router.push('/meals/grocery');
        }}
      />

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <Text style={styles.toolsBody}>Keep this recipe easy to reuse later.</Text>
        <View style={styles.toolsChips}>
          <BubbleChip
            icon={recipe.isFavorite ? 'bookmark' : 'bookmark-outline'}
            label={recipe.isFavorite ? 'Unfavorite' : 'Favorite'}
            tone="neutral"
            onPress={() => toggleRecipeFavorite(recipe.id)}
          />
          <BubbleChip icon="create-outline" label="Edit recipe" tone="neutral" onPress={() => router.push(`/meals/recipe/${recipe.id}/edit`)} />
          <BubbleChip icon="book-outline" label="Recipe Book" tone="neutral" onPress={() => router.push('/meals/recipe-book')} />
        </View>
      </GlassCard>

      <VoiceHintRow label="Say 'Add this to Friday dinner'" onAsk={() => setTalkOpen(true)} />
      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
    marginBottom: ds.spacing.s12,
  },
  stepText: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.text,
    fontWeight: '500',
    marginBottom: ds.spacing.s8,
  },
  toolsTitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  toolsBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  toolsChips: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
