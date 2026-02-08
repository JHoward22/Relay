import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { ds } from '@/constants/design-system';
import { getSlotLabel, MealPlanDay, MealSlot, Recipe } from '../meals-context';

export function SectionCard({
  title,
  rightLabel,
  onRightPress,
  children,
}: {
  title: string;
  rightLabel?: string;
  onRightPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <GlassCard blur>
      <SectionHeader title={title} rightLabel={rightLabel} onRightPress={onRightPress} />
      {children}
    </GlassCard>
  );
}

export function DayStrip({
  days,
  selected,
  onSelect,
}: {
  days: { dateISO: string; label: string }[];
  selected: string;
  onSelect: (dateISO: string) => void;
}) {
  return (
    <View style={styles.dayStrip}>
      {days.map((day) => {
        const active = day.dateISO === selected;
        return (
          <Pressable
            key={day.dateISO}
            onPress={() => onSelect(day.dateISO)}
            style={[styles.dayPill, active ? styles.dayPillActive : null]}
          >
            <Text style={[styles.dayPillText, active ? styles.dayPillTextActive : null]}>{day.label.split(',')[0]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SlotList({
  day,
  slots,
  recipes,
  onPress,
  onLongPress,
}: {
  day: MealPlanDay;
  slots: MealSlot[];
  recipes: Recipe[];
  onPress: (slot: MealSlot) => void;
  onLongPress?: (slot: MealSlot) => void;
}) {
  const findRecipe = (recipeId?: string) => recipes.find((recipe) => recipe.id === recipeId);

  return (
    <View style={styles.slotStack}>
      {(['breakfast', 'lunch', 'dinner'] as const).map((slotType) => {
        const slot = slots.find((entry) => entry.slotType === slotType);
        const recipe = slot ? findRecipe(slot.recipeId) : null;

        if (!slot) {
          return (
            <ListRow
              key={`${day.id}-${slotType}`}
              icon="add"
              iconTint={ds.colors.primary}
              label={getSlotLabel(slotType)}
              body="No meal yet"
              onPress={() => onPress({ id: 'new', dayISO: day.dateISO, slotType, servings: 2, status: 'planned' })}
            />
          );
        }

        return (
          <Pressable key={slot.id} onPress={() => onPress(slot)} onLongPress={() => onLongPress?.(slot)}>
            <ListRow
              icon="restaurant-outline"
              iconTint="#D48A47"
              label={`${getSlotLabel(slot.slotType)} · ${recipe?.title || slot.customMealTitle || 'Custom meal'}`}
              body={`${slot.servings} servings${slot.assignedMemberId ? ' · Assigned' : ''}`}
              trailing={<Ionicons name="ellipsis-horizontal" size={16} color={ds.colors.secondary} />}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function RecipeCarousel({
  recipes,
  onPress,
  onSeeAll,
}: {
  recipes: Recipe[];
  onPress: (id: string) => void;
  onSeeAll: () => void;
}) {
  if (!recipes.length) {
    return <EmptyState title="No saved recipes" body="Import a recipe link or add one manually." />;
  }

  return (
    <View>
      <SectionHeader title="Saved Recipes" rightLabel="See all" onRightPress={onSeeAll} />
      <View style={styles.recipeRow}>
        {recipes.slice(0, 4).map((recipe) => (
          <Pressable key={recipe.id} onPress={() => onPress(recipe.id)} style={styles.recipeCard}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {recipe.title}
            </Text>
            <Text style={styles.recipeMeta}>{recipe.prepMinutes + recipe.cookMinutes} min</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryStat}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

export function SuggestionActions({
  onDo,
  onEdit,
  onDismiss,
}: {
  onDo: () => void;
  onEdit: () => void;
  onDismiss: () => void;
}) {
  return (
    <View style={styles.suggestionActions}>
      <BubbleChip icon="checkmark" label="Do it" tone="success" onPress={onDo} />
      <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={onEdit} />
      <BubbleChip icon="close" label="Dismiss" tone="neutral" onPress={onDismiss} />
    </View>
  );
}

const styles = StyleSheet.create({
  dayStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  dayPill: {
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
    borderRadius: ds.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
  },
  dayPillActive: {
    backgroundColor: ds.colors.primary,
    borderColor: ds.colors.primary,
  },
  dayPillText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
  },
  slotStack: {
    gap: ds.spacing.s8,
  },
  recipeRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  recipeCard: {
    flex: 1,
    minHeight: 90,
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    padding: ds.spacing.s12,
    ...ds.shadow.soft,
  },
  recipeTitle: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 18,
    color: ds.colors.text,
    fontWeight: '700',
  },
  recipeMeta: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  summaryStat: {
    flex: 1,
    borderRadius: ds.radius.r16,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFill,
    padding: ds.spacing.s12,
    ...ds.shadow.soft,
  },
  summaryValue: {
    fontFamily: ds.font,
    fontSize: 20,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
  },
  summaryLabel: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  suggestionActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
    marginTop: ds.spacing.s8,
  },
});
