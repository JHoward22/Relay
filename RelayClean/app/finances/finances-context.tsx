import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { emitAIMemoryEvent } from '@/store/ai-memory-events';
import {
  consumePendingVoiceActions,
  PendingVoiceAction,
  subscribePendingVoiceActions,
} from '@/store/voice-router/pending-actions';

export type FinanceTimeRange = 'week' | 'month' | 'custom';

export type Bill = {
  id: string;
  name: string;
  amount: number;
  dueDateISO: string;
  frequency: 'monthly' | 'annual' | 'one-time';
  status: 'upcoming' | 'paid' | 'overdue';
  autopay: boolean;
  categoryId: string;
  notes?: string;
  linkedReminderId?: string;
  history: { id: string; dateISO: string; amount: number; status: 'paid' | 'late' }[];
};

export type Subscription = {
  id: string;
  name: string;
  cost: number;
  renewDateISO: string;
  frequency: 'monthly' | 'annual';
  status: 'active' | 'canceled';
  usageFlag: 'normal' | 'rarely-used' | 'high-cost';
  notes?: string;
  linkedReminderId?: string;
};

export type Budget = {
  id: string;
  timeframe: FinanceTimeRange;
  startISO: string;
  endISO: string;
  totalLimit: number;
  categoryLimits: { categoryId: string; limit: number }[];
  spentToDate: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  budgetLimit: number;
  trendDeltaPercent: number;
  transactionIds: string[];
};

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  title: string;
  amount: number;
  dateISO: string;
  categoryId: string;
  source: 'manual' | 'ai';
  notes?: string;
  memberId?: string;
};

export type Income = {
  id: string;
  sourceName: string;
  amount: number;
  dateISO: string;
  recurring: boolean;
  frequency?: 'monthly' | 'biweekly' | 'one-time';
  notes?: string;
};

export type ReminderLinkage = {
  id: string;
  sourceType: 'bill' | 'subscription';
  sourceId: string;
  remindAtISO: string;
  leadTime: string;
  enabled: boolean;
};

export type FinanceInsight = {
  id: string;
  type:
    | 'food_overspend'
    | 'subscription_cluster'
    | 'rarely_used_subscriptions'
    | 'heavy_bill_week'
    | 'cashflow_warning'
    | 'positive_progress';
  title: string;
  body: string;
  severity: 'low' | 'medium' | 'info';
  actionRoute: string;
};

type FinancesState = {
  bills: Bill[];
  subscriptions: Subscription[];
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  incomes: Income[];
  reminders: ReminderLinkage[];
  selectedTimeRange: FinanceTimeRange;
  customRange?: { startISO: string; endISO: string };
  dismissedInsightIds: string[];
};

type FinancesAction =
  | { type: 'SET_TIME_RANGE'; payload: FinanceTimeRange }
  | { type: 'SET_CUSTOM_RANGE'; payload: { startISO: string; endISO: string } }
  | { type: 'DISMISS_INSIGHT'; id: string }
  | { type: 'ADD_BILL'; payload: Omit<Bill, 'id' | 'status' | 'history'> }
  | { type: 'UPDATE_BILL'; id: string; payload: Partial<Bill> }
  | { type: 'DELETE_BILL'; id: string }
  | { type: 'MARK_BILL_PAID'; id: string }
  | { type: 'ADD_SUBSCRIPTION'; payload: Omit<Subscription, 'id' | 'status' | 'usageFlag'> }
  | { type: 'UPDATE_SUBSCRIPTION'; id: string; payload: Partial<Subscription> }
  | { type: 'CANCEL_SUBSCRIPTION'; id: string }
  | { type: 'DELETE_SUBSCRIPTION'; id: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'UPDATE_CATEGORY_BUDGET'; payload: { categoryId: string; budgetLimit: number } }
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id'> }
  | { type: 'ADD_INCOME'; payload: Omit<Income, 'id'> }
  | { type: 'ADD_REMINDER_LINK'; payload: Omit<ReminderLinkage, 'id'> };

const idGen = (() => {
  let c = 2000;
  return (prefix: string) => {
    c += 1;
    return `${prefix}-${c}`;
  };
})();

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const seedCategories: Category[] = [
  { id: 'cat-food', name: 'Food', icon: 'restaurant-outline', color: '#D48A47', spent: 520, budgetLimit: 450, trendDeltaPercent: 12, transactionIds: ['tx-1', 'tx-2'] },
  { id: 'cat-housing', name: 'Housing', icon: 'home-outline', color: '#5D83D5', spent: 2300, budgetLimit: 2300, trendDeltaPercent: 0, transactionIds: ['tx-3'] },
  { id: 'cat-family', name: 'Family', icon: 'people-outline', color: '#57A27D', spent: 260, budgetLimit: 350, trendDeltaPercent: -8, transactionIds: ['tx-4'] },
  { id: 'cat-transport', name: 'Transport', icon: 'car-outline', color: '#7C8BC8', spent: 190, budgetLimit: 240, trendDeltaPercent: -5, transactionIds: ['tx-5'] },
];

const seedBills: Bill[] = [
  {
    id: 'bill-1',
    name: 'Rent',
    amount: 2300,
    dueDateISO: isoOffset(3),
    frequency: 'monthly',
    status: 'upcoming',
    autopay: false,
    categoryId: 'cat-housing',
    notes: 'Due on first of month.',
    linkedReminderId: 'rem-1',
    history: [{ id: 'bh-1', dateISO: isoOffset(-30), amount: 2300, status: 'paid' }],
  },
  {
    id: 'bill-2',
    name: 'Electricity',
    amount: 126,
    dueDateISO: isoOffset(5),
    frequency: 'monthly',
    status: 'upcoming',
    autopay: true,
    categoryId: 'cat-housing',
    notes: 'Usage spikes in winter.',
    linkedReminderId: 'rem-2',
    history: [{ id: 'bh-2', dateISO: isoOffset(-31), amount: 118, status: 'paid' }],
  },
  {
    id: 'bill-3',
    name: 'Credit card',
    amount: 420,
    dueDateISO: isoOffset(-2),
    frequency: 'monthly',
    status: 'paid',
    autopay: false,
    categoryId: 'cat-transport',
    notes: 'Include fuel and tolls.',
    history: [{ id: 'bh-3', dateISO: isoOffset(-2), amount: 420, status: 'paid' }],
  },
];

const seedSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Relay Pro',
    cost: 8,
    renewDateISO: isoOffset(8),
    frequency: 'monthly',
    status: 'active',
    usageFlag: 'normal',
    notes: 'Core assistant plan.',
    linkedReminderId: 'rem-3',
  },
  {
    id: 'sub-2',
    name: 'Music Family',
    cost: 16,
    renewDateISO: isoOffset(12),
    frequency: 'monthly',
    status: 'active',
    usageFlag: 'rarely-used',
    notes: 'Usage dropped this month.',
  },
  {
    id: 'sub-3',
    name: 'Cloud Storage',
    cost: 4,
    renewDateISO: isoOffset(1),
    frequency: 'monthly',
    status: 'active',
    usageFlag: 'high-cost',
    notes: 'Consider annual pricing.',
  },
];

const seedTransactions: Transaction[] = [
  { id: 'tx-1', type: 'expense', title: 'Groceries', amount: 280, dateISO: isoOffset(-4), categoryId: 'cat-food', source: 'manual' },
  { id: 'tx-2', type: 'expense', title: 'Dinner out', amount: 74, dateISO: isoOffset(-2), categoryId: 'cat-food', source: 'manual' },
  { id: 'tx-3', type: 'expense', title: 'Rent payment', amount: 2300, dateISO: isoOffset(-10), categoryId: 'cat-housing', source: 'manual' },
  { id: 'tx-4', type: 'expense', title: 'School supplies', amount: 90, dateISO: isoOffset(-3), categoryId: 'cat-family', source: 'manual' },
  { id: 'tx-5', type: 'expense', title: 'Fuel', amount: 58, dateISO: isoOffset(-1), categoryId: 'cat-transport', source: 'manual' },
  { id: 'tx-6', type: 'income', title: 'Salary', amount: 5400, dateISO: isoOffset(-12), categoryId: 'cat-housing', source: 'manual' },
];

const seedIncomes: Income[] = [
  { id: 'inc-1', sourceName: 'Primary salary', amount: 5400, dateISO: isoOffset(-12), recurring: true, frequency: 'monthly' },
  { id: 'inc-2', sourceName: 'Freelance project', amount: 650, dateISO: isoOffset(-6), recurring: false, frequency: 'one-time' },
];

const seedBudget: Budget = {
  id: 'budget-1',
  timeframe: 'month',
  startISO: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10),
  endISO: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10),
  totalLimit: 4200,
  categoryLimits: seedCategories.map((cat) => ({ categoryId: cat.id, limit: cat.budgetLimit })),
  spentToDate: seedCategories.reduce((sum, cat) => sum + cat.spent, 0),
};

const initialState: FinancesState = {
  bills: seedBills,
  subscriptions: seedSubscriptions,
  budgets: [seedBudget],
  categories: seedCategories,
  transactions: seedTransactions,
  incomes: seedIncomes,
  reminders: [
    { id: 'rem-1', sourceType: 'bill', sourceId: 'bill-1', remindAtISO: isoOffset(2), leadTime: '1 day before', enabled: true },
    { id: 'rem-2', sourceType: 'bill', sourceId: 'bill-2', remindAtISO: isoOffset(4), leadTime: '1 day before', enabled: true },
    { id: 'rem-3', sourceType: 'subscription', sourceId: 'sub-1', remindAtISO: isoOffset(7), leadTime: '1 day before', enabled: true },
  ],
  selectedTimeRange: 'month',
  dismissedInsightIds: [],
};

function computeInsights(state: FinancesState): FinanceInsight[] {
  const incomeTotal = state.incomes.reduce((sum, income) => sum + income.amount, 0);
  const expenseTotal = state.transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const food = state.categories.find((category) => category.name.toLowerCase() === 'food');
  const dueSoonBills = state.bills.filter((bill) => bill.status !== 'paid' && new Date(`${bill.dueDateISO}T00:00:00`).getTime() - Date.now() <= 7 * 24 * 60 * 60 * 1000);
  const rarelyUsed = state.subscriptions.filter((sub) => sub.usageFlag === 'rarely-used' && sub.status === 'active');
  const highCost = state.subscriptions.filter((sub) => sub.usageFlag === 'high-cost' && sub.status === 'active');

  const insights: FinanceInsight[] = [];

  if (food && food.spent > food.budgetLimit * 1.1) {
    insights.push({
      id: 'ins-food',
      type: 'food_overspend',
      title: 'Food spending is above plan this month',
      body: `Food is ${Math.round(((food.spent - food.budgetLimit) / food.budgetLimit) * 100)}% above your target.`,
      severity: 'medium',
      actionRoute: '/finances/categories/cat-food',
    });
  }

  if (dueSoonBills.length >= 2) {
    insights.push({
      id: 'ins-bills',
      type: 'heavy_bill_week',
      title: 'Bills are heavier this week',
      body: `${dueSoonBills.length} bills are due in the next 7 days.`,
      severity: 'medium',
      actionRoute: '/finances/bills',
    });
  }

  if (rarelyUsed.length >= 1) {
    insights.push({
      id: 'ins-rare-subs',
      type: 'rarely_used_subscriptions',
      title: 'Subscriptions with low usage found',
      body: `${rarelyUsed.length} subscription${rarelyUsed.length > 1 ? 's' : ''} may be cancel candidates.`,
      severity: 'low',
      actionRoute: '/finances/subscriptions',
    });
  }

  if (highCost.length >= 1) {
    insights.push({
      id: 'ins-sub-cluster',
      type: 'subscription_cluster',
      title: 'Upcoming renewals this week',
      body: `${highCost.length} higher-cost subscription${highCost.length > 1 ? 's renew' : ' renews'} soon.`,
      severity: 'low',
      actionRoute: '/finances/subscriptions',
    });
  }

  if (incomeTotal > 0 && expenseTotal / incomeTotal > 0.82) {
    insights.push({
      id: 'ins-cashflow',
      type: 'cashflow_warning',
      title: 'Spending is close to this month\'s income',
      body: 'Consider delaying optional purchases this week.',
      severity: 'medium',
      actionRoute: '/finances/summary',
    });
  }

  if (!insights.length) {
    insights.push({
      id: 'ins-positive',
      type: 'positive_progress',
      title: 'You are on track this month',
      body: 'Most categories are within budget and upcoming bills are covered.',
      severity: 'info',
      actionRoute: '/finances/summary',
    });
  }

  return insights.filter((insight) => !state.dismissedInsightIds.includes(insight.id));
}

function reducer(state: FinancesState, action: FinancesAction): FinancesState {
  switch (action.type) {
    case 'SET_TIME_RANGE':
      return {
        ...state,
        selectedTimeRange: action.payload,
      };
    case 'SET_CUSTOM_RANGE':
      return {
        ...state,
        selectedTimeRange: 'custom',
        customRange: action.payload,
      };
    case 'DISMISS_INSIGHT':
      return {
        ...state,
        dismissedInsightIds: [...new Set([...state.dismissedInsightIds, action.id])],
      };
    case 'ADD_BILL': {
      const bill: Bill = {
        ...action.payload,
        id: idGen('bill'),
        status: 'upcoming',
        history: [],
      };
      return {
        ...state,
        bills: [bill, ...state.bills],
      };
    }
    case 'UPDATE_BILL':
      return {
        ...state,
        bills: state.bills.map((bill) => (bill.id === action.id ? { ...bill, ...action.payload } : bill)),
      };
    case 'DELETE_BILL':
      return {
        ...state,
        bills: state.bills.filter((bill) => bill.id !== action.id),
      };
    case 'MARK_BILL_PAID':
      return {
        ...state,
        bills: state.bills.map((bill) =>
          bill.id === action.id
            ? {
                ...bill,
                status: 'paid',
                history: [
                  {
                    id: idGen('bh'),
                    amount: bill.amount,
                    dateISO: new Date().toISOString().slice(0, 10),
                    status: 'paid',
                  },
                  ...bill.history,
                ],
              }
            : bill
        ),
      };
    case 'ADD_SUBSCRIPTION': {
      const sub: Subscription = {
        ...action.payload,
        id: idGen('sub'),
        status: 'active',
        usageFlag: 'normal',
      };
      return {
        ...state,
        subscriptions: [sub, ...state.subscriptions],
      };
    }
    case 'UPDATE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map((sub) => (sub.id === action.id ? { ...sub, ...action.payload } : sub)),
      };
    case 'CANCEL_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.map((sub) => (sub.id === action.id ? { ...sub, status: 'canceled' } : sub)),
      };
    case 'DELETE_SUBSCRIPTION':
      return {
        ...state,
        subscriptions: state.subscriptions.filter((sub) => sub.id !== action.id),
      };
    case 'SET_BUDGET': {
      const existing = state.budgets.find((budget) => budget.id === action.payload.id);
      return {
        ...state,
        budgets: existing
          ? state.budgets.map((budget) => (budget.id === action.payload.id ? action.payload : budget))
          : [action.payload, ...state.budgets],
        categories: state.categories.map((cat) => {
          const limit = action.payload.categoryLimits.find((entry) => entry.categoryId === cat.id)?.limit;
          return limit ? { ...cat, budgetLimit: limit } : cat;
        }),
      };
    }
    case 'UPDATE_CATEGORY_BUDGET':
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.categoryId ? { ...cat, budgetLimit: action.payload.budgetLimit } : cat
        ),
      };
    case 'ADD_TRANSACTION': {
      const tx: Transaction = {
        ...action.payload,
        id: idGen('tx'),
      };
      return {
        ...state,
        transactions: [tx, ...state.transactions],
        categories: state.categories.map((cat) =>
          cat.id === tx.categoryId
            ? {
                ...cat,
                spent: tx.type === 'expense' ? cat.spent + tx.amount : Math.max(0, cat.spent - tx.amount),
                transactionIds: [tx.id, ...cat.transactionIds],
              }
            : cat
        ),
      };
    }
    case 'ADD_INCOME': {
      const income: Income = {
        ...action.payload,
        id: idGen('inc'),
      };
      return {
        ...state,
        incomes: [income, ...state.incomes],
      };
    }
    case 'ADD_REMINDER_LINK': {
      const reminder: ReminderLinkage = {
        ...action.payload,
        id: idGen('rem'),
      };
      return {
        ...state,
        reminders: [reminder, ...state.reminders],
      };
    }
    default:
      return state;
  }
}

type FinancesStore = {
  state: FinancesState;
  insights: FinanceInsight[];
  setTimeRange: (range: FinanceTimeRange) => void;
  setCustomRange: (payload: { startISO: string; endISO: string }) => void;
  dismissInsight: (id: string) => void;
  addBill: (payload: Omit<Bill, 'id' | 'status' | 'history'>) => void;
  updateBill: (id: string, payload: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  markBillPaid: (id: string) => void;
  addSubscription: (payload: Omit<Subscription, 'id' | 'status' | 'usageFlag'>) => void;
  updateSubscription: (id: string, payload: Partial<Subscription>) => void;
  cancelSubscription: (id: string) => void;
  deleteSubscription: (id: string) => void;
  setBudget: (budget: Budget) => void;
  updateCategoryBudget: (payload: { categoryId: string; budgetLimit: number }) => void;
  addTransaction: (payload: Omit<Transaction, 'id'>) => void;
  addIncome: (payload: Omit<Income, 'id'>) => void;
  addReminderLink: (payload: Omit<ReminderLinkage, 'id'>) => void;
};

const FinancesContext = createContext<FinancesStore | null>(null);

export function FinancesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const insights = useMemo(() => computeInsights(state), [state]);

  useEffect(() => {
    const applyPendingAction = (action: PendingVoiceAction) => {
      if (action.type === 'add_bill') {
        const name = typeof action.payload.name === 'string' ? action.payload.name : 'Voice bill';
        const amount =
          typeof action.payload.amount === 'number'
            ? action.payload.amount
            : Number(action.payload.amount) || 0;
        const dueDateISO =
          typeof action.payload.dueDateISO === 'string'
            ? action.payload.dueDateISO
            : new Date().toISOString().slice(0, 10);
        const recurrence = action.payload.recurrence;
        const frequency: Bill['frequency'] =
          recurrence === 'monthly' || recurrence === 'annual' || recurrence === 'one-time'
            ? recurrence
            : 'one-time';
        const notes = typeof action.payload.notes === 'string' ? action.payload.notes : undefined;
        dispatch({
          type: 'ADD_BILL',
          payload: {
            name,
            amount,
            dueDateISO,
            frequency,
            autopay: false,
            categoryId: 'cat-housing',
            notes,
          },
        });
        return;
      }

      if (action.type === 'add_subscription') {
        const name = typeof action.payload.name === 'string' ? action.payload.name : 'Voice subscription';
        const cost =
          typeof action.payload.amount === 'number'
            ? action.payload.amount
            : Number(action.payload.amount) || 0;
        const renewDateISO =
          typeof action.payload.renewDateISO === 'string'
            ? action.payload.renewDateISO
            : new Date().toISOString().slice(0, 10);
        const recurrence = action.payload.recurrence;
        const frequency: Subscription['frequency'] =
          recurrence === 'annual' || recurrence === 'monthly' ? recurrence : 'monthly';
        const notes = typeof action.payload.notes === 'string' ? action.payload.notes : undefined;
        dispatch({
          type: 'ADD_SUBSCRIPTION',
          payload: {
            name,
            cost,
            renewDateISO,
            frequency,
            notes,
          },
        });
        return;
      }

      if (action.type === 'mark_bill_paid') {
        const title =
          typeof action.payload.title === 'string' ? action.payload.title.toLowerCase().trim() : '';
        if (!title) return;
        const bill = state.bills.find((item) => item.name.toLowerCase().includes(title));
        if (!bill) return;
        dispatch({ type: 'MARK_BILL_PAID', id: bill.id });
        return;
      }

      if (action.type === 'cancel_subscription') {
        const title =
          typeof action.payload.title === 'string' ? action.payload.title.toLowerCase().trim() : '';
        if (!title) return;
        const sub = state.subscriptions.find((item) =>
          item.name.toLowerCase().includes(title)
        );
        if (!sub) return;
        dispatch({ type: 'CANCEL_SUBSCRIPTION', id: sub.id });
      }
    };

    consumePendingVoiceActions('finances').forEach(applyPendingAction);
    return subscribePendingVoiceActions('finances', applyPendingAction);
  }, [state.bills, state.subscriptions]);

  useEffect(() => {
    const upcomingBills = state.bills.filter((bill) => bill.status === 'upcoming').length;
    const overdueBills = state.bills.filter((bill) => bill.status === 'overdue').length;
    const overBudgetCategories = state.categories.filter((category) => category.spent > category.budgetLimit).length;
    const rareSubscriptions = state.subscriptions.filter((sub) => sub.usageFlag === 'rarely-used' || sub.usageFlag === 'high-cost').length;
    const weeklyExpenseTotal = state.transactions
      .filter((tx) => tx.type === 'expense')
      .filter((tx) => {
        const txDate = new Date(`${tx.dateISO}T00:00:00`).getTime();
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return txDate >= cutoff;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    emitAIMemoryEvent({
      source: 'finances',
      kind: 'snapshot',
      payload: {
        upcomingBills,
        overdueBills,
        overBudgetCategories,
        rareSubscriptions,
        weeklyExpenseTotal,
      },
    });
  }, [state.bills, state.categories, state.subscriptions, state.transactions]);

  const value = useMemo<FinancesStore>(
    () => ({
      state,
      insights,
      setTimeRange: (range) => dispatch({ type: 'SET_TIME_RANGE', payload: range }),
      setCustomRange: (payload) => dispatch({ type: 'SET_CUSTOM_RANGE', payload }),
      dismissInsight: (id) => dispatch({ type: 'DISMISS_INSIGHT', id }),
      addBill: (payload) => dispatch({ type: 'ADD_BILL', payload }),
      updateBill: (id, payload) => dispatch({ type: 'UPDATE_BILL', id, payload }),
      deleteBill: (id) => dispatch({ type: 'DELETE_BILL', id }),
      markBillPaid: (id) => dispatch({ type: 'MARK_BILL_PAID', id }),
      addSubscription: (payload) => dispatch({ type: 'ADD_SUBSCRIPTION', payload }),
      updateSubscription: (id, payload) => dispatch({ type: 'UPDATE_SUBSCRIPTION', id, payload }),
      cancelSubscription: (id) => dispatch({ type: 'CANCEL_SUBSCRIPTION', id }),
      deleteSubscription: (id) => dispatch({ type: 'DELETE_SUBSCRIPTION', id }),
      setBudget: (budget) => dispatch({ type: 'SET_BUDGET', payload: budget }),
      updateCategoryBudget: (payload) => dispatch({ type: 'UPDATE_CATEGORY_BUDGET', payload }),
      addTransaction: (payload) => dispatch({ type: 'ADD_TRANSACTION', payload }),
      addIncome: (payload) => dispatch({ type: 'ADD_INCOME', payload }),
      addReminderLink: (payload) => dispatch({ type: 'ADD_REMINDER_LINK', payload }),
    }),
    [state, insights]
  );

  return <FinancesContext.Provider value={value}>{children}</FinancesContext.Provider>;
}

export function useFinancesStore() {
  const context = useContext(FinancesContext);
  if (!context) {
    throw new Error('useFinancesStore must be used within FinancesProvider');
  }
  return context;
}

export function fmtCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function billDueLabel(bill: Bill) {
  const due = new Date(`${bill.dueDateISO}T00:00:00`).getTime();
  const diffDays = Math.ceil((due - Date.now()) / (24 * 60 * 60 * 1000));
  if (bill.status === 'paid') return 'Paid';
  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`;
  if (diffDays === 0) return 'Due today';
  return `Due in ${diffDays}d`;
}

export function subscriptionRenewalLabel(sub: Subscription) {
  const due = new Date(`${sub.renewDateISO}T00:00:00`).getTime();
  const diffDays = Math.ceil((due - Date.now()) / (24 * 60 * 60 * 1000));
  if (sub.status === 'canceled') return 'Canceled';
  if (diffDays < 0) return `Renewed ${Math.abs(diffDays)}d ago`;
  if (diffDays === 0) return 'Renews today';
  return `Renews in ${diffDays}d`;
}

export function findCategoryName(categories: Category[], categoryId: string) {
  return categories.find((cat) => cat.id === categoryId)?.name || 'General';
}
