import { IntentName, IntentSlot, SlotValues } from './types';

type ExtractedEntities = {
  title?: string;
  date?: string;
  time?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  person?: string;
  member?: string;
  pet?: string;
  amount?: string;
  recurrence?: string;
  url?: string;
  query?: string;
  item?: string;
  taskRef?: string;
  eventRef?: string;
  reason?: string;
  category?: string;
  mealType?: string;
};

const MONTH_WORDS =
  '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';

function cleanEntity(text: string) {
  return text.replace(/[.,!?]/g, '').trim();
}

function titleFromVerb(text: string) {
  const rules: RegExp[] = [
    /remind me to (.+?)(?:\s(?:today|tomorrow|next|on|at|by|in)\b|$)/i,
    /(?:create|add|new) (?:a )?(?:task|event|note|bill|subscription) (?:to )?(.+?)(?:\s(?:today|tomorrow|next|on|at|by|in)\b|$)/i,
    /i need to (.+?)(?:\s(?:today|tomorrow|next|on|at|by|in)\b|$)/i,
    /schedule (.+?)(?:\s(?:today|tomorrow|next|on|at|by|in)\b|$)/i,
    /assign (.+?) to /i,
    /(?:mark|set) (.+?) (?:paid|complete|done)/i,
    /(?:cancel|stop|remove) (.+?) subscription/i,
    /delete (?:note|task|event)?\s*(.+)$/i,
  ];

  for (const rule of rules) {
    const match = text.match(rule);
    if (match?.[1]) return cleanEntity(match[1]);
  }

  return undefined;
}

function extractDate(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('today')) return 'Today';
  if (lower.includes('tomorrow')) return 'Tomorrow';
  if (lower.includes('tonight')) return 'Tonight';
  if (lower.includes('this week')) return 'This week';
  if (lower.includes('next week')) return 'Next week';
  if (lower.includes('next month')) return 'Next month';
  if (lower.includes('in six months') || lower.includes('in 6 months') || lower.includes('6 months')) {
    return 'In 6 months';
  }

  const weekday = text.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (weekday?.[1]) {
    return `Next ${weekday[1][0].toUpperCase()}${weekday[1].slice(1).toLowerCase()}`;
  }

  const monthDate = text.match(new RegExp(`${MONTH_WORDS}\\s+\\d{1,2}`, 'i'));
  if (monthDate?.[0]) return cleanEntity(monthDate[0]);

  const numericDate = text.match(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/);
  if (numericDate?.[0]) return numericDate[0];

  return undefined;
}

function extractTime(text: string) {
  const explicit = text.match(/\b(\d{1,2}(?::\d{2})?\s?(?:am|pm))\b/i);
  if (explicit?.[1]) return explicit[1].toUpperCase();

  if (/\bmorning\b/i.test(text)) return 'Morning';
  if (/\bafternoon\b/i.test(text)) return 'Afternoon';
  if (/\bevening\b/i.test(text)) return 'Evening';
  if (/\bnight\b/i.test(text)) return 'Night';

  return undefined;
}

function extractRange(text: string) {
  if (/\btoday\b/i.test(text)) return 'today';
  if (/\bthis week\b/i.test(text)) return 'this-week';
  if (/\blast week\b/i.test(text)) return 'last-week';

  const explicit = text.match(/from\s+(.+?)\s+to\s+(.+?)(?:$|[.,!?])/i);
  if (explicit?.[1] && explicit?.[2]) {
    return `${cleanEntity(explicit[1])} to ${cleanEntity(explicit[2])}`;
  }

  return undefined;
}

function extractCustomRange(text: string) {
  const explicit = text.match(/from\s+(.+?)\s+to\s+(.+?)(?:$|[.,!?])/i);
  if (!explicit?.[1] || !explicit?.[2]) return {};

  return {
    startDate: cleanEntity(explicit[1]),
    endDate: cleanEntity(explicit[2]),
  };
}

function extractAmount(text: string) {
  const amount = text.match(/\$\s?\d+(?:\.\d{1,2})?/);
  if (amount?.[0]) return amount[0].replace(/\s+/g, '');

  const words = text.match(/\b(\d+(?:\.\d{1,2})?)\s*(dollars|usd|bucks)\b/i);
  if (words?.[1]) return `$${words[1]}`;

  return undefined;
}

function extractRecurrence(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('every day') || lower.includes('daily')) return 'Daily';
  if (lower.includes('every week') || lower.includes('weekly')) return 'Weekly';
  if (lower.includes('every month') || lower.includes('monthly')) return 'Monthly';
  if (lower.includes('every year') || lower.includes('yearly') || lower.includes('annually')) return 'Yearly';
  if (lower.includes('every 6 months') || lower.includes('six months')) return 'Every 6 months';
  return undefined;
}

function extractUrl(text: string) {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match?.[0];
}

function extractPerson(text: string) {
  const assign = text.match(/assign(?:ed)?(?:\s+\w+)*\s+to\s+([A-Za-z][A-Za-z\s'-]{1,28})/i);
  if (assign?.[1]) return cleanEntity(assign[1]);

  const forPerson = text.match(/\bfor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (forPerson?.[1]) return cleanEntity(forPerson[1]);

  return undefined;
}

function extractPet(text: string) {
  const forPet = text.match(/(?:for|feed|vet visit for|medication for)\s+([A-Z][a-zA-Z'-]+)/);
  if (forPet?.[1]) return cleanEntity(forPet[1]);

  const named = text.match(/\b(dog|cat|pet)\b/i);
  if (named?.[1]) return named[1][0].toUpperCase() + named[1].slice(1).toLowerCase();

  return undefined;
}

function extractItem(text: string) {
  const match = text.match(/add\s+(.+?)\s+to\s+(?:the\s+)?grocery list/i);
  if (match?.[1]) return cleanEntity(match[1]);

  return undefined;
}

function extractTaskRef(text: string) {
  const match = text.match(/(?:complete|mark|finish|reschedule|move|delete|remove)\s+(.+?)(?:\s+(?:done|complete|to|for|on|task)\b|$)/i);
  if (match?.[1]) return cleanEntity(match[1]);

  if (/who is responsible/i.test(text)) {
    const who = text.replace(/who is responsible for/i, '').trim();
    return cleanEntity(who);
  }

  return undefined;
}

function extractEventRef(text: string) {
  const match = text.match(/(?:move|reschedule|delete|remove|cancel)\s+(.+?)(?:\s+(?:to|event|appointment|meeting)\b|$)/i);
  if (match?.[1]) return cleanEntity(match[1]);
  return undefined;
}

function extractBillTitle(text: string) {
  const match = text.match(/(?:mark|set)\s+(.+?)\s+bill\s+(?:paid|complete|done)/i);
  if (match?.[1]) return cleanEntity(`${match[1]} bill`);
  const generic = text.match(/(?:mark|set)\s+(.+?)\s+(?:paid|complete|done)/i);
  if (generic?.[1] && /bill/i.test(text)) return cleanEntity(generic[1]);
  return undefined;
}

function extractSubscriptionTitle(text: string) {
  const match = text.match(/(?:cancel|stop|remove)\s+(.+?)\s+subscription/i);
  if (match?.[1]) return cleanEntity(match[1]);
  return undefined;
}

function extractLocation(text: string) {
  const match = text.match(/\bat\s+([A-Za-z0-9][A-Za-z0-9\s,'-]{2,40})$/i);
  if (match?.[1] && !/\b(am|pm|morning|afternoon|evening|night)\b/i.test(match[1])) {
    return cleanEntity(match[1]);
  }
  return undefined;
}

function extractQuery(text: string) {
  const fromFind = text.match(/(?:find|search)\s+(?:my\s+)?(?:note|notes|document|docs)?\s*(.+)$/i);
  if (fromFind?.[1]) return cleanEntity(fromFind[1]);

  return undefined;
}

function extractMealType(text: string) {
  if (/\bbreakfast\b/i.test(text)) return 'Breakfast';
  if (/\blunch\b/i.test(text)) return 'Lunch';
  if (/\bdinner\b/i.test(text)) return 'Dinner';
  return undefined;
}

function extractReason(text: string) {
  const reason = text.match(/(?:for|because|reason)\s+(.+)$/i);
  if (reason?.[1]) return cleanEntity(reason[1]);
  return undefined;
}

function extractCategory(text: string) {
  const candidates = ['food', 'housing', 'family', 'transport', 'health', 'work', 'personal'];
  const lower = text.toLowerCase();
  const hit = candidates.find((entry) => lower.includes(entry));
  return hit ? hit[0].toUpperCase() + hit.slice(1) : undefined;
}

function extractEntities(input: string): ExtractedEntities {
  const text = input.trim();
  const { startDate, endDate } = extractCustomRange(text);

  return {
    title: titleFromVerb(text),
    date: extractDate(text),
    time: extractTime(text),
    startDate,
    endDate,
    location: extractLocation(text),
    person: extractPerson(text),
    member: extractPerson(text),
    pet: extractPet(text),
    amount: extractAmount(text),
    recurrence: extractRecurrence(text),
    url: extractUrl(text),
    query: extractQuery(text),
    item: extractItem(text),
    taskRef: extractTaskRef(text),
    eventRef: extractEventRef(text),
    reason: extractReason(text),
    category: extractCategory(text),
    mealType: extractMealType(text),
  };
}

export function extractSlotsForIntent(intent: IntentName, input: string): SlotValues {
  const entities = extractEntities(input);
  const range = extractRange(input);

  const slots: SlotValues = {
    title: entities.title,
    date: entities.date,
    time: entities.time,
    start_date: entities.startDate,
    end_date: entities.endDate,
    location: entities.location,
    person: entities.person,
    member: entities.member,
    pet: entities.pet,
    amount: entities.amount,
    recurrence: entities.recurrence,
    url: entities.url,
    query: entities.query,
    item: entities.item,
    task_ref: entities.taskRef,
    event_ref: entities.eventRef,
    reason: entities.reason,
    category: entities.category,
    meal_type: entities.mealType,
    range,
  };

  if (intent === 'create_task' && !slots.title) {
    slots.title = cleanEntity(input);
  }

  if (intent === 'delete_task' && !slots.task_ref) {
    slots.task_ref = slots.title || cleanEntity(input.replace(/delete|remove|task/gi, ''));
  }

  if (intent === 'delete_event' && !slots.event_ref) {
    slots.event_ref = slots.title || cleanEntity(input.replace(/delete|remove|cancel|event|appointment|meeting/gi, ''));
  }

  if (intent === 'create_note') {
    if (!slots.title && slots.query) slots.title = slots.query;
    if (!slots.title) slots.title = 'Quick captured note';
  }

  if (intent === 'delete_note' && !slots.query) {
    slots.query = cleanEntity(input.replace(/delete|remove|note/gi, ''));
  }

  if (intent === 'add_grocery_item' && !slots.item && slots.title) {
    slots.item = slots.title;
  }

  if (intent === 'mark_bill_paid' && !slots.title) {
    slots.title = extractBillTitle(input) || cleanEntity(input.replace(/mark|set|paid|bill|complete|done/gi, ''));
  }

  if (intent === 'cancel_subscription' && !slots.title) {
    slots.title =
      extractSubscriptionTitle(input) ||
      cleanEntity(input.replace(/cancel|stop|remove|subscription/gi, ''));
  }

  if (intent === 'find_note' && !slots.query) {
    slots.query = cleanEntity(input.replace(/find|search|notes?|docs?|documents?/gi, ''));
  }

  if (intent === 'assign_chore' && !slots.member) {
    slots.member = slots.person;
  }

  if (intent === 'schedule_vet_visit' && !slots.reason) {
    slots.reason = 'Routine check';
  }

  if (intent === 'mark_medication_given' && !slots.title) {
    slots.title = cleanEntity(
      input.replace(/mark|set|given|gave|medication|medicine|for|pet/gi, '')
    );
  }

  if (intent === 'complete_vet_visit' && !slots.reason) {
    slots.reason = 'Completed';
  }

  if (intent === 'reassign_chore' && !slots.task_ref) {
    slots.task_ref = extractTaskRef(input);
  }

  if (intent === 'summarize_custom_range') {
    if (!slots.start_date && range?.includes(' to ')) {
      slots.start_date = range.split(' to ')[0];
    }
    if (!slots.end_date && range?.includes(' to ')) {
      slots.end_date = range.split(' to ')[1];
    }
  }

  return slots;
}

export function getFollowUpQuestion(intent: IntentName, slot: IntentSlot) {
  const key = `${intent}:${slot}`;

  const map: Record<string, { question: string; chips: string[] }> = {
    'create_task:title': {
      question: 'What should I call this task?',
      chips: ['Call the vet', 'Follow up with school', 'Pay bill'],
    },
    'complete_task:task_ref': {
      question: 'Which task should I mark complete?',
      chips: ['Call the vet', 'Take vitamins', 'Pick up Emily'],
    },
    'delete_task:task_ref': {
      question: 'Which task should I delete?',
      chips: ['Call the vet', 'Take vitamins', 'Pick up Emily'],
    },
    'reschedule_task:task_ref': {
      question: 'Which task should I move?',
      chips: ['Call the vet', 'Take vitamins', 'Pick up Emily'],
    },
    'reschedule_task:date': {
      question: 'When should I reschedule it for?',
      chips: ['Tomorrow', 'Next week', 'Friday'],
    },
    'create_event:title': {
      question: 'What should this event be called?',
      chips: ['Dentist appointment', 'School pickup', 'Project sync'],
    },
    'create_event:date': {
      question: 'What day should I schedule it?',
      chips: ['Tomorrow', 'Next Thursday', 'Feb 12'],
    },
    'move_event:event_ref': {
      question: 'Which event do you want to move?',
      chips: ['Dentist appointment', 'School pickup', 'Vet visit'],
    },
    'delete_event:event_ref': {
      question: 'Which event should I delete?',
      chips: ['Dentist appointment', 'School pickup', 'Vet visit'],
    },
    'move_event:date': {
      question: 'What is the new date?',
      chips: ['Tomorrow', 'Friday', 'Next week'],
    },
    'add_grocery_item:item': {
      question: 'What should I add to groceries?',
      chips: ['Milk', 'Eggs', 'Chicken thighs'],
    },
    'import_recipe_link:url': {
      question: 'Paste the recipe link to import.',
      chips: ['https://example.com/recipe'],
    },
    'add_bill:title': {
      question: 'What bill is this?',
      chips: ['Internet bill', 'Electricity', 'Water bill'],
    },
    'add_bill:amount': {
      question: 'What amount should I set?',
      chips: ['$89', '$120', '$45'],
    },
    'add_bill:date': {
      question: 'When is it due?',
      chips: ['Today', 'Tomorrow', 'Next Monday'],
    },
    'add_subscription:title': {
      question: 'What subscription should I add?',
      chips: ['Music Family', 'Cloud storage', 'Gym'],
    },
    'add_subscription:amount': {
      question: 'How much does it cost?',
      chips: ['$8', '$16', '$24'],
    },
    'mark_bill_paid:title': {
      question: 'Which bill should I mark paid?',
      chips: ['Rent', 'Internet bill', 'Electricity'],
    },
    'cancel_subscription:title': {
      question: 'Which subscription should I cancel?',
      chips: ['Music Family', 'Streaming service', 'Cloud storage'],
    },
    'log_feeding:pet': {
      question: 'Which pet is this for?',
      chips: ['Buddy', 'Luna', 'Dog'],
    },
    'add_medication:pet': {
      question: 'Which pet needs medication?',
      chips: ['Buddy', 'Luna', 'Cat'],
    },
    'add_medication:title': {
      question: 'Medication name?',
      chips: ['Flea + Tick', 'Hairball support', 'Antibiotic'],
    },
    'mark_medication_given:pet': {
      question: 'Which pet got medication?',
      chips: ['Buddy', 'Luna', 'Cat'],
    },
    'mark_medication_given:title': {
      question: 'Which medication was given?',
      chips: ['Flea + Tick', 'Heartworm', 'Antibiotic'],
    },
    'schedule_vet_visit:pet': {
      question: 'Which pet should I schedule?',
      chips: ['Buddy', 'Luna', 'Dog'],
    },
    'schedule_vet_visit:date': {
      question: 'When should the vet visit happen?',
      chips: ['Tomorrow', 'Next Tuesday', 'Feb 12'],
    },
    'complete_vet_visit:pet': {
      question: 'Which pet visit should I complete?',
      chips: ['Buddy', 'Luna', 'Dog'],
    },
    'delete_note:query': {
      question: 'Which note should I delete?',
      chips: ['Dentist follow-up', 'Weekly logistics', 'New app concept'],
    },
    'find_note:query': {
      question: 'What should I search for?',
      chips: ['taxes', 'passport', 'meeting notes'],
    },
    'assign_chore:member': {
      question: 'Who should this be assigned to?',
      chips: ['Alex', 'Michael', 'Amy'],
    },
    'assign_chore:title': {
      question: 'What chore should I assign?',
      chips: ['Do dishes', 'Take out trash', 'Laundry'],
    },
    'reassign_chore:task_ref': {
      question: 'Which chore should I reassign?',
      chips: ['School pickup', 'Dishes', 'Laundry'],
    },
    'reassign_chore:member': {
      question: 'Who should get this chore now?',
      chips: ['Michael', 'Amy', 'Jaiden'],
    },
    'add_family_event:title': {
      question: 'What is the family event title?',
      chips: ['Soccer practice', 'School recital', 'Family dinner'],
    },
    'add_family_event:date': {
      question: 'When should I schedule this family event?',
      chips: ['Tomorrow', 'Friday 6PM', 'Next week'],
    },
    'who_is_responsible:task_ref': {
      question: 'What task are you checking?',
      chips: ['School pickup', 'Feed the dog', 'Dishes'],
    },
    'summarize_custom_range:start_date': {
      question: 'What is the start date?',
      chips: ['Feb 1', 'Last Monday', 'Jan 1'],
    },
    'summarize_custom_range:end_date': {
      question: 'What is the end date?',
      chips: ['Today', 'Feb 7', 'This Friday'],
    },
  };

  return (
    map[key] ?? {
      question: `I need one more detail: ${slot.replace('_', ' ')}.`,
      chips: ['Today', 'Tomorrow', 'Next week'],
    }
  );
}
