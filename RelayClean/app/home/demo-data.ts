export type ReminderRecord = {
  id: string;
  title: string;
  dueLabel: string;
  group: 'today' | 'upcoming' | 'recurring';
  repeat?: string;
  context: string;
};

export type FollowUpRecord = {
  id: string;
  title: string;
  contact: string;
  dueLabel: string;
  status: 'needs-reply' | 'scheduled' | 'sent';
  context: string;
  aiDraft: string;
};

export type MealRecord = {
  id: string;
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  title: string;
  status: 'planned' | 'needs-grocery';
  groceryCount: number;
  notes: string;
};

export type BillRecord = {
  id: string;
  title: string;
  amount: string;
  dueLabel: string;
  status: 'due' | 'paid';
  category: string;
};

export type SubscriptionRecord = {
  id: string;
  title: string;
  amount: string;
  renewalLabel: string;
  status: 'active' | 'review';
  note: string;
};

export type PetProfileRecord = {
  id: string;
  name: string;
  species: string;
  age: string;
  vet: string;
  nextVisit: string;
  meds: string[];
  routineIds: string[];
};

export type PetRoutineRecord = {
  id: string;
  petId: string;
  title: string;
  frequency: string;
  nextDue: string;
};

export type NoteRecord = {
  id: string;
  title: string;
  body: string;
  updatedAt: string;
  source: 'manual' | 'summary' | 'voice';
};

export type FamilyAssignmentRecord = {
  id: string;
  title: string;
  owner: string;
  dueLabel: string;
  status: 'open' | 'done';
};

export type FamilyAnnouncementRecord = {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  postedAt: string;
};

export let remindersData: ReminderRecord[] = [
  {
    id: 'r1',
    title: 'Take vitamins',
    dueLabel: 'Today · Evening',
    group: 'today',
    context: 'Wellness routine',
  },
  {
    id: 'r2',
    title: 'Confirm dentist follow-up',
    dueLabel: 'Tomorrow · 9:00 AM',
    group: 'upcoming',
    context: 'Health reminder',
  },
  {
    id: 'r3',
    title: 'Flea medicine for Buddy',
    dueLabel: '1st of each month',
    group: 'recurring',
    repeat: 'Monthly',
    context: 'Pet care recurring',
  },
  {
    id: 'r4',
    title: 'Pay internet bill',
    dueLabel: 'Friday · 6:00 PM',
    group: 'upcoming',
    context: 'Billing reminder',
  },
];

export let followUpsData: FollowUpRecord[] = [
  {
    id: 'f1',
    title: "Reply to Emma's teacher",
    contact: "Emma's teacher",
    dueLabel: 'Awaiting response since Monday',
    status: 'needs-reply',
    context: 'Permission slip follow-up',
    aiDraft: "Yes, I'll make sure Emma brings the signed permission slip by Friday.",
  },
  {
    id: 'f2',
    title: 'Check contractor estimate',
    contact: 'Blue Oak Plumbing',
    dueLabel: 'Follow up tomorrow morning',
    status: 'scheduled',
    context: 'Home maintenance',
    aiDraft: 'Hi, checking in on the estimate timeline. Thanks again.',
  },
  {
    id: 'f3',
    title: 'Thank coach for schedule update',
    contact: 'Coach Mina',
    dueLabel: 'Sent today',
    status: 'sent',
    context: 'School activity',
    aiDraft: 'Thanks for sharing the updated practice calendar.',
  },
];

export const mealsData: MealRecord[] = [
  {
    id: 'm1',
    day: 'Monday',
    mealType: 'Dinner',
    title: 'Sheet pan salmon and vegetables',
    status: 'planned',
    groceryCount: 2,
    notes: 'Low-prep weeknight meal.',
  },
  {
    id: 'm2',
    day: 'Tuesday',
    mealType: 'Dinner',
    title: 'Turkey taco bowls',
    status: 'needs-grocery',
    groceryCount: 5,
    notes: 'Need cilantro, avocados, yogurt.',
  },
  {
    id: 'm3',
    day: 'Wednesday',
    mealType: 'Lunch',
    title: 'Mediterranean salad prep',
    status: 'planned',
    groceryCount: 1,
    notes: 'Prep for two lunches.',
  },
];

export const groceryData = [
  { id: 'g1', label: 'Avocados', checked: false },
  { id: 'g2', label: 'Greek yogurt', checked: false },
  { id: 'g3', label: 'Salmon fillets', checked: true },
  { id: 'g4', label: 'Spinach', checked: false },
];

export const billsData: BillRecord[] = [
  {
    id: 'b1',
    title: 'Rent',
    amount: '$2,300',
    dueLabel: 'Due in 3 days',
    status: 'due',
    category: 'Housing',
  },
  {
    id: 'b2',
    title: 'Electricity',
    amount: '$126',
    dueLabel: 'Due Friday',
    status: 'due',
    category: 'Utilities',
  },
  {
    id: 'b3',
    title: 'Credit card',
    amount: '$420',
    dueLabel: 'Paid yesterday',
    status: 'paid',
    category: 'Debt',
  },
];

export const subscriptionsData: SubscriptionRecord[] = [
  {
    id: 's1',
    title: 'Relay Pro',
    amount: '$8/mo',
    renewalLabel: 'Renews in 8 days',
    status: 'active',
    note: 'Core household assistant plan.',
  },
  {
    id: 's2',
    title: 'Music Family',
    amount: '$16/mo',
    renewalLabel: 'Renews in 12 days',
    status: 'review',
    note: 'Usage dropped this month.',
  },
  {
    id: 's3',
    title: 'Cloud storage',
    amount: '$4/mo',
    renewalLabel: 'Renews tomorrow',
    status: 'active',
    note: 'Needed for family docs.',
  },
];

export const petProfilesData: PetProfileRecord[] = [
  {
    id: 'p1',
    name: 'Buddy',
    species: 'Dog',
    age: '4 years',
    vet: 'Dr. Williams',
    nextVisit: 'May 24 · 9:30 AM',
    meds: ['Flea + tick (monthly)', 'Joint supplement (daily)'],
    routineIds: ['pr1', 'pr2', 'pr3'],
  },
  {
    id: 'p2',
    name: 'Luna',
    species: 'Cat',
    age: '2 years',
    vet: 'Westside Animal Care',
    nextVisit: 'Aug 16 · 11:00 AM',
    meds: ['Hairball support (weekly)'],
    routineIds: ['pr4'],
  },
];

export const petRoutinesData: PetRoutineRecord[] = [
  {
    id: 'pr1',
    petId: 'p1',
    title: 'Morning feeding',
    frequency: 'Daily',
    nextDue: 'Today · 7:00 AM',
  },
  {
    id: 'pr2',
    petId: 'p1',
    title: 'Evening walk',
    frequency: 'Daily',
    nextDue: 'Today · 6:30 PM',
  },
  {
    id: 'pr3',
    petId: 'p1',
    title: 'Flea + tick medicine',
    frequency: 'Monthly',
    nextDue: 'Mar 1',
  },
  {
    id: 'pr4',
    petId: 'p2',
    title: 'Litter refresh',
    frequency: 'Every 2 days',
    nextDue: 'Tomorrow morning',
  },
];

export const notesData: NoteRecord[] = [
  {
    id: 'n1',
    title: 'Weekly planning summary',
    body: 'Focus this week: dentist scheduling, school pickup logistics, and bill reminders.',
    updatedAt: 'Today · 8:12 AM',
    source: 'summary',
  },
  {
    id: 'n2',
    title: 'Vet questions for Buddy',
    body: 'Ask about flea treatment alternatives and annual blood panel timing.',
    updatedAt: 'Yesterday',
    source: 'manual',
  },
  {
    id: 'n3',
    title: 'Relay capture: afternoon logistics',
    body: 'School pickup 4:30 PM, vitamins evening, soccer bag prep by 3:45 PM.',
    updatedAt: 'Yesterday',
    source: 'voice',
  },
];

export const familyAssignmentsData: FamilyAssignmentRecord[] = [
  {
    id: 'fa1',
    title: 'Soccer pickup',
    owner: 'Michael',
    dueLabel: 'Today · 4:30 PM',
    status: 'open',
  },
  {
    id: 'fa2',
    title: 'Vet medicine refill',
    owner: 'Jaiden',
    dueLabel: 'Tomorrow',
    status: 'open',
  },
  {
    id: 'fa3',
    title: 'Laundry reset',
    owner: 'Amy',
    dueLabel: 'Done this morning',
    status: 'done',
  },
];

export const familyAnnouncementsData: FamilyAnnouncementRecord[] = [
  {
    id: 'an1',
    title: 'Recital starts at 6 PM',
    body: 'Please leave by 5:20 PM to avoid traffic around the school lot.',
    postedBy: 'Jaiden',
    postedAt: 'Today · 9:10 AM',
  },
  {
    id: 'an2',
    title: 'Grocery delivery moved',
    body: 'Window changed to 7:00-8:00 PM. Keep dinner prep simple tonight.',
    postedBy: 'Michael',
    postedAt: 'Yesterday',
  },
];

export function getReminderById(id: string) {
  return remindersData.find((item) => item.id === id);
}

export function getFollowUpById(id: string) {
  return followUpsData.find((item) => item.id === id);
}

export function getMealById(id: string) {
  return mealsData.find((item) => item.id === id);
}

export function getBillById(id: string) {
  return billsData.find((item) => item.id === id);
}

export function getSubscriptionById(id: string) {
  return subscriptionsData.find((item) => item.id === id);
}

export function getPetById(id: string) {
  return petProfilesData.find((item) => item.id === id);
}

export function getRoutineById(id: string) {
  return petRoutinesData.find((item) => item.id === id);
}

export function getNoteById(id: string) {
  return notesData.find((item) => item.id === id);
}

export function getFamilyAssignmentById(id: string) {
  return familyAssignmentsData.find((item) => item.id === id);
}

const nextHomeId = (() => {
  let counter = 500;
  return (prefix: string) => {
    counter += 1;
    return `${prefix}${counter}`;
  };
})();

function inferReminderGroup(dueLabel: string, repeat?: string): ReminderRecord['group'] {
  if (repeat && repeat !== 'None') return 'recurring';
  const normalized = dueLabel.toLowerCase();
  if (normalized.includes('today')) return 'today';
  return 'upcoming';
}

export function createReminderRecord(payload: {
  title: string;
  dueLabel: string;
  repeat?: string;
  context?: string;
}) {
  const reminder: ReminderRecord = {
    id: nextHomeId('r'),
    title: payload.title,
    dueLabel: payload.dueLabel,
    group: inferReminderGroup(payload.dueLabel, payload.repeat),
    repeat: payload.repeat && payload.repeat !== 'None' ? payload.repeat : undefined,
    context: payload.context?.trim() || 'Relay reminder',
  };
  remindersData = [reminder, ...remindersData];
  return reminder;
}

export function updateReminderRecord(
  id: string,
  payload: {
    title?: string;
    dueLabel?: string;
    repeat?: string;
    context?: string;
  }
) {
  let updated: ReminderRecord | undefined;
  remindersData = remindersData.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      title: payload.title ?? item.title,
      dueLabel: payload.dueLabel ?? item.dueLabel,
      repeat: payload.repeat === undefined || payload.repeat === 'None' ? undefined : payload.repeat,
      context: payload.context ?? item.context,
    };
    updated.group = inferReminderGroup(updated.dueLabel, updated.repeat);
    return updated;
  });
  return updated;
}

export function snoozeReminderRecord(id: string, dueLabel = 'Tomorrow · 9:00 AM') {
  return updateReminderRecord(id, { dueLabel, repeat: 'None' });
}

export function completeReminderRecord(id: string) {
  const before = remindersData.length;
  remindersData = remindersData.filter((item) => item.id !== id);
  return before !== remindersData.length;
}

export function updateFollowUpRecord(
  id: string,
  payload: {
    status?: FollowUpRecord['status'];
    dueLabel?: string;
    aiDraft?: string;
  }
) {
  let updated: FollowUpRecord | undefined;
  followUpsData = followUpsData.map((item) => {
    if (item.id !== id) return item;
    updated = {
      ...item,
      status: payload.status ?? item.status,
      dueLabel: payload.dueLabel ?? item.dueLabel,
      aiDraft: payload.aiDraft ?? item.aiDraft,
    };
    return updated;
  });
  return updated;
}
