import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { AIMemoryEvent, emitAIMemoryEvent, subscribeAIMemoryEvents } from '@/store/ai-memory-events';

type MemoryCategoryKey = 'preference' | 'behavioral' | 'temporal' | 'relational' | 'contextual';

type MemoryControls = {
  categories: Record<MemoryCategoryKey, boolean>;
  proactiveEnabled: boolean;
  learningEnabled: boolean;
};

export type MemoryRecord = {
  id: string;
  category: MemoryCategoryKey;
  title: string;
  detail: string;
  source: AIMemoryEvent['source'];
  confidence: number;
  updatedAtISO: string;
};

export type AIInsight = {
  id: string;
  title: string;
  body: string;
  category: MemoryCategoryKey;
  severity: 'info' | 'medium';
  confidence: number;
  actionLabel: string;
  actionRoute: string;
  why: string;
  sourceMemoryIds: string[];
  createdAtISO: string;
};

export type SummaryRange = 'today' | 'this-week' | 'last-week' | 'custom';
export type SummaryScopeKey = 'tasks' | 'events' | 'money' | 'meals' | 'family' | 'pets' | 'notes';

export type SummaryRequest = {
  range: SummaryRange;
  customStartISO?: string;
  customEndISO?: string;
  scope: SummaryScopeKey[];
};

export type SummaryResult = {
  id: string;
  title: string;
  rangeLabel: string;
  createdAtISO: string;
  lines: string[];
  metrics: { label: string; value: string }[];
  sourceSummary: string;
};

type SnapshotMap = Partial<Record<AIMemoryEvent['source'], Record<string, unknown>>>;

type AIMemoryState = {
  controls: MemoryControls;
  snapshots: SnapshotMap;
  events: AIMemoryEvent[];
  actionLedger: {
    voiceCommands: number;
    voiceQuestions: number;
    appliedInsights: number;
    dismissedInsights: number;
    recentVoicePhrases: string[];
  };
  records: MemoryRecord[];
  insights: AIInsight[];
  dismissedInsightIds: string[];
  summaries: SummaryResult[];
  lastSummaryId?: string;
};

type AIMemoryAction =
  | { type: 'INGEST_EVENT'; event: AIMemoryEvent }
  | { type: 'TOGGLE_CATEGORY'; category: MemoryCategoryKey; enabled: boolean }
  | { type: 'TOGGLE_PROACTIVE'; enabled: boolean }
  | { type: 'TOGGLE_LEARNING'; enabled: boolean }
  | { type: 'CLEAR_CATEGORY'; category: MemoryCategoryKey }
  | { type: 'RESET_ALL' }
  | { type: 'DISMISS_INSIGHT'; id: string }
  | { type: 'RESTORE_INSIGHT'; id: string }
  | { type: 'APPLY_INSIGHT'; id: string }
  | { type: 'SAVE_SUMMARY'; summary: SummaryResult };

const makeId = (() => {
  let c = 12000;
  return (prefix: string) => {
    c += 1;
    return `${prefix}-${c}`;
  };
})();

function cap<T>(items: T[], limit: number) {
  return items.slice(Math.max(items.length - limit, 0));
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function deriveRecords(state: AIMemoryState): MemoryRecord[] {
  const now = new Date().toISOString();
  const records: MemoryRecord[] = [];
  const relay = state.snapshots.relay ?? {};
  const family = state.snapshots.family ?? {};
  const meals = state.snapshots.meals ?? {};
  const finances = state.snapshots.finances ?? {};
  const pets = state.snapshots.pets ?? {};
  const notes = state.snapshots.notes ?? {};

  if (state.controls.categories.preference) {
    const voiceRatio = asNumber(relay.voiceTaskRatio, 0);
    records.push({
      id: 'mem-pref-input',
      category: 'preference',
      title: 'Input preference',
      detail: voiceRatio >= 0.5 ? 'You usually capture tasks by voice.' : 'You balance typing and voice input.',
      source: 'relay',
      confidence: 0.72,
      updatedAtISO: now,
    });

    records.push({
      id: 'mem-pref-notify',
      category: 'preference',
      title: 'Reminder style',
      detail: asString(relay.recapTime)
        ? `Daily recap appears around ${asString(relay.recapTime)}.`
        : 'Relay will infer your best recap window as usage grows.',
      source: 'relay',
      confidence: 0.64,
      updatedAtISO: now,
    });
  }

  if (state.controls.categories.behavioral) {
    const completionRate = asNumber(relay.taskCompletionRate, 0);
    records.push({
      id: 'mem-beh-task-rate',
      category: 'behavioral',
      title: 'Task completion pattern',
      detail: `Completion trend: ${Math.round(completionRate * 100)}% of active tasks are completed on time in demo tracking.`,
      source: 'relay',
      confidence: 0.7,
      updatedAtISO: now,
    });

    records.push({
      id: 'mem-beh-edits',
      category: 'behavioral',
      title: 'Adjustment pattern',
      detail: `${asNumber(relay.editCount)} edits were made after creation, suggesting a preference for quick capture then refine.`,
      source: 'relay',
      confidence: 0.58,
      updatedAtISO: now,
    });
  }

  if (state.controls.categories.temporal) {
    const busyWeekday = asString(relay.busiestWeekday, 'Thursday');
    records.push({
      id: 'mem-temp-weekday',
      category: 'temporal',
      title: 'Weekly pattern',
      detail: `${busyWeekday} appears to carry the highest schedule load in current demo data.`,
      source: 'relay',
      confidence: 0.62,
      updatedAtISO: now,
    });

    records.push({
      id: 'mem-temp-cycle',
      category: 'temporal',
      title: 'Cycle trend',
      detail: `Recurring commitments detected: ${asNumber(relay.recurringCount)} repeating task/event loops.`,
      source: 'relay',
      confidence: 0.66,
      updatedAtISO: now,
    });
  }

  if (state.controls.categories.relational) {
    records.push({
      id: 'mem-rel-family-load',
      category: 'relational',
      title: 'Delegation balance',
      detail: `${asNumber(family.openTasks)} open shared tasks across ${asNumber(family.membersCount)} members.`,
      source: 'family',
      confidence: 0.69,
      updatedAtISO: now,
    });

    records.push({
      id: 'mem-rel-assignment',
      category: 'relational',
      title: 'Assignment behavior',
      detail: asString(family.topAssignee)
        ? `${asString(family.topAssignee)} currently receives the most assignments.`
        : 'Assignment patterns will appear as family activity increases.',
      source: 'family',
      confidence: 0.61,
      updatedAtISO: now,
    });
  }

  if (state.controls.categories.contextual) {
    const repeats = asStringArray(meals.groceryRepeats);
    records.push({
      id: 'mem-ctx-grocery',
      category: 'contextual',
      title: 'Grocery repeats',
      detail: repeats.length
        ? `Frequently repeated items: ${repeats.slice(0, 4).join(', ')}.`
        : 'Relay has not identified repeated grocery staples yet.',
      source: 'meals',
      confidence: 0.74,
      updatedAtISO: now,
    });

    records.push({
      id: 'mem-ctx-voice-phrases',
      category: 'contextual',
      title: 'Voice phrase memory',
      detail: state.actionLedger.recentVoicePhrases.length
        ? `Common phrases: ${state.actionLedger.recentVoicePhrases.slice(0, 2).join(' • ')}.`
        : 'Relay will remember common wording after more voice interactions.',
      source: 'voice',
      confidence: 0.55,
      updatedAtISO: now,
    });

    records.push({
      id: 'mem-ctx-finance',
      category: 'contextual',
      title: 'Financial context',
      detail: `${asNumber(finances.upcomingBills)} bills upcoming, ${asNumber(finances.overBudgetCategories)} categories above budget targets.`,
      source: 'finances',
      confidence: 0.64,
      updatedAtISO: now,
    });

    records.push({
      id: 'mem-ctx-pets-notes',
      category: 'contextual',
      title: 'Life context index',
      detail: `${asNumber(pets.activePets)} pets tracked and ${asNumber(notes.notesCount)} notes stored for reference continuity.`,
      source: 'pets',
      confidence: 0.6,
      updatedAtISO: now,
    });
  }

  return records;
}

function deriveInsights(state: AIMemoryState, records: MemoryRecord[]): AIInsight[] {
  const now = new Date().toISOString();
  const insights: AIInsight[] = [];
  const relay = state.snapshots.relay ?? {};
  const family = state.snapshots.family ?? {};
  const meals = state.snapshots.meals ?? {};
  const finances = state.snapshots.finances ?? {};
  const pets = state.snapshots.pets ?? {};

  const completionRate = asNumber(relay.taskCompletionRate, 1);
  if (completionRate < 0.65 && state.controls.categories.behavioral) {
    insights.push({
      id: 'ins-task-completion',
      title: 'Task load may be too dense',
      body: 'You are completing fewer than 65% of active tasks. Relay can rebalance timing.',
      category: 'behavioral',
      severity: 'medium',
      confidence: 0.78,
      actionLabel: 'Open Tasks',
      actionRoute: '/tasks',
      why: 'Derived from completion and snooze patterns in recent task activity.',
      sourceMemoryIds: ['mem-beh-task-rate'],
      createdAtISO: now,
    });
  }

  if (asNumber(family.overlapCount) > 0 && state.controls.categories.relational) {
    insights.push({
      id: 'ins-family-overlap',
      title: 'Family schedule conflict detected',
      body: 'Multiple family events overlap in the same window next week.',
      category: 'relational',
      severity: 'medium',
      confidence: 0.74,
      actionLabel: 'Review Calendar',
      actionRoute: '/family/calendar',
      why: 'Detected from event date/time clustering in Family Hub.',
      sourceMemoryIds: ['mem-rel-family-load'],
      createdAtISO: now,
    });
  }

  if (asNumber(finances.overBudgetCategories) > 0 && state.controls.categories.contextual) {
    insights.push({
      id: 'ins-budget-watch',
      title: 'Budget categories drifting high',
      body: `${asNumber(finances.overBudgetCategories)} budget categories are above target this month.`,
      category: 'contextual',
      severity: 'medium',
      confidence: 0.81,
      actionLabel: 'Open Finances',
      actionRoute: '/finances',
      why: 'Compared current category spend against configured budget caps.',
      sourceMemoryIds: ['mem-ctx-finance'],
      createdAtISO: now,
    });
  }

  if (asNumber(finances.rareSubscriptions) > 0 && state.controls.categories.contextual) {
    insights.push({
      id: 'ins-subscriptions',
      title: 'Subscription optimization available',
      body: `${asNumber(finances.rareSubscriptions)} subscriptions appear underused or high-cost.`,
      category: 'contextual',
      severity: 'info',
      confidence: 0.69,
      actionLabel: 'Review Subscriptions',
      actionRoute: '/finances/subscriptions',
      why: 'Usage flags indicate low engagement relative to recurring cost.',
      sourceMemoryIds: ['mem-ctx-finance'],
      createdAtISO: now,
    });
  }

  if (asNumber(pets.overdueVaccines) > 0 && state.controls.categories.contextual) {
    insights.push({
      id: 'ins-pet-health',
      title: 'Pet health follow-up suggested',
      body: `${asNumber(pets.overdueVaccines)} vaccine records are marked overdue.`,
      category: 'contextual',
      severity: 'medium',
      confidence: 0.77,
      actionLabel: 'Open Pets',
      actionRoute: '/pets',
      why: 'Health reminders show due dates older than today.',
      sourceMemoryIds: ['mem-ctx-pets-notes'],
      createdAtISO: now,
    });
  }

  if (asNumber(meals.repeatedGroceryCount) >= 8 && state.controls.categories.contextual) {
    insights.push({
      id: 'ins-grocery-pattern',
      title: 'Recurring grocery pattern found',
      body: 'Your grocery list repeats many items. Relay can pre-build staples weekly.',
      category: 'contextual',
      severity: 'info',
      confidence: 0.73,
      actionLabel: 'Open Grocery',
      actionRoute: '/meals/grocery',
      why: 'Repeated grocery terms were identified in active shopping items.',
      sourceMemoryIds: ['mem-ctx-grocery'],
      createdAtISO: now,
    });
  }

  const voiceHeavy = asNumber(relay.voiceTaskRatio, 0) >= 0.6;
  if (voiceHeavy && state.controls.categories.preference) {
    insights.push({
      id: 'ins-voice-default',
      title: 'Voice-first mode fits your usage',
      body: 'You create most items by voice. Relay can prioritize spoken quick actions.',
      category: 'preference',
      severity: 'info',
      confidence: 0.67,
      actionLabel: 'Open Memory Controls',
      actionRoute: '/ai/memory',
      why: 'Voice-created item ratio is consistently higher than manual creation.',
      sourceMemoryIds: ['mem-pref-input'],
      createdAtISO: now,
    });
  }

  if (!state.controls.proactiveEnabled) {
    return insights.filter((item) => item.severity === 'info').slice(0, 2);
  }

  const visible = insights.filter((item) => !state.dismissedInsightIds.includes(item.id));
  return visible.slice(0, 12);
}

function generateSummaryFromState(state: AIMemoryState, request: SummaryRequest): SummaryResult {
  const relay = state.snapshots.relay ?? {};
  const family = state.snapshots.family ?? {};
  const meals = state.snapshots.meals ?? {};
  const finances = state.snapshots.finances ?? {};
  const pets = state.snapshots.pets ?? {};
  const notes = state.snapshots.notes ?? {};

  const rangeLabel =
    request.range === 'today'
      ? 'Today'
      : request.range === 'this-week'
        ? 'This week'
        : request.range === 'last-week'
          ? 'Last week'
          : `${request.customStartISO || 'Custom start'} to ${request.customEndISO || 'Custom end'}`;

  const lines: string[] = [];
  const metrics: { label: string; value: string }[] = [];

  if (request.scope.includes('tasks')) {
    lines.push(`Tasks: ${asNumber(relay.tasksCompleted)} completed, ${asNumber(relay.tasksOpen)} still open.`);
    metrics.push({ label: 'Task completion', value: `${Math.round(asNumber(relay.taskCompletionRate, 0) * 100)}%` });
  }

  if (request.scope.includes('events')) {
    lines.push(`Calendar: ${asNumber(relay.eventsUpcoming)} upcoming events with ${asString(relay.busiestWeekday, 'mixed')} as the busiest weekday.`);
    metrics.push({ label: 'Upcoming events', value: `${asNumber(relay.eventsUpcoming)}` });
  }

  if (request.scope.includes('money')) {
    lines.push(`Finances: ${asNumber(finances.upcomingBills)} bills upcoming, ${asNumber(finances.overBudgetCategories)} categories above budget.`);
    metrics.push({ label: 'Weekly spend', value: `$${Math.round(asNumber(finances.weeklyExpenseTotal))}` });
  }

  if (request.scope.includes('meals')) {
    lines.push(`Meals: ${asNumber(meals.plannedSlots)} planned slots and ${asNumber(meals.groceryItems)} grocery entries.`);
    metrics.push({ label: 'Repeated staples', value: `${asNumber(meals.repeatedGroceryCount)}` });
  }

  if (request.scope.includes('family')) {
    lines.push(`Family: ${asNumber(family.openTasks)} shared tasks open across ${asNumber(family.membersCount)} members.`);
    metrics.push({ label: 'Family overlaps', value: `${asNumber(family.overlapCount)}` });
  }

  if (request.scope.includes('pets')) {
    lines.push(`Pets: ${asNumber(pets.activePets)} active profiles, ${asNumber(pets.overdueVaccines)} overdue vaccine reminders.`);
    metrics.push({ label: 'Upcoming vet items', value: `${asNumber(pets.upcomingVisits)}` });
  }

  if (request.scope.includes('notes')) {
    lines.push(`Notes & Docs: ${asNumber(notes.notesCount)} notes and ${asNumber(notes.docsCount)} documents are indexed.`);
    metrics.push({ label: 'Pinned knowledge', value: `${asNumber(notes.pinnedCount)}` });
  }

  if (!lines.length) {
    lines.push('Relay has not collected enough memory signals for this summary scope yet.');
  }

  return {
    id: makeId('summary'),
    title: `Relay summary · ${rangeLabel}`,
    rangeLabel,
    createdAtISO: new Date().toISOString(),
    lines,
    metrics,
    sourceSummary: 'Generated from in-app structured memory snapshots only.',
  };
}

const initialState: AIMemoryState = {
  controls: {
    categories: {
      preference: true,
      behavioral: true,
      temporal: true,
      relational: true,
      contextual: true,
    },
    proactiveEnabled: true,
    learningEnabled: true,
  },
  snapshots: {},
  events: [],
  actionLedger: {
    voiceCommands: 0,
    voiceQuestions: 0,
    appliedInsights: 0,
    dismissedInsights: 0,
    recentVoicePhrases: [],
  },
  records: [],
  insights: [],
  dismissedInsightIds: [],
  summaries: [],
  lastSummaryId: undefined,
};

function recompute(state: AIMemoryState): AIMemoryState {
  const records = deriveRecords(state);
  const insights = deriveInsights(state, records);
  return {
    ...state,
    records,
    insights,
  };
}

function reducer(state: AIMemoryState, action: AIMemoryAction): AIMemoryState {
  switch (action.type) {
    case 'INGEST_EVENT': {
      if (!state.controls.learningEnabled) {
        return {
          ...state,
          events: cap([...state.events, action.event], 300),
        };
      }

      const nextEvents = cap([...state.events, action.event], 300);
      let nextSnapshots = state.snapshots;
      let nextLedger = state.actionLedger;

      if (action.event.kind === 'snapshot') {
        nextSnapshots = {
          ...state.snapshots,
          [action.event.source]: action.event.payload,
        };
      }

      if (action.event.source === 'voice') {
        const phrase = asString(action.event.payload.text);
        const isQuestion = phrase.includes('?') || asString(action.event.payload.intent).includes('why');
        nextLedger = {
          ...state.actionLedger,
          voiceCommands: state.actionLedger.voiceCommands + 1,
          voiceQuestions: state.actionLedger.voiceQuestions + (isQuestion ? 1 : 0),
          recentVoicePhrases: phrase
            ? cap([...state.actionLedger.recentVoicePhrases, phrase], 8)
            : state.actionLedger.recentVoicePhrases,
        };
      }

      return recompute({
        ...state,
        snapshots: nextSnapshots,
        events: nextEvents,
        actionLedger: nextLedger,
      });
    }

    case 'TOGGLE_CATEGORY': {
      return recompute({
        ...state,
        controls: {
          ...state.controls,
          categories: {
            ...state.controls.categories,
            [action.category]: action.enabled,
          },
        },
      });
    }

    case 'TOGGLE_PROACTIVE': {
      return recompute({
        ...state,
        controls: {
          ...state.controls,
          proactiveEnabled: action.enabled,
        },
      });
    }

    case 'TOGGLE_LEARNING': {
      return {
        ...state,
        controls: {
          ...state.controls,
          learningEnabled: action.enabled,
        },
      };
    }

    case 'CLEAR_CATEGORY': {
      const records = state.records.filter((record) => record.category !== action.category);
      const insights = state.insights.filter((insight) => insight.category !== action.category);
      return {
        ...state,
        records,
        insights,
      };
    }

    case 'RESET_ALL': {
      return {
        ...initialState,
      };
    }

    case 'DISMISS_INSIGHT': {
      return {
        ...state,
        dismissedInsightIds: state.dismissedInsightIds.includes(action.id)
          ? state.dismissedInsightIds
          : [...state.dismissedInsightIds, action.id],
        insights: state.insights.filter((insight) => insight.id !== action.id),
        actionLedger: {
          ...state.actionLedger,
          dismissedInsights: state.actionLedger.dismissedInsights + 1,
        },
      };
    }

    case 'RESTORE_INSIGHT': {
      return recompute({
        ...state,
        dismissedInsightIds: state.dismissedInsightIds.filter((id) => id !== action.id),
      });
    }

    case 'APPLY_INSIGHT': {
      return {
        ...state,
        actionLedger: {
          ...state.actionLedger,
          appliedInsights: state.actionLedger.appliedInsights + 1,
        },
      };
    }

    case 'SAVE_SUMMARY': {
      return {
        ...state,
        summaries: [action.summary, ...state.summaries],
        lastSummaryId: action.summary.id,
      };
    }

    default:
      return state;
  }
}

type AIMemoryContextValue = {
  state: AIMemoryState;
  insights: AIInsight[];
  records: MemoryRecord[];
  summaries: SummaryResult[];
  getInsight: (id: string) => AIInsight | undefined;
  getSummary: (id: string) => SummaryResult | undefined;
  toggleCategory: (category: MemoryCategoryKey, enabled: boolean) => void;
  toggleProactive: (enabled: boolean) => void;
  toggleLearning: (enabled: boolean) => void;
  clearCategory: (category: MemoryCategoryKey) => void;
  resetAllMemory: () => void;
  dismissInsight: (id: string) => void;
  restoreInsight: (id: string) => void;
  applyInsight: (id: string) => void;
  generateSummary: (request: SummaryRequest) => SummaryResult;
  answerVoiceMemoryQuery: (query: string) => { answer: string; sources: string[] };
};

const AIMemoryContext = createContext<AIMemoryContextValue | null>(null);

export function AIMemoryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  React.useEffect(() => {
    return subscribeAIMemoryEvents((event) => {
      dispatch({ type: 'INGEST_EVENT', event });
    });
  }, []);

  const value = useMemo<AIMemoryContextValue>(
    () => ({
      state,
      insights: state.insights,
      records: state.records,
      summaries: state.summaries,
      getInsight: (id) => state.insights.find((insight) => insight.id === id),
      getSummary: (id) => state.summaries.find((summary) => summary.id === id),
      toggleCategory: (category, enabled) => dispatch({ type: 'TOGGLE_CATEGORY', category, enabled }),
      toggleProactive: (enabled) => dispatch({ type: 'TOGGLE_PROACTIVE', enabled }),
      toggleLearning: (enabled) => dispatch({ type: 'TOGGLE_LEARNING', enabled }),
      clearCategory: (category) => dispatch({ type: 'CLEAR_CATEGORY', category }),
      resetAllMemory: () => dispatch({ type: 'RESET_ALL' }),
      dismissInsight: (id) => dispatch({ type: 'DISMISS_INSIGHT', id }),
      restoreInsight: (id) => dispatch({ type: 'RESTORE_INSIGHT', id }),
      applyInsight: (id) => {
        dispatch({ type: 'APPLY_INSIGHT', id });
        emitAIMemoryEvent({
          source: 'voice',
          kind: 'action',
          payload: {
            intent: 'apply_insight',
            insightId: id,
          },
        });
      },
      generateSummary: (request) => {
        const summary = generateSummaryFromState(state, request);
        dispatch({ type: 'SAVE_SUMMARY', summary });
        emitAIMemoryEvent({
          source: 'voice',
          kind: 'action',
          payload: {
            intent: 'summary_generated',
            range: request.range,
            scope: request.scope,
          },
        });
        return summary;
      },
      answerVoiceMemoryQuery: (query) => {
        const lower = query.toLowerCase();
        if (lower.includes('why') && lower.includes('remind')) {
          return {
            answer:
              'Relay triggered this reminder because your recent completion pattern shows similar items slipping when scheduled late in the day.',
            sources: ['Behavioral memory', 'Temporal memory'],
          };
        }

        if (lower.includes('forget') || lower.includes('last week')) {
          return {
            answer:
              'Last-week patterns show lower completion in clustered evening windows. Relay suggests spreading high-priority tasks earlier.',
            sources: ['Behavioral memory', 'Temporal memory'],
          };
        }

        if (lower.includes('usually') && lower.includes('eat')) {
          return {
            answer: 'You frequently repeat staples like milk, eggs, spinach, and yogurt. Relay can auto-build a weekly staples list.',
            sources: ['Contextual memory'],
          };
        }

        return {
          answer: 'Relay can answer this once more memory signals are collected from your in-app actions.',
          sources: ['Memory dashboard'],
        };
      },
    }),
    [state]
  );

  return <AIMemoryContext.Provider value={value}>{children}</AIMemoryContext.Provider>;
}

export function useAIMemory() {
  const context = useContext(AIMemoryContext);
  if (!context) {
    throw new Error('useAIMemory must be used within AIMemoryProvider');
  }
  return context;
}
