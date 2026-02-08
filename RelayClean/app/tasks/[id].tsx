import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
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

const DUE_OPTIONS = ['Today', 'Tomorrow', 'Friday', 'Next week'];
const TIME_OPTIONS = ['No time', '9:00 AM', '1:00 PM', '5:00 PM'];

export default function TaskDetailScreen() {
  const router = useRouter() as any;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, addEvent, addTask, toggleTask, updateTask } = useRelayStore();

  const task = useMemo(() => state.tasks.find((entry) => entry.id === id), [id, state.tasks]);
  const linkedEvent = useMemo(() => state.events[0], [state.events]);
  const assignedMember = useMemo(
    () => state.members.find((member) => member.name === task?.assignedTo),
    [state.members, task?.assignedTo]
  );

  const [title, setTitle] = useState(task?.title ?? '');
  const [note, setNote] = useState(task?.note ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ?? 'Tomorrow');
  const [time, setTime] = useState(task?.time ?? 'No time');
  const [priority, setPriority] = useState(task?.priority ?? 'medium');
  const [subtasks, setSubtasks] = useState(task?.subtasks ?? []);
  const [attachments, setAttachments] = useState(task?.attachments ?? []);
  const [subtasksExpanded, setSubtasksExpanded] = useState(true);
  const [dueSheetOpen, setDueSheetOpen] = useState(false);
  const [timeSheetOpen, setTimeSheetOpen] = useState(false);
  const [infoSheet, setInfoSheet] = useState<string | null>(null);
  const [talkOpen, setTalkOpen] = useState(false);

  const completedSubtasks = useMemo(
    () => subtasks.filter((entry) => entry.completed).length,
    [subtasks]
  );

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LiquidBackdrop />
        <View style={styles.center}>
          <Text style={styles.missing}>Task not found.</Text>
          <PrimaryButton label="Back to tasks" onPress={() => router.replace('/tasks')} />
        </View>
      </SafeAreaView>
    );
  }

  const aiInsights = [
    task.recurring ? 'You usually complete this as a recurring routine.' : `You usually do this near ${dueDate}.`,
    task.createdBy === 'voice'
      ? 'This task was captured from voice and can be replayed.'
      : 'Manual edits are enabled and synced across your task views.',
    linkedEvent ? `This task relates to ${linkedEvent.title} in your calendar.` : 'No linked calendar item yet.',
  ];

  const saveTask = async () => {
    await Haptics.selectionAsync();
    updateTask(task.id, {
      title,
      note,
      dueDate,
      time: time === 'No time' ? undefined : time,
      priority: priority === 'low' || priority === 'high' ? priority : 'medium',
      subtasks,
      attachments,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Task Detail" subtitle={task.category} onBack={() => router.back()} />

        <GlassCard blur>
          <SectionHeader title="Task" />
          <View style={styles.topTaskRow}>
            <Pressable
              style={[styles.checkbox, task.completed && styles.checkboxDone]}
              onPress={async () => {
                await Haptics.selectionAsync();
                toggleTask(task.id);
              }}
            >
              {task.completed ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : null}
            </Pressable>

            <FormField
              label="Title"
              value={title}
              onChangeText={setTitle}
              containerStyle={styles.titleField}
            />
          </View>

          <View style={styles.metaRow}>
            <View style={styles.priorityRow}>
              {(['low', 'medium', 'high'] as const).map((value) => {
                const selected = priority === value;
                return (
                  <Pressable
                    key={value}
                    style={[styles.priorityPill, selected && styles.priorityPillSelected]}
                    onPress={() => setPriority(value)}
                  >
                    <Text style={[styles.priorityText, selected && styles.priorityTextSelected]}>
                      {value.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {task.createdBy === 'voice' ? (
              <Pressable style={styles.voiceReplayButton} onPress={() => setInfoSheet('Playing your original voice capture (demo).')}>
                <Ionicons name="play-circle-outline" size={16} color={ds.colors.primary} />
                <Text style={styles.voiceReplayText}>You said...</Text>
              </Pressable>
            ) : null}
          </View>
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Core details" />
          <ListRow variant="compact" label="Due date" rightText={dueDate} onPress={() => setDueSheetOpen(true)} />
          <ListRow variant="compact" label="Time" rightText={time} onPress={() => setTimeSheetOpen(true)} />
          <ListRow variant="compact" label="Category (AI-assigned)" rightText={task.category} />
          <ListRow
            variant="compact"
            label="Related calendar event"
            rightText={linkedEvent?.title ?? 'Add'}
            onPress={() => (linkedEvent ? router.push(`/calendar/event/${linkedEvent.id}`) : router.push('/calendar/create'))}
          />
          <ListRow
            variant="compact"
            label="Related people"
            rightText={task.assignedTo ?? 'Not assigned'}
            onPress={() =>
              assignedMember ? router.push('/family/members') : setInfoSheet('No person assigned yet. Use quick actions to assign.')
            }
          />
          <ListRow
            variant="compact"
            label="Related location"
            rightText={linkedEvent?.location ?? 'Not linked'}
            onPress={() => setInfoSheet(linkedEvent?.location ?? 'No location attached yet.')}
          />
        </GlassCard>

        <GlassCard blur>
          <SectionHeader title="Notes" />
          <FormField label="Notes" value={note} onChangeText={setNote} multiline />
          <SecondaryButton
            label="Add voice note"
            onPress={() =>
              setAttachments((prev) => [
                ...prev,
                {
                  id: `attachment-${Date.now()}`,
                  type: 'voice-note',
                  name: `Voice note ${prev.filter((item) => item.type === 'voice-note').length + 1}`,
                },
              ])
            }
          />
        </GlassCard>

        <GlassCard blur>
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
          <View style={styles.attachmentActions}>
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
        </GlassCard>

        <GlassCard blur>
          <Pressable style={styles.subtasksHeader} onPress={() => setSubtasksExpanded((prev) => !prev)}>
            <Text style={styles.subtasksTitle}>
              {subtasks.length ? `Prepare checklist (${completedSubtasks}/${subtasks.length} complete)` : 'Subtasks'}
            </Text>
            <Ionicons name={subtasksExpanded ? 'chevron-up' : 'chevron-down'} size={16} color={ds.colors.textSoft} />
          </Pressable>

          {subtasksExpanded ? (
            <>
              {subtasks.length ? (
                subtasks.map((subtask) => (
                  <Pressable
                    key={subtask.id}
                    style={styles.subtaskRow}
                    onPress={() =>
                      setSubtasks((prev) =>
                        prev.map((entry) =>
                          entry.id === subtask.id ? { ...entry, completed: !entry.completed } : entry
                        )
                      )
                    }
                  >
                    <View style={[styles.subtaskCheck, subtask.completed && styles.subtaskCheckDone]}>
                      {subtask.completed ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={[styles.subtaskText, subtask.completed && styles.subtaskDone]}>
                      {subtask.title}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.emptyText}>No subtasks yet.</Text>
              )}
              <SecondaryButton
                label="Add subtask"
                onPress={() =>
                  setSubtasks((prev) => [
                    ...prev,
                    { id: `subtask-${Date.now()}`, title: `Subtask ${prev.length + 1}`, completed: false },
                  ])
                }
              />
            </>
          ) : null}
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
          <PrimaryButton label="Reschedule" onPress={() => setDueSheetOpen(true)} />
          <SecondaryButton
            label={task.recurring ? 'Convert to one-time' : 'Convert to recurring'}
            onPress={() =>
              updateTask(task.id, {
                recurring: !task.recurring,
                cadence: task.recurring ? undefined : 'Weekly',
              })
            }
          />
          <SecondaryButton
            label="Break into subtasks"
            onPress={() => {
              if (subtasks.length) return;
              setSubtasks([
                { id: 'auto-subtask-1', title: 'Plan the steps', completed: false },
                { id: 'auto-subtask-2', title: 'Complete first action', completed: false },
                { id: 'auto-subtask-3', title: 'Review and confirm', completed: false },
              ]);
            }}
          />
          <SecondaryButton label="Ask Relay" onPress={() => setTalkOpen(true)} />
          <SecondaryButton
            label="Convert to event"
            onPress={() => {
              addEvent({
                title,
                date: '2026-02-21',
                time: time === 'No time' ? 'No time set' : time,
                location: linkedEvent?.location ?? 'No location set',
                reminder: '1 hour before',
                notes: note,
                repeat: 'None',
              });
              router.push('/calendar');
            }}
          />
          <SecondaryButton
            label="Add follow-up reminder"
            onPress={() => {
              addTask({
                title: `Follow up: ${title}`,
                dueDate: 'Tomorrow',
                priority: 'medium',
                category: 'Follow-up',
                recurring: false,
                note,
                createdBy: 'manual',
              });
              router.push('/tasks');
            }}
          />
        </GlassCard>

        <PrimaryButton
          label="Save changes"
          onPress={async () => {
            await saveTask();
            router.back();
          }}
        />
      </ScrollView>

      <SheetModal visible={dueSheetOpen} onClose={() => setDueSheetOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Pick due date</Text>
          {DUE_OPTIONS.map((option) => (
            <SecondaryButton
              key={option}
              label={option}
              onPress={() => {
                setDueDate(option);
                setDueSheetOpen(false);
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
                setTime(option);
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
  safeArea: {
    flex: 1,
    backgroundColor: ds.colors.bg,
  },
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
  topTaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: ds.spacing.s12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: ds.colors.secondary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: ds.spacing.s24,
  },
  checkboxDone: {
    borderColor: ds.colors.success,
    backgroundColor: ds.colors.success,
  },
  titleField: {
    flex: 1,
  },
  metaRow: {
    marginTop: ds.spacing.s4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  priorityPill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s4,
    backgroundColor: 'rgba(46, 93, 190, 0.08)',
  },
  priorityPillSelected: {
    backgroundColor: 'rgba(46, 93, 190, 0.18)',
  },
  priorityText: {
    fontFamily: ds.font,
    fontSize: 12,
    lineHeight: 16,
    color: ds.colors.textMuted,
    fontWeight: '700',
  },
  priorityTextSelected: {
    color: ds.colors.primary,
  },
  voiceReplayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s4,
  },
  voiceReplayText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  attachmentActions: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  subtasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ds.spacing.s8,
  },
  subtasksTitle: {
    fontFamily: ds.font,
    fontSize: 16,
    lineHeight: 22,
    color: ds.colors.text,
    fontWeight: '700',
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
    marginBottom: ds.spacing.s8,
  },
  subtaskCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: ds.colors.secondary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtaskCheckDone: {
    borderColor: ds.colors.success,
    backgroundColor: ds.colors.success,
  },
  subtaskText: {
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '500',
  },
  subtaskDone: {
    textDecorationLine: 'line-through',
    color: ds.colors.textMuted,
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
