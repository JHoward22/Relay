import React, { createContext, useContext, useMemo, useReducer } from 'react';

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
  priority: 'low' | 'medium' | 'high';
  category: string;
  assignedTo?: string;
  completed: boolean;
  recurring: boolean;
  cadence?: string;
  note?: string;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
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

type RelayState = {
  inbox: InboxItem[];
  tasks: TaskItem[];
  events: EventItem[];
  members: FamilyMember[];
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
      completed: false,
      recurring: false,
      note: 'Ask about flea treatment.',
    },
    {
      id: 't2',
      title: 'Take vitamins',
      dueDate: 'Today · Evening',
      priority: 'low',
      category: 'Personal',
      completed: false,
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
      completed: false,
      recurring: false,
    },
    {
      id: 't4',
      title: 'Feed the dog',
      dueDate: 'Today · 7:00 PM',
      priority: 'medium',
      category: 'Family',
      assignedTo: 'Buddy',
      completed: false,
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
      location: '1234 Health St, Suite 200',
      reminder: '2 hours before',
      notes: 'Bring insurance card.',
      repeat: 'Yearly',
    },
    {
      id: 'e2',
      title: 'School Pickup',
      date: '2026-02-10',
      time: '4:30 PM',
      location: 'West Entrance',
      reminder: '30 min before',
      repeat: 'Weekly',
    },
  ],
  members: [
    { id: 'm1', name: 'Michael', role: 'Partner' },
    { id: 'm2', name: 'Amy', role: 'Child' },
    { id: 'm3', name: 'Buddy', role: 'Pet' },
  ],
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
  | { type: 'ADD_TASK'; payload: Omit<TaskItem, 'id' | 'completed'> }
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

function reducer(state: RelayState, action: RelayAction): RelayState {
  switch (action.type) {
    case 'ADD_TASK': {
      const task: TaskItem = {
        ...action.payload,
        id: createId('t'),
        completed: false,
      };
      const inbox: InboxItem = {
        id: createId('i'),
        title: task.title,
        subtitle: task.dueDate,
        type: task.recurring ? 'recurring' : task.category.toLowerCase() === 'health' ? 'reminder' : 'task',
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
      const updatedTasks = state.tasks.map((task) =>
        task.id === action.id ? { ...task, completed: !task.completed } : task
      );
      return {
        ...state,
        tasks: updatedTasks,
        inbox: state.inbox.map((item) =>
          item.sourceType === 'task' && item.sourceId === action.id
            ? { ...item, done: !item.done }
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
      const event: EventItem = { ...action.payload, id: createId('e') };
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
          const event: EventItem = {
            id: eventId,
            title: item.title,
            date: '2026-02-15',
            time: item.dueLabel,
            location: 'TBD',
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
          category: item.type === 'message' ? 'Follow-up' : 'General',
          completed: false,
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
  addTask: (payload: Omit<TaskItem, 'id' | 'completed'>) => void;
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
  updateAISettings: (payload: Partial<RelayState['aiSettings']>) => void;
  updateNotificationSettings: (
    payload: Partial<RelayState['notificationSettings']>
  ) => void;
  addFromRelay: (payload: RelayDraftItem[]) => void;
};

const RelayContext = createContext<RelayStore | null>(null);

export function RelayStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

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
