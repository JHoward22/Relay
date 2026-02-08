import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ds } from '@/constants/design-system';
import { MealsShell, MealsTalkSheet } from './components/MealsShell';
import { useMealsStore } from './meals-context';

export default function MealSummaryScreen() {
  const router = useRouter() as any;
  const { state } = useMealsStore();
  const [talkOpen, setTalkOpen] = useState(false);

  const summary = useMemo(() => {
    const planned = state.slots.filter((slot) => slot.status === 'planned').length;
    const grocery = state.groceryItems.filter((item) => !item.checked).length;
    const favorites = state.recipes.filter((recipe) => recipe.isFavorite).length;
    return {
      planned,
      grocery,
      favorites,
    };
  }, [state.groceryItems, state.recipes, state.slots]);

  return (
    <MealsShell title="Meal Summary" subtitle="Relay weekly overview" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>This week</Text>
        <Text style={styles.body}>You have {summary.planned} meals planned and {summary.grocery} grocery items remaining.</Text>
        <Text style={styles.body}>Favorites used this week: {summary.favorites}</Text>
      </GlassCard>

      <View style={styles.row}>
        <BubbleChip icon="mic" label="Ask follow-up" tone="primary" onPress={() => setTalkOpen(true)} />
        <BubbleChip icon="document-text-outline" label="Save as note" tone="neutral" onPress={() => router.push('/notes/create')} />
        <BubbleChip icon="share-outline" label="Share" tone="neutral" onPress={() => router.push('/meals/grocery/share')} />
      </View>

      <PrimaryButton label="Turn into tasks" onPress={() => router.push('/tasks/create')} />
      <SecondaryButton label="Back to meals" onPress={() => router.replace('/meals')} />

      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: ds.spacing.s8,
  },
  title: {
    fontFamily: ds.font,
    fontSize: ds.type.section.fontSize,
    lineHeight: ds.type.section.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  body: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
