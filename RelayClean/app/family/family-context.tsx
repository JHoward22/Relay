import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { emitAIMemoryEvent } from '@/store/ai-memory-events';
import {
  consumePendingVoiceActions,
  PendingVoiceAction,
  subscribePendingVoiceActions,
} from '@/store/voice-router/pending-actions';

export type MemberRole = 'admin' | 'adult' | 'child' | 'viewer';

export type Family = {
  id: string;
  name: string;
  avatarUris: string[];
  createdAtISO: string;
};

export type MemberPermission = {
  view: boolean;
  edit: boolean;
  voiceAuthority: boolean;
  destructive: boolean;
};

export type Member = {
  id: string;
  name: string;
  role: MemberRole;
  color: string;
  avatarUri?: string;
  email?: string;
  active: boolean;
  permission: MemberPermission;
};

export type Child = {
  id: string;
  name: string;
  age: number;
  avatarUri?: string;
  colorTag: string;
  school: string;
  notes: string;
  healthReminders: string[];
  memberId?: string;
};

export type SharedTaskComment = {
  id: string;
  byMemberId: string;
  text: string;
  createdAtISO: string;
};

export type SharedTask = {
  id: string;
  title: string;
  description?: string;
  assignedMemberIds: string[];
  dueDateISO: string;
  recurringRule?: string;
  status: 'open' | 'done';
  createdByMemberId: string;
  comments: SharedTaskComment[];
  archived: boolean;
};

export type FamilyEvent = {
  id: string;
  title: string;
  dateISO: string;
  timeLabel: string;
  location?: string;
  affectedMemberIds: string[];
  notes?: string;
  repeatRule?: string;
  type: 'event' | 'reminder';
};

export type ShoppingItem = {
  id: string;
  title: string;
  quantity: string;
  assignedMemberId?: string;
  done: boolean;
};

export type ShoppingList = {
  id: string;
  name: string;
  items: ShoppingItem[];
};

export type FamilyDocument = {
  id: string;
  name: string;
  docType: 'pdf' | 'image' | 'text';
  tagIds: string[];
  visibility: 'shared' | 'restricted';
  allowedMemberIds: string[];
  aiSummary: string;
  uploadedByMemberId: string;
  archived: boolean;
};

export type FamilyTag = {
  id: string;
  label: string;
};

export type FamilyAlert = {
  id: string;
  title: string;
  body: string;
  route: string;
};

type FamilyState = {
  family?: Family;
  members: Member[];
  children: Child[];
  tasks: SharedTask[];
  events: FamilyEvent[];
  shoppingLists: ShoppingList[];
  documents: FamilyDocument[];
  tags: FamilyTag[];
  dismissedAlertIds: string[];
};

type FamilyAction =
  | { type: 'CREATE_FAMILY'; payload: { name: string } }
  | { type: 'INVITE_MEMBER'; payload: { name: string; email?: string; role: MemberRole } }
  | { type: 'UPDATE_MEMBER_ROLE'; id: string; role: MemberRole }
  | { type: 'REMOVE_MEMBER'; id: string }
  | { type: 'ADD_CHILD'; id: string; payload: Omit<Child, 'id'> }
  | { type: 'UPDATE_CHILD'; id: string; payload: Partial<Child> }
  | { type: 'ADD_TASK'; id: string; payload: Omit<SharedTask, 'id' | 'comments' | 'archived' | 'status'> }
  | { type: 'UPDATE_TASK'; id: string; payload: Partial<SharedTask> }
  | { type: 'TOGGLE_TASK'; id: string }
  | { type: 'ADD_TASK_COMMENT'; id: string; payload: { byMemberId: string; text: string } }
  | { type: 'ADD_EVENT'; id: string; payload: Omit<FamilyEvent, 'id'> }
  | { type: 'UPDATE_EVENT'; id: string; payload: Partial<FamilyEvent> }
  | { type: 'DELETE_EVENT'; id: string }
  | { type: 'ADD_LIST'; id: string; payload: { name: string } }
  | { type: 'ADD_LIST_ITEM'; listId: string; payload: Omit<ShoppingItem, 'id' | 'done'> }
  | { type: 'TOGGLE_LIST_ITEM'; listId: string; itemId: string }
  | { type: 'UPDATE_LIST_ITEM'; listId: string; itemId: string; payload: Partial<ShoppingItem> }
  | { type: 'ADD_DOCUMENT'; id: string; payload: Omit<FamilyDocument, 'id' | 'archived'> }
  | { type: 'UPDATE_DOCUMENT'; id: string; payload: Partial<FamilyDocument> }
  | { type: 'ARCHIVE_DOCUMENT'; id: string; archived: boolean }
  | { type: 'DISMISS_ALERT'; id: string };

const idGen = (() => {
  let c = 5000;
  return (prefix: string) => {
    c += 1;
    return `${prefix}-${c}`;
  };
})();

const nowISO = () => new Date().toISOString();

const rolePermissions = (role: MemberRole): MemberPermission => {
  if (role === 'admin') return { view: true, edit: true, voiceAuthority: true, destructive: true };
  if (role === 'adult') return { view: true, edit: true, voiceAuthority: true, destructive: false };
  if (role === 'child') return { view: true, edit: false, voiceAuthority: false, destructive: false };
  return { view: true, edit: false, voiceAuthority: false, destructive: false };
};

const initialState: FamilyState = {
  family: {
    id: 'fam-1',
    name: 'Howard Household',
    avatarUris: [],
    createdAtISO: nowISO(),
  },
  members: [
    { id: 'fm-1', name: 'Jaiden', role: 'admin', color: '#4A86F7', active: true, permission: rolePermissions('admin') },
    { id: 'fm-2', name: 'Michael', role: 'adult', color: '#57A27D', active: true, permission: rolePermissions('adult') },
    { id: 'fm-3', name: 'Amy', role: 'child', color: '#D48A47', active: true, permission: rolePermissions('child') },
    { id: 'fm-4', name: 'Buddy', role: 'viewer', color: '#7C8BC8', active: true, permission: rolePermissions('viewer') },
  ],
  children: [
    {
      id: 'ch-1',
      name: 'Amy',
      age: 9,
      colorTag: '#D48A47',
      school: 'Valley Elementary',
      notes: 'Soccer Tue/Thu',
      healthReminders: ['Vitamin after dinner'],
      memberId: 'fm-3',
    },
  ],
  tasks: [
    {
      id: 'ft-1',
      title: 'School pickup',
      description: 'West gate at 4:30 PM',
      assignedMemberIds: ['fm-2'],
      dueDateISO: new Date().toISOString().slice(0, 10),
      status: 'open',
      createdByMemberId: 'fm-1',
      comments: [
        { id: 'fc-1', byMemberId: 'fm-1', text: 'Traffic is heavy today.', createdAtISO: nowISO() },
      ],
      archived: false,
    },
    {
      id: 'ft-2',
      title: 'Dishes after dinner',
      assignedMemberIds: ['fm-3'],
      dueDateISO: new Date().toISOString().slice(0, 10),
      recurringRule: 'Daily',
      status: 'open',
      createdByMemberId: 'fm-1',
      comments: [],
      archived: false,
    },
  ],
  events: [
    {
      id: 'fe-1',
      title: 'Recital',
      dateISO: new Date().toISOString().slice(0, 10),
      timeLabel: '6:00 PM',
      location: 'School Hall',
      affectedMemberIds: ['fm-1', 'fm-2', 'fm-3'],
      notes: 'Arrive 20 minutes early',
      type: 'event',
    },
    {
      id: 'fe-2',
      title: 'Vet check reminder',
      dateISO: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      timeLabel: '9:30 AM',
      affectedMemberIds: ['fm-1', 'fm-2', 'fm-4'],
      repeatRule: 'Monthly',
      type: 'reminder',
    },
  ],
  shoppingLists: [
    {
      id: 'fl-1',
      name: 'Family Grocery',
      items: [
        { id: 'fi-1', title: 'Milk', quantity: '1 gal', assignedMemberId: 'fm-2', done: false },
        { id: 'fi-2', title: 'Diapers', quantity: '1 pack', assignedMemberId: 'fm-1', done: true },
      ],
    },
  ],
  documents: [
    {
      id: 'fd-1',
      name: 'School form.pdf',
      docType: 'pdf',
      tagIds: ['tag-school'],
      visibility: 'shared',
      allowedMemberIds: ['fm-1', 'fm-2'],
      aiSummary: 'School permission form due by Friday.',
      uploadedByMemberId: 'fm-1',
      archived: false,
    },
  ],
  tags: [
    { id: 'tag-school', label: 'school' },
    { id: 'tag-health', label: 'health' },
    { id: 'tag-household', label: 'household' },
  ],
  dismissedAlertIds: [],
};

function reducer(state: FamilyState, action: FamilyAction): FamilyState {
  switch (action.type) {
    case 'CREATE_FAMILY':
      return {
        ...state,
        family: {
          id: state.family?.id ?? idGen('fam'),
          name: action.payload.name,
          avatarUris: state.family?.avatarUris ?? [],
          createdAtISO: state.family?.createdAtISO ?? nowISO(),
        },
      };
    case 'INVITE_MEMBER': {
      const role = action.payload.role;
      const member: Member = {
        id: idGen('fm'),
        name: action.payload.name,
        email: action.payload.email,
        role,
        color: role === 'admin' ? '#4A86F7' : role === 'adult' ? '#57A27D' : role === 'child' ? '#D48A47' : '#7C8BC8',
        active: true,
        permission: rolePermissions(role),
      };
      return { ...state, members: [...state.members, member] };
    }
    case 'UPDATE_MEMBER_ROLE':
      return {
        ...state,
        members: state.members.map((item) =>
          item.id === action.id ? { ...item, role: action.role, permission: rolePermissions(action.role) } : item
        ),
      };
    case 'REMOVE_MEMBER':
      return {
        ...state,
        members: state.members.filter((item) => item.id !== action.id),
        tasks: state.tasks.map((task) => ({ ...task, assignedMemberIds: task.assignedMemberIds.filter((id) => id !== action.id) })),
      };
    case 'ADD_CHILD':
      return { ...state, children: [...state.children, { ...action.payload, id: action.id }] };
    case 'UPDATE_CHILD':
      return {
        ...state,
        children: state.children.map((item) => (item.id === action.id ? { ...item, ...action.payload } : item)),
      };
    case 'ADD_TASK': {
      const task: SharedTask = {
        ...action.payload,
        id: action.id,
        status: 'open',
        comments: [],
        archived: false,
      };
      return { ...state, tasks: [task, ...state.tasks] };
    }
    case 'UPDATE_TASK':
      return { ...state, tasks: state.tasks.map((item) => (item.id === action.id ? { ...item, ...action.payload } : item)) };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((item) => (item.id === action.id ? { ...item, status: item.status === 'done' ? 'open' : 'done' } : item)),
      };
    case 'ADD_TASK_COMMENT':
      return {
        ...state,
        tasks: state.tasks.map((item) =>
          item.id === action.id
            ? {
                ...item,
                comments: [...item.comments, { id: idGen('fc'), byMemberId: action.payload.byMemberId, text: action.payload.text, createdAtISO: nowISO() }],
              }
            : item
        ),
      };
    case 'ADD_EVENT':
      return { ...state, events: [{ ...action.payload, id: action.id }, ...state.events] };
    case 'UPDATE_EVENT':
      return { ...state, events: state.events.map((item) => (item.id === action.id ? { ...item, ...action.payload } : item)) };
    case 'DELETE_EVENT':
      return { ...state, events: state.events.filter((item) => item.id !== action.id) };
    case 'ADD_LIST':
      return { ...state, shoppingLists: [{ id: action.id, name: action.payload.name, items: [] }, ...state.shoppingLists] };
    case 'ADD_LIST_ITEM':
      return {
        ...state,
        shoppingLists: state.shoppingLists.map((list) =>
          list.id === action.listId
            ? { ...list, items: [...list.items, { id: idGen('fi'), ...action.payload, done: false }] }
            : list
        ),
      };
    case 'TOGGLE_LIST_ITEM':
      return {
        ...state,
        shoppingLists: state.shoppingLists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                items: list.items.map((item) => (item.id === action.itemId ? { ...item, done: !item.done } : item)),
              }
            : list
        ),
      };
    case 'UPDATE_LIST_ITEM':
      return {
        ...state,
        shoppingLists: state.shoppingLists.map((list) =>
          list.id === action.listId
            ? {
                ...list,
                items: list.items.map((item) => (item.id === action.itemId ? { ...item, ...action.payload } : item)),
              }
            : list
        ),
      };
    case 'ADD_DOCUMENT':
      return { ...state, documents: [{ ...action.payload, id: action.id, archived: false }, ...state.documents] };
    case 'UPDATE_DOCUMENT':
      return { ...state, documents: state.documents.map((item) => (item.id === action.id ? { ...item, ...action.payload } : item)) };
    case 'ARCHIVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((item) => (item.id === action.id ? { ...item, archived: action.archived } : item)),
      };
    case 'DISMISS_ALERT':
      return state.dismissedAlertIds.includes(action.id)
        ? state
        : { ...state, dismissedAlertIds: [...state.dismissedAlertIds, action.id] };
    default:
      return state;
  }
}

function computeAlerts(state: FamilyState): FamilyAlert[] {
  const alerts: FamilyAlert[] = [];

  const upcoming = state.events.filter((item) => item.dateISO >= new Date().toISOString().slice(0, 10));
  if (upcoming.length >= 3) {
    alerts.push({
      id: 'al-overlap',
      title: 'Potential schedule overlap',
      body: 'Three family events are close together tomorrow.',
      route: '/family/calendar',
    });
  }

  const openTasks = state.tasks.filter((item) => item.status === 'open' && !item.archived);
  if (openTasks.length >= 3) {
    alerts.push({
      id: 'al-tasks-open',
      title: `${openTasks.length} shared tasks still open`,
      body: 'Relay can redistribute tonight chores for balance.',
      route: '/family/tasks',
    });
  }

  const amy = state.members.find((item) => item.name.toLowerCase() === 'amy');
  if (amy) {
    const amyOpen = openTasks.filter((item) => item.assignedMemberIds.includes(amy.id)).length;
    if (amyOpen >= 2) {
      alerts.push({
        id: 'al-amy-chores',
        title: 'Amy has multiple chores this week',
        body: 'Consider reassigning one item to reduce overload.',
        route: '/family/tasks',
      });
    }
  }

  if (!alerts.length) {
    alerts.push({
      id: 'al-calm',
      title: 'Family plan looks balanced',
      body: 'No urgent conflicts detected right now.',
      route: '/family',
    });
  }

  return alerts.filter((item) => !state.dismissedAlertIds.includes(item.id));
}

type FamilyContextValue = {
  state: FamilyState;
  alerts: FamilyAlert[];
  createFamily: (name: string) => void;
  inviteMember: (payload: { name: string; email?: string; role: MemberRole }) => void;
  updateMemberRole: (id: string, role: MemberRole) => void;
  removeMember: (id: string) => void;
  addChild: (payload: Omit<Child, 'id'>) => string;
  updateChild: (id: string, payload: Partial<Child>) => void;
  addTask: (payload: Omit<SharedTask, 'id' | 'comments' | 'archived' | 'status'>) => string;
  updateTask: (id: string, payload: Partial<SharedTask>) => void;
  toggleTask: (id: string) => void;
  addTaskComment: (id: string, payload: { byMemberId: string; text: string }) => void;
  addEvent: (payload: Omit<FamilyEvent, 'id'>) => string;
  updateEvent: (id: string, payload: Partial<FamilyEvent>) => void;
  deleteEvent: (id: string) => void;
  addList: (name: string) => string;
  addListItem: (listId: string, payload: Omit<ShoppingItem, 'id' | 'done'>) => void;
  toggleListItem: (listId: string, itemId: string) => void;
  updateListItem: (listId: string, itemId: string, payload: Partial<ShoppingItem>) => void;
  addDocument: (payload: Omit<FamilyDocument, 'id' | 'archived'>) => string;
  updateDocument: (id: string, payload: Partial<FamilyDocument>) => void;
  archiveDocument: (id: string, archived: boolean) => void;
  dismissAlert: (id: string) => void;
  getMember: (id: string) => Member | undefined;
  getChild: (id: string) => Child | undefined;
  getTask: (id: string) => SharedTask | undefined;
  getEvent: (id: string) => FamilyEvent | undefined;
  getDocument: (id: string) => FamilyDocument | undefined;
  getList: (id: string) => ShoppingList | undefined;
};

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const resolveMemberId = (action: PendingVoiceAction) => {
      const memberName =
        typeof action.payload.memberName === 'string'
          ? action.payload.memberName.toLowerCase().trim()
          : '';
      if (memberName) {
        const match = state.members.find((member) => member.name.toLowerCase().includes(memberName));
        if (match) return match.id;
      }
      return state.members.find((member) => member.role === 'adult' || member.role === 'admin')?.id || state.members[0]?.id;
    };

    const applyPendingAction = (action: PendingVoiceAction) => {
      if (action.type === 'assign_chore') {
        const assignee = resolveMemberId(action);
        if (!assignee) return;
        const createdBy =
          state.members.find((member) => member.role === 'admin')?.id || state.members[0]?.id || assignee;
        const title =
          typeof action.payload.title === 'string' && action.payload.title.trim()
            ? action.payload.title.trim()
            : 'Shared chore';
        const dueDateISO =
          typeof action.payload.dueDateISO === 'string'
            ? action.payload.dueDateISO
            : new Date().toISOString().slice(0, 10);
        dispatch({
          type: 'ADD_TASK',
          id: idGen('ft'),
          payload: {
            title,
            assignedMemberIds: [assignee],
            dueDateISO,
            createdByMemberId: createdBy,
          },
        });
        return;
      }

      if (action.type === 'add_family_event') {
        const primaryMember = resolveMemberId(action);
        const title =
          typeof action.payload.title === 'string' && action.payload.title.trim()
            ? action.payload.title.trim()
            : 'Family event';
        const dateISO =
          typeof action.payload.dateISO === 'string'
            ? action.payload.dateISO
            : new Date().toISOString().slice(0, 10);
        const timeLabel = typeof action.payload.timeLabel === 'string' ? action.payload.timeLabel : '6:00 PM';
        dispatch({
          type: 'ADD_EVENT',
          id: idGen('fe'),
          payload: {
            title,
            dateISO,
            timeLabel,
            affectedMemberIds: primaryMember ? [primaryMember] : [],
            notes: 'Captured from Relay voice',
            type: 'event',
          },
        });
        return;
      }

      if (action.type === 'reassign_chore') {
        const assignee = resolveMemberId(action);
        if (!assignee) return;
        const taskRef =
          typeof action.payload.taskRef === 'string'
            ? action.payload.taskRef.toLowerCase().trim()
            : '';
        const target = state.tasks.find((task) => {
          if (task.archived || task.status !== 'open') return false;
          if (!taskRef) return true;
          return task.title.toLowerCase().includes(taskRef);
        });
        if (!target) return;
        dispatch({
          type: 'UPDATE_TASK',
          id: target.id,
          payload: {
            assignedMemberIds: [assignee],
          },
        });
      }
    };

    consumePendingVoiceActions('family').forEach(applyPendingAction);
    return subscribePendingVoiceActions('family', applyPendingAction);
  }, [state.members, state.tasks]);

  useEffect(() => {
    const openTasks = state.tasks.filter((task) => task.status === 'open' && !task.archived);
    const doneTasks = state.tasks.filter((task) => task.status === 'done' && !task.archived);
    const assigneeCounts = openTasks.reduce<Record<string, number>>((acc, task) => {
      task.assignedMemberIds.forEach((id) => {
        acc[id] = (acc[id] || 0) + 1;
      });
      return acc;
    }, {});
    const topAssigneeId = Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topAssignee = topAssigneeId ? state.members.find((member) => member.id === topAssigneeId)?.name : '';

    const overlapMap = state.events.reduce<Record<string, number>>((acc, event) => {
      const key = `${event.dateISO}-${event.timeLabel}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const overlapCount = Object.values(overlapMap).filter((count) => count > 1).length;

    emitAIMemoryEvent({
      source: 'family',
      kind: 'snapshot',
      payload: {
        membersCount: state.members.length,
        openTasks: openTasks.length,
        doneTasks: doneTasks.length,
        eventsUpcoming: state.events.filter((event) => event.dateISO >= new Date().toISOString().slice(0, 10)).length,
        overlapCount,
        topAssignee: topAssignee ?? '',
      },
    });
  }, [state.children, state.events, state.members, state.tasks]);

  const value = useMemo<FamilyContextValue>(
    () => ({
      state,
      alerts: computeAlerts(state),
      createFamily: (name) => dispatch({ type: 'CREATE_FAMILY', payload: { name } }),
      inviteMember: (payload) => dispatch({ type: 'INVITE_MEMBER', payload }),
      updateMemberRole: (id, role) => dispatch({ type: 'UPDATE_MEMBER_ROLE', id, role }),
      removeMember: (id) => dispatch({ type: 'REMOVE_MEMBER', id }),
      addChild: (payload) => {
        const id = idGen('ch');
        dispatch({ type: 'ADD_CHILD', id, payload });
        return id;
      },
      updateChild: (id, payload) => dispatch({ type: 'UPDATE_CHILD', id, payload }),
      addTask: (payload) => {
        const id = idGen('ft');
        dispatch({ type: 'ADD_TASK', id, payload });
        return id;
      },
      updateTask: (id, payload) => dispatch({ type: 'UPDATE_TASK', id, payload }),
      toggleTask: (id) => dispatch({ type: 'TOGGLE_TASK', id }),
      addTaskComment: (id, payload) => dispatch({ type: 'ADD_TASK_COMMENT', id, payload }),
      addEvent: (payload) => {
        const id = idGen('fe');
        dispatch({ type: 'ADD_EVENT', id, payload });
        return id;
      },
      updateEvent: (id, payload) => dispatch({ type: 'UPDATE_EVENT', id, payload }),
      deleteEvent: (id) => dispatch({ type: 'DELETE_EVENT', id }),
      addList: (name) => {
        const id = idGen('fl');
        dispatch({ type: 'ADD_LIST', id, payload: { name } });
        return id;
      },
      addListItem: (listId, payload) => dispatch({ type: 'ADD_LIST_ITEM', listId, payload }),
      toggleListItem: (listId, itemId) => dispatch({ type: 'TOGGLE_LIST_ITEM', listId, itemId }),
      updateListItem: (listId, itemId, payload) => dispatch({ type: 'UPDATE_LIST_ITEM', listId, itemId, payload }),
      addDocument: (payload) => {
        const id = idGen('fd');
        dispatch({ type: 'ADD_DOCUMENT', id, payload });
        return id;
      },
      updateDocument: (id, payload) => dispatch({ type: 'UPDATE_DOCUMENT', id, payload }),
      archiveDocument: (id, archived) => dispatch({ type: 'ARCHIVE_DOCUMENT', id, archived }),
      dismissAlert: (id) => dispatch({ type: 'DISMISS_ALERT', id }),
      getMember: (id) => state.members.find((item) => item.id === id),
      getChild: (id) => state.children.find((item) => item.id === id),
      getTask: (id) => state.tasks.find((item) => item.id === id),
      getEvent: (id) => state.events.find((item) => item.id === id),
      getDocument: (id) => state.documents.find((item) => item.id === id),
      getList: (id) => state.shoppingLists.find((item) => item.id === id),
    }),
    [state]
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamilyStore() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamilyStore must be used within FamilyProvider');
  return ctx;
}

export function roleLabel(role: MemberRole) {
  if (role === 'admin') return 'Admin';
  if (role === 'adult') return 'Adult';
  if (role === 'child') return 'Child';
  return 'Viewer';
}
