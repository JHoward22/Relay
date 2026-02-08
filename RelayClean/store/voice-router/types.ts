export type IntentDomain =
  | 'global'
  | 'tasks'
  | 'calendar'
  | 'meals'
  | 'finances'
  | 'pets'
  | 'notes'
  | 'family'
  | 'search'
  | 'system';

export type IntentName =
  | 'summarize_day'
  | 'summarize_week'
  | 'summarize_custom_range'
  | 'what_do_i_have_today'
  | 'what_should_i_do_today'
  | 'create_task'
  | 'delete_task'
  | 'complete_task'
  | 'reschedule_task'
  | 'list_tasks'
  | 'create_event'
  | 'delete_event'
  | 'move_event'
  | 'what_is_next_event'
  | 'plan_meal'
  | 'generate_week_plan'
  | 'add_grocery_item'
  | 'import_recipe_link'
  | 'add_bill'
  | 'mark_bill_paid'
  | 'add_subscription'
  | 'cancel_subscription'
  | 'explain_spending'
  | 'log_feeding'
  | 'add_medication'
  | 'mark_medication_given'
  | 'schedule_vet_visit'
  | 'complete_vet_visit'
  | 'create_note'
  | 'delete_note'
  | 'save_summary_as_note'
  | 'find_note'
  | 'assign_chore'
  | 'reassign_chore'
  | 'add_family_event'
  | 'who_is_responsible'
  | 'unknown_intent'
  | 'small_talk_qna';

export type IntentSlot =
  | 'title'
  | 'task_ref'
  | 'event_ref'
  | 'query'
  | 'date'
  | 'time'
  | 'range'
  | 'start_date'
  | 'end_date'
  | 'location'
  | 'person'
  | 'member'
  | 'pet'
  | 'meal_type'
  | 'item'
  | 'url'
  | 'amount'
  | 'recurrence'
  | 'reason'
  | 'category';

export type SlotValues = Partial<Record<IntentSlot, string>>;

export type IntentSpec = {
  name: IntentName;
  domain: IntentDomain;
  description: string;
  requiredSlots: IntentSlot[];
  optionalSlots: IntentSlot[];
  examples: string[];
  confirmationRequired: boolean;
  handler: IntentDomain;
  previewTitle: string;
  processingLabel: string;
  patterns: RegExp[];
  keywords: string[];
};

export type AppContextTab =
  | 'home'
  | 'tasks'
  | 'calendar'
  | 'settings'
  | 'meals'
  | 'finances'
  | 'pets'
  | 'notes'
  | 'family'
  | 'unknown';

export type VoiceRouteContext = {
  pathname: string;
  tab: AppContextTab;
  familyMode: boolean;
  selectedDateISO?: string;
};

export type FollowUpPrompt = {
  slot: IntentSlot;
  question: string;
  chips: string[];
};

export type VoiceInterpretation = {
  intent: IntentName;
  spec: IntentSpec;
  slots: SlotValues;
  missingSlots: IntentSlot[];
  confidence: number;
  reasoning: string;
  requiresConfirmation: boolean;
  previewLines: string[];
  destinationLabel: string;
  followUp?: FollowUpPrompt;
};

export type VoiceExecutionUndo = {
  label: string;
  run: () => void;
};

export type VoiceExecutionOutcome = {
  message: string;
  detail?: string;
  route?: string;
  explain: string;
  informational: boolean;
  undo?: VoiceExecutionUndo;
};

export type VoiceDebugEntry = {
  id: string;
  atISO: string;
  transcript: string;
  contextPath: string;
  contextTab: AppContextTab;
  intent: IntentName;
  confidence: number;
  slots: SlotValues;
  missingSlots: IntentSlot[];
  confirmationRequired: boolean;
  handler: IntentDomain;
  reasoning: string;
};
