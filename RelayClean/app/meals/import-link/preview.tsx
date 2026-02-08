import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from '../components/MealsShell';
import { defaultImportDraft, fallbackGroupForInput, ImportDraft, useMealsStore } from '../meals-context';

export default function LinkPreviewScreen() {
  const router = useRouter() as any;
  const { url } = useLocalSearchParams<{ url?: string }>();
  const { state, saveImportToRecipes, addGroceryItem } = useMealsStore();

  const draft = useMemo<ImportDraft>(() => {
    if (!url) return defaultImportDraft('https://example.com/recipe');
    return state.recentImports.find((entry) => entry.url === url) || defaultImportDraft(url);
  }, [state.recentImports, url]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [title, setTitle] = useState(draft.title);
  const [tags, setTags] = useState(draft.suggestedTags.join(','));
  const [destination, setDestination] = useState<'recipe' | 'plan' | 'grocery'>('recipe');
  const [talkOpen, setTalkOpen] = useState(false);

  const normalizedTags = tags
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  const toggleTag = (tag: string) => {
    const next = normalizedTags.includes(tag)
      ? normalizedTags.filter((entry) => entry !== tag)
      : [...normalizedTags, tag];
    setTags(next.join(', '));
  };

  const onConfirm = () => {
    saveImportToRecipes({
      draft,
      title,
      tags: normalizedTags,
    });

    if (destination === 'plan') {
      router.replace('/meals/choose');
      return;
    }

    if (destination === 'grocery') {
      draft.ingredients.forEach((ingredient) => {
        addGroceryItem({
          name: ingredient.name,
          quantity: ingredient.quantity,
          group: ingredient.group || fallbackGroupForInput(ingredient.name),
        });
      });
      router.replace('/meals/grocery');
      return;
    }

    router.replace('/meals/import-link/success');
  };

  return (
    <MealsShell title="Link Preview" subtitle="Confirm extracted recipe" onBack={() => router.back()}>
      <GlassCard blur style={styles.card}>
        <Text style={styles.title}>{draft.title}</Text>
        <Text style={styles.meta}>{draft.source}</Text>
        <Text style={styles.meta}>{draft.url}</Text>

        <View style={styles.tagRow}>
          {draft.suggestedTags.map((tag) => (
            <BubbleChip
              key={tag}
              icon="pricetag-outline"
              label={tag}
              tone={normalizedTags.includes(tag) ? 'success' : 'neutral'}
              onPress={() => toggleTag(tag)}
            />
          ))}
        </View>
      </GlassCard>

      <PrimaryButton
        label="Save to Recipe Book"
        onPress={() => {
          setDestination('recipe');
          setConfirmOpen(true);
        }}
      />
      <SecondaryButton
        label="Add to meal plan"
        onPress={() => {
          setDestination('plan');
          setConfirmOpen(true);
        }}
      />
      <SecondaryButton
        label="Add ingredients to grocery list"
        onPress={() => {
          setDestination('grocery');
          setConfirmOpen(true);
        }}
      />

      <VoiceHintRow label="Say 'Save this and add to Friday dinner'" onAsk={() => setTalkOpen(true)} />

      <SheetModal visible={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Recipe parse confirmation</Text>
          <FormField label="Title" value={title} onChangeText={setTitle} />
          <FormField label="Tags" value={tags} onChangeText={setTags} />

          <Text style={styles.metaStrong}>Ingredients preview</Text>
          {draft.ingredients.map((ingredient) => (
            <Text key={`${ingredient.name}-${ingredient.quantity}`} style={styles.listText}>
              • {ingredient.name} — {ingredient.quantity}
            </Text>
          ))}

          <View style={styles.sheetActions}>
            <BubbleChip icon="checkmark" label="Accept" tone="success" onPress={onConfirm} />
            <BubbleChip icon="create-outline" label="Edit" tone="primary" onPress={() => setConfirmOpen(false)} />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setConfirmOpen(false)} />
          </View>
        </View>
      </SheetModal>

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
  meta: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  metaStrong: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.text,
    fontWeight: '700',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  listText: {
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  sheetActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
