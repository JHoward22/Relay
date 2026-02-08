import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { getWeekDays, useMealsStore } from './meals-context';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from './components/MealsShell';
import { SectionCard, SummaryStat, SuggestionActions } from './components/MealsBlocks';

export default function MealsHomeScreen() {
  const router = useRouter() as any;
  const { state } = useMealsStore();
  const [talkOpen, setTalkOpen] = useState(false);
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);

  const weekDays = useMemo(() => getWeekDays(state.weekPlan.weekStartISO), [state.weekPlan.weekStartISO]);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, number>();
    state.slots.forEach((slot) => {
      map.set(slot.dayISO, (map.get(slot.dayISO) ?? 0) + 1);
    });
    return map;
  }, [state.slots]);

  const mealsPlanned = state.slots.filter((slot) => slot.status === 'planned').length;
  const groceryOpen = state.groceryItems.filter((item) => !item.checked).length;

  const recipeHighlights = useMemo(
    () =>
      state.recipes
        .slice()
        .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
        .slice(0, 3),
    [state.recipes]
  );

  const topSuggestion = {
    title: 'Generate dinners for the week? ',
    body: 'Relay can build a balanced dinner plan in one pass and keep prep realistic.',
    onDo: () => router.push('/meals/plan-generator/preferences?preset=dinner'),
    onEdit: () => router.push('/meals/plan-generator/preferences'),
  };

  return (
    <MealsShell
      title="Meals"
      subtitle={`This week • ${mealsPlanned} meals planned`}
      headerActions={[
        { icon: 'sparkles-outline', label: 'Plan', onPress: () => router.push('/meals/plan-generator/preferences') },
        { icon: 'cart-outline', label: 'Grocery', onPress: () => router.push('/meals/grocery') },
      ]}
    >
      <SectionCard title="Plan This Week" rightLabel="Open week" onRightPress={() => router.push('/meals/weekly')}>
        <View style={styles.statsRow}>
          <SummaryStat label="Meals" value={`${mealsPlanned}`} />
          <SummaryStat label="Groceries" value={`${groceryOpen}`} />
          <SummaryStat label="Recipes" value={`${state.recipes.length}`} />
        </View>

        <View style={styles.dayPreviewRow}>
          {weekDays.slice(0, 4).map((day) => (
            <Pressable key={day.dateISO} style={styles.dayPreview} onPress={() => router.push(`/meals/day/${day.dateISO}`)}>
              <Text style={styles.dayPreviewLabel}>{day.label.split(',')[0]}</Text>
              <Text style={styles.dayPreviewMeta}>{slotsByDay.get(day.dateISO) ?? 0} planned</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.primaryActions}>
          <PrimaryButton label="Plan Week" onPress={() => router.push('/meals/weekly')} style={styles.flex} />
          <SecondaryButton label="Grocery List" onPress={() => router.push('/meals/grocery')} style={styles.flex} />
        </View>
      </SectionCard>

      <SectionCard title="Capture Recipes" rightLabel="Recipe book" onRightPress={() => router.push('/meals/recipe-book')}>
        <View style={styles.captureGrid}>
          <Pressable style={styles.captureTile} onPress={() => router.push('/meals/import-link')}>
            <Ionicons name="link-outline" size={18} color={ds.colors.primary} />
            <Text style={styles.captureTitle}>Import Link</Text>
            <Text style={styles.captureBody}>Paste from social or web</Text>
          </Pressable>

          <Pressable style={styles.captureTile} onPress={() => router.push('/meals/add-recipe')}>
            <Ionicons name="book-outline" size={18} color={ds.colors.primary} />
            <Text style={styles.captureTitle}>Add Recipe</Text>
            <Text style={styles.captureBody}>Manual, voice, or photo</Text>
          </Pressable>
        </View>

        {recipeHighlights.length ? (
          <View style={styles.listWrap}>
            {recipeHighlights.map((recipe) => (
              <View key={recipe.id} style={styles.rowWrap}>
                <ListRow
                  icon="restaurant-outline"
                  iconTint="#D48A47"
                  label={recipe.title}
                  body={`${recipe.prepMinutes + recipe.cookMinutes} min • ${recipe.tags.slice(0, 2).join(' • ')}`}
                  onPress={() => router.push(`/meals/recipe/${recipe.id}`)}
                />
              </View>
            ))}
          </View>
        ) : (
          <EmptyState title="No saved recipes" body="Import your first recipe link to start planning faster." />
        )}
      </SectionCard>

      {!dismissedSuggestion ? (
        <GlassCard blur>
          <Text style={styles.insightEyebrow}>Top Insight</Text>
          <Text style={styles.suggestionTitle}>{topSuggestion.title}</Text>
          <Text style={styles.suggestionBody}>{topSuggestion.body}</Text>
          <SuggestionActions
            onDo={topSuggestion.onDo}
            onEdit={topSuggestion.onEdit}
            onDismiss={() => setDismissedSuggestion(true)}
          />
        </GlassCard>
      ) : null}

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.toolsRow}>
          <BubbleChip icon="albums-outline" label="Collections" tone="neutral" onPress={() => router.push('/meals/recipe-book/collections')} />
          <BubbleChip icon="basket-outline" label="Pantry" tone="neutral" onPress={() => router.push('/meals/pantry')} />
          <BubbleChip icon="receipt-outline" label="Meal Summary" tone="neutral" onPress={() => router.push('/meals/summary')} />
        </View>
      </GlassCard>

      <VoiceHintRow label="Say 'plan dinners this week'" onAsk={() => setTalkOpen(true)} />
      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s12,
  },
  dayPreviewRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s12,
  },
  dayPreview: {
    flex: 1,
    borderRadius: ds.radius.r14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    paddingHorizontal: ds.spacing.s8,
    paddingVertical: ds.spacing.s8,
  },
  dayPreviewLabel: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.text,
    fontWeight: '700',
  },
  dayPreviewMeta: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  primaryActions: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  captureGrid: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  captureTile: {
    flex: 1,
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    padding: ds.spacing.s12,
    gap: ds.spacing.s4,
    ...ds.shadow.soft,
  },
  captureTitle: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  captureBody: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  listWrap: {
    marginTop: ds.spacing.s12,
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  suggestionTitle: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 15,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '700',
  },
  insightEyebrow: {
    fontFamily: ds.font,
    fontSize: 11,
    lineHeight: 14,
    color: ds.colors.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  suggestionBody: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  toolsTitle: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '700',
    marginBottom: ds.spacing.s8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  toolsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
