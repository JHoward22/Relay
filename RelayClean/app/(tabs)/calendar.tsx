import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Calendar } from 'react-native-calendars';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { EmptyState } from '@/components/relay/EmptyState';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SheetModal } from '@/components/relay/SheetModal';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { EventItem, useRelayStore } from '@/store/relay-store';

type CalendarView = 'day' | 'week' | 'month';
type ScopeFilter = 'all' | 'personal' | 'family';
type RecurrenceFilter = 'all' | 'recurring' | 'one-time';
type OriginFilter = 'all' | 'voice' | 'manual';

type CalendarFilters = {
  type: 'all' | NonNullable<EventItem['type']>;
  scope: ScopeFilter;
  recurrence: RecurrenceFilter;
  origin: OriginFilter;
};

const RESCHEDULE_OPTIONS = ['Today', 'Tomorrow', 'Next week', 'In 2 weeks'];

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function todayIso() {
  return isoDate(new Date());
}

function addDaysISO(date: string, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

function sameOrAfter(date: string, start: string) {
  return new Date(date).getTime() >= new Date(start).getTime();
}

function sameOrBefore(date: string, end: string) {
  return new Date(date).getTime() <= new Date(end).getTime();
}

function iconForType(type?: EventItem['type']) {
  if (type === 'health') return 'medkit-outline';
  if (type === 'family') return 'people-outline';
  if (type === 'pet') return 'paw-outline';
  if (type === 'meal') return 'restaurant-outline';
  if (type === 'bill') return 'wallet-outline';
  return 'calendar-outline';
}

function contextLine(event: EventItem) {
  if (event.aiContext) return event.aiContext;
  const recurrence = event.repeat && event.repeat !== 'None' ? event.repeat : 'One-time';
  return `${event.type ?? 'General'} • ${recurrence}`;
}

export default function CalendarScreen() {
  const router = useRouter() as any;
  const { state, addEvent, deleteEvent, updateEvent } = useRelayStore();

  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [view, setView] = useState<CalendarView>('month');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickEventId, setQuickEventId] = useState<string | null>(null);
  const [talkOpen, setTalkOpen] = useState(false);
  const [undoEvent, setUndoEvent] = useState<EventItem | null>(null);
  const [filters, setFilters] = useState<CalendarFilters>({
    type: 'all',
    scope: 'all',
    recurrence: 'all',
    origin: 'all',
  });

  const eventTypes = useMemo(() => {
    const values = Array.from(new Set(state.events.map((event) => event.type).filter(Boolean))) as NonNullable<
      EventItem['type']
    >[];
    return ['all', ...values] as const;
  }, [state.events]);

  const filteredEvents = useMemo(() => {
    return state.events.filter((event) => {
      if (filters.type !== 'all' && event.type !== filters.type) return false;
      if (filters.scope === 'family' && !(event.shared || event.assignedTo)) return false;
      if (filters.scope === 'personal' && (event.shared || event.assignedTo)) return false;
      if (filters.recurrence === 'recurring' && (!event.repeat || event.repeat === 'None')) return false;
      if (filters.recurrence === 'one-time' && event.repeat && event.repeat !== 'None') return false;
      if (filters.origin !== 'all' && event.createdBy !== filters.origin) return false;
      return true;
    });
  }, [filters, state.events]);

  const agendaEvents = useMemo(() => {
    if (view === 'day' || view === 'month') {
      return filteredEvents
        .filter((event) => event.date === selectedDate)
        .sort((a, b) => a.time.localeCompare(b.time));
    }

    const weekStart = selectedDate;
    const weekEnd = addDaysISO(selectedDate, 6);
    return filteredEvents
      .filter((event) => sameOrAfter(event.date, weekStart) && sameOrBefore(event.date, weekEnd))
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [filteredEvents, selectedDate, view]);

  const markedDates = useMemo(() => {
    const dates: Record<string, { marked?: boolean; selected?: boolean; selectedColor?: string }> = {
      [selectedDate]: {
        selected: true,
        selectedColor: ds.colors.primary,
      },
    };

    filteredEvents.forEach((event) => {
      if (!dates[event.date]) {
        dates[event.date] = { marked: true };
      } else {
        dates[event.date] = { ...dates[event.date], marked: true };
      }
    });

    return dates;
  }, [filteredEvents, selectedDate]);

  const quickEvent = useMemo(
    () => state.events.find((event) => event.id === quickEventId) ?? null,
    [quickEventId, state.events]
  );

  const monthTitle = useMemo(
    () =>
      new Date(selectedDate).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [selectedDate]
  );

  const jumpToToday = async () => {
    await Haptics.selectionAsync();
    setSelectedDate(todayIso());
  };

  const deleteWithUndo = async (event: EventItem) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteEvent(event.id);
    setUndoEvent(event);
    setQuickEventId(null);
  };

  const restoreDeleted = async () => {
    if (!undoEvent) return;
    await Haptics.selectionAsync();
    addEvent({
      title: undoEvent.title,
      date: undoEvent.date,
      time: undoEvent.time,
      allDay: undoEvent.allDay,
      type: undoEvent.type,
      createdBy: undoEvent.createdBy,
      shared: undoEvent.shared,
      assignedTo: undoEvent.assignedTo,
      color: undoEvent.color,
      linkedTaskIds: undoEvent.linkedTaskIds,
      attachments: undoEvent.attachments,
      aiContext: undoEvent.aiContext,
      location: undoEvent.location,
      reminder: undoEvent.reminder,
      notes: undoEvent.notes,
      repeat: undoEvent.repeat,
    });
    setUndoEvent(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GlassCard blur>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Calendar</Text>
              <Text style={styles.headerSub}>{monthTitle}</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable style={styles.iconButton} onPress={jumpToToday}>
                <Ionicons name="today-outline" size={16} color={ds.colors.textSoft} />
              </Pressable>
              <Pressable style={styles.iconButton} onPress={() => setFiltersOpen(true)}>
                <Ionicons name="options-outline" size={16} color={ds.colors.textSoft} />
              </Pressable>
            </View>
          </View>

          <View style={styles.viewSegmentRow}>
            {(['day', 'week', 'month'] as const).map((item) => {
              const selected = view === item;
              return (
                <Pressable
                  key={item}
                  style={[styles.viewChip, selected && styles.viewChipSelected]}
                  onPress={() => setView(item)}
                >
                  <Text style={[styles.viewChipText, selected && styles.viewChipTextSelected]}>
                    {item[0].toUpperCase()}
                    {item.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </GlassCard>

        <GlassCard style={styles.calendarWrap} blur>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            enableSwipeMonths
            hideExtraDays
            theme={{
              calendarBackground: 'transparent',
              dayTextColor: ds.colors.text,
              monthTextColor: ds.colors.text,
              textDayFontFamily: ds.font,
              textMonthFontFamily: ds.font,
              textDayHeaderFontFamily: ds.font,
              textDayFontWeight: '600',
              todayTextColor: ds.colors.primary,
              arrowColor: ds.colors.primary,
              selectedDayBackgroundColor: ds.colors.primary,
              selectedDayTextColor: '#FFFFFF',
              textMonthFontWeight: '600',
            }}
            style={styles.calendar}
          />
        </GlassCard>

        <GlassCard blur>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>
              {view === 'week' ? `Week timeline · ${selectedDate}` : `Agenda · ${selectedDate}`}
            </Text>
          </View>

          {agendaEvents.length ? (
            agendaEvents.map((event) => (
              <Pressable
                key={event.id}
                style={styles.eventCard}
                onPress={() => router.push(`/calendar/event/${event.id}`)}
                onLongPress={() => setQuickEventId(event.id)}
              >
                <View style={[styles.eventIconWrap, { backgroundColor: `${event.color ?? ds.colors.primary}22` }]}>
                  <Ionicons name={iconForType(event.type)} size={15} color={event.color ?? ds.colors.primary} />
                </View>
                <View style={styles.eventTextWrap}>
                  <Text style={styles.eventTime}>
                    {event.allDay ? 'All day' : event.time} {view === 'week' ? `· ${event.date}` : ''}
                  </Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventContext}>{contextLine(event)}</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState title="Nothing scheduled" body="Try saying “Schedule a…” to let Relay place it for you." />
              <PrimaryButton label="Talk to Relay" onPress={() => setTalkOpen(true)} />
            </View>
          )}
        </GlassCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Pressable style={styles.addFab} onPress={() => router.push('/calendar/create')}>
        <Ionicons name="add" size={22} color="#FFFFFF" />
      </Pressable>

      {undoEvent ? (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>Event removed.</Text>
          <Pressable onPress={restoreDeleted}>
            <Text style={styles.undoAction}>Undo</Text>
          </Pressable>
        </View>
      ) : null}

      <SheetModal visible={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Filter calendar</Text>

          <Text style={styles.sheetLabel}>Event type</Text>
          <View style={styles.filterRow}>
            {eventTypes.map((type) => (
              <Pressable
                key={type}
                style={[styles.filterChip, filters.type === type && styles.filterChipActive]}
                onPress={() => setFilters((prev) => ({ ...prev, type }))}
              >
                <Text style={[styles.filterChipText, filters.type === type && styles.filterChipTextActive]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sheetLabel}>Personal vs Family</Text>
          <View style={styles.filterRow}>
            {(['all', 'personal', 'family'] as const).map((scope) => (
              <Pressable
                key={scope}
                style={[styles.filterChip, filters.scope === scope && styles.filterChipActive]}
                onPress={() => setFilters((prev) => ({ ...prev, scope }))}
              >
                <Text style={[styles.filterChipText, filters.scope === scope && styles.filterChipTextActive]}>
                  {scope}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sheetLabel}>Recurring vs One-time</Text>
          <View style={styles.filterRow}>
            {(['all', 'recurring', 'one-time'] as const).map((recurrence) => (
              <Pressable
                key={recurrence}
                style={[styles.filterChip, filters.recurrence === recurrence && styles.filterChipActive]}
                onPress={() => setFilters((prev) => ({ ...prev, recurrence }))}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filters.recurrence === recurrence && styles.filterChipTextActive,
                  ]}
                >
                  {recurrence}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sheetLabel}>Voice-created vs Manual</Text>
          <View style={styles.filterRow}>
            {(['all', 'voice', 'manual'] as const).map((origin) => (
              <Pressable
                key={origin}
                style={[styles.filterChip, filters.origin === origin && styles.filterChipActive]}
                onPress={() => setFilters((prev) => ({ ...prev, origin }))}
              >
                <Text style={[styles.filterChipText, filters.origin === origin && styles.filterChipTextActive]}>
                  {origin}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sheetButtonRow}>
            <SecondaryButton
              label="Clear"
              onPress={() =>
                setFilters({ type: 'all', scope: 'all', recurrence: 'all', origin: 'all' })
              }
              style={styles.flex}
            />
            <PrimaryButton label="Apply" onPress={() => setFiltersOpen(false)} style={styles.flex} />
          </View>
        </View>
      </SheetModal>

      <SheetModal visible={!!quickEvent} onClose={() => setQuickEventId(null)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Event actions</Text>
          <Text style={styles.quickSubtitle}>{quickEvent?.title ?? ''}</Text>

          <PrimaryButton
            label="Open detail"
            onPress={() => {
              if (!quickEvent) return;
              setQuickEventId(null);
              router.push(`/calendar/event/${quickEvent.id}`);
            }}
          />
          <SecondaryButton
            label="Reschedule"
            onPress={async () => {
              if (!quickEvent) return;
              await Haptics.selectionAsync();
              updateEvent(quickEvent.id, { date: addDaysISO(todayIso(), 1) });
              setQuickEventId(null);
            }}
          />
          <SecondaryButton
            label={quickEvent?.repeat && quickEvent.repeat !== 'None' ? 'Set one-time' : 'Convert to recurring'}
            onPress={() => {
              if (!quickEvent) return;
              updateEvent(quickEvent.id, {
                repeat: quickEvent.repeat && quickEvent.repeat !== 'None' ? 'None' : 'Monthly',
              });
              setQuickEventId(null);
            }}
          />
          <View style={styles.rescheduleOptions}>
            {RESCHEDULE_OPTIONS.map((option) => (
              <SecondaryButton
                key={option}
                label={option}
                onPress={() => {
                  if (!quickEvent) return;
                  const offset = option === 'Today' ? 0 : option === 'Tomorrow' ? 1 : option === 'Next week' ? 7 : 14;
                  updateEvent(quickEvent.id, { date: addDaysISO(todayIso(), offset) });
                  setQuickEventId(null);
                }}
                style={styles.flex}
              />
            ))}
          </View>
          <SecondaryButton
            label="Delete (undo)"
            onPress={() => quickEvent && deleteWithUndo(quickEvent)}
          />
        </View>
      </SheetModal>

      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: 126,
    gap: ds.spacing.s12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: ds.font,
    fontSize: 30,
    lineHeight: 34,
    color: ds.colors.text,
    fontWeight: '700',
  },
  headerSub: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 19,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.84)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewSegmentRow: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  viewChip: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingVertical: ds.spacing.s8,
    alignItems: 'center',
  },
  viewChipSelected: {
    backgroundColor: 'rgba(231, 241, 255, 0.95)',
    borderColor: '#ADC8F8',
  },
  viewChipText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  viewChipTextSelected: {
    color: ds.colors.primary,
  },
  calendarWrap: {
    padding: ds.spacing.s8,
  },
  calendar: {
    borderRadius: 14,
  },
  sectionRow: {
    marginBottom: ds.spacing.s8,
  },
  sectionTitle: {
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '700',
  },
  eventCard: {
    marginBottom: ds.spacing.s8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  eventIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTextWrap: {
    flex: 1,
  },
  eventTime: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  eventTitle: {
    marginTop: 1,
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '700',
  },
  eventContext: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  emptyWrap: {
    gap: ds.spacing.s12,
  },
  addFab: {
    position: 'absolute',
    left: ds.spacing.s16,
    bottom: 116,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: ds.colors.primary,
    borderWidth: 2,
    borderColor: '#D4E4FF',
    alignItems: 'center',
    justifyContent: 'center',
    ...ds.shadow.card,
  },
  undoBar: {
    position: 'absolute',
    left: ds.spacing.s16,
    right: 84,
    bottom: 114,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.95)',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  undoText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textSoft,
    fontWeight: '500',
  },
  undoAction: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  sheetContent: {
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    gap: ds.spacing.s8,
  },
  sheetTitle: {
    fontFamily: ds.font,
    fontSize: 18,
    lineHeight: 24,
    color: ds.colors.text,
    fontWeight: '700',
  },
  sheetLabel: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textSoft,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(231, 241, 255, 0.95)',
    borderColor: '#AFC8F5',
  },
  filterChipText: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: ds.colors.primary,
  },
  sheetButtonRow: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  quickSubtitle: {
    marginBottom: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  rescheduleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  bottomSpacer: {
    height: ds.spacing.s24,
  },
});
