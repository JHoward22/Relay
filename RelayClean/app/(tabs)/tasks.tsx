import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { BlurView } from 'expo-blur';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { EmptyState } from '@/components/relay/EmptyState';
import { PrimaryButton, SecondaryButton } from '@/components/relay/Buttons';
import { GlassCard } from '@/components/relay/GlassCard';
import { LiquidBackdrop } from '@/components/relay/LiquidBackdrop';
import { SectionTitle } from '@/components/relay/SectionTitle';
import { SheetModal } from '@/components/relay/SheetModal';
import { SwipeTaskRow } from '@/components/relay/SwipeTaskRow';
import { TalkToRelaySheet } from '@/components/relay/TalkToRelaySheet';
import { ds } from '@/constants/design-system';
import { TaskItem, useRelayStore } from '@/store/relay-store';

type TaskSegment = 'today' | 'upcoming' | 'recurring' | 'all';
type DueFilter = 'all' | 'today' | 'upcoming' | 'overdue';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';
type CreatedByFilter = 'all' | 'voice' | 'manual';

type TaskFilters = {
  due: DueFilter;
  priority: PriorityFilter;
  category: string;
  createdBy: CreatedByFilter;
  assignedTo: string;
};

type QuickMode = 'menu' | 'reschedule' | 'assign';

const SEGMENTS: TaskSegment[] = ['today', 'upcoming', 'recurring', 'all'];
const DUE_OPTIONS: DueFilter[] = ['all', 'today', 'upcoming', 'overdue'];
const PRIORITY_OPTIONS: PriorityFilter[] = ['all', 'low', 'medium', 'high'];
const CREATED_OPTIONS: CreatedByFilter[] = ['all', 'voice', 'manual'];
const RESCHEDULE_OPTIONS = ['Today', 'Tomorrow', 'Next week', 'In 2 weeks'];

function isTodayLabel(label: string) {
  return label.toLowerCase().includes('today');
}

function isOverdue(task: TaskItem) {
  const lower = task.dueDate.toLowerCase();
  if (lower.includes('overdue') || lower.includes('yesterday')) return true;
  if (/^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)) {
    const due = new Date(task.dueDate);
    const now = new Date();
    due.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return due.getTime() < now.getTime();
  }
  return false;
}

function contextLine(task: TaskItem) {
  const priority = `${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`;
  return `${task.dueDate} • ${task.category} • ${priority}`;
}

function normalize(text: string) {
  return text.trim().toLowerCase();
}

export default function TasksScreen() {
  const router = useRouter() as any;
  const { state, addTask, deleteTask, toggleTask, updateTask } = useRelayStore();
  const scrollY = useSharedValue(0);

  const [segment, setSegment] = useState<TaskSegment>('today');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    due: 'all',
    priority: 'all',
    category: 'all',
    createdBy: 'all',
    assignedTo: 'all',
  });
  const [quickTaskId, setQuickTaskId] = useState<string | null>(null);
  const [quickMode, setQuickMode] = useState<QuickMode>('menu');
  const [talkOpen, setTalkOpen] = useState(false);
  const [collapsingIds, setCollapsingIds] = useState<string[]>([]);
  const [undoTask, setUndoTask] = useState<TaskItem | null>(null);

  const activeTasks = useMemo(
    () => state.tasks.filter((task) => !task.archived),
    [state.tasks]
  );
  const archivedTasks = useMemo(
    () => state.tasks.filter((task) => task.archived),
    [state.tasks]
  );
  const todayRemaining = useMemo(
    () => activeTasks.filter((task) => isTodayLabel(task.dueDate)).length,
    [activeTasks]
  );

  const categories = useMemo(() => {
    const values = Array.from(new Set(activeTasks.map((task) => task.category))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ['all', ...values];
  }, [activeTasks]);

  const segmentedTasks = useMemo(() => {
    if (segment === 'today') return activeTasks.filter((task) => isTodayLabel(task.dueDate));
    if (segment === 'upcoming') {
      return activeTasks.filter((task) => !isTodayLabel(task.dueDate) && !task.recurring);
    }
    if (segment === 'recurring') return activeTasks.filter((task) => task.recurring);
    return activeTasks;
  }, [activeTasks, segment]);

  const filteredTasks = useMemo(() => {
    const searchTerm = normalize(query);

    return segmentedTasks.filter((task) => {
      if (collapsingIds.includes(task.id)) return false;

      if (filters.due === 'today' && !isTodayLabel(task.dueDate)) return false;
      if (filters.due === 'upcoming' && isTodayLabel(task.dueDate)) return false;
      if (filters.due === 'overdue' && !isOverdue(task)) return false;

      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.category !== 'all' && task.category !== filters.category) return false;
      if (filters.createdBy !== 'all' && task.createdBy !== filters.createdBy) return false;
      if (filters.assignedTo !== 'all' && task.assignedTo !== filters.assignedTo) return false;

      if (!searchTerm) return true;

      const haystack = `${task.title} ${task.note ?? ''} ${task.category} ${task.aiContext ?? ''}`.toLowerCase();
      return haystack.includes(searchTerm);
    });
  }, [collapsingIds, filters, query, segmentedTasks]);

  const quickTask = useMemo(
    () => state.tasks.find((task) => task.id === quickTaskId) ?? null,
    [quickTaskId, state.tasks]
  );

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(-8, -scrollY.value * 0.06) }],
  }));

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  useEffect(() => {
    if (!undoTask) return;
    const timeout = setTimeout(() => setUndoTask(null), 6000);
    return () => clearTimeout(timeout);
  }, [undoTask]);

  const completeTask = async (taskId: string) => {
    await Haptics.selectionAsync();
    setCollapsingIds((prev) => [...prev, taskId]);
    setTimeout(() => {
      toggleTask(taskId);
      setCollapsingIds((prev) => prev.filter((id) => id !== taskId));
    }, 220);
  };

  const deleteTaskWithUndo = async (task: TaskItem) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteTask(task.id);
    setUndoTask(task);
    setQuickTaskId(null);
  };

  const undoDelete = async () => {
    if (!undoTask) return;
    await Haptics.selectionAsync();
    addTask({
      title: undoTask.title,
      dueDate: undoTask.dueDate,
      time: undoTask.time,
      priority: undoTask.priority,
      category: undoTask.category,
      assignedTo: undoTask.assignedTo,
      recurring: undoTask.recurring,
      cadence: undoTask.cadence,
      note: undoTask.note,
      createdBy: undoTask.createdBy,
      aiContext: undoTask.aiContext,
      subtasks: undoTask.subtasks,
      attachments: undoTask.attachments,
    });
    setUndoTask(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LiquidBackdrop />
      <View pointerEvents="none" style={styles.paperLines}>
        {Array.from({ length: 20 }).map((_, index) => (
          <View key={index} style={styles.paperLine} />
        ))}
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        stickyHeaderIndices={[2]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.headerCardWrap, headerAnimatedStyle]}>
          <GlassCard blur>
            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle}>Tasks</Text>
                <Text style={styles.headerSub}>Today • {todayRemaining} remaining</Text>
              </View>

              <View style={styles.headerIcons}>
                <Pressable style={styles.headerIconButton} onPress={() => setFilterOpen(true)}>
                  <Ionicons name="options-outline" size={16} color={ds.colors.textSoft} />
                </Pressable>
                <Pressable style={styles.headerIconButton} onPress={() => setSearchOpen((prev) => !prev)}>
                  <Ionicons name="search-outline" size={16} color={ds.colors.textSoft} />
                </Pressable>
              </View>
            </View>

            <View style={styles.voicePromptRow}>
              <Text style={styles.voicePromptText}>Try saying “Remind me to...”</Text>
              <Pressable style={styles.voicePromptButton} onPress={() => setTalkOpen(true)}>
                <Ionicons name="sparkles-outline" size={14} color={ds.colors.primary} />
                <Text style={styles.voicePromptButtonText}>Ask Relay</Text>
              </Pressable>
            </View>
          </GlassCard>
        </Animated.View>

        <View style={styles.searchWrap}>
          {searchOpen ? (
            <View style={styles.searchField}>
              <Ionicons name="search-outline" size={15} color={ds.colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search tasks, notes, and AI context"
                placeholderTextColor={ds.colors.textMuted}
                style={styles.searchInput}
                autoFocus
              />
              <Pressable onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color={ds.colors.secondary} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.archiveLink} onPress={() => router.push('/tasks/archive')}>
              <Text style={styles.archiveLinkText}>Archive • {archivedTasks.length}</Text>
              <Ionicons name="chevron-forward" size={14} color={ds.colors.primary} />
            </Pressable>
          )}
        </View>

        <View style={styles.segmentStickyWrap}>
          <BlurView intensity={32} tint="light" style={styles.segmentBlur}>
            <View style={styles.segmentRow}>
              {SEGMENTS.map((item) => {
                const selected = segment === item;
                return (
                  <Pressable
                    key={item}
                    style={[styles.segmentChip, selected && styles.segmentChipActive]}
                    onPress={() => setSegment(item)}
                  >
                    <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>
                      {item[0].toUpperCase()}
                      {item.slice(1)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </BlurView>
        </View>

        <GlassCard blur>
          <SectionTitle title={`${segment[0].toUpperCase()}${segment.slice(1)} tasks`} />

          {filteredTasks.length ? (
            filteredTasks.map((task) => (
              <SwipeTaskRow
                key={task.id}
                task={task}
                contextLine={contextLine(task)}
                overdue={isOverdue(task)}
                onPress={() => router.push(`/tasks/${task.id}`)}
                onLongPress={() => {
                  setQuickMode('menu');
                  setQuickTaskId(task.id);
                }}
                onComplete={() => completeTask(task.id)}
                onMore={() => {
                  setQuickMode('menu');
                  setQuickTaskId(task.id);
                }}
              />
            ))
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState
                title="Nothing to do right now"
                body="Try saying “Remind me to…” and Relay will organize it for you."
              />
              <PrimaryButton label="Talk to Relay" onPress={() => setTalkOpen(true)} />
            </View>
          )}
        </GlassCard>

        <View style={styles.bottomSpacer} />
      </Animated.ScrollView>

      <Pressable style={styles.addFab} onPress={() => router.push('/tasks/create')}>
        <Ionicons name="add" size={22} color="#FFFFFF" />
      </Pressable>

      {undoTask ? (
        <View style={styles.undoBar}>
          <Text style={styles.undoText}>Task deleted.</Text>
          <Pressable onPress={undoDelete}>
            <Text style={styles.undoButton}>Undo</Text>
          </Pressable>
        </View>
      ) : null}

      <SheetModal
        visible={!!quickTask}
        onClose={() => {
          setQuickTaskId(null);
          setQuickMode('menu');
        }}
      >
        <View style={styles.sheetContent}>
          {quickMode === 'menu' && quickTask ? (
            <>
              <Text style={styles.sheetTitle}>Quick actions</Text>
              <Text style={styles.sheetSubtitle}>{quickTask.title}</Text>

              <PrimaryButton
                label="Mark complete"
                onPress={() => {
                  completeTask(quickTask.id);
                  setQuickTaskId(null);
                }}
              />
              <SecondaryButton label="Reschedule" onPress={() => setQuickMode('reschedule')} />
              <SecondaryButton
                label="Assign to person"
                onPress={() => setQuickMode('assign')}
              />
              <SecondaryButton
                label={quickTask.recurring ? 'Set one-time' : 'Convert to recurring'}
                onPress={() => {
                  updateTask(quickTask.id, {
                    recurring: !quickTask.recurring,
                    cadence: quickTask.recurring ? undefined : 'Weekly',
                  });
                  setQuickTaskId(null);
                }}
              />
              <SecondaryButton label="Delete" onPress={() => deleteTaskWithUndo(quickTask)} />
            </>
          ) : null}

          {quickMode === 'reschedule' && quickTask ? (
            <>
              <Text style={styles.sheetTitle}>Reschedule</Text>
              <Text style={styles.sheetSubtitle}>Choose a new timing for this task</Text>
              {RESCHEDULE_OPTIONS.map((option) => (
                <SecondaryButton
                  key={option}
                  label={option}
                  onPress={() => {
                    updateTask(quickTask.id, { dueDate: option });
                    setQuickTaskId(null);
                    setQuickMode('menu');
                  }}
                />
              ))}
              <SecondaryButton label="Back" onPress={() => setQuickMode('menu')} />
            </>
          ) : null}

          {quickMode === 'assign' && quickTask ? (
            <>
              <Text style={styles.sheetTitle}>Assign to person</Text>
              {state.familyModeEnabled ? (
                <>
                  {state.members.map((member) => (
                    <SecondaryButton
                      key={member.id}
                      label={member.name}
                      onPress={() => {
                        updateTask(quickTask.id, { assignedTo: member.name });
                        setQuickTaskId(null);
                        setQuickMode('menu');
                      }}
                    />
                  ))}
                </>
              ) : (
                <>
                  <Text style={styles.sheetSubtitle}>Enable Family mode in Settings to assign tasks.</Text>
                  <PrimaryButton
                    label="Open Settings"
                    onPress={() => {
                      setQuickTaskId(null);
                      setQuickMode('menu');
                      router.push('/settings');
                    }}
                  />
                </>
              )}
              <SecondaryButton label="Back" onPress={() => setQuickMode('menu')} />
            </>
          ) : null}
        </View>
      </SheetModal>

      <SheetModal visible={filterOpen} onClose={() => setFilterOpen(false)}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Filter tasks</Text>

          <Text style={styles.filterLabel}>Due date</Text>
          <View style={styles.filterChips}>
            {DUE_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={[styles.filterChip, filters.due === option && styles.filterChipActive]}
                onPress={() => setFilters((prev) => ({ ...prev, due: option }))}
              >
                <Text style={[styles.filterChipText, filters.due === option && styles.filterChipTextActive]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterLabel}>Priority</Text>
          <View style={styles.filterChips}>
            {PRIORITY_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={[styles.filterChip, filters.priority === option && styles.filterChipActive]}
                onPress={() => setFilters((prev) => ({ ...prev, priority: option }))}
              >
                <Text
                  style={[styles.filterChipText, filters.priority === option && styles.filterChipTextActive]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterLabel}>Created by</Text>
          <View style={styles.filterChips}>
            {CREATED_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={[styles.filterChip, filters.createdBy === option && styles.filterChipActive]}
                onPress={() => setFilters((prev) => ({ ...prev, createdBy: option }))}
              >
                <Text
                  style={[styles.filterChipText, filters.createdBy === option && styles.filterChipTextActive]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.filterLabel}>Category</Text>
          <View style={styles.filterChips}>
            {categories.map((option) => (
              <Pressable
                key={option}
                style={[styles.filterChip, filters.category === option && styles.filterChipActive]}
                onPress={() => setFilters((prev) => ({ ...prev, category: option }))}
              >
                <Text
                  style={[styles.filterChipText, filters.category === option && styles.filterChipTextActive]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          {state.familyModeEnabled ? (
            <>
              <Text style={styles.filterLabel}>Assigned person</Text>
              <View style={styles.filterChips}>
                <Pressable
                  style={[styles.filterChip, filters.assignedTo === 'all' && styles.filterChipActive]}
                  onPress={() => setFilters((prev) => ({ ...prev, assignedTo: 'all' }))}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.assignedTo === 'all' && styles.filterChipTextActive,
                    ]}
                  >
                    all
                  </Text>
                </Pressable>
                {state.members.map((member) => (
                  <Pressable
                    key={member.id}
                    style={[styles.filterChip, filters.assignedTo === member.name && styles.filterChipActive]}
                    onPress={() => setFilters((prev) => ({ ...prev, assignedTo: member.name }))}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        filters.assignedTo === member.name && styles.filterChipTextActive,
                      ]}
                    >
                      {member.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.filterButtonRow}>
            <SecondaryButton
              label="Clear"
              onPress={() =>
                setFilters({
                  due: 'all',
                  priority: 'all',
                  category: 'all',
                  createdBy: 'all',
                  assignedTo: 'all',
                })
              }
              style={styles.flex}
            />
            <PrimaryButton label="Apply" onPress={() => setFilterOpen(false)} style={styles.flex} />
          </View>
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
    paddingBottom: 132,
  },
  paperLines: {
    ...StyleSheet.absoluteFillObject,
    top: 120,
    opacity: 0.18,
    gap: 28,
  },
  paperLine: {
    height: 1,
    backgroundColor: '#D6E4FB',
    marginHorizontal: ds.spacing.s16,
  },
  headerCardWrap: {
    marginBottom: ds.spacing.s8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: ds.spacing.s8,
  },
  headerTextWrap: {
    flex: 1,
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
  headerIcons: {
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePromptRow: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.78)',
    paddingHorizontal: ds.spacing.s12,
    paddingVertical: ds.spacing.s8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voicePromptText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  voicePromptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s4,
  },
  voicePromptButtonText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '700',
  },
  searchWrap: {
    minHeight: 38,
    marginBottom: ds.spacing.s8,
    justifyContent: 'center',
  },
  searchField: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.86)',
    paddingHorizontal: ds.spacing.s12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s8,
  },
  searchInput: {
    flex: 1,
    fontFamily: ds.font,
    fontSize: 14,
    lineHeight: 20,
    color: ds.colors.text,
    fontWeight: '500',
  },
  archiveLink: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: ds.spacing.s4,
  },
  archiveLinkText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.primary,
    fontWeight: '600',
  },
  segmentStickyWrap: {
    marginBottom: ds.spacing.s12,
  },
  segmentBlur: {
    borderRadius: 13,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(214, 225, 245, 0.9)',
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  segmentRow: {
    flexDirection: 'row',
    padding: ds.spacing.s4,
    gap: ds.spacing.s4,
  },
  segmentChip: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: ds.spacing.s8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentChipActive: {
    backgroundColor: 'rgba(228, 239, 255, 0.95)',
  },
  segmentText: {
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: ds.colors.primary,
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
  undoButton: {
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
  sheetSubtitle: {
    marginBottom: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textMuted,
    fontWeight: '500',
  },
  filterLabel: {
    marginTop: ds.spacing.s4,
    fontFamily: ds.font,
    fontSize: 13,
    lineHeight: 18,
    color: ds.colors.textSoft,
    fontWeight: '700',
  },
  filterChips: {
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
  filterButtonRow: {
    marginTop: ds.spacing.s8,
    flexDirection: 'row',
    gap: ds.spacing.s8,
  },
  flex: {
    flex: 1,
  },
  bottomSpacer: {
    height: ds.spacing.s32,
  },
});
