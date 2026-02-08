import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { emitAIMemoryEvent } from '@/store/ai-memory-events';
import {
  consumePendingVoiceActions,
  PendingVoiceAction,
  subscribePendingVoiceActions,
} from '@/store/voice-router/pending-actions';

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'other';
export type ReminderEntityType = 'feeding' | 'walk' | 'medication' | 'vaccine' | 'vet-visit';

export type Pet = {
  id: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  ageYears: number;
  weightKg: number;
  photoUri?: string;
  status: 'stable' | 'attention';
  archived: boolean;
  familyShared: boolean;
  caretakerIds: string[];
  lastVetVisitISO?: string;
  nextVaccinationISO?: string;
};

export type Feeding = {
  id: string;
  petId: string;
  title: string;
  dateISO: string;
  timeLabel: string;
  foodType: string;
  portion: string;
  notes?: string;
  completed: boolean;
  loggedBy: string;
  createdBy: 'voice' | 'manual';
};

export type Medication = {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  schedule: string;
  timeLabel: string;
  startISO: string;
  endISO?: string;
  nextDueISO: string;
  active: boolean;
  lastGivenISO?: string;
  notes?: string;
};

export type Vaccine = {
  id: string;
  petId: string;
  name: string;
  dueISO: string;
  status: 'upcoming' | 'due' | 'overdue' | 'complete';
  provider?: string;
  completedISO?: string;
  notes?: string;
};

export type Walk = {
  id: string;
  petId: string;
  title: string;
  dateISO: string;
  timeLabel: string;
  durationMin: number;
  notes?: string;
  completed: boolean;
  loggedBy: string;
  createdBy: 'voice' | 'manual';
};

export type VetVisit = {
  id: string;
  petId: string;
  clinicName: string;
  reason: string;
  dateISO: string;
  timeLabel: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  followUpDateISO?: string;
};

export type PetNote = {
  id: string;
  petId: string;
  title: string;
  body: string;
  updatedAtISO: string;
  source: 'manual' | 'voice';
};

export type Reminder = {
  id: string;
  petId: string;
  entityType: ReminderEntityType;
  entityId: string;
  title: string;
  dueAtISO: string;
  repeatRule?: string;
  enabled: boolean;
};

export type PetCaretaker = {
  id: string;
  name: string;
  role: string;
  permission: 'view' | 'edit';
};

export type PetInsight = {
  id: string;
  type:
    | 'medication_missed'
    | 'vaccine_due_soon'
    | 'vaccine_overdue'
    | 'walk_consistency_drop'
    | 'feeding_irregularity'
    | 'followup_suggested'
    | 'all_clear';
  petId?: string;
  title: string;
  body: string;
  severity: 'info' | 'medium';
  actionRoute: string;
};

type PetsState = {
  pets: Pet[];
  feedings: Feeding[];
  medications: Medication[];
  vaccines: Vaccine[];
  walks: Walk[];
  vetVisits: VetVisit[];
  notes: PetNote[];
  reminders: Reminder[];
  caretakers: PetCaretaker[];
  familyModeEnabled: boolean;
  dismissedInsightIds: string[];
};

type PetsAction =
  | { type: 'ADD_PET'; id: string; payload: Omit<Pet, 'id' | 'status' | 'archived'> }
  | { type: 'UPDATE_PET'; id: string; payload: Partial<Pet> }
  | { type: 'ARCHIVE_PET'; id: string }
  | { type: 'ADD_FEEDING'; id: string; payload: Omit<Feeding, 'id' | 'completed' | 'loggedBy' | 'createdBy'> & { createdBy?: 'voice' | 'manual' } }
  | { type: 'UPDATE_FEEDING'; id: string; payload: Partial<Feeding> }
  | { type: 'LOG_FEEDING'; id: string }
  | { type: 'ADD_WALK'; id: string; payload: Omit<Walk, 'id' | 'completed' | 'loggedBy' | 'createdBy'> & { createdBy?: 'voice' | 'manual' } }
  | { type: 'UPDATE_WALK'; id: string; payload: Partial<Walk> }
  | { type: 'LOG_WALK'; id: string }
  | { type: 'ADD_MEDICATION'; id: string; payload: Omit<Medication, 'id' | 'active'> }
  | { type: 'UPDATE_MEDICATION'; id: string; payload: Partial<Medication> }
  | { type: 'MARK_MEDICATION_GIVEN'; id: string; whenISO: string }
  | { type: 'ADD_VACCINE'; id: string; payload: Omit<Vaccine, 'id' | 'status'> }
  | { type: 'UPDATE_VACCINE'; id: string; payload: Partial<Vaccine> }
  | { type: 'MARK_VACCINE_COMPLETE'; id: string; whenISO: string }
  | { type: 'ADD_VET_VISIT'; id: string; payload: Omit<VetVisit, 'id' | 'status'> }
  | { type: 'UPDATE_VET_VISIT'; id: string; payload: Partial<VetVisit> }
  | { type: 'COMPLETE_VET_VISIT'; id: string }
  | { type: 'ADD_NOTE'; id: string; payload: Omit<PetNote, 'id' | 'updatedAtISO' | 'source'> & { source?: 'manual' | 'voice' } }
  | { type: 'UPDATE_NOTE'; id: string; payload: Partial<PetNote> }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'ADD_REMINDER'; id: string; payload: Omit<Reminder, 'id' | 'enabled'> }
  | { type: 'DISMISS_INSIGHT'; id: string }
  | { type: 'SET_CARETAKER_PERMISSION'; id: string; permission: 'view' | 'edit' };

const idGen = (() => {
  let c = 3000;
  return (prefix: string) => {
    c += 1;
    return `${prefix}-${c}`;
  };
})();

function offsetISO(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function computeVaccineStatus(dueISO: string): Vaccine['status'] {
  const today = new Date();
  const due = new Date(`${dueISO}T00:00:00`);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'due';
  return 'upcoming';
}

const seedPets: Pet[] = [
  {
    id: 'pet-1',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    ageYears: 4,
    weightKg: 29.5,
    status: 'stable',
    archived: false,
    familyShared: true,
    caretakerIds: ['ct-1', 'ct-2'],
    lastVetVisitISO: offsetISO(-120),
    nextVaccinationISO: offsetISO(24),
  },
  {
    id: 'pet-2',
    name: 'Luna',
    species: 'cat',
    breed: 'Domestic Shorthair',
    ageYears: 2,
    weightKg: 4.8,
    status: 'attention',
    archived: false,
    familyShared: true,
    caretakerIds: ['ct-1'],
    lastVetVisitISO: offsetISO(-80),
    nextVaccinationISO: offsetISO(-2),
  },
];

const seedFeedings: Feeding[] = [
  {
    id: 'fd-1',
    petId: 'pet-1',
    title: 'Morning feeding',
    dateISO: offsetISO(0),
    timeLabel: '7:00 AM',
    foodType: 'Salmon blend kibble',
    portion: '1 cup',
    completed: true,
    loggedBy: 'Jaiden',
    createdBy: 'manual',
  },
  {
    id: 'fd-2',
    petId: 'pet-1',
    title: 'Evening feeding',
    dateISO: offsetISO(0),
    timeLabel: '6:30 PM',
    foodType: 'Salmon blend kibble',
    portion: '1 cup',
    completed: false,
    loggedBy: 'Unassigned',
    createdBy: 'voice',
  },
  {
    id: 'fd-3',
    petId: 'pet-2',
    title: 'Dinner feeding',
    dateISO: offsetISO(0),
    timeLabel: '7:15 PM',
    foodType: 'Indoor wellness mix',
    portion: '0.5 cup',
    completed: false,
    loggedBy: 'Amy',
    createdBy: 'manual',
  },
];

const seedMedications: Medication[] = [
  {
    id: 'md-1',
    petId: 'pet-1',
    name: 'Flea + Tick',
    dosage: '1 chew',
    schedule: 'Monthly',
    timeLabel: '8:00 AM',
    startISO: offsetISO(-90),
    nextDueISO: offsetISO(2),
    active: true,
    lastGivenISO: offsetISO(-28),
    notes: 'Give with breakfast.',
  },
  {
    id: 'md-2',
    petId: 'pet-2',
    name: 'Hairball support',
    dosage: '5 ml',
    schedule: 'Weekly',
    timeLabel: '9:00 PM',
    startISO: offsetISO(-45),
    nextDueISO: offsetISO(-1),
    active: true,
    lastGivenISO: offsetISO(-8),
  },
];

const seedVaccines: Vaccine[] = [
  {
    id: 'vx-1',
    petId: 'pet-1',
    name: 'Rabies booster',
    dueISO: offsetISO(24),
    status: computeVaccineStatus(offsetISO(24)),
    provider: 'Dr. Williams Vet Clinic',
  },
  {
    id: 'vx-2',
    petId: 'pet-2',
    name: 'FVRCP',
    dueISO: offsetISO(-2),
    status: computeVaccineStatus(offsetISO(-2)),
    provider: 'Westside Animal Care',
    notes: 'Overdue by 2 days.',
  },
];

const seedWalks: Walk[] = [
  {
    id: 'wk-1',
    petId: 'pet-1',
    title: 'Evening walk',
    dateISO: offsetISO(0),
    timeLabel: '6:45 PM',
    durationMin: 35,
    completed: false,
    loggedBy: 'Michael',
    createdBy: 'manual',
  },
  {
    id: 'wk-2',
    petId: 'pet-1',
    title: 'Morning walk',
    dateISO: offsetISO(0),
    timeLabel: '7:30 AM',
    durationMin: 20,
    completed: true,
    loggedBy: 'Jaiden',
    createdBy: 'voice',
  },
];

const seedVetVisits: VetVisit[] = [
  {
    id: 'vv-1',
    petId: 'pet-1',
    clinicName: 'Dr. Williams Vet Clinic',
    reason: 'Annual wellness exam',
    dateISO: offsetISO(12),
    timeLabel: '9:30 AM',
    status: 'upcoming',
    notes: 'Bring stool sample and vaccine card.',
  },
  {
    id: 'vv-2',
    petId: 'pet-2',
    clinicName: 'Westside Animal Care',
    reason: 'Dermatitis follow-up',
    dateISO: offsetISO(-40),
    timeLabel: '11:00 AM',
    status: 'completed',
    followUpDateISO: offsetISO(20),
  },
];

const seedNotes: PetNote[] = [
  {
    id: 'pn-1',
    petId: 'pet-1',
    title: 'Buddy appetite note',
    body: 'Ate slower this week. Keep an eye on hydration.',
    updatedAtISO: nowISO(),
    source: 'manual',
  },
  {
    id: 'pn-2',
    petId: 'pet-2',
    title: 'Luna symptom log',
    body: 'Sneezing reduced after cleaning filter.',
    updatedAtISO: nowISO(),
    source: 'voice',
  },
];

const seedReminders: Reminder[] = [
  {
    id: 'rm-1',
    petId: 'pet-1',
    entityType: 'medication',
    entityId: 'md-1',
    title: 'Give Buddy flea + tick',
    dueAtISO: offsetISO(2),
    repeatRule: 'Monthly',
    enabled: true,
  },
  {
    id: 'rm-2',
    petId: 'pet-2',
    entityType: 'vaccine',
    entityId: 'vx-2',
    title: 'Luna vaccine due',
    dueAtISO: offsetISO(0),
    repeatRule: 'Yearly',
    enabled: true,
  },
];

const seedCaretakers: PetCaretaker[] = [
  { id: 'ct-1', name: 'Jaiden', role: 'Owner', permission: 'edit' },
  { id: 'ct-2', name: 'Michael', role: 'Partner', permission: 'edit' },
  { id: 'ct-3', name: 'Amy', role: 'Family', permission: 'view' },
];

const initialState: PetsState = {
  pets: seedPets,
  feedings: seedFeedings,
  medications: seedMedications,
  vaccines: seedVaccines,
  walks: seedWalks,
  vetVisits: seedVetVisits,
  notes: seedNotes,
  reminders: seedReminders,
  caretakers: seedCaretakers,
  familyModeEnabled: true,
  dismissedInsightIds: [],
};

function reducer(state: PetsState, action: PetsAction): PetsState {
  switch (action.type) {
    case 'ADD_PET': {
      const pet: Pet = {
        ...action.payload,
        id: action.id,
        status: 'stable',
        archived: false,
      };
      return { ...state, pets: [pet, ...state.pets] };
    }
    case 'UPDATE_PET': {
      return {
        ...state,
        pets: state.pets.map((pet) => (pet.id === action.id ? { ...pet, ...action.payload } : pet)),
      };
    }
    case 'ARCHIVE_PET': {
      return {
        ...state,
        pets: state.pets.map((pet) => (pet.id === action.id ? { ...pet, archived: true } : pet)),
      };
    }
    case 'ADD_FEEDING': {
      const feeding: Feeding = {
        ...action.payload,
        id: action.id,
        completed: false,
        loggedBy: 'Relay',
        createdBy: action.payload.createdBy ?? 'manual',
      };
      return { ...state, feedings: [feeding, ...state.feedings] };
    }
    case 'UPDATE_FEEDING': {
      return {
        ...state,
        feedings: state.feedings.map((item) => (item.id === action.id ? { ...item, ...action.payload } : item)),
      };
    }
    case 'LOG_FEEDING': {
      return {
        ...state,
        feedings: state.feedings.map((item) =>
          item.id === action.id ? { ...item, completed: true, loggedBy: 'Relay' } : item
        ),
      };
    }
    case 'ADD_WALK': {
      const walk: Walk = {
        ...action.payload,
        id: action.id,
        completed: false,
        loggedBy: 'Relay',
        createdBy: action.payload.createdBy ?? 'manual',
      };
      return { ...state, walks: [walk, ...state.walks] };
    }
    case 'UPDATE_WALK': {
      return {
        ...state,
        walks: state.walks.map((item) => (item.id === action.id ? { ...item, ...action.payload } : item)),
      };
    }
    case 'LOG_WALK': {
      return {
        ...state,
        walks: state.walks.map((item) =>
          item.id === action.id ? { ...item, completed: true, loggedBy: 'Relay' } : item
        ),
      };
    }
    case 'ADD_MEDICATION': {
      const medication: Medication = {
        ...action.payload,
        id: action.id,
        active: true,
      };
      return { ...state, medications: [medication, ...state.medications] };
    }
    case 'UPDATE_MEDICATION': {
      return {
        ...state,
        medications: state.medications.map((item) => (item.id === action.id ? { ...item, ...action.payload } : item)),
      };
    }
    case 'MARK_MEDICATION_GIVEN': {
      return {
        ...state,
        medications: state.medications.map((item) =>
          item.id === action.id
            ? {
                ...item,
                lastGivenISO: action.whenISO,
                nextDueISO: offsetISO(30),
              }
            : item
        ),
      };
    }
    case 'ADD_VACCINE': {
      const vaccine: Vaccine = {
        ...action.payload,
        id: action.id,
        status: computeVaccineStatus(action.payload.dueISO),
      };
      return { ...state, vaccines: [vaccine, ...state.vaccines] };
    }
    case 'UPDATE_VACCINE': {
      return {
        ...state,
        vaccines: state.vaccines.map((item) =>
          item.id === action.id
            ? { ...item, ...action.payload, status: action.payload.dueISO ? computeVaccineStatus(action.payload.dueISO) : item.status }
            : item
        ),
      };
    }
    case 'MARK_VACCINE_COMPLETE': {
      return {
        ...state,
        vaccines: state.vaccines.map((item) =>
          item.id === action.id
            ? {
                ...item,
                status: 'complete',
                completedISO: action.whenISO,
              }
            : item
        ),
      };
    }
    case 'ADD_VET_VISIT': {
      const visit: VetVisit = {
        ...action.payload,
        id: action.id,
        status: 'upcoming',
      };
      return { ...state, vetVisits: [visit, ...state.vetVisits] };
    }
    case 'UPDATE_VET_VISIT': {
      return {
        ...state,
        vetVisits: state.vetVisits.map((item) => (item.id === action.id ? { ...item, ...action.payload } : item)),
      };
    }
    case 'COMPLETE_VET_VISIT': {
      return {
        ...state,
        vetVisits: state.vetVisits.map((item) => (item.id === action.id ? { ...item, status: 'completed' } : item)),
      };
    }
    case 'ADD_NOTE': {
      const note: PetNote = {
        ...action.payload,
        id: action.id,
        source: action.payload.source ?? 'manual',
        updatedAtISO: nowISO(),
      };
      return { ...state, notes: [note, ...state.notes] };
    }
    case 'UPDATE_NOTE': {
      return {
        ...state,
        notes: state.notes.map((item) =>
          item.id === action.id ? { ...item, ...action.payload, updatedAtISO: nowISO() } : item
        ),
      };
    }
    case 'DELETE_NOTE': {
      return {
        ...state,
        notes: state.notes.filter((item) => item.id !== action.id),
      };
    }
    case 'ADD_REMINDER': {
      const reminder: Reminder = {
        ...action.payload,
        id: action.id,
        enabled: true,
      };
      return { ...state, reminders: [reminder, ...state.reminders] };
    }
    case 'DISMISS_INSIGHT': {
      if (state.dismissedInsightIds.includes(action.id)) return state;
      return {
        ...state,
        dismissedInsightIds: [...state.dismissedInsightIds, action.id],
      };
    }
    case 'SET_CARETAKER_PERMISSION': {
      return {
        ...state,
        caretakers: state.caretakers.map((item) =>
          item.id === action.id ? { ...item, permission: action.permission } : item
        ),
      };
    }
    default:
      return state;
  }
}

function formatDateLabel(dayISO: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dayISO}T00:00:00`));
}

function computeInsights(state: PetsState): PetInsight[] {
  const insights: PetInsight[] = [];

  const overdueVaccines = state.vaccines.filter((vaccine) => vaccine.status === 'overdue');
  overdueVaccines.forEach((vaccine) => {
    insights.push({
      id: `ins-vx-overdue-${vaccine.id}`,
      type: 'vaccine_overdue',
      petId: vaccine.petId,
      title: `${findPetName(state, vaccine.petId)} has an overdue vaccine`,
      body: `${vaccine.name} passed due date. Relay can reschedule it now.`,
      severity: 'medium',
      actionRoute: `/pets/profile/${vaccine.petId}/health/vaccines/${vaccine.id}`,
    });
  });

  const dueSoon = state.vaccines.filter((vaccine) => vaccine.status === 'due');
  dueSoon.forEach((vaccine) => {
    insights.push({
      id: `ins-vx-due-${vaccine.id}`,
      type: 'vaccine_due_soon',
      petId: vaccine.petId,
      title: `${vaccine.name} is due soon`,
      body: `Due ${formatDateLabel(vaccine.dueISO)} for ${findPetName(state, vaccine.petId)}.`,
      severity: 'info',
      actionRoute: `/pets/profile/${vaccine.petId}/health/vaccines/${vaccine.id}`,
    });
  });

  const medMissed = state.medications.filter((medication) => new Date(`${medication.nextDueISO}T00:00:00`) < new Date());
  medMissed.forEach((medication) => {
    insights.push({
      id: `ins-med-${medication.id}`,
      type: 'medication_missed',
      petId: medication.petId,
      title: `${findPetName(state, medication.petId)} may have missed medication`,
      body: `${medication.name} was due ${formatDateLabel(medication.nextDueISO)}.`,
      severity: 'medium',
      actionRoute: `/pets/profile/${medication.petId}/health/medications/${medication.id}`,
    });
  });

  const followupNeeded = state.vetVisits.find((visit) => visit.status === 'completed' && !visit.followUpDateISO);
  if (followupNeeded) {
    insights.push({
      id: `ins-followup-${followupNeeded.id}`,
      type: 'followup_suggested',
      petId: followupNeeded.petId,
      title: 'Add a follow-up reminder',
      body: `${findPetName(state, followupNeeded.petId)} had a completed visit with no follow-up date set.`,
      severity: 'info',
      actionRoute: `/pets/profile/${followupNeeded.petId}/vet-visits/${followupNeeded.id}`,
    });
  }

  if (!insights.length) {
    insights.push({
      id: 'ins-all-clear',
      type: 'all_clear',
      title: 'Everything looks on track',
      body: 'No urgent pet care actions needed right now.',
      severity: 'info',
      actionRoute: '/pets',
    });
  }

  return insights.filter((insight) => !state.dismissedInsightIds.includes(insight.id));
}

function findPetName(state: PetsState, petId: string) {
  return state.pets.find((pet) => pet.id === petId)?.name ?? 'Your pet';
}

export type PetScheduleItem = {
  id: string;
  petId: string;
  kind: 'feeding' | 'walk' | 'medication' | 'vaccine' | 'vet-visit';
  title: string;
  whenLabel: string;
  statusLabel: string;
  route: string;
};

function buildScheduleItems(state: PetsState, petId: string): PetScheduleItem[] {
  const feedings = state.feedings
    .filter((item) => item.petId === petId)
    .map((item) => ({
      id: `feeding-${item.id}`,
      petId,
      kind: 'feeding' as const,
      title: item.title,
      whenLabel: `${formatDateLabel(item.dateISO)} · ${item.timeLabel}`,
      statusLabel: item.completed ? 'Done' : 'Upcoming',
      route: `/pets/profile/${petId}/feeding/${item.id}/edit`,
    }));

  const walks = state.walks
    .filter((item) => item.petId === petId)
    .map((item) => ({
      id: `walk-${item.id}`,
      petId,
      kind: 'walk' as const,
      title: item.title,
      whenLabel: `${formatDateLabel(item.dateISO)} · ${item.timeLabel}`,
      statusLabel: item.completed ? 'Done' : `${item.durationMin} min`,
      route: `/pets/profile/${petId}/walks/${item.id}/edit`,
    }));

  const medications = state.medications
    .filter((item) => item.petId === petId)
    .map((item) => ({
      id: `medication-${item.id}`,
      petId,
      kind: 'medication' as const,
      title: item.name,
      whenLabel: `${formatDateLabel(item.nextDueISO)} · ${item.timeLabel}`,
      statusLabel: item.active ? 'Active' : 'Paused',
      route: `/pets/profile/${petId}/health/medications/${item.id}`,
    }));

  const vaccines = state.vaccines
    .filter((item) => item.petId === petId)
    .map((item) => ({
      id: `vaccine-${item.id}`,
      petId,
      kind: 'vaccine' as const,
      title: item.name,
      whenLabel: formatDateLabel(item.dueISO),
      statusLabel: item.status,
      route: `/pets/profile/${petId}/health/vaccines/${item.id}`,
    }));

  const visits = state.vetVisits
    .filter((item) => item.petId === petId)
    .map((item) => ({
      id: `vet-visit-${item.id}`,
      petId,
      kind: 'vet-visit' as const,
      title: item.reason,
      whenLabel: `${formatDateLabel(item.dateISO)} · ${item.timeLabel}`,
      statusLabel: item.status,
      route: `/pets/profile/${petId}/vet-visits/${item.id}`,
    }));

  return [...feedings, ...walks, ...medications, ...vaccines, ...visits].sort((a, b) =>
    a.whenLabel.localeCompare(b.whenLabel)
  );
}

type PetsContextValue = {
  state: PetsState;
  insights: PetInsight[];
  activePets: Pet[];
  getPet: (petId: string) => Pet | undefined;
  getScheduleForPet: (petId: string) => PetScheduleItem[];
  addPet: (payload: Omit<Pet, 'id' | 'status' | 'archived'>) => string;
  updatePet: (id: string, payload: Partial<Pet>) => void;
  archivePet: (id: string) => void;
  addFeeding: (payload: Omit<Feeding, 'id' | 'completed' | 'loggedBy' | 'createdBy'> & { createdBy?: 'voice' | 'manual' }) => string;
  updateFeeding: (id: string, payload: Partial<Feeding>) => void;
  logFeeding: (id: string) => void;
  addWalk: (payload: Omit<Walk, 'id' | 'completed' | 'loggedBy' | 'createdBy'> & { createdBy?: 'voice' | 'manual' }) => string;
  updateWalk: (id: string, payload: Partial<Walk>) => void;
  logWalk: (id: string) => void;
  addMedication: (payload: Omit<Medication, 'id' | 'active'>) => string;
  updateMedication: (id: string, payload: Partial<Medication>) => void;
  markMedicationGiven: (id: string) => void;
  addVaccine: (payload: Omit<Vaccine, 'id' | 'status'>) => string;
  updateVaccine: (id: string, payload: Partial<Vaccine>) => void;
  markVaccineComplete: (id: string) => void;
  addVetVisit: (payload: Omit<VetVisit, 'id' | 'status'>) => string;
  updateVetVisit: (id: string, payload: Partial<VetVisit>) => void;
  completeVetVisit: (id: string) => void;
  addNote: (payload: Omit<PetNote, 'id' | 'updatedAtISO' | 'source'> & { source?: 'manual' | 'voice' }) => string;
  updateNote: (id: string, payload: Partial<PetNote>) => void;
  deleteNote: (id: string) => void;
  addReminder: (payload: Omit<Reminder, 'id' | 'enabled'>) => string;
  dismissInsight: (id: string) => void;
  setCaretakerPermission: (id: string, permission: 'view' | 'edit') => void;
};

const PetsContext = createContext<PetsContextValue | null>(null);

export function PetsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const resolvePetId = (action: PendingVoiceAction) => {
      const petName =
        typeof action.payload.petName === 'string'
          ? action.payload.petName.toLowerCase().trim()
          : '';
      if (petName) {
        const matched = state.pets.find((pet) => pet.name.toLowerCase().includes(petName));
        if (matched) return matched.id;
      }
      return state.pets.find((pet) => !pet.archived)?.id || state.pets[0]?.id || '';
    };

    const applyPendingAction = (action: PendingVoiceAction) => {
      if (action.type === 'log_feeding') {
        const petId = resolvePetId(action);
        if (!petId) return;
        const dateISO =
          typeof action.payload.dateISO === 'string'
            ? action.payload.dateISO
            : new Date().toISOString().slice(0, 10);
        const timeLabel = typeof action.payload.timeLabel === 'string' ? action.payload.timeLabel : 'Now';
        dispatch({
          type: 'ADD_FEEDING',
          id: idGen('fd'),
          payload: {
            petId,
            title: 'Voice feeding log',
            dateISO,
            timeLabel,
            foodType: 'Meal',
            portion: 'Standard',
            notes: 'Captured from Relay voice',
            createdBy: 'voice',
          },
        });
        return;
      }

      if (action.type === 'add_medication') {
        const petId = resolvePetId(action);
        if (!petId) return;
        const startISO =
          typeof action.payload.startISO === 'string'
            ? action.payload.startISO
            : new Date().toISOString().slice(0, 10);
        const timeLabel = typeof action.payload.timeLabel === 'string' ? action.payload.timeLabel : '8:00 AM';
        const schedule = typeof action.payload.schedule === 'string' ? action.payload.schedule : 'Daily';
        const name = typeof action.payload.name === 'string' ? action.payload.name : 'Medication';
        dispatch({
          type: 'ADD_MEDICATION',
          id: idGen('md'),
          payload: {
            petId,
            name,
            dosage: 'See label',
            schedule,
            timeLabel,
            startISO,
            nextDueISO: startISO,
            notes: 'Captured from Relay voice',
          },
        });
        return;
      }

      if (action.type === 'schedule_vet_visit') {
        const petId = resolvePetId(action);
        if (!petId) return;
        const dateISO =
          typeof action.payload.dateISO === 'string'
            ? action.payload.dateISO
            : new Date().toISOString().slice(0, 10);
        const timeLabel = typeof action.payload.timeLabel === 'string' ? action.payload.timeLabel : '3:00 PM';
        const reason = typeof action.payload.reason === 'string' ? action.payload.reason : 'Routine check';
        dispatch({
          type: 'ADD_VET_VISIT',
          id: idGen('vv'),
          payload: {
            petId,
            clinicName: 'Primary Vet Clinic',
            reason,
            dateISO,
            timeLabel,
            notes: 'Created from Relay voice',
          },
        });
        return;
      }

      if (action.type === 'mark_medication_given') {
        const petId = resolvePetId(action);
        const nameHint =
          typeof action.payload.name === 'string' ? action.payload.name.toLowerCase().trim() : '';
        const medication = state.medications.find((item) => {
          if (item.petId !== petId) return false;
          if (!nameHint) return true;
          return item.name.toLowerCase().includes(nameHint);
        });
        if (!medication) return;
        const whenISO =
          typeof action.payload.dateISO === 'string'
            ? action.payload.dateISO
            : new Date().toISOString().slice(0, 10);
        dispatch({ type: 'MARK_MEDICATION_GIVEN', id: medication.id, whenISO });
        return;
      }

      if (action.type === 'complete_vet_visit') {
        const petId = resolvePetId(action);
        const visit = [...state.vetVisits]
          .filter((item) => item.petId === petId && item.status === 'upcoming')
          .sort((a, b) => a.dateISO.localeCompare(b.dateISO))[0];
        if (!visit) return;
        dispatch({ type: 'COMPLETE_VET_VISIT', id: visit.id });
      }
    };

    consumePendingVoiceActions('pets').forEach(applyPendingAction);
    return subscribePendingVoiceActions('pets', applyPendingAction);
  }, [state.medications, state.pets, state.vetVisits]);

  useEffect(() => {
    const activePets = state.pets.filter((pet) => !pet.archived);
    const overdueVaccines = state.vaccines.filter((vaccine) => vaccine.status === 'overdue').length;
    const upcomingVisits = state.vetVisits.filter((visit) => visit.status === 'upcoming').length;
    const lastFeedLog = state.feedings
      .filter((feeding) => feeding.completed)
      .map((feeding) => feeding.dateISO)
      .sort()
      .at(-1);
    const lastWalkLog = state.walks
      .filter((walk) => walk.completed)
      .map((walk) => walk.dateISO)
      .sort()
      .at(-1);
    const lastCareLogISO = [lastFeedLog, lastWalkLog].filter(Boolean).sort().at(-1) || '';

    emitAIMemoryEvent({
      source: 'pets',
      kind: 'snapshot',
      payload: {
        activePets: activePets.length,
        overdueVaccines,
        upcomingVisits,
        activeMedications: state.medications.filter((med) => med.active).length,
        lastCareLogISO,
      },
    });
  }, [state.feedings, state.medications, state.pets, state.vaccines, state.vetVisits, state.walks]);

  const value = useMemo<PetsContextValue>(() => {
    const activePets = state.pets.filter((pet) => !pet.archived);
    return {
      state,
      insights: computeInsights(state),
      activePets,
      getPet: (petId) => state.pets.find((pet) => pet.id === petId),
      getScheduleForPet: (petId) => buildScheduleItems(state, petId),
      addPet: (payload) => {
        const id = idGen('pet');
        dispatch({ type: 'ADD_PET', id, payload: { ...payload } });
        return id;
      },
      updatePet: (id, payload) => dispatch({ type: 'UPDATE_PET', id, payload }),
      archivePet: (id) => dispatch({ type: 'ARCHIVE_PET', id }),
      addFeeding: (payload) => {
        const id = idGen('fd');
        dispatch({ type: 'ADD_FEEDING', id, payload: { ...payload } });
        return id;
      },
      updateFeeding: (id, payload) => dispatch({ type: 'UPDATE_FEEDING', id, payload }),
      logFeeding: (id) => dispatch({ type: 'LOG_FEEDING', id }),
      addWalk: (payload) => {
        const id = idGen('wk');
        dispatch({ type: 'ADD_WALK', id, payload: { ...payload } });
        return id;
      },
      updateWalk: (id, payload) => dispatch({ type: 'UPDATE_WALK', id, payload }),
      logWalk: (id) => dispatch({ type: 'LOG_WALK', id }),
      addMedication: (payload) => {
        const id = idGen('md');
        dispatch({ type: 'ADD_MEDICATION', id, payload: { ...payload } });
        return id;
      },
      updateMedication: (id, payload) => dispatch({ type: 'UPDATE_MEDICATION', id, payload }),
      markMedicationGiven: (id) => dispatch({ type: 'MARK_MEDICATION_GIVEN', id, whenISO: new Date().toISOString().slice(0, 10) }),
      addVaccine: (payload) => {
        const id = idGen('vx');
        dispatch({ type: 'ADD_VACCINE', id, payload: { ...payload } });
        return id;
      },
      updateVaccine: (id, payload) => dispatch({ type: 'UPDATE_VACCINE', id, payload }),
      markVaccineComplete: (id) => dispatch({ type: 'MARK_VACCINE_COMPLETE', id, whenISO: new Date().toISOString().slice(0, 10) }),
      addVetVisit: (payload) => {
        const id = idGen('vv');
        dispatch({ type: 'ADD_VET_VISIT', id, payload: { ...payload } });
        return id;
      },
      updateVetVisit: (id, payload) => dispatch({ type: 'UPDATE_VET_VISIT', id, payload }),
      completeVetVisit: (id) => dispatch({ type: 'COMPLETE_VET_VISIT', id }),
      addNote: (payload) => {
        const id = idGen('pn');
        dispatch({ type: 'ADD_NOTE', id, payload: { ...payload } });
        return id;
      },
      updateNote: (id, payload) => dispatch({ type: 'UPDATE_NOTE', id, payload }),
      deleteNote: (id) => dispatch({ type: 'DELETE_NOTE', id }),
      addReminder: (payload) => {
        const id = idGen('rm');
        dispatch({ type: 'ADD_REMINDER', id, payload: { ...payload } });
        return id;
      },
      dismissInsight: (id) => dispatch({ type: 'DISMISS_INSIGHT', id }),
      setCaretakerPermission: (id, permission) => dispatch({ type: 'SET_CARETAKER_PERMISSION', id, permission }),
    };
  }, [state]);

  return <PetsContext.Provider value={value}>{children}</PetsContext.Provider>;
}

export function usePetsStore() {
  const ctx = useContext(PetsContext);
  if (!ctx) {
    throw new Error('usePetsStore must be used within PetsProvider');
  }
  return ctx;
}

export function speciesLabel(species: PetSpecies) {
  if (species === 'dog') return 'Dog';
  if (species === 'cat') return 'Cat';
  if (species === 'bird') return 'Bird';
  return 'Other';
}

export function formatDateShort(dateISO?: string) {
  if (!dateISO) return 'Not set';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateISO}T00:00:00`));
}

export function formatDateLong(dateISO?: string) {
  if (!dateISO) return 'Not set';
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dateISO}T00:00:00`));
}
