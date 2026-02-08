import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { AppHeader } from '@/components/relay/AppHeader';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { FormField } from '@/components/relay/FormField';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { ListRow } from '@/components/relay/ListRow';
import { SectionHeader } from '@/components/relay/SectionHeader';
import { SheetModal } from '@/components/relay/SheetModal';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { useRelayStore } from '@/store/relay-store';

const DATE_OPTIONS = ['Today', 'Tomorrow', 'Friday', 'Next week'];
const TIME_OPTIONS = ['All day', '9:00 AM', '2:00 PM', '5:30 PM'];
const COLOR_OPTIONS = ['#4B84E8', '#5D83D5', '#55A07D', '#D48A47', '#7C8BC8'];

export default function EventDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, addTask, deleteEvent, updateEvent } = useRelayStore();

  const event = useMemo(() => state.events.find((entry) => entry.id === id), [id, state.events]);
  const linkedTasks = useMemo(() => {
    if (!event) return [];
    return state.tasks.filter(
      (task) =>
        event.linkedTaskIds?.includes(task.id) ||
        task.title.toLowerCase().includes(event.title.toLowerCase()) ||
        task.category.toLowerCase().includes('follow-up')
    );
  }, [event, state.tasks]);

  const [title, setTitle] = useState(event?.title ?? '');
  const [date, setDate] = useState(event?.date ?? '');
  const [time, setTime] = useState(event?.time ?? '');
  const [allDay, setAllDay] = useState(event?.allDay ?? false);
  const [location, setLocation] = useState(event?.location ?? '');
  const [notes, setNotes] = useState(event?.notes ?? '');
  const [repeat, setRepeat] = useState(event?.repeat ?? 'None');
  const [reminder, setReminder] = useState(event?.reminder ?? '1 hour before');
  const [color, setColor] = useState(event?.color ?? '#4B84E8');
  const [attachments, setAttachments] = useState(event?.attachments ?? []);
  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [talkOpen, setTalkOpen] = useState(false);
  const [infoSheet, setInfoSheet] = useState<string | null>(null);

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LiquidBackdrop />
        <View style={styles.center}>
          <Text style={styles.missing}>Event not found.</Text>
          <PrimaryButton label="Back to calendar" onPress={() => router.replace('/calendar')} />
        </View>
      </SafeAreaView>
    );
  }

  const aiInsights = [
    time.toLowerCase().includes('am')
      ? 'You usually schedule this in the morning.'
      : 'Relay noticed this tends to happen later in the day.',
    repeat && repeat !== 'None' ? `This event recurs ${repeat.toLowerCase()}.` : 'This event is currently one-time.',
    reminder ? `You may want a reminder ${reminder.toLowerCase()}.` : 'Relay can suggest reminder timing.',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Event Detail" subtitle={event.type ?? 'general'} onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Event" />
          <FormField label="Title" value={title} onChangeText={setTitle} />

          <View style={styles.metaGrid}>
            <Pressable style={styles.metaCell} onPress={() => setDateSheetOpen(true)}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{date}</Text>
            </Pressable>
            <Pressable style={styles.metaCell} onPress={() => setTimeSheetOpen(true)}>
              <Text style={styles.metaLabel}>Time</Text>
              <Text style={styles.metaValue}>{allDay ? 'All day' : time}</Text>
            </Pressable>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.switchLabel}>All-day event</Text>
            <Switch
              value={allDay}
              onValueChange={setAllDay}
              trackColor={{ false: '#D2D8E6', true: '#AEC6FF' }}
              thumbColor={allDay ? ds.colors.primary : '#FFFFFF'}
            />
          </View>

          <View style={styles.colorRow}>
            <Text style={styles.colorLabel}>Calendar color / type</Text>
            <View style={styles.colorDots}>
              {COLOR_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={[styles.colorDot, { backgroundColor: option }, color === option && styles.colorDotActive]}
                  onPress={() => setColor(option)}
                />
              ))}
            </View>
          </View>
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Details" />
          <FormField label="Location" value={location} onChangeText={setLocation} />
          <Pressable style={styles.mapPreview} onPress={() => setInfoSheet(location || 'No map location set yet.')}>
            <Ionicons name="map-outline" size={18} color={ds.colors.primary} />
            <Text style={styles.mapText}>Map preview</Text>
          </Pressable>

          {state.familyModeEnabled ? (
            <ListRow
              variant="compact"
              label="Related people"
              rightText={event.assignedTo ?? 'Not assigned'}
              onPress={() => router.push('/family')}
            />
          ) : null}

          <FormField label="Notes" value={notes} onChangeText={setNotes} multiline />
          <SecondaryButton
            label="Add voice note"
            onPress={() =>
              setAttachments((prev) => [
                ...prev,
                { id: `voice-${Date.now()}`, type: 'voice-note', name: `Voice note ${prev.length + 1}` },
              ])
            }
          />

          <SectionHeader title="Attachments" />
          {attachments.length ? (
            attachments.map((attachment) => (
              <ListRow
                key={attachment.id}
                variant="compact"
                label={attachment.name}
                rightText={attachment.type}
                onPress={() => setInfoSheet(`${attachment.name} opened (demo).`)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No attachments yet.</Text>
          )}
          <View style={styles.attachmentButtons}>
            <SecondaryButton
              label="Photo"
              onPress={() =>
                setAttachments((prev) => [
                  ...prev,
                  { id: `photo-${Date.now()}`, type: 'photo', name: `Photo ${prev.length + 1}` },
                ])
              }
              style={styles.flex}
            />
            <SecondaryButton
              label="Document"
              onPress={() =>
                setAttachments((prev) => [
                  ...prev,
                  { id: `doc-${Date.now()}`, type: 'document', name: `Document ${prev.length + 1}` },
                ])
              }
              style={styles.flex}
            />
            <SecondaryButton
              label="Link"
              onPress={() =>
                setAttachments((prev) => [
                  ...prev,
                  { id: `link-${Date.now()}`, type: 'link', name: `Link ${prev.length + 1}` },
                ])
              }
              style={styles.flex}
            />
          </View>

          <SectionHeader title="Linked tasks" />
          {linkedTasks.length ? (
            linkedTasks.map((task) => (
              <ListRow
                key={task.id}
                variant="compact"
                label={task.title}
                body={task.dueDate}
                onPress={() => router.push(`/tasks/${task.id}`)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No linked tasks yet.</Text>
          )}
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="AI Insight" />
          {aiInsights.map((insight) => (
            <Text key={insight} style={styles.insightText}>
              • {insight}
            </Text>
          ))}
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Actions" />
          <PrimaryButton label="Edit date/time" onPress={() => setDateSheetOpen(true)} />
          <SecondaryButton
            label={repeat && repeat !== 'None' ? 'Convert to one-time' : 'Convert to recurring'}
            onPress={() => setRepeat(repeat && repeat !== 'None' ? 'None' : 'Every 6 months')}
          />
          <SecondaryButton
            label="Add reminder"
            onPress={() => setReminder(reminder === '1 hour before' ? '1 day before' : '1 hour before')}
          />
          <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />
        </GlassCard>

        <PrimaryButton
          label="Save edits"
          onPress={() => {
            updateEvent(event.id, {
              title,
              date,
              time,
              allDay,
              color,
              location,
              notes,
              reminder,
              repeat,
              attachments,
              aiContext: `${event.type ?? 'General'} • ${repeat && repeat !== 'None' ? repeat : 'One-time'}`,
            });
            router.back();
          }}
        />
        <SecondaryButton
          label="Convert to task"
          onPress={() => {
            addTask({
              title,
              dueDate: `${date} · ${allDay ? 'All day' : time}`,
              priority: 'medium',
              category: 'Event follow-up',
              recurring: false,
              note: notes,
              createdBy: 'manual',
            });
            router.replace('/tasks');
          }}
        />
        <SecondaryButton
          label="Delete event"
          onPress={() => {
            deleteEvent(event.id);
            router.replace('/calendar');
          }}
        />
      </ScrollView>

      <SheetModal visible={dateSheetOpen} onClose={() => setDateSheetOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Pick date</Text>
          {DATE_OPTIONS.map((option) => (
            <SecondaryButton
              key={option}
              label={option}
              onPress={() => {
                setDate(option);
                setDateSheetOpen(false);
              }}
            />
          ))}
        </View>
      </SheetModal>

      <SheetModal visible={timeSheetOpen} onClose={() => setTimeSheetOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Pick time</Text>
          {TIME_OPTIONS.map((option) => (
            <SecondaryButton
              key={option}
              label={option}
              onPress={() => {
                if (option === 'All day') {
                  setAllDay(true);
                  setTime('All day');
                } else {
                  setAllDay(false);
                  setTime(option);
                }
                setTimeSheetOpen(false);
              }}
            />
          ))}
        </View>
      </SheetModal>

      <SheetModal visible={!!infoSheet} onClose={() => setInfoSheet(null)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Relay</Text>
          <Text style={styles.sheetBody}>{infoSheet}</Text>
          <PrimaryButton label="Done" onPress={() => setInfoSheet(null)} />
        </View>
      </SheetModal>

      <TalkToRelaySheet visible={talkOpen} onClose={() => setTalkOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ds.colors.bg },
  content: {
    paddingHorizontal: ds.spacing.s16,
    paddingTop: ds.spacing.s12,
    paddingBottom: ds.spacing.s32,
    gap: ds.spacing.s12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ds.spacing.s16,
    gap: ds.spacing.s12,
  },
  missing: {
    fontFamily: ds.font,
    fontSize: ds.type.body.fontSize,
    lineHeight: ds.type.body.lineHeight,
    color: ds.colors.textMuted,
    textAlign: 'center',
  },
  metaGrid: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
  },
  metaCell: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
  },
  metaLabel: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  metaValue: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '600',
  },
  rowBetween: {
    marginBottom: ds.spacing.s8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textSoft,
    fontWeight: '600',
  },
  colorRow: {
    gap: ds.spacing.s8,
  },
  colorLabel: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textSoft,
    fontWeight: '600',
  },
  colorDots: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  colorDotActive: {
    transform: [{ scale: 1.14 }],
    borderColor: ds.colors.text,
  },
  mapPreview: {
    marginTop: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  mapText: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textSoft,
    fontWeight: '500',
  },
  emptyText: {
    marginBottom: ds.spacing.s8,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  attachmentButtons: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  insightText: {
    marginBottom: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 19,
    color: ds.colors.textMuted,
    fontWeight: '500',
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
  sheetBody: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.textSoft,
    fontWeight: '500',
  },
});
