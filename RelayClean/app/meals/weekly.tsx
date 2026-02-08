import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';
import { DayStrip, SectionCard, SlotList } from './components/MealsBlocks';
import { MealsShell, MealsTalkSheet, VoiceHintRow } from './components/MealsShell';
import { getSlotLabel, getWeekDays, MealSlot, useMealsStore } from './meals-context';

export default function WeeklyPlannerScreen() {
  const router = useRouter() as any;
  const { state: relayState } = useRelayStore();
  const { state, removeSlot, addRecipeToSlot } = useMealsStore();

  const days = useMemo(() => getWeekDays(state.weekPlan.weekStartISO), [state.weekPlan.weekStartISO]);
  const [selectedDay, setSelectedDay] = useState(days[0]?.dateISO ?? state.weekPlan.weekStartISO);
  const [slotSheet, setSlotSheet] = useState<MealSlot | null>(null);
  const [talkOpen, setTalkOpen] = useState(false);
  const [assignTo, setAssignTo] = useState('');

  const dayEntity = state.days.find((day) => day.dateISO === selectedDay);
  const slots = state.slots.filter((slot) => slot.dayISO === selectedDay);
  const recipes = state.recipes;

  return (
    <MealsShell
      title="Weekly Planner"
      subtitle="Mon-Sun meal schedule"
      onBack={() => router.back()}
      headerActions={[
        { icon: 'add', label: 'Add', onPress: () => router.push(`/meals/choose?day=${selectedDay}`) },
      ]}
    >
      <SectionCard title="Week view">
        <DayStrip days={days} selected={selectedDay} onSelect={setSelectedDay} />
      </SectionCard>

      <SectionCard title={days.find((day) => day.dateISO === selectedDay)?.label || 'Selected day'}>
        {dayEntity ? (
          <SlotList
            day={dayEntity}
            slots={slots}
            recipes={recipes}
            onPress={(slot) => {
              if (slot.id === 'new') {
                router.push(`/meals/choose?day=${selectedDay}&slot=${slot.slotType}`);
                return;
              }
              setSlotSheet(slot);
            }}
            onLongPress={(slot) => setSlotSheet(slot)}
          />
        ) : (
          <Text style={styles.meta}>No plan for this day yet.</Text>
        )}
      </SectionCard>

      <PrimaryButton label="Add meal" onPress={() => router.push(`/meals/choose?day=${selectedDay}`)} />
      <SecondaryButton label="Generate plan" onPress={() => router.push('/meals/plan-generator/preferences')} />

      <SectionCard title="More tools">
        <View style={styles.sheetActions}>
          <BubbleChip icon="calendar-outline" label="Open selected day" tone="neutral" onPress={() => router.push(`/meals/day/${selectedDay}`)} />
          <BubbleChip icon="cart-outline" label="Grocery list" tone="neutral" onPress={() => router.push('/meals/grocery')} />
        </View>
      </SectionCard>

      <VoiceHintRow
        label="Say 'Generate my week meals'"
        onAsk={() => setTalkOpen(true)}
      />

      <SheetModal visible={!!slotSheet} onClose={() => setSlotSheet(null)}>
        <View style={styles.sheetWrap}>
          <Text style={styles.sheetTitle}>Meal slot detail</Text>
          <Text style={styles.meta}>
            {slotSheet ? `${getSlotLabel(slotSheet.slotType)} • ${slotSheet.dayISO}` : ''}
          </Text>

          {relayState.familyModeEnabled ? (
            <FormField
              label="Assign cooking"
              placeholder="Member name"
              value={assignTo}
              onChangeText={setAssignTo}
            />
          ) : null}

          <View style={styles.sheetActions}>
            <BubbleChip
              icon="create-outline"
              label="Edit"
              tone="primary"
              onPress={() => {
                if (!slotSheet) return;
                setSlotSheet(null);
                router.push(`/meals/choose?day=${slotSheet.dayISO}&slot=${slotSheet.slotType}`);
              }}
            />
            <BubbleChip
              icon="checkmark"
              label="Save"
              tone="success"
              onPress={() => {
                if (!slotSheet || !assignTo) {
                  setSlotSheet(null);
                  return;
                }
                addRecipeToSlot({
                  dayISO: slotSheet.dayISO,
                  slotType: slotSheet.slotType,
                  recipeId: slotSheet.recipeId,
                  customMealTitle: slotSheet.customMealTitle,
                  servings: slotSheet.servings,
                  assignedMemberId: assignTo,
                });
                setAssignTo('');
                setSlotSheet(null);
              }}
            />
            <BubbleChip
              icon="trash-outline"
              label="Remove"
              tone="danger"
              onPress={() => {
                if (!slotSheet || slotSheet.id === 'new') return;
                removeSlot(slotSheet.id);
                setSlotSheet(null);
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setSlotSheet(null)} />
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
