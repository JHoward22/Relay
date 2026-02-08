import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { FormField } from '@/components/relay/FormField';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { SheetModal } from '@/components/relay/SheetModal';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../../components/FamilyShell';
import { useFamilyStore } from '../../family-context';

export default function FamilyEventDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEvent, state, updateEvent, deleteEvent } = useFamilyStore();

  const event = getEvent(id);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(event?.notes ?? '');

  const people = useMemo(() => {
    if (!event) return '';
    return event.affectedMemberIds
      .map((memberId) => state.members.find((member) => member.id === memberId)?.name)
      .filter(Boolean)
      .join(', ');
  }, [event, state.members]);

  if (!event) {
    return (
      <FamilyShell title="Event" onBack={() => router.back()}>
        <EmptyState title="Event not found" body="This event may have been removed." />
      </FamilyShell>
    );
  }

  return (
    <FamilyShell title={event.title} subtitle={`${event.dateISO} · ${event.timeLabel}`} onBack={() => router.back()}>
      <FamilySectionCard title="Event details">
        <Text style={styles.body}>Type: {event.type === 'reminder' ? 'Reminder' : 'Event'}</Text>
        <Text style={styles.body}>People: {people || 'None assigned'}</Text>
        <Text style={styles.body}>Location: {event.location || 'Not set'}</Text>
        <Text style={styles.body}>Repeat: {event.repeatRule || 'No repeat'}</Text>
      </FamilySectionCard>

      <FamilySectionCard title="Notes">
        <FormField
          label="Notes"
          value={noteDraft}
          onChangeText={setNoteDraft}
          placeholder="Add context for this event"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <View style={styles.actions}>
          <BubbleChip icon="save-outline" label="Save" tone="primary" onPress={() => updateEvent(event.id, { notes: noteDraft })} />
        </View>
      </FamilySectionCard>

      <FamilySectionCard title="Actions">
        <View style={styles.primaryActions}>
          <PrimaryButton label="+1 hour" onPress={() => updateEvent(event.id, { timeLabel: '7:00 PM' })} style={styles.flex} />
          <SecondaryButton
            label={event.repeatRule ? 'Clear recurring' : 'Set recurring'}
            onPress={() => updateEvent(event.id, { repeatRule: event.repeatRule ? undefined : 'Weekly' })}
            style={styles.flex}
          />
        </View>
      </FamilySectionCard>

      <GlassCard blur>
        <Text style={styles.toolsTitle}>More tools</Text>
        <View style={styles.actions}>
          <BubbleChip icon="notifications-outline" label="Reminder Mode" tone="neutral" onPress={() => updateEvent(event.id, { type: 'reminder' })} />
          <BubbleChip icon="mic-outline" label="Ask Relay" tone="neutral" onPress={() => router.push('/family/voice-summary')} />
          <BubbleChip icon="trash-outline" label="Delete" tone="danger" onPress={() => setDeleteOpen(true)} />
        </View>
      </GlassCard>

      <FamilyVoiceHint label="Try saying: 'Move this event to tomorrow and remind everyone.'" onAsk={() => router.push('/family/voice-summary')} />

      <SheetModal visible={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Delete event?</Text>
          <Text style={styles.sheetBody}>Relay will remove this event from the shared family calendar.</Text>
          <View style={styles.actions}>
            <BubbleChip
              icon="trash-outline"
              label="Delete"
              tone="danger"
              onPress={() => {
                deleteEvent(event.id);
                setDeleteOpen(false);
                router.replace('/family/calendar');
              }}
            />
            <BubbleChip icon="close" label="Cancel" tone="neutral" onPress={() => setDeleteOpen(false)} />
          </View>
        </View>
      </SheetModal>
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '600',
    marginBottom: ds.spacing.s4,
  },
  actions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  primaryActions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
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
  sheetContent: {
    paddingHorizontal: ds.spacing.s16,
    paddingVertical: ds.spacing.s16,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: 20,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetBody: {
    marginTop: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
});
