import { EventItem, TaskItem } from '@/store/relay-store';
import { enqueuePendingVoiceAction } from './pending-actions';
import { VoiceExecutionOutcome, VoiceInterpretation, VoiceRouteContext } from './types';

type RelayLike = {
  state: {
    tasks: TaskItem[];
    events: EventItem[];
    members: { id: string; name: string; role: string }[];
  };
  addTask: (payload: {
    title: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    category?: string;
    assignedTo?: string;
    recurring: boolean;
    cadence?: string;
    createdBy?: 'voice' | 'manual';
    note?: string;
  }) => void;
  updateTask: (id: string, payload: Partial<TaskItem>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addEvent: (payload: Omit<EventItem, 'id'>) => void;
  updateEvent: (id: string, payload: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;
};

export type VoiceHandlerDeps = {
  relay: RelayLike;
  context: VoiceRouteContext;
  navigate: (route: string) => void;
};

function capitalize(text: string) {
  const clean = text.trim();
  return clean.length ? clean[0].toUpperCase() + clean.slice(1) : clean;
}

function findTask(tasks: TaskItem[], taskRef?: string) {
  if (!taskRef) return undefined;
  const lower = taskRef.toLowerCase();
  return tasks.find((task) => task.title.toLowerCase().includes(lower));
}

function findEvent(events: EventItem[], eventRef?: string) {
  if (!eventRef) return undefined;
  const lower = eventRef.toLowerCase();
  return events.find((event) => event.title.toLowerCase().includes(lower));
}

function fallbackRefText(slots: VoiceInterpretation['slots']) {
  return slots.task_ref || slots.event_ref || slots.title || slots.query;
}

function dueLabel(date?: string, time?: string) {
  const d = date || 'Soon';
  if (!time) return d;
  return `${d} · ${time}`;
}

function parseAmountValue(input?: string) {
  if (!input) return 0;
  const numeric = Number.parseFloat(input.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

function toISODateFromHint(input?: string, fallback = new Date().toISOString().slice(0, 10)) {
  if (!input) return fallback;

  const normalized = input.trim().toLowerCase();
  if (!normalized) return fallback;
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;

  const base = new Date();
  base.setHours(0, 0, 0, 0);

  if (normalized.includes('tomorrow')) {
    base.setDate(base.getDate() + 1);
    return base.toISOString().slice(0, 10);
  }
  if (normalized.includes('next week')) {
    base.setDate(base.getDate() + 7);
    return base.toISOString().slice(0, 10);
  }
  if (normalized.includes('today')) {
    return base.toISOString().slice(0, 10);
  }

  const relativeDaysMatch = normalized.match(/in\s+(\d+)\s+day/);
  if (relativeDaysMatch) {
    base.setDate(base.getDate() + Number(relativeDaysMatch[1]));
    return base.toISOString().slice(0, 10);
  }

  return fallback;
}

function financeFrequency(input?: string): 'monthly' | 'annual' | 'one-time' {
  if (!input) return 'one-time';
  const normalized = input.toLowerCase();
  if (normalized.includes('month')) return 'monthly';
  if (normalized.includes('year') || normalized.includes('annual')) return 'annual';
  return 'one-time';
}

function subscriptionFrequency(input?: string): 'monthly' | 'annual' {
  if (!input) return 'monthly';
  return input.toLowerCase().includes('year') || input.toLowerCase().includes('annual')
    ? 'annual'
    : 'monthly';
}

function nextUpcomingEvent(events: EventItem[]) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events
    .filter((event) => event.date >= today)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  return upcoming[0];
}

function openRoute(route: string, deps: VoiceHandlerDeps) {
  deps.navigate(route);
}

export function executeVoiceIntent(
  interpretation: VoiceInterpretation,
  deps: VoiceHandlerDeps
): VoiceExecutionOutcome {
  const { intent, slots } = interpretation;

  switch (intent) {
    case 'summarize_day': {
      const route = '/ai/summary/result?range=today';
      return {
        message: 'Here is a quick summary of today.',
        detail: 'I can also save it as a note or turn highlights into tasks.',
        route,
        informational: true,
        explain: 'You asked for a day summary. I used today as the default range.',
      };
    }
    case 'summarize_week': {
      const route = '/ai/summary/result?range=this-week';
      return {
        message: 'Weekly summary is ready.',
        detail: 'Open the summary to view wins, misses, and next actions.',
        route,
        informational: true,
        explain: 'You requested a weekly summary, so I prepared the this-week view.',
      };
    }
    case 'summarize_custom_range': {
      const route = '/ai/summary';
      return {
        message: `I’ll summarize from ${slots.start_date || 'start'} to ${slots.end_date || 'end'}.`,
        detail: 'You can edit the date range before generating.',
        route,
        informational: true,
        explain: 'I detected an explicit custom range in your request.',
      };
    }
    case 'what_do_i_have_today': {
      const todayTasks = deps.relay.state.tasks.filter((task) => task.dueDate.toLowerCase().includes('today') && !task.completed);
      const nextEvent = nextUpcomingEvent(deps.relay.state.events);
      return {
        message: `You have ${todayTasks.length} open task${todayTasks.length === 1 ? '' : 's'} today${nextEvent ? ` and next event is ${nextEvent.title} at ${nextEvent.time}` : ''}.`,
        detail: 'Want me to make a quick plan for the rest of today?',
        route: '/home/day-summary',
        informational: true,
        explain: 'I combined today-tagged tasks with your next scheduled event.',
      };
    }
    case 'what_should_i_do_today': {
      return {
        message: 'I drafted a simple plan for your day.',
        detail: 'Focus block first, then urgent tasks, then reminders.',
        route: '/home/day-summary',
        informational: true,
        explain: 'This is a planning request, so no data changes were needed.',
      };
    }

    case 'create_task': {
      const title = capitalize(slots.title || 'Follow up');
      const createdDue = dueLabel(slots.date, slots.time);
      const assignedTo = slots.person || slots.member;
      deps.relay.addTask({
        title,
        dueDate: createdDue,
        priority: 'medium',
        category: slots.category || 'General',
        assignedTo,
        recurring: false,
        createdBy: 'voice',
      });

      const created = deps.relay.state.tasks[0];

      return {
        message: `Added task: ${title}.`,
        detail: `Due ${createdDue}.`,
        route: '/tasks',
        informational: false,
        explain: 'I mapped your voice request to create_task and wrote to Tasks.',
        undo: created
          ? {
              label: 'Undo add task',
              run: () => deps.relay.deleteTask(created.id),
            }
          : undefined,
      };
    }
    case 'delete_task': {
      const ref = slots.task_ref || slots.title || slots.query;
      const target = findTask(deps.relay.state.tasks, ref);
      if (!target) {
        return {
          message: 'I could not find that task to delete.',
          detail: 'Try saying the exact task title.',
          route: '/tasks',
          informational: true,
          explain: 'Delete requires a task reference that matches an existing task.',
        };
      }

      deps.relay.deleteTask(target.id);
      return {
        message: `Deleted task: ${target.title}.`,
        route: '/tasks',
        informational: false,
        explain: 'Matched task title and removed it from Tasks and Inbox.',
        undo: {
          label: 'Undo delete',
          run: () =>
            deps.relay.addTask({
              title: target.title,
              dueDate: target.dueDate,
              priority: target.priority,
              category: target.category,
              assignedTo: target.assignedTo,
              recurring: target.recurring,
              cadence: target.cadence,
              createdBy: 'voice',
              note: target.note,
            }),
        },
      };
    }
    case 'complete_task': {
      const target = findTask(deps.relay.state.tasks, slots.task_ref);
      if (!target) {
        return {
          message: 'I could not find that task yet.',
          detail: 'Try saying the exact task name.',
          route: '/tasks',
          informational: true,
          explain: 'No close match found in open tasks.',
        };
      }

      deps.relay.toggleTask(target.id);

      return {
        message: `Marked complete: ${target.title}.`,
        route: `/tasks/${target.id}`,
        informational: false,
        explain: 'Matched task by title and toggled completion state.',
        undo: {
          label: 'Undo completion',
          run: () => deps.relay.toggleTask(target.id),
        },
      };
    }
    case 'reschedule_task': {
      const target = findTask(deps.relay.state.tasks, slots.task_ref);
      if (!target) {
        return {
          message: 'I could not find which task to reschedule.',
          detail: 'Say the task name and new date.',
          route: '/tasks',
          informational: true,
          explain: 'Task reference did not match existing task titles.',
        };
      }

      const nextDue = dueLabel(slots.date, slots.time);
      const previous = target.dueDate;
      deps.relay.updateTask(target.id, { dueDate: nextDue });

      return {
        message: `Rescheduled ${target.title} to ${nextDue}.`,
        route: `/tasks/${target.id}`,
        informational: false,
        explain: 'I matched the task and updated its due date.',
        undo: {
          label: 'Undo reschedule',
          run: () => deps.relay.updateTask(target.id, { dueDate: previous }),
        },
      };
    }
    case 'list_tasks': {
      const open = deps.relay.state.tasks.filter((task) => !task.completed).length;
      return {
        message: `You have ${open} open task${open === 1 ? '' : 's'}.`,
        detail: 'Open Tasks for the full list.',
        route: '/tasks',
        informational: true,
        explain: 'This is informational only, so no confirmation was required.',
      };
    }

    case 'create_event': {
      const title = capitalize(slots.title || 'New event');
      const date = slots.date || new Date().toISOString().slice(0, 10);
      const time = slots.time || '3:00 PM';
      deps.relay.addEvent({
        title,
        date,
        time,
        allDay: false,
        type: 'general',
        createdBy: 'voice',
        shared: false,
        assignedTo: slots.person,
        color: '#4B84E8',
        aiContext: 'Created through Relay Voice',
        location: slots.location || 'No location set',
        reminder: '1 hour before',
        notes: '',
        repeat: slots.recurrence || 'None',
      });

      const created = deps.relay.state.events[0];

      return {
        message: `Scheduled ${title}.`,
        detail: `${date} · ${time}`,
        route: '/calendar',
        informational: false,
        explain: 'I extracted title/date/time and created a calendar event.',
        undo: created
          ? {
              label: 'Undo event',
              run: () => deps.relay.deleteEvent(created.id),
            }
          : undefined,
      };
    }
    case 'delete_event': {
      const ref = slots.event_ref || slots.title || slots.query;
      const target = findEvent(deps.relay.state.events, ref);
      if (!target) {
        return {
          message: 'I could not find that event to delete.',
          detail: 'Try saying the exact event name.',
          route: '/calendar',
          informational: true,
          explain: 'Delete requires an event reference that matches an existing event.',
        };
      }

      deps.relay.deleteEvent(target.id);
      return {
        message: `Deleted event: ${target.title}.`,
        route: '/calendar',
        informational: false,
        explain: 'Matched event title and removed it from Calendar and Inbox.',
        undo: {
          label: 'Undo delete',
          run: () =>
            deps.relay.addEvent({
              title: target.title,
              date: target.date,
              time: target.time,
              allDay: target.allDay,
              type: target.type,
              createdBy: 'voice',
              shared: target.shared,
              assignedTo: target.assignedTo,
              color: target.color,
              linkedTaskIds: target.linkedTaskIds,
              attachments: target.attachments,
              aiContext: target.aiContext,
              location: target.location,
              reminder: target.reminder,
              notes: target.notes,
              repeat: target.repeat,
            }),
        },
      };
    }
    case 'move_event': {
      const target = findEvent(deps.relay.state.events, slots.event_ref);
      if (!target) {
        return {
          message: 'I could not find that event to move.',
          detail: 'Try saying the exact event name.',
          route: '/calendar',
          informational: true,
          explain: 'No event title matched the reference phrase.',
        };
      }

      const previous = { date: target.date, time: target.time };
      deps.relay.updateEvent(target.id, {
        date: slots.date || target.date,
        time: slots.time || target.time,
      });

      return {
        message: `Moved ${target.title} to ${slots.date || target.date}${slots.time ? ` at ${slots.time}` : ''}.`,
        route: `/calendar/event/${target.id}`,
        informational: false,
        explain: 'Matched event title and updated schedule fields.',
        undo: {
          label: 'Undo move',
          run: () => deps.relay.updateEvent(target.id, previous),
        },
      };
    }
    case 'what_is_next_event': {
      const next = nextUpcomingEvent(deps.relay.state.events);
      return {
        message: next ? `Next event is ${next.title} at ${next.time}.` : 'No upcoming events found.',
        route: next ? `/calendar/event/${next.id}` : '/calendar',
        informational: true,
        explain: 'I looked up the nearest upcoming event by date/time sorting.',
      };
    }

    case 'plan_meal': {
      const title = capitalize(slots.title || 'Meal plan');
      const dayISO = toISODateFromHint(slots.date, deps.context.selectedDateISO);
      const slotType = (slots.meal_type || '').toLowerCase().includes('breakfast')
        ? 'breakfast'
        : (slots.meal_type || '').toLowerCase().includes('lunch')
          ? 'lunch'
          : 'dinner';
      deps.relay.addTask({
        title: `Meal: ${title}`,
        dueDate: slots.date || 'This week',
        priority: 'medium',
        category: 'Meals',
        recurring: false,
        createdBy: 'voice',
      });
      enqueuePendingVoiceAction('meals', 'plan_meal', {
        title,
        dayISO,
        slotType,
      });
      openRoute('/meals/weekly', deps);
      return {
        message: `Added ${title} to your meal planning flow.`,
        detail: 'Open Weekly Planner to place it into a day slot.',
        route: '/meals/weekly',
        informational: false,
        explain: 'Meals module is context-routed; task stub created for cross-tab visibility.',
      };
    }
    case 'generate_week_plan': {
      openRoute('/meals/plan-generator/preferences', deps);
      return {
        message: 'Ready to generate your week meal plan.',
        detail: 'Set preferences, then confirm generated meals.',
        route: '/meals/plan-generator/preferences',
        informational: false,
        explain: 'This intent routes to Meal Plan Generator flow.',
      };
    }
    case 'add_grocery_item': {
      const item = slots.item || slots.title || 'Grocery item';
      deps.relay.addTask({
        title: `Buy ${item}`,
        dueDate: 'Soon',
        priority: 'low',
        category: 'Shopping',
        recurring: false,
        createdBy: 'voice',
      });
      enqueuePendingVoiceAction('meals', 'add_grocery_item', {
        name: item,
        quantity: '1',
      });
      openRoute('/meals/grocery', deps);
      return {
        message: `Added ${item} to your grocery workflow.`,
        route: '/meals/grocery',
        informational: false,
        explain: 'I routed to Meals grocery and created a shopping reminder task.',
      };
    }
    case 'import_recipe_link': {
      if (slots.url) {
        enqueuePendingVoiceAction('meals', 'import_recipe_link', {
          url: slots.url,
        });
      }
      openRoute('/meals/import-link', deps);
      return {
        message: slots.url
          ? `Recipe link detected. Ready to import: ${slots.url}`
          : 'Recipe import flow is open. Paste your link to continue.',
        route: '/meals/import-link',
        informational: false,
        explain: 'This action opens the recipe import parser flow in Meals.',
      };
    }

    case 'add_bill': {
      const title = capitalize(slots.title || 'New bill');
      const due = slots.date || 'Soon';
      const amount = slots.amount || '$0';
      const dueISO = toISODateFromHint(slots.date, deps.context.selectedDateISO);
      const amountValue = parseAmountValue(slots.amount);
      deps.relay.addTask({
        title: `Pay ${title}`,
        dueDate: due,
        priority: 'high',
        category: 'Finance',
        recurring: !!slots.recurrence,
        cadence: slots.recurrence,
        createdBy: 'voice',
      });
      enqueuePendingVoiceAction('finances', 'add_bill', {
        name: title,
        amount: amountValue,
        dueDateISO: dueISO,
        recurrence: financeFrequency(slots.recurrence),
        notes: 'Created by Relay voice',
      });
      openRoute('/finances/bills/create', deps);
      return {
        message: `Prepared bill: ${title} (${amount}) due ${due}.`,
        route: '/finances/bills/create',
        informational: false,
        explain: 'Bills are handled in Finances; I also created a finance reminder task.',
      };
    }
    case 'mark_bill_paid': {
      const billName = capitalize(slots.title || fallbackRefText(slots) || 'Bill');
      enqueuePendingVoiceAction('finances', 'mark_bill_paid', {
        title: billName,
      });
      openRoute('/finances/bills', deps);
      return {
        message: `Prepared bill payment update for ${billName}.`,
        detail: 'Open Bills to verify and review payment history.',
        route: '/finances/bills',
        informational: false,
        explain: 'I queued a Finances action that marks the matched bill as paid.',
      };
    }
    case 'add_subscription': {
      const title = capitalize(slots.title || 'New subscription');
      const amount = slots.amount || '$0';
      const renewDateISO = toISODateFromHint(slots.date, deps.context.selectedDateISO);
      const amountValue = parseAmountValue(slots.amount);
      deps.relay.addTask({
        title: `Review ${title} subscription`,
        dueDate: slots.date || 'This week',
        priority: 'medium',
        category: 'Finance',
        recurring: true,
        cadence: slots.recurrence || 'Monthly',
        createdBy: 'voice',
      });
      enqueuePendingVoiceAction('finances', 'add_subscription', {
        name: title,
        amount: amountValue,
        renewDateISO,
        recurrence: subscriptionFrequency(slots.recurrence),
        notes: 'Created by Relay voice',
      });
      openRoute('/finances/subscriptions/create', deps);
      return {
        message: `Prepared subscription: ${title} (${amount}).`,
        route: '/finances/subscriptions/create',
        informational: false,
        explain: 'Subscription setup is in Finances with confirmation before save.',
      };
    }
    case 'cancel_subscription': {
      const name = capitalize(slots.title || fallbackRefText(slots) || 'Subscription');
      enqueuePendingVoiceAction('finances', 'cancel_subscription', {
        title: name,
      });
      openRoute('/finances/subscriptions', deps);
      return {
        message: `Prepared cancellation for ${name}.`,
        detail: 'Open Subscriptions to confirm status.',
        route: '/finances/subscriptions',
        informational: false,
        explain: 'I queued a Finances action that cancels the matching subscription.',
      };
    }
    case 'explain_spending': {
      return {
        message: 'I generated a spending explanation based on your current demo data.',
        detail: 'Open Finances summary for category and trend details.',
        route: '/finances/summary',
        informational: true,
        explain: 'This is read-only analysis; no confirmation required.',
      };
    }

    case 'log_feeding': {
      const pet = slots.pet || 'your pet';
      const when = slots.time || 'now';
      const dateISO = toISODateFromHint(slots.date, deps.context.selectedDateISO);
      deps.relay.addTask({
        title: `Log feeding for ${pet}`,
        dueDate: dueLabel(slots.date || 'Today', when),
        priority: 'medium',
        category: 'Pet care',
        recurring: false,
        createdBy: 'voice',
      });
      enqueuePendingVoiceAction('pets', 'log_feeding', {
        petName: pet,
        dateISO,
        timeLabel: when,
      });
      openRoute('/pets', deps);
      return {
        message: `Feeding log queued for ${pet} (${when}).`,
        route: '/pets',
        informational: false,
        explain: 'Pets records are updated in the Pets module; this creates a visible follow-up task now.',
      };
    }
    case 'add_medication': {
      const pet = slots.pet || 'your pet';
      const med = slots.title || 'Medication';
      const startISO = toISODateFromHint(slots.date, deps.context.selectedDateISO);
      deps.relay.addTask({
        title: `${pet}: ${capitalize(med)}`,
        dueDate: dueLabel(slots.date || 'Today', slots.time),
        priority: 'high',
        category: 'Pet care',
        recurring: !!slots.recurrence,
        cadence: slots.recurrence,
        createdBy: 'voice',
      });
      enqueuePendingVoiceAction('pets', 'add_medication', {
        petName: pet,
        name: capitalize(med),
        schedule: slots.recurrence || 'Daily',
        timeLabel: slots.time || '8:00 AM',
        startISO,
      });
      openRoute('/pets', deps);
      return {
        message: `Medication plan prepared for ${pet}.`,
        detail: `${capitalize(med)} ${slots.recurrence ? `(${slots.recurrence})` : ''}`.trim(),
        route: '/pets',
        informational: false,
        explain: 'Medication intent creates a pet-care task and routes into Pets detail flows.',
      };
    }
    case 'mark_medication_given': {
      const pet = slots.pet || 'your pet';
      const medication = capitalize(slots.title || 'Medication');
      enqueuePendingVoiceAction('pets', 'mark_medication_given', {
        petName: pet,
        name: medication,
        dateISO: toISODateFromHint(slots.date, deps.context.selectedDateISO),
      });
      openRoute('/pets', deps);
      return {
        message: `Marked ${medication} as given for ${pet}.`,
        route: '/pets',
        informational: false,
        explain: 'I queued a Pets action to update medication completion state.',
      };
    }
    case 'schedule_vet_visit': {
      const pet = slots.pet || 'Pet';
      const date = slots.date || 'Next week';
      const time = slots.time || '3:00 PM';
      const dateISO = toISODateFromHint(slots.date, deps.context.selectedDateISO);
      deps.relay.addEvent({
        title: `${pet} vet visit`,
        date,
        time,
        allDay: false,
        type: 'pet',
        createdBy: 'voice',
        shared: false,
        color: '#55A07D',
        aiContext: 'Pet care appointment',
        location: 'Vet clinic',
        reminder: '1 day before',
        notes: slots.reason || 'Routine check',
        repeat: 'None',
      });
      enqueuePendingVoiceAction('pets', 'schedule_vet_visit', {
        petName: pet,
        reason: slots.reason || 'Routine check',
        dateISO,
        timeLabel: time,
      });
      openRoute('/pets', deps);
      return {
        message: `Scheduled vet visit for ${pet}.`,
        detail: `${date} · ${time}`,
        route: '/pets',
        informational: false,
        explain: 'Vet visit intent maps to a calendar event with pet context.',
      };
    }
    case 'complete_vet_visit': {
      const pet = slots.pet || 'Pet';
      enqueuePendingVoiceAction('pets', 'complete_vet_visit', {
        petName: pet,
      });
      openRoute('/pets', deps);
      return {
        message: `Marked the latest vet visit complete for ${pet}.`,
        route: '/pets',
        informational: false,
        explain: 'I queued a Pets action to complete the most relevant upcoming visit.',
      };
    }

    case 'create_note': {
      enqueuePendingVoiceAction('notes', 'create_note', {
        title: capitalize(slots.title || 'Quick note'),
        body: slots.query || slots.title || '',
      });
      openRoute('/notes/create', deps);
      return {
        message: `Note draft ready: ${capitalize(slots.title || 'Quick note')}.`,
        route: '/notes/create',
        informational: false,
        explain: 'I routed to Notes create flow for final edit and save confirmation.',
      };
    }
    case 'delete_note': {
      const query = slots.query || slots.title || '';
      enqueuePendingVoiceAction('notes', 'delete_note', {
        query,
      });
      openRoute(`/notes/search${query ? `?q=${encodeURIComponent(query)}` : ''}`, deps);
      return {
        message: query
          ? `Prepared note deletion for “${query}”.`
          : 'Prepared note deletion flow.',
        detail: 'Open Notes search results to verify what was removed.',
        route: `/notes/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
        informational: false,
        explain: 'I queued a Notes action that deletes the first matching note title.',
      };
    }
    case 'save_summary_as_note': {
      enqueuePendingVoiceAction('notes', 'save_summary_as_note', {
        title: 'Relay summary',
        body: 'Saved from voice summary flow.',
      });
      openRoute('/notes/create', deps);
      return {
        message: 'Summary note draft is ready to save.',
        route: '/notes/create',
        informational: false,
        explain: 'This action converts a summary into Notes for long-term reference.',
      };
    }
    case 'find_note': {
      const q = encodeURIComponent(slots.query || '');
      const route = `/notes/search${q ? `?q=${q}` : ''}`;
      return {
        message: `Searching notes${slots.query ? ` for “${slots.query}”` : ''}.`,
        route,
        informational: true,
        explain: 'Search intent does not modify data, so no confirmation is required.',
      };
    }

    case 'assign_chore': {
      const member = slots.member || 'Family member';
      const title = capitalize(slots.title || 'Shared chore');
      const dueDateISO = toISODateFromHint(slots.date, deps.context.selectedDateISO);
      deps.relay.addTask({
        title,
        dueDate: slots.date || 'Today',
        priority: 'medium',
        category: 'Family',
        assignedTo: member,
        recurring: false,
        createdBy: 'voice',
      });
      enqueuePendingVoiceAction('family', 'assign_chore', {
        memberName: member,
        title,
        dueDateISO,
      });
      openRoute('/family/tasks', deps);
      return {
        message: `Assigned “${title}” to ${member}.`,
        route: '/family/tasks',
        informational: false,
        explain: 'Family assignment creates a task and routes into Family tasks board.',
      };
    }
    case 'reassign_chore': {
      const member = slots.member || slots.person || 'Family member';
      const taskRef = slots.task_ref || slots.title || '';
      enqueuePendingVoiceAction('family', 'reassign_chore', {
        taskRef,
        memberName: member,
      });
      openRoute('/family/tasks', deps);
      return {
        message: taskRef
          ? `Prepared reassignment of ${taskRef} to ${member}.`
          : `Prepared chore reassignment to ${member}.`,
        route: '/family/tasks',
        informational: false,
        explain: 'I queued a Family action to move the matching open chore to a new assignee.',
      };
    }
    case 'add_family_event': {
      const title = capitalize(slots.title || 'Family event');
      const date = slots.date || 'This week';
      const time = slots.time || '6:00 PM';
      const dateISO = toISODateFromHint(slots.date, deps.context.selectedDateISO);
      deps.relay.addEvent({
        title,
        date,
        time,
        allDay: false,
        type: 'family',
        createdBy: 'voice',
        shared: true,
        assignedTo: slots.member || slots.person,
        color: '#5D83D5',
        aiContext: 'Family calendar event',
        location: slots.location || 'No location set',
        reminder: '1 hour before',
        notes: '',
        repeat: 'None',
      });
      enqueuePendingVoiceAction('family', 'add_family_event', {
        title,
        dateISO,
        timeLabel: time,
        memberName: slots.member || slots.person || '',
      });
      openRoute('/family/calendar', deps);
      return {
        message: `Added family event: ${title}.`,
        detail: `${date} · ${time}`,
        route: '/family/calendar',
        informational: false,
        explain: 'Family event maps to shared calendar flow.',
      };
    }
    case 'who_is_responsible': {
      const target = findTask(deps.relay.state.tasks, slots.task_ref);
      if (!target || !target.assignedTo) {
        return {
          message: 'No clear assignee found for that task yet.',
          detail: 'You can assign it in Family Tasks.',
          route: '/family/tasks',
          informational: true,
          explain: 'Responsibility lookup checks assigned task metadata first.',
        };
      }

      return {
        message: `${target.assignedTo} is currently responsible for ${target.title}.`,
        route: `/tasks/${target.id}`,
        informational: true,
        explain: 'I matched the task and returned its assigned member.',
      };
    }

    case 'small_talk_qna': {
      return {
        message: 'I’m here and ready. Tell me what you want to organize next.',
        detail: 'Try: “Add a task to call the vet tomorrow.”',
        informational: true,
        explain: 'This is a conversational prompt with no data mutation.',
      };
    }
    case 'unknown_intent':
    default: {
      return {
        message: 'I can help with tasks, events, meals, finances, pets, notes, or family actions.',
        detail: 'Try a direct command like “Schedule a dentist appointment next Thursday at 3 PM.”',
        informational: true,
        explain: 'No confident intent match was found, so I asked for clarification.',
      };
    }
  }
}
