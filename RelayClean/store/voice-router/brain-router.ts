import { applyContextBias } from './context-bias';
import { INTENT_BY_NAME, INTENT_REGISTRY } from './intent-registry';
import { pushVoiceDebugEntry } from './debug-store';
import { extractSlotsForIntent, getFollowUpQuestion } from './slot-extractors';
import {
  IntentName,
  IntentSlot,
  SlotValues,
  VoiceInterpretation,
  VoiceRouteContext,
} from './types';

function scoreIntent(input: string, intentName: IntentName) {
  const spec = INTENT_BY_NAME[intentName];
  if (!spec) return 0;

  const text = input.trim();
  let score = 0;

  spec.patterns.forEach((pattern) => {
    if (pattern.test(text)) score += 2;
  });

  const lower = text.toLowerCase();
  spec.keywords.forEach((keyword) => {
    if (lower.includes(keyword.toLowerCase())) score += 0.32;
  });

  // Longer exact phrase match earns a bit more confidence.
  if (spec.examples.some((sample) => lower.includes(sample.toLowerCase()))) {
    score += 0.9;
  }

  return score;
}

function fallbackIntent(input: string, context: VoiceRouteContext): IntentName {
  const lower = input.toLowerCase();

  if (/(^|\b)(thanks|thank you|hello|hi|hey|how are you)(\b|$)/i.test(input)) {
    return 'small_talk_qna';
  }

  if (/\b(delete|remove)\b/.test(lower) && /\btask\b/.test(lower)) return 'delete_task';
  if (/\b(delete|remove|cancel)\b/.test(lower) && /\b(event|appointment|meeting)\b/.test(lower)) return 'delete_event';
  if (/\b(mark|set)\b/.test(lower) && /\bpaid\b/.test(lower) && /\bbill\b/.test(lower)) return 'mark_bill_paid';
  if (/\b(cancel|stop|remove)\b/.test(lower) && /\bsubscription\b/.test(lower)) return 'cancel_subscription';
  if (/\b(delete|remove)\b/.test(lower) && /\bnote\b/.test(lower)) return 'delete_note';
  if (/\b(given|gave)\b/.test(lower) && /\b(medication|medicine|meds)\b/.test(lower)) return 'mark_medication_given';
  if (/\b(complete|done)\b/.test(lower) && /\bvet\b/.test(lower)) return 'complete_vet_visit';
  if (/\breassign\b/.test(lower) && /\b(chore|task)\b/.test(lower)) return 'reassign_chore';

  if (context.tab === 'calendar' && /\b(add|schedule|move|reschedule|delete|remove|cancel)\b/.test(lower)) {
    if (/\b(delete|remove|cancel)\b/.test(lower)) return 'delete_event';
    return /\b(move|reschedule)\b/.test(lower) ? 'move_event' : 'create_event';
  }

  if (context.tab === 'tasks' && /\b(add|create|complete|reschedule|move|list|show|delete|remove)\b/.test(lower)) {
    if (/\b(delete|remove)\b/.test(lower)) return 'delete_task';
    if (/\b(complete|done|finish)\b/.test(lower)) return 'complete_task';
    if (/\b(reschedule|move)\b/.test(lower)) return 'reschedule_task';
    if (/\b(list|show)\b/.test(lower)) return 'list_tasks';
    return 'create_task';
  }

  if (context.tab === 'meals' && /\b(meal|grocery|recipe|import|dinner|lunch|breakfast|plan)\b/.test(lower)) {
    if (/\bimport\b/.test(lower)) return 'import_recipe_link';
    if (/\bgrocery\b/.test(lower)) return 'add_grocery_item';
    if (/\bweek\b/.test(lower)) return 'generate_week_plan';
    return 'plan_meal';
  }

  if (context.tab === 'finances' && /\b(bill|subscription|spending|money|paid|cancel)\b/.test(lower)) {
    if (/\b(mark|set)\b/.test(lower) && /\bpaid\b/.test(lower)) return 'mark_bill_paid';
    if (/\b(cancel|stop|remove)\b/.test(lower) && /\bsubscription\b/.test(lower)) return 'cancel_subscription';
    if (/\bsubscription\b/.test(lower)) return 'add_subscription';
    if (/\bexplain|spending|money\b/.test(lower)) return 'explain_spending';
    return 'add_bill';
  }

  if (context.tab === 'pets' && /\b(feed|feeding|medication|vet|given|complete)\b/.test(lower)) {
    if (/\b(given|gave)\b/.test(lower) && /\b(medication|medicine|meds)\b/.test(lower)) return 'mark_medication_given';
    if (/\b(complete|done)\b/.test(lower) && /\bvet\b/.test(lower)) return 'complete_vet_visit';
    if (/\bvet\b/.test(lower)) return 'schedule_vet_visit';
    if (/\bmedication|medicine|meds\b/.test(lower)) return 'add_medication';
    return 'log_feeding';
  }

  if (context.tab === 'notes' && /\b(note|search|find|summary|save|delete|remove)\b/.test(lower)) {
    if (/\b(delete|remove)\b/.test(lower)) return 'delete_note';
    if (/\b(find|search)\b/.test(lower)) return 'find_note';
    if (/\bsummary\b/.test(lower)) return 'save_summary_as_note';
    return 'create_note';
  }

  if (context.tab === 'family' && /\b(assign|reassign|family|chore|responsible)\b/.test(lower)) {
    if (/\bresponsible\b/.test(lower)) return 'who_is_responsible';
    if (/\breassign\b/.test(lower)) return 'reassign_chore';
    if (/\bevent|calendar\b/.test(lower)) return 'add_family_event';
    return 'assign_chore';
  }

  return 'unknown_intent';
}

function firstMissing(requiredSlots: IntentSlot[], slots: SlotValues) {
  return requiredSlots.filter((slot) => !slots[slot] || String(slots[slot]).trim().length === 0);
}

function destinationForIntent(intent: IntentName) {
  if (
    intent === 'create_task' ||
    intent === 'delete_task' ||
    intent === 'complete_task' ||
    intent === 'reschedule_task' ||
    intent === 'list_tasks'
  ) {
    return 'Tasks';
  }
  if (
    intent === 'create_event' ||
    intent === 'delete_event' ||
    intent === 'move_event' ||
    intent === 'what_is_next_event'
  ) {
    return 'Calendar';
  }
  if (intent === 'plan_meal' || intent === 'generate_week_plan' || intent === 'add_grocery_item' || intent === 'import_recipe_link') {
    return 'Meals';
  }
  if (
    intent === 'add_bill' ||
    intent === 'mark_bill_paid' ||
    intent === 'add_subscription' ||
    intent === 'cancel_subscription' ||
    intent === 'explain_spending'
  ) {
    return 'Finances';
  }
  if (
    intent === 'log_feeding' ||
    intent === 'add_medication' ||
    intent === 'mark_medication_given' ||
    intent === 'schedule_vet_visit' ||
    intent === 'complete_vet_visit'
  ) {
    return 'Pets';
  }
  if (
    intent === 'create_note' ||
    intent === 'delete_note' ||
    intent === 'save_summary_as_note' ||
    intent === 'find_note'
  ) {
    return 'Notes & Docs';
  }
  if (
    intent === 'assign_chore' ||
    intent === 'reassign_chore' ||
    intent === 'add_family_event' ||
    intent === 'who_is_responsible'
  ) {
    return 'Family Hub';
  }
  if (
    intent === 'summarize_day' ||
    intent === 'summarize_week' ||
    intent === 'summarize_custom_range' ||
    intent === 'what_do_i_have_today' ||
    intent === 'what_should_i_do_today'
  ) {
    return 'AI Summary';
  }
  return 'Relay';
}

function previewLinesForIntent(intent: IntentName, slots: SlotValues) {
  const lines: string[] = [];

  const pushIf = (label: string, slot?: string) => {
    if (!slot) return;
    lines.push(`${label}: ${slot}`);
  };

  pushIf('Title', slots.title);
  pushIf('Date', slots.date);
  pushIf('Time', slots.time);
  pushIf('Amount', slots.amount);
  pushIf('Person', slots.person || slots.member);
  pushIf('Pet', slots.pet);
  pushIf('Location', slots.location);
  pushIf('Recurrence', slots.recurrence);
  pushIf('Item', slots.item);
  pushIf('Range', slots.range);

  if (!lines.length) {
    if (intent === 'what_do_i_have_today') return ['Read today timeline'];
    if (intent === 'what_should_i_do_today') return ['Generate a suggested day plan'];
    if (intent === 'summarize_day') return ['Summarize today'];
    if (intent === 'summarize_week') return ['Summarize this week'];
    if (intent === 'small_talk_qna') return ['Conversational response'];
    return ['Relay will perform this action'];
  }

  return lines;
}

export function routeVoiceIntent(input: string, context: VoiceRouteContext): VoiceInterpretation {
  const scores = INTENT_REGISTRY.reduce<Record<IntentName, number>>((acc, spec) => {
    acc[spec.name] = scoreIntent(input, spec.name);
    return acc;
  }, {} as Record<IntentName, number>);

  const boosted = applyContextBias(scores, context);
  const ranked = Object.entries(boosted)
    .sort((a, b) => b[1] - a[1])
    .map(([name, score]) => ({ name: name as IntentName, score }));

  let selected = ranked[0];
  if (!selected || selected.score <= 0.45) {
    const fallback = fallbackIntent(input, context);
    selected = { name: fallback, score: fallback === 'unknown_intent' ? 0.2 : 0.65 };
  }

  const spec = INTENT_BY_NAME[selected.name] ?? INTENT_BY_NAME.unknown_intent;
  const slots = extractSlotsForIntent(spec.name, input);
  const missingSlots = firstMissing(spec.requiredSlots, slots);
  const followUp = missingSlots.length
    ? {
        slot: missingSlots[0],
        ...getFollowUpQuestion(spec.name, missingSlots[0]),
      }
    : undefined;
  const previewLines = previewLinesForIntent(spec.name, slots);
  const destinationLabel = destinationForIntent(spec.name);

  const interpretation: VoiceInterpretation = {
    intent: spec.name,
    spec,
    slots,
    missingSlots,
    confidence: Number(Math.min(0.98, Math.max(0.2, selected.score / 4.2)).toFixed(2)),
    reasoning:
      selected.score > 0.45
        ? `Matched ${spec.domain} intent patterns and context bias for ${context.tab}.`
        : `Low lexical confidence; routed via ${context.tab} context fallback.`,
    requiresConfirmation: spec.confirmationRequired,
    previewLines,
    destinationLabel,
    followUp,
  };

  pushVoiceDebugEntry({
    transcript: input,
    contextPath: context.pathname,
    contextTab: context.tab,
    intent: interpretation.intent,
    confidence: interpretation.confidence,
    slots: interpretation.slots,
    missingSlots: interpretation.missingSlots,
    confirmationRequired: interpretation.requiresConfirmation,
    handler: interpretation.spec.handler,
    reasoning: interpretation.reasoning,
  });

  return interpretation;
}
