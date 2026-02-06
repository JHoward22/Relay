import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { AppHeader } from '@/components/relay/AppHeader';
import { BottomMicBar } from '@/components/relay/BottomMicBar';
import { SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { ListRow } from '@/components/relay/ListRow';
import { SectionTitle } from '@/components/relay/SectionTitle';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function CalendarScreen() {
  const router = useRouter() as any;
  const [selectedDate, setSelectedDate] = useState(isoToday());
  const [relayOpen, setRelayOpen] = useState(false);
  const { state, markInboxDone, snoozeInbox } = useRelayStore();

  const openInbox = useMemo(() => state.inbox.filter((item) => !item.done), [state.inbox]);

  const dayEvents = useMemo(
    () => state.events.filter((event) => event.date === selectedDate),
    [selectedDate, state.events]
  );

  const dayTasks = useMemo(() => {
    if (selectedDate === isoToday()) {
      return state.tasks.filter((task) => task.dueDate.toLowerCase().includes('today'));
    }
    return [];
  }, [selectedDate, state.tasks]);

  const markedDates = useMemo(() => {
    const dates: Record<string, { marked?: boolean; selected?: boolean; selectedColor?: string }> = {
      [selectedDate]: {
        selected: true,
        selectedColor: ds.colors.primary,
      },
    };

    state.events.forEach((event) => {
      if (!dates[event.date]) {
        dates[event.date] = { marked: true };
      } else {
        dates[event.date] = { ...dates[event.date], marked: true };
      }
    });

    return dates;
  }, [selectedDate, state.events]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Calendar"
          subtitle="Month view and daily timeline"
          rightLabel="Add"
          onRightPress={() => router.push('/calendar/create')}
        />

        <GlassCard>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            enableSwipeMonths
            theme={{
              calendarBackground: '#FFFFFF',
              dayTextColor: ds.colors.text,
              monthTextColor: ds.colors.text,
              textDayFontFamily: ds.font,
              textMonthFontFamily: ds.font,
              textDayHeaderFontFamily: ds.font,
              todayTextColor: ds.colors.primary,
              arrowColor: ds.colors.primary,
              textMonthFontWeight: '600',
            }}
            style={styles.calendar}
          />
        </GlassCard>

        <GlassCard>
          <SectionTitle title="Schedule" rightLabel={selectedDate} />

          {dayEvents.map((event) => (
            <View key={event.id} style={styles.rowWrap}>
              <ListRow
                icon="calendar-outline"
                iconTint={ds.colors.primary}
                label={event.title}
                body={`${event.time} · ${event.location ?? 'No location'}`}
                onPress={() => router.push(`/calendar/event/${event.id}`)}
              />
            </View>
          ))}

          {dayTasks.map((task) => (
            <View key={task.id} style={styles.rowWrap}>
              <ListRow
                icon="checkmark-done-outline"
                iconTint={ds.colors.family}
                label={task.title}
                body={task.dueDate}
                onPress={() => router.push(`/tasks/${task.id}`)}
              />
            </View>
          ))}

          {!dayEvents.length && !dayTasks.length ? (
            <Text style={styles.emptyText}>No schedule items for this day.</Text>
          ) : null}

          <SecondaryButton label="Create event" onPress={() => router.push('/calendar/create')} />
        </GlassCard>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <BottomMicBar
        onMicPress={() => setRelayOpen(true)}
        onDone={() => {
          if (openInbox[0]) markInboxDone(openInbox[0].id);
        }}
        onLater={() => {
          if (openInbox[0]) snoozeInbox(openInbox[0].id);
        }}
        onViewAll={() => router.push('/home/inbox')}
      />

      <TalkToRelaySheet visible={relayOpen} onClose={() => setRelayOpen(false)} />
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
    paddingBottom: 270,
    gap: ds.spacing.s12,
  },
  calendar: {
    borderRadius: ds.radius.card,
  },
  rowWrap: {
    marginBottom: ds.spacing.s8,
  },
  emptyText: {
    marginBottom: ds.spacing.s12,
    fontFamily: ds.font,
    fontSize: ds.type.caption.fontSize,
    lineHeight: ds.type.caption.lineHeight,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: ds.spacing.s16,
  },
});
