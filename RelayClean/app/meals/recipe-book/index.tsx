import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { MealsShell, VoiceHintRow, MealsTalkSheet } from '../components/MealsShell';
import { useMealsStore } from '../meals-context';

export default function RecipeBookScreen() {
  const router = useRouter() as any;
  const { state, toggleRecipeFavorite, deleteRecipe, addRecipeIngredientsToGrocery } = useMealsStore();
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [quickRecipeId, setQuickRecipeId] = useState<string | null>(null);
  const [talkOpen, setTalkOpen] = useState(false);

  const tags = useMemo(() => {
    return Array.from(new Set(state.recipes.flatMap((recipe) => recipe.tags))).slice(0, 8);
  }, [state.recipes]);

  const filtered = useMemo(() => {
    return state.recipes.filter((recipe) => {
      const matchesSearch = search ? recipe.title.toLowerCase().includes(search.toLowerCase()) : true;
      const matchesTag = activeTag ? recipe.tags.includes(activeTag) : true;
      return matchesSearch && matchesTag;
    });
  }, [activeTag, search, state.recipes]);

  const quickRecipe = state.recipes.find((recipe) => recipe.id === quickRecipeId) || null;

  return (
    <MealsShell
      title="Recipe Book"
      subtitle={`${state.recipes.length} saved recipes`}
      onBack={() => router.back()}
      headerActions={[
        { icon: 'add', label: 'Add', onPress: () => router.push('/meals/add-recipe') },
        { icon: 'albums-outline', label: 'Collections', onPress: () => router.push('/meals/recipe-book/collections') },
      ]}
    >
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search recipes"
        placeholderTextColor="#8A95AD"
        style={styles.input}
      />

      <View style={styles.tagRow}>
        <BubbleChip icon="funnel-outline" label="All" tone={activeTag ? 'neutral' : 'primary'} onPress={() => setActiveTag('')} />
        {tags.map((tag) => (
          <BubbleChip
            key={tag}
            icon="pricetag-outline"
            label={tag}
            tone={activeTag === tag ? 'primary' : 'neutral'}
            onPress={() => setActiveTag(tag)}
          />
        ))}
      </View>

      {filtered.length ? (
        <View style={styles.grid}>
          {filtered.map((recipe) => (
            <Pressable
              key={recipe.id}
              style={styles.card}
              onPress={() => router.push(`/meals/recipe/${recipe.id}`)}
              onLongPress={() => setQuickRecipeId(recipe.id)}
            >
              <Text style={styles.cardTitle}>{recipe.title}</Text>
              <Text style={styles.cardMeta}>{recipe.tags.join(' · ')}</Text>
              <Text style={styles.cardMeta}>{recipe.prepMinutes + recipe.cookMinutes} min • {recipe.servings} servings</Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState title="No saved recipes" body="Import a link or add a recipe to start your collection." />
      )}

      <VoiceHintRow label="Say 'Find quick dinners under 30 minutes'" onAsk={() => setTalkOpen(true)} />

      <SheetModal visible={!!quickRecipe} onClose={() => setQuickRecipeId(null)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>{quickRecipe?.title}</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="calendar-outline"
              label="Add to week"
              tone="primary"
              onPress={() => {
                setQuickRecipeId(null);
                router.push('/meals/weekly');
              }}
            />
            <BubbleChip
              icon="cart-outline"
              label="To grocery"
              tone="success"
              onPress={() => {
                if (quickRecipe) addRecipeIngredientsToGrocery([quickRecipe.id]);
                setQuickRecipeId(null);
                router.push('/meals/grocery');
              }}
            />
            <BubbleChip
              icon={quickRecipe?.isFavorite ? 'heart' : 'heart-outline'}
              label="Favorite"
              tone="neutral"
              onPress={() => {
                if (quickRecipe) toggleRecipeFavorite(quickRecipe.id);
              }}
            />
            <BubbleChip
              icon="create-outline"
              label="Edit"
              tone="primary"
              onPress={() => {
                if (!quickRecipe) return;
                setQuickRecipeId(null);
                router.push(`/meals/recipe/${quickRecipe.id}/edit`);
              }}
            />
            <BubbleChip
              icon="trash-outline"
              label="Delete"
              tone="danger"
              onPress={() => {
                if (quickRecipe) deleteRecipe(quickRecipe.id);
                setQuickRecipeId(null);
              }}
            />
          </View>
        </View>
      </SheetModal>

      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    color: ds.colors.text,
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  card: {
    width: '48%',
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    padding: ds.spacing.s12,
    minHeight: 116,
    ...ds.shadow.soft,
  },
  cardTitle: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 18,
    color: ds.colors.text,
    fontWeight: '700',
  },
  cardMeta: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '500',
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
