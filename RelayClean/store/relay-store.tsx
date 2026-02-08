import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { emitAIMemoryEvent } from '@/store/ai-memory-events';

export type InboxFilter = 'today' | 'waiting' | 'upcoming';
export type RelayEntityType = 'task' | 'reminder' | 'event' | 'message' | 'recurring';

export type InboxItem = {
  id: string;
  title: string;
  subtitle: string;
  type: RelayEntityType;
  filter: InboxFilter;
  note?: string;
  done: boolean;
  sourceId?: string;
  sourceType?: 'task' | 'event';
};

export type TaskItem = {
  id: string;
  title: string;
  dueDate: string;
  time?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  assignedTo?: string;
  createdBy: 'voice' | 'manual';
  aiContext?: string;
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  attachments?: {
    id: string;
    type: 'photo' | 'document' | 'link' | 'voice-note';
    name: string;
    uri?: string;
  }[];
  completed: boolean;
  archived: boolean;
  recurring: boolean;
  cadence?: string;
  note?: string;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  allDay?: boolean;
  type?: 'health' | 'family' | 'pet' | 'meal' | 'bill' | 'general';
  createdBy?: 'voice' | 'manual';
  shared?: boolean;
  assignedTo?: string;
  color?: string;
  linkedTaskIds?: string[];
  attachments?: {
    id: string;
    type: 'photo' | 'document' | 'link' | 'voice-note';
    name: string;
  }[];
  aiContext?: string;
  location?: string;
  reminder?: string;
  notes?: string;
  repeat?: string;
};

export type FamilyMember = {
  id: string;
  name: string;
  role: string;
};

export type RelayDraftItem = {
  id: string;
  title: string;
  type: 'task' | 'reminder' | 'event' | 'message';
  dueLabel: string;
};

type NewTaskPayload = Omit<
  TaskItem,
  'id' | 'completed' | 'archived' | 'createdBy' | 'category'
> & {
  createdBy?: 'voice' | 'manual';
  category?: string;
};

type RelayState = {
  inbox: InboxItem[];
  tasks: TaskItem[];
  events: EventItem[];
  members: FamilyMember[];
  familyModeEnabled: boolean;
  aiSettings: {
    smartSuggestions: boolean;
    learningFromActivity: boolean;
    proactiveReminders: boolean;
  };
  notificationSettings: {
    nudgeEnabled: boolean;
    recapTime: string;
    quietHours: boolean;
  };
};

const initialState: RelayState = {
  inbox: [
    {
      id: 'i1',
      title: "Reply to Emma's teacher",
      subtitle: 'Waiting 2 days',
      type: 'message',
      filter: 'waiting',
      done: false,
      note: 'Follow-up needed by Friday.',
    },
    {
      id: 'i2',
      title: 'Annual Physical at 2:00 PM',
      subtitle: 'Health appointment',
      type: 'event',
      filter: 'today',
      done: false,
      sourceId: 'e1',
      sourceType: 'event',
    },
    {
      id: 'i3',
      title: 'Pick up Emily from soccer practice',
      subtitle: 'Today · 5:00 PM',
      type: 'task',
      filter: 'today',
      done: false,
      sourceId: 't3',
      sourceType: 'task',
    },
    {
      id: 'i4',
      title: 'Feed the dog',
      subtitle: 'Today · 7:00 PM',
      type: 'recurring',
      filter: 'today',
      done: false,
      sourceId: 't4',
      sourceType: 'task',
    },
  ],
  tasks: [
    {
      id: 't1',
      title: 'Call the vet',
      dueDate: 'Today',
      priority: 'medium',
      category: 'Health',
      createdBy: 'manual',
      aiContext: 'Relay grouped this under Pet care follow-up',
      completed: false,
      archived: false,
      recurring: false,
      note: 'Ask about flea treatment.',
    },
    {
      id: 't2',
      title: 'Take vitamins',
      dueDate: 'Today · Evening',
      priority: 'low',
      category: 'Personal',
      createdBy: 'voice',
      aiContext: 'Built from your nightly wellness routine',
      completed: false,
      archived: false,
      recurring: true,
      cadence: 'Daily',
    },
    {
      id: 't3',
      title: 'Pick up Emily from soccer practice',
      dueDate: 'Today · 5:00 PM',
      priority: 'high',
      category: 'Family',
      assignedTo: 'Michael',
      createdBy: 'voice',
      aiContext: 'Linked to school calendar pickup window',
      completed: false,
      archived: false,
      recurring: false,
      subtasks: [
        { id: 'st31', title: 'Bring permission slip', completed: true },
        { id: 'st32', title: 'Leave by 4:10 PM', completed: false },
      ],
    },
    {
      id: 't4',
      title: 'Feed the dog',
      dueDate: 'Today · 7:00 PM',
      priority: 'medium',
      category: 'Family',
      assignedTo: 'Buddy',
      createdBy: 'manual',
      aiContext: 'Recurring pet care routine',
      completed: false,
      archived: false,
      recurring: true,
      cadence: 'Daily',
    },
  ],
  events: [
    {
      id: 'e1',
      title: 'Annual Physical',
      date: '2026-10-12',
      time: '2:00 PM',
      type: 'health',
      createdBy: 'manual',
      shared: false,
      color: '#4B84E8',
      aiContext: 'Health • Recurring every 6 months',
      location: '1234 Health St, Suite 200',
      reminder: '2 hours before',
      notes: 'Bring insurance card.',
      repeat: 'Every 6 months',
    },
    {
      id: 'e2',
      title: 'School Pickup',
      date: '2026-02-10',
      time: '4:30 PM',
      type: 'family',
      createdBy: 'voice',
      shared: true,
      assignedTo: 'Michael',
      color: '#5D83D5',
      aiContext: 'Family • Weekday recurring routine',
      location: 'West Entrance',
      reminder: '30 min before',
      repeat: 'Weekdays',
    },
  ],
  members: [
    { id: 'm1', name: 'Michael', role: 'Partner' },
    { id: 'm2', name: 'Amy', role: 'Child' },
    { id: 'm3', name: 'Buddy', role: 'Pet' },
  ],
  familyModeEnabled: true,
  aiSettings: {
    smartSuggestions: true,
    learningFromActivity: true,
    proactiveReminders: true,
  },
  notificationSettings: {
    nudgeEnabled: true,
    recapTime: '7:30 PM',
    quietHours: false,
  },
};

type RelayAction =
  | { type: 'ADD_TASK'; payload: NewTaskPayload }
  | { type: 'UPDATE_TASK'; id: string; payload: Partial<TaskItem> }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'DELETE_TASK'; id: string }
  | { type: 'ADD_EVENT'; payload: Omit<EventItem, 'id'> }
  | { type: 'UPDATE_EVENT'; id: string; payload: Partial<EventItem> }
  | { type: 'DELETE_EVENT'; id: string }
  | { type: 'MARK_INBOX_DONE'; id: string }
  | { type: 'SNOOZE_INBOX'; id: string }
  | { type: 'UPDATE_INBOX'; id: string; payload: Partial<InboxItem> }
  | { type: 'ADD_MEMBER'; payload: Omit<FamilyMember, 'id'> }
  | { type: 'SET_FAMILY_MODE'; enabled: boolean }
  | { type: 'UPDATE_AI_SETTINGS'; payload: Partial<RelayState['aiSettings']> }
  | {
      type: 'UPDATE_NOTIFICATION_SETTINGS';
      payload: Partial<RelayState['notificationSettings']>;
    }
  | { type: 'ADD_FROM_RELAY'; payload: RelayDraftItem[] };

let idCount = 100;
const createId = (prefix: string) => {
  idCount += 1;
  return `${prefix}-${idCount}`;
};

function asInboxFilter(label: string): InboxFilter {
  const lower = label.toLowerCase();
  if (lower.includes('waiting')) return 'waiting';
  if (lower.includes('today')) return 'today';
  return 'upcoming';
}

function inferCategoryFromTitle(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes('shop') || lower.includes('grocery') || lower.includes('buy')) return 'Shopping';
  if (lower.includes('chore') || lower.includes('clean') || lower.includes('laundry')) return 'Chore';
  if (lower.includes('pet') || lower.includes('dog') || lower.includes('vet')) return 'Pet care';
  if (lower.includes('pack') || lower.includes('trip') || lower.includes('travel')) return 'Packing';
  if (lower.includes('errand') || lower.includes('pickup') || lower.includes('drop off')) return 'Errand';
  if (lower.includes('follow') || lower.includes('reply') || lower.includes('message')) return 'Follow-up';
  if (lower.includes('remind') || lower.includes('vitamin') || lower.includes('med')) return 'Reminder';
  return 'General';
}

function inferAiContext(task: Pick<TaskItem, 'title' | 'dueDate' | 'priority'>) {
  const cadenceHint = task.dueDate.toLowerCase().includes('today') ? 'Focus on this today' : 'Planned for later';
  return `${cadenceHint} • ${task.priority[0].toUpperCase()}${task.priority.slice(1)} priority`;
}

function inferEventType(title: string): NonNullable<EventItem['type']> {
  const lower = title.toLowerCase();
  if (lower.includes('dentist') || lower.includes('doctor') || lower.includes('physical') || lower.includes('vet')) return 'health';
  if (lower.includes('pickup') || lower.includes('school') || lower.includes('family')) return 'family';
  if (lower.includes('pet') || lower.includes('groom')) return 'pet';
  if (lower.includes('meal') || lower.includes('dinner')) return 'meal';
  if (lower.includes('bill') || lower.includes('payment')) return 'bill';
  return 'general';
}

function inferEventContext(event: Pick<EventItem, 'title' | 'repeat' | 'type'>) {
  const label = event.type ? event.type[0].toUpperCase() + event.type.slice(1) : 'General';
  if (event.repeat && event.repeat !== 'None') return `${label} • ${event.repeat}`;
  return `${label} • One-time`;
}

function eventColorForType(type: NonNullable<EventItem['type']>) {
  if (type === 'health') return '#4B84E8';
  if (type === 'family') return '#5D83D5';
  if (type === 'pet') return '#55A07D';
  if (type === 'meal') return '#D48A47';
  if (type === 'bill') return '#7C8BC8';
  return '#4B84E8';
}

function reducer(state: RelayState, action: RelayAction): RelayState {
  switch (action.type) {
    case 'ADD_TASK': {
      const inferredCategory = action.payload.category || inferCategoryFromTitle(action.payload.title);
      const task: TaskItem = {
        ...action.payload,
        id: createId('t'),
        category: inferredCategory,
        createdBy: action.payload.createdBy ?? 'manual',
        aiContext:
          action.payload.aiContext ??
          inferAiContext({
            title: action.payload.title,
            dueDate: action.payload.dueDate,
            priority: action.payload.priority,
          }),
        completed: false,
        archived: false,
      };
      const inbox: InboxItem = {
        id: createId('i'),
        title: task.title,
        subtitle: task.dueDate,
        type:
          task.recurring
            ? 'recurring'
            : task.category.toLowerCase().includes('health') || task.category.toLowerCase().includes('reminder')
              ? 'reminder'
              : 'task',
        filter: asInboxFilter(task.dueDate),
        done: false,
        sourceId: task.id,
        sourceType: 'task',
      };
      return {
        ...state,
        tasks: [task, ...state.tasks],
        inbox: [inbox, ...state.inbox],
      };
    }
    case 'UPDATE_TASK': {
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, ...action.payload } : task
        ),
      };
    }
    case 'TOGGLE_TASK': {
      let toggledComplete = false;
      const updatedTasks = state.tasks.map((task) => {
        if (task.id !== action.id) return task;
        toggledComplete = !task.completed;
        return { ...task, completed: !task.completed, archived: !task.completed };
      });
      return {
        ...state,
        tasks: updatedTasks,
        inbox: state.inbox.map((item) =>
          item.sourceType === 'task' && item.sourceId === action.id
            ? { ...item, done: toggledComplete ? true : false }
            : item
        ),
      };
    }
    case 'DELETE_TASK': {
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.id),
        inbox: state.inbox.filter(
          (item) => !(item.sourceType === 'task' && item.sourceId === action.id)
        ),
      };
    }
    case 'ADD_EVENT': {
      const type = action.payload.type ?? inferEventType(action.payload.title);
      const event: EventItem = {
        ...action.payload,
        id: createId('e'),
        type,
        createdBy: action.payload.createdBy ?? 'manual',
        shared: action.payload.shared ?? false,
        color: action.payload.color ?? eventColorForType(type),
        repeat: action.payload.repeat ?? 'None',
        aiContext:
          action.payload.aiContext ??
          inferEventContext({
            title: action.payload.title,
            repeat: action.payload.repeat ?? 'None',
            type,
          }),
      };
      const inbox: InboxItem = {
        id: createId('i'),
        title: event.title,
        subtitle: `${event.date} · ${event.time}`,
        type: 'event',
        filter: 'upcoming',
        done: false,
        sourceId: event.id,
        sourceType: 'event',
      };
      return {
        ...state,
        events: [event, ...state.events],
        inbox: [inbox, ...state.inbox],
      };
    }
    case 'UPDATE_EVENT': {
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.id ? { ...event, ...action.payload } : event
        ),
      };
    }
    case 'DELETE_EVENT': {
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.id),
        inbox: state.inbox.filter(
          (item) => !(item.sourceType === 'event' && item.sourceId === action.id)
        ),
      };
    }
    case 'MARK_INBOX_DONE': {
      return {
        ...state,
        inbox: state.inbox.map((item) =>
          item.id === action.id ? { ...item, done: true, filter: 'upcoming' } : item
        ),
      };
    }
    case 'SNOOZE_INBOX': {
      return {
        ...state,
        inbox: state.inbox.map((item) =>
          item.id === action.id
            ? { ...item, subtitle: `Snoozed · ${item.subtitle}`, filter: 'upcoming' }
            : item
        ),
      };
    }
    case 'UPDATE_INBOX': {
      return {
        ...state,
        inbox: state.inbox.map((item) =>
          item.id === action.id ? { ...item, ...action.payload } : item
        ),
      };
    }
    case 'ADD_MEMBER': {
      const member: FamilyMember = {
        ...action.payload,
        id: createId('m'),
      };
      return {
        ...state,
        members: [...state.members, member],
      };
    }
    case 'SET_FAMILY_MODE': {
      return {
        ...state,
        familyModeEnabled: action.enabled,
      };
    }
    case 'UPDATE_AI_SETTINGS': {
      return {
        ...state,
        aiSettings: {
          ...state.aiSettings,
          ...action.payload,
        },
      };
    }
    case 'UPDATE_NOTIFICATION_SETTINGS': {
      return {
        ...state,
        notificationSettings: {
          ...state.notificationSettings,
          ...action.payload,
        },
      };
    }
    case 'ADD_FROM_RELAY': {
      const nextState = action.payload.reduce((acc, item) => {
        if (item.type === 'event') {
          const eventId = createId('e');
          const type = inferEventType(item.title);
          const event: EventItem = {
            id: eventId,
            title: item.title,
            date: '2026-02-15',
            time: item.dueLabel,
            type,
            createdBy: 'voice',
            color: eventColorForType(type),
            repeat: 'None',
            aiContext: inferEventContext({ title: item.title, repeat: 'None', type }),
            location: 'No location set',
            reminder: '1 hour before',
          };
          const inbox: InboxItem = {
            id: createId('i'),
            title: item.title,
            subtitle: item.dueLabel,
            type: 'event',
            filter: asInboxFilter(item.dueLabel),
            done: false,
            sourceId: event.id,
            sourceType: 'event',
          };
          return {
            ...acc,
            events: [event, ...acc.events],
            inbox: [inbox, ...acc.inbox],
          };
        }

        const taskId = createId('t');
        const task: TaskItem = {
          id: taskId,
          title: item.title,
          dueDate: item.dueLabel,
          priority: 'medium',
          category: item.type === 'message' ? 'Follow-up' : inferCategoryFromTitle(item.title),
          createdBy: 'voice',
          aiContext: 'Captured by Relay voice understanding',
          completed: false,
          archived: false,
          recurring: false,
        };

        const inbox: InboxItem = {
          id: createId('i'),
          title: item.title,
          subtitle: item.dueLabel,
          type: item.type === 'message' ? 'message' : item.type === 'reminder' ? 'reminder' : 'task',
          filter: asInboxFilter(item.dueLabel),
          done: false,
          sourceId: task.id,
          sourceType: 'task',
        };

        return {
          ...acc,
          tasks: [task, ...acc.tasks],
          inbox: [inbox, ...acc.inbox],
        };
      }, state);

      return nextState;
    }
    default:
      return state;
  }
}

type RelayStore = {
  state: RelayState;
  addTask: (payload: NewTaskPayload) => void;
  updateTask: (id: string, payload: Partial<TaskItem>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addEvent: (payload: Omit<EventItem, 'id'>) => void;
  updateEvent: (id: string, payload: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
  markInboxDone: (id: string) => void;
  snoozeInbox: (id: string) => void;
  updateInbox: (id: string, payload: Partial<InboxItem>) => void;
  addMember: (payload: Omit<FamilyMember, 'id'>) => void;
  setFamilyMode: (enabled: boolean) => void;
  updateAISettings: (payload: Partial<RelayState['aiSettings']>) => void;
  updateNotificationSettings: (
    payload: Partial<RelayState['notificationSettings']>
  ) => void;
  addFromRelay: (payload: RelayDraftItem[]) => void;
};

const RelayContext = createContext<RelayStore | null>(null);

export function RelayStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const tasksTotal = state.tasks.length;
    const tasksCompleted = state.tasks.filter((item) => item.completed).length;
    const tasksOpen = tasksTotal - tasksCompleted;
    const voiceTaskCount = state.tasks.filter((item) => item.createdBy === 'voice').length;
    const voiceTaskRatio = tasksTotal ? voiceTaskCount / tasksTotal : 0;
    const eventsUpcoming = state.events.filter((event) => event.date >= new Date().toISOString().slice(0, 10)).length;
    const recurringCount = state.tasks.filter((task) => task.recurring).length + state.events.filter((event) => event.repeat && event.repeat !== 'None').length;
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayMap = state.events.reduce<Record<string, number>>((acc, event) => {
      const day = weekdays[new Date(`${event.date}T00:00:00`).getDay()];
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});
    const busiestWeekday = Object.entries(weekdayMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Thursday';

    emitAIMemoryEvent({
      source: 'relay',
      kind: 'snapshot',
      payload: {
        tasksTotal,
        tasksCompleted,
        tasksOpen,
        taskCompletionRate: tasksTotal ? tasksCompleted / tasksTotal : 1,
        voiceTaskRatio,
        eventsUpcoming,
        recurringCount,
        busiestWeekday,
        editCount: state.tasks.filter((task) => !!task.note).length,
        recapTime: state.notificationSettings.recapTime,
      },
    });
  }, [state.events, state.notificationSettings.recapTime, state.tasks]);

  const value = useMemo<RelayStore>(
    () => ({
      state,
      addTask: (payload) => dispatch({ type: 'ADD_TASK', payload }),
      updateTask: (id, payload) => dispatch({ type: 'UPDATE_TASK', id, payload }),
      toggleTask: (id) => dispatch({ type: 'TOGGLE_TASK', id }),
      deleteTask: (id) => dispatch({ type: 'DELETE_TASK', id }),
      addEvent: (payload) => dispatch({ type: 'ADD_EVENT', payload }),
      updateEvent: (id, payload) => dispatch({ type: 'UPDATE_EVENT', id, payload }),
      deleteEvent: (id) => dispatch({ type: 'DELETE_EVENT', id }),
      markInboxDone: (id) => dispatch({ type: 'MARK_INBOX_DONE', id }),
      snoozeInbox: (id) => dispatch({ type: 'SNOOZE_INBOX', id }),
      updateInbox: (id, payload) => dispatch({ type: 'UPDATE_INBOX', id, payload }),
      addMember: (payload) => dispatch({ type: 'ADD_MEMBER', payload }),
      setFamilyMode: (enabled) => dispatch({ type: 'SET_FAMILY_MODE', enabled }),
      updateAISettings: (payload) => dispatch({ type: 'UPDATE_AI_SETTINGS', payload }),
      updateNotificationSettings: (payload) =>
        dispatch({ type: 'UPDATE_NOTIFICATION_SETTINGS', payload }),
      addFromRelay: (payload) => dispatch({ type: 'ADD_FROM_RELAY', payload }),
    }),
    [state]
  );

  return <RelayContext.Provider value={value}>{children}</RelayContext.Provider>;
}

export function useRelayStore() {
  const context = useContext(RelayContext);
  if (!context) {
    throw new Error('useRelayStore must be used within RelayStoreProvider');
  }
  return context;
}
