import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from './components/MealsShell';
import { MealSlotType, useMealsStore } from './meals-context';

export default function ChooseRecipeOrCreateMealScreen() {
  const router = useRouter() as any;
  const params = useLocalSearchParams<{ day?: string; slot?: MealSlotType }>();
  const dayISO = params.day || new Date().toISOString().slice(0, 10);
  const slotType = params.slot || 'dinner';

  const { state, addRecipeToSlot } = useMealsStore();
  const [query, setQuery] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [talkOpen, setTalkOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return state.recipes;
    return state.recipes.filter((recipe) => recipe.title.toLowerCase().includes(query.toLowerCase()));
  }, [query, state.recipes]);

  const applyRecipe = (recipeId?: string, customMealTitle?: string) => {
    addRecipeToSlot({
      dayISO,
      slotType,
      recipeId,
      customMealTitle,
      servings: 2,
    });
    router.replace(`/meals/day/${dayISO}`);
  };

  return (
    <MealsShell title="Choose Meal" subtitle={`${slotType} • ${dayISO}`} onBack={() => router.back()}>
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search saved recipes"
          placeholderTextColor="#8A95AD"
          style={styles.searchInput}
        />
      </View>

      <SectionHeader title="Saved recipes" rightLabel="Add recipe" onRightPress={() => router.push('/meals/add-recipe')} />
      <View style={styles.listWrap}>
        {filtered.map((recipe) => (
          <ListRow
            key={recipe.id}
            icon="restaurant-outline"
            iconTint="#D48A47"
            label={recipe.title}
            body={`${recipe.prepMinutes + recipe.cookMinutes} min • ${recipe.tags.join(' · ')}`}
            onPress={() => applyRecipe(recipe.id)}
          />
        ))}
      </View>

      <PrimaryButton label="Use custom meal title" onPress={() => setCustomOpen(true)} />
      <SecondaryButton label="Create new recipe" onPress={() => router.push('/meals/add-recipe/manual')} />

      <VoiceHintRow
        label="Say 'Add turkey taco bowls for Thursday dinner'"
        onAsk={() => setTalkOpen(true)}
      />

      <SheetModal visible={customOpen} onClose={() => setCustomOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Custom meal</Text>
          <TextInput
            value={customTitle}
            onChangeText={setCustomTitle}
            placeholder="Meal title"
            placeholderTextColor="#8A95AD"
            style={styles.searchInput}
          />

          <View style={styles.sheetActions}>
            <BubbleChip
              icon="checkmark"
              label="Save"
              tone="success"
              onPress={() => {
                const title = customTitle.trim() || 'Custom meal';
                setCustomOpen(false);
                applyRecipe(undefined, title);
              }}
            />
            <BubbleChip
              icon="close"
              label="Cancel"
              tone="neutral"
              onPress={() => setCustomOpen(false)}
            />
          </View>
        </View>
      </SheetModal>

      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    padding: ds.spacing.s8,
  },
  searchInput: {
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: 'rgba(206,219,241,0.9)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    color: ds.colors.text,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
  },
  listWrap: {
    gap: ds.spacing.s8,
  },
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
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
