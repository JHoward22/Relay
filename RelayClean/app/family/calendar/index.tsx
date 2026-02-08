import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BubbleChip } from '@/components/relay/BubbleChip';
import { EmptyState } from '@/components/relay/EmptyState';
import { ListRow } from '@/components/relay/ListRow';
import { ds } from '@/constants/design-system';
import { FamilySectionCard, FamilyShell, FamilyVoiceHint } from '../components/FamilyShell';
import { useFamilyStore } from '../family-context';

function isoForOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function FamilyCalendarScreen() {
  const router = useRouter() as any;
  const { state } = useFamilyStore();
  const [selectedDate, setSelectedDate] = useState(isoForOffset(0));

  const eventsForDay = useMemo(
    () => state.events.filter((event) => event.dateISO === selectedDate),
    [selectedDate, state.events]
  );

  const dayOptions = useMemo(
    () => [isoForOffset(0), isoForOffset(1), isoForOffset(2), isoForOffset(3), isoForOffset(4), isoForOffset(5), isoForOffset(6)],
    []
  );

  return (
    <FamilyShell
      title="Family Calendar"
      subtitle="Shared schedules and reminders"
      onBack={() => router.back()}
      headerActions={[
        { icon: 'add', label: 'Add', onPress: () => router.push('/family/calendar/create') },
        { icon: 'today-outline', label: 'Today', onPress: () => setSelectedDate(isoForOffset(0)) },
      ]}
    >
      <FamilySectionCard title="This week">
        <View style={styles.dayRow}>
          {dayOptions.map((iso) => {
            const active = iso === selectedDate;
            return (
              <Pressable
                key={iso}
                style={[styles.dayChip, active ? styles.dayChipActive : null]}
                onPress={() => setSelectedDate(iso)}
              >
                <Text style={[styles.dayText, active ? styles.dayTextActive : null]}>{iso.slice(5)}</Text>
              </Pressable>
            );
          })}
        </View>
      </FamilySectionCard>

      <FamilySectionCard title="Agenda" rightLabel="New Event" onRightPress={() => router.push('/family/calendar/create')}>
        {eventsForDay.length ? (
          <View style={styles.listWrap}>
            {eventsForDay.map((event) => {
              const who = event.affectedMemberIds
                .map((memberId) => state.members.find((member) => member.id === memberId)?.name)
                .filter(Boolean)
                .join(', ');

              return (
                <ListRow
                  key={event.id}
                  icon={event.type === 'reminder' ? 'notifications-outline' : 'calendar-outline'}
                  label={event.title}
                  body={`${event.timeLabel}${who ? ` · ${who}` : ''}`}
                  badge={event.repeatRule || undefined}
                  onPress={() => router.push(`/family/calendar/event/${event.id}`)}
                />
              );
            })}
          </View>
        ) : (
          <EmptyState title="No events on this day" body="Create a family event or reminder to keep everyone aligned." />
        )}
      </FamilySectionCard>

      <FamilySectionCard title="Actions">
        <View style={styles.actions}>
          <BubbleChip icon="add-circle-outline" label="Create event" tone="primary" onPress={() => router.push('/family/calendar/create')} />
          <BubbleChip icon="people-outline" label="Assign members" tone="neutral" onPress={() => router.push('/family/members')} />
          <BubbleChip icon="mic-outline" label="Ask Relay" tone="neutral" onPress={() => router.push('/family/voice-summary')} />
        </View>
      </FamilySectionCard>

      <FamilyVoiceHint label="Try saying: 'Schedule recital rehearsal on Friday at 6 PM.'" onAsk={() => router.push('/family/voice-summary')} />
    </FamilyShell>
  );
}

const styles = StyleSheet.create({
  dayRow: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    flexWrap: 'wrap',
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ds.colors.glassBorder,
    backgroundColor: ds.colors.glassFillSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    borderColor: 'rgba(80, 152, 255, 0.52)',
    backgroundColor: 'rgba(80, 152, 255, 0.18)',
  },
  dayText: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '700',
  },
  dayTextActive: {
    color: ds.colors.primary,
  },
  listWrap: {
    gap: ds.spacing.s8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
});
