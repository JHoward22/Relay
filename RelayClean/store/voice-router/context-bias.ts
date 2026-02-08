import { AppContextTab, IntentName, VoiceRouteContext } from './types';

const TAB_TO_INTENTS: Record<AppContextTab, IntentName[]> = {
  home: ['what_do_i_have_today', 'what_should_i_do_today', 'summarize_day', 'summarize_week'],
  tasks: ['create_task', 'delete_task', 'complete_task', 'reschedule_task', 'list_tasks'],
  calendar: ['create_event', 'delete_event', 'move_event', 'what_is_next_event'],
  settings: [],
  meals: ['plan_meal', 'generate_week_plan', 'add_grocery_item', 'import_recipe_link'],
  finances: ['add_bill', 'mark_bill_paid', 'add_subscription', 'cancel_subscription', 'explain_spending'],
  pets: ['log_feeding', 'add_medication', 'mark_medication_given', 'schedule_vet_visit', 'complete_vet_visit'],
  notes: ['create_note', 'delete_note', 'find_note', 'save_summary_as_note'],
  family: ['assign_chore', 'reassign_chore', 'add_family_event', 'who_is_responsible'],
  unknown: [],
};

export function tabFromPath(pathname: string): AppContextTab {
  if (pathname === '/' || pathname.startsWith('/home') || pathname.startsWith('/library')) return 'home';
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/settings')) return 'settings';
  if (pathname.startsWith('/meals')) return 'meals';
  if (pathname.startsWith('/finances')) return 'finances';
  if (pathname.startsWith('/pets')) return 'pets';
  if (pathname.startsWith('/notes')) return 'notes';
  if (pathname.startsWith('/family')) return 'family';
  return 'unknown';
}

export function applyContextBias(
  baseScores: Record<IntentName, number>,
  context: VoiceRouteContext
): Record<IntentName, number> {
  const scores: Record<IntentName, number> = { ...baseScores };
  const favored = TAB_TO_INTENTS[context.tab] ?? [];

  favored.forEach((intent) => {
    scores[intent] = (scores[intent] || 0) + 1.2;
  });

  // Family-only bias: if family mode is off, damp family intents.
  if (!context.familyMode) {
    TAB_TO_INTENTS.family.forEach((intent) => {
      if (scores[intent]) scores[intent] = Math.max(0, scores[intent] - 1.8);
    });
  }

  return scores;
}
