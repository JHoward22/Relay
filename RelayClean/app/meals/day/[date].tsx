import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { SectionCard, SlotList } from '../components/MealsBlocks';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from '../components/MealsShell';
import { MealSlot, useMealsStore } from '../meals-context';

export default function DayPlanScreen() {
  const router = useRouter() as any;
  const { date } = useLocalSearchParams<{ date: string }>();
  const dayISO = date || new Date().toISOString().slice(0, 10);
  const { state, setDayNotes, addRecipeIngredientsToGrocery } = useMealsStore();
  const [talkOpen, setTalkOpen] = useState(false);
  const [quickSlot, setQuickSlot] = useState<MealSlot | null>(null);
  const day = state.days.find((entry) => entry.dateISO === dayISO);
  const slots = state.slots.filter((slot) => slot.dayISO === dayISO);

  const prepNotes = useMemo(() => day?.prepNotes || '', [day?.prepNotes]);
  const [notesInput, setNotesInput] = useState(prepNotes);

  return (
    <MealsShell title="Day Plan" subtitle={new Date(`${dayISO}T00:00:00`).toDateString()} onBack={() => router.back()}>
      <SectionCard title="Meals">
        {day ? (
          <SlotList
            day={day}
            slots={slots}
            recipes={state.recipes}
            onPress={(slot) => {
              if (slot.id === 'new') {
                router.push(`/meals/choose?day=${dayISO}&slot=${slot.slotType}`);
                return;
              }
              if (slot.recipeId) {
                router.push(`/meals/recipe/${slot.recipeId}?day=${dayISO}&slot=${slot.slotType}`);
                return;
              }
              setQuickSlot(slot);
            }}
            onLongPress={(slot) => setQuickSlot(slot)}
          />
        ) : (
          <Text style={styles.meta}>No meals planned yet for this day.</Text>
        )}
      </SectionCard>

      <SectionCard title="Prep notes">
        <FormField
          label="Notes"
          value={notesInput}
          onChangeText={setNotesInput}
          multiline
          placeholder="Prep reminders for this day"
        />
        <BubbleChip
          icon="save-outline"
          label="Save notes"
          tone="primary"
          onPress={() => setDayNotes({ dayISO, notes: notesInput })}
        />
      </SectionCard>

      <PrimaryButton label="Add meal" onPress={() => router.push(`/meals/choose?day=${dayISO}`)} />
      <SecondaryButton
        label="Generate day plan"
        onPress={() => router.push(`/meals/plan-generator/preview?scope=day&day=${dayISO}`)}
      />

      <SectionCard title="More tools">
        <View style={styles.sheetActions}>
          <BubbleChip
            icon="cart-outline"
            label="Add to grocery list"
            tone="neutral"
            onPress={() => {
              const recipeIds = slots
                .map((slot) => slot.recipeId)
                .filter((value): value is string => Boolean(value));
              if (recipeIds.length) addRecipeIngredientsToGrocery(recipeIds);
              router.push('/meals/grocery');
            }}
          />
          <BubbleChip icon="calendar-outline" label="Weekly planner" tone="neutral" onPress={() => router.push('/meals/weekly')} />
        </View>
      </SectionCard>

      <VoiceHintRow
        label="Say 'Plan meals for Friday and add groceries'"
        onAsk={() => setTalkOpen(true)}
      />

      <SheetModal visible={!!quickSlot} onClose={() => setQuickSlot(null)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Meal quick actions</Text>
          <View style={styles.sheetActions}>
            <BubbleChip
              icon="create-outline"
              label="Edit"
              tone="primary"
              onPress={() => {
                if (!quickSlot) return;
                setQuickSlot(null);
                router.push(`/meals/choose?day=${dayISO}&slot=${quickSlot.slotType}`);
              }}
            />
            <BubbleChip
              icon="cart-outline"
              label="To grocery"
              tone="success"
              onPress={() => {
                if (!quickSlot?.recipeId) {
                  setQuickSlot(null);
                  return;
                }
                addRecipeIngredientsToGrocery([quickSlot.recipeId]);
                setQuickSlot(null);
                router.push('/meals/grocery');
              }}
            />
            <BubbleChip icon="close" label="Close" tone="neutral" onPress={() => setQuickSlot(null)} />
          </View>
        </View>
      </SheetModal>

      <MealsTalkSheet open={talkOpen} onClose={() => setTalkOpen(false)} />
    </MealsShell>
  );
}

const styles = StyleSheet.create({
  meta: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
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
