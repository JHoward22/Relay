import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { emitAIMemoryEvent } from '@/store/ai-memory-events';
import {
  consumePendingVoiceActions,
  PendingVoiceAction,
  subscribePendingVoiceActions,
} from '@/store/voice-router/pending-actions';

export type NoteSource = 'manual' | 'voice' | 'mixed';
export type DocType = 'pdf' | 'image' | 'text';
export type MoodTag = 'calm' | 'good' | 'stressed' | 'tired' | 'focused';

export type Tag = {
  id: string;
  label: string;
  color: string;
  usageCount: number;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  isSystem: boolean;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  categorySlug: string;
  tagIds: string[];
  checklist: { id: string; title: string; done: boolean }[];
  pinned: boolean;
  archived: boolean;
  createdAtISO: string;
  updatedAtISO: string;
  source: NoteSource;
  shared: boolean;
  addedBy: string;
  aiSummary: string;
  relatedNoteIds: string[];
};

export type Document = {
  id: string;
  name: string;
  type: DocType;
  categorySlug: string;
  tagIds: string[];
  pinned: boolean;
  archived: boolean;
  createdAtISO: string;
  updatedAtISO: string;
  source: 'upload' | 'voice';
  shared: boolean;
  addedBy: string;
  aiSummary: string;
  extractedText?: string;
};

export type JournalEntry = {
  id: string;
  title: string;
  body: string;
  mood: MoodTag;
  dateISO: string;
  tagIds: string[];
  archived: boolean;
  source: 'manual' | 'voice';
  aiReflection: string;
};

export type NoteDraft = {
  mode: NoteSource;
  title: string;
  body: string;
  categorySlug: string;
  tagIds: string[];
  pinned: boolean;
};

export type DocDraft = {
  name: string;
  type: DocType;
  categorySlug: string;
  tagIds: string[];
  fileLabel: string;
};

export type NotesFilter = {
  categorySlug?: string;
  type: 'all' | 'note' | 'doc' | 'journal';
  time: 'any' | '7d' | '30d';
  tagId?: string;
};

export type AiSuggestion = {
  id: string;
  title: string;
  body: string;
  route: string;
};

type NotesState = {
  categories: Category[];
  tags: Tag[];
  notes: Note[];
  documents: Document[];
  journalEntries: JournalEntry[];
  noteDraft?: NoteDraft;
  docDraft?: DocDraft;
  dismissedSuggestionIds: string[];
};

type NotesAction =
  | { type: 'SET_NOTE_DRAFT'; payload: NoteDraft }
  | { type: 'CLEAR_NOTE_DRAFT' }
  | { type: 'SET_DOC_DRAFT'; payload: DocDraft }
  | { type: 'CLEAR_DOC_DRAFT' }
  | { type: 'ADD_NOTE'; id: string; payload: Omit<Note, 'id' | 'createdAtISO' | 'updatedAtISO'> }
  | { type: 'UPDATE_NOTE'; id: string; payload: Partial<Note> }
  | { type: 'ARCHIVE_NOTE'; id: string; archived: boolean }
  | { type: 'DELETE_NOTE'; id: string }
  | { type: 'TOGGLE_PIN_NOTE'; id: string }
  | { type: 'MOVE_NOTE'; id: string; categorySlug: string }
  | { type: 'ADD_DOCUMENT'; id: string; payload: Omit<Document, 'id' | 'createdAtISO' | 'updatedAtISO'> }
  | { type: 'UPDATE_DOCUMENT'; id: string; payload: Partial<Document> }
  | { type: 'ARCHIVE_DOCUMENT'; id: string; archived: boolean }
  | { type: 'DELETE_DOCUMENT'; id: string }
  | { type: 'TOGGLE_PIN_DOCUMENT'; id: string }
  | { type: 'MOVE_DOCUMENT'; id: string; categorySlug: string }
  | { type: 'SET_DOC_TAGS'; id: string; tagIds: string[] }
  | { type: 'SET_NOTE_TAGS'; id: string; tagIds: string[] }
  | { type: 'ADD_JOURNAL'; id: string; payload: Omit<JournalEntry, 'id'> }
  | { type: 'UPDATE_JOURNAL'; id: string; payload: Partial<JournalEntry> }
  | { type: 'ARCHIVE_JOURNAL'; id: string; archived: boolean }
  | { type: 'DELETE_JOURNAL'; id: string }
  | { type: 'DISMISS_SUGGESTION'; id: string };

const idGen = (() => {
  let c = 4000;
  return (prefix: string) => {
    c += 1;
    return `${prefix}-${c}`;
  };
})();

function nowISO() {
  return new Date().toISOString();
}

function isoOffset(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const seedCategories: Category[] = [
  { id: 'cat-personal', slug: 'personal', name: 'Personal Notes', icon: 'person-outline', description: 'Life admin and personal reminders', isSystem: true },
  { id: 'cat-work', slug: 'work-school', name: 'Work / School', icon: 'briefcase-outline', description: 'Projects, meetings, and school plans', isSystem: true },
  { id: 'cat-documents', slug: 'documents', name: 'Documents', icon: 'folder-outline', description: 'Important files and records', isSystem: true },
  { id: 'cat-receipts', slug: 'receipts', name: 'Receipts', icon: 'receipt-outline', description: 'Expenses and purchase history', isSystem: true },
  { id: 'cat-ideas', slug: 'ideas', name: 'Ideas', icon: 'bulb-outline', description: 'Creative thoughts and future plans', isSystem: true },
  { id: 'cat-journal', slug: 'journal', name: 'Journal', icon: 'book-outline', description: 'Daily entries and reflections', isSystem: true },
  { id: 'cat-reference', slug: 'reference', name: 'Reference', icon: 'bookmark-outline', description: 'Keep-for-later knowledge', isSystem: true },
  { id: 'cat-archive', slug: 'archive', name: 'Archive', icon: 'archive-outline', description: 'Archived notes and documents', isSystem: true },
];

const seedTags: Tag[] = [
  { id: 'tag-urgent', label: 'urgent', color: '#D05D5D', usageCount: 4 },
  { id: 'tag-family', label: 'family', color: '#5D83D5', usageCount: 6 },
  { id: 'tag-health', label: 'health', color: '#57A27D', usageCount: 5 },
  { id: 'tag-finance', label: 'finance', color: '#7C8BC8', usageCount: 3 },
  { id: 'tag-idea', label: 'idea', color: '#D48A47', usageCount: 7 },
  { id: 'tag-followup', label: 'follow-up', color: '#4D6FB7', usageCount: 2 },
];

const seedNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Dentist follow-up plan',
    body: 'Call clinic by Monday, ask for a 6-month cleaning block for the family.',
    categorySlug: 'personal',
    tagIds: ['tag-health', 'tag-followup'],
    checklist: [
      { id: 'ck-1', title: 'Call clinic', done: false },
      { id: 'ck-2', title: 'Add reminder in Relay', done: true },
    ],
    pinned: true,
    archived: false,
    createdAtISO: isoOffset(-9),
    updatedAtISO: isoOffset(-1),
    source: 'voice',
    shared: true,
    addedBy: 'Jaiden',
    aiSummary: 'A health follow-up note with one remaining action.',
    relatedNoteIds: ['note-2'],
  },
  {
    id: 'note-2',
    title: 'Weekly logistics summary',
    body: 'Soccer pickup Tue/Thu, vitamins each evening, budget review Friday.',
    categorySlug: 'reference',
    tagIds: ['tag-family'],
    checklist: [],
    pinned: false,
    archived: false,
    createdAtISO: isoOffset(-5),
    updatedAtISO: isoOffset(-2),
    source: 'mixed',
    shared: true,
    addedBy: 'Relay',
    aiSummary: 'A compact weekly overview of family logistics and routines.',
    relatedNoteIds: ['note-1'],
  },
  {
    id: 'note-3',
    title: 'New app concept',
    body: 'Voice-first onboarding that teaches itself from user routines.',
    categorySlug: 'ideas',
    tagIds: ['tag-idea'],
    checklist: [],
    pinned: false,
    archived: false,
    createdAtISO: isoOffset(-3),
    updatedAtISO: isoOffset(-1),
    source: 'manual',
    shared: false,
    addedBy: 'Jaiden',
    aiSummary: 'A product idea focused on adaptive voice onboarding.',
    relatedNoteIds: [],
  },
];

const seedDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'Insurance card copy.pdf',
    type: 'pdf',
    categorySlug: 'documents',
    tagIds: ['tag-health'],
    pinned: true,
    archived: false,
    createdAtISO: isoOffset(-14),
    updatedAtISO: isoOffset(-7),
    source: 'upload',
    shared: true,
    addedBy: 'Jaiden',
    aiSummary: 'Insurance card reference document for appointments.',
    extractedText: 'Policy number, provider contact, member ID.',
  },
  {
    id: 'doc-2',
    name: 'Grocery receipt image.jpg',
    type: 'image',
    categorySlug: 'receipts',
    tagIds: ['tag-finance'],
    pinned: false,
    archived: false,
    createdAtISO: isoOffset(-6),
    updatedAtISO: isoOffset(-6),
    source: 'upload',
    shared: false,
    addedBy: 'Jaiden',
    aiSummary: 'Receipt snapshot with food and household categories.',
    extractedText: 'Total $84.23, store timestamp, line items.',
  },
];

const seedJournal: JournalEntry[] = [
  {
    id: 'jr-1',
    title: 'Friday check-in',
    body: 'Felt clear after organizing tasks in Relay. Need to protect Sunday prep time.',
    mood: 'good',
    dateISO: isoOffset(0).slice(0, 10),
    tagIds: ['tag-idea'],
    archived: false,
    source: 'manual',
    aiReflection: 'You feel most in control when your week is pre-planned.',
  },
  {
    id: 'jr-2',
    title: 'Midweek note',
    body: 'Overbooked afternoon. Next time block family tasks earlier.',
    mood: 'stressed',
    dateISO: isoOffset(-3).slice(0, 10),
    tagIds: ['tag-family'],
    archived: false,
    source: 'voice',
    aiReflection: 'Your stress spikes when errands and pickups overlap in late afternoons.',
  },
];

const initialState: NotesState = {
  categories: seedCategories,
  tags: seedTags,
  notes: seedNotes,
  documents: seedDocuments,
  journalEntries: seedJournal,
  dismissedSuggestionIds: [],
};

function reducer(state: NotesState, action: NotesAction): NotesState {
  switch (action.type) {
    case 'SET_NOTE_DRAFT':
      return { ...state, noteDraft: action.payload };
    case 'CLEAR_NOTE_DRAFT':
      return { ...state, noteDraft: undefined };
    case 'SET_DOC_DRAFT':
      return { ...state, docDraft: action.payload };
    case 'CLEAR_DOC_DRAFT':
      return { ...state, docDraft: undefined };
    case 'ADD_NOTE': {
      const next: Note = {
        ...action.payload,
        id: action.id,
        createdAtISO: nowISO(),
        updatedAtISO: nowISO(),
      };
      return { ...state, notes: [next, ...state.notes] };
    }
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((item) => (item.id === action.id ? { ...item, ...action.payload, updatedAtISO: nowISO() } : item)),
      };
    case 'ARCHIVE_NOTE':
      return {
        ...state,
        notes: state.notes.map((item) => (item.id === action.id ? { ...item, archived: action.archived, updatedAtISO: nowISO() } : item)),
      };
    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter((item) => item.id !== action.id) };
    case 'TOGGLE_PIN_NOTE':
      return {
        ...state,
        notes: state.notes.map((item) => (item.id === action.id ? { ...item, pinned: !item.pinned, updatedAtISO: nowISO() } : item)),
      };
    case 'MOVE_NOTE':
      return {
        ...state,
        notes: state.notes.map((item) => (item.id === action.id ? { ...item, categorySlug: action.categorySlug, updatedAtISO: nowISO() } : item)),
      };
    case 'ADD_DOCUMENT': {
      const next: Document = {
        ...action.payload,
        id: action.id,
        createdAtISO: nowISO(),
        updatedAtISO: nowISO(),
      };
      return { ...state, documents: [next, ...state.documents] };
    }
    case 'UPDATE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((item) => (item.id === action.id ? { ...item, ...action.payload, updatedAtISO: nowISO() } : item)),
      };
    case 'ARCHIVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((item) => (item.id === action.id ? { ...item, archived: action.archived, updatedAtISO: nowISO() } : item)),
      };
    case 'DELETE_DOCUMENT':
      return { ...state, documents: state.documents.filter((item) => item.id !== action.id) };
    case 'TOGGLE_PIN_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((item) => (item.id === action.id ? { ...item, pinned: !item.pinned, updatedAtISO: nowISO() } : item)),
      };
    case 'MOVE_DOCUMENT':
      return {
        ...state,
        documents: state.documents.map((item) => (item.id === action.id ? { ...item, categorySlug: action.categorySlug, updatedAtISO: nowISO() } : item)),
      };
    case 'SET_DOC_TAGS':
      return {
        ...state,
        documents: state.documents.map((item) => (item.id === action.id ? { ...item, tagIds: action.tagIds, updatedAtISO: nowISO() } : item)),
      };
    case 'SET_NOTE_TAGS':
      return {
        ...state,
        notes: state.notes.map((item) => (item.id === action.id ? { ...item, tagIds: action.tagIds, updatedAtISO: nowISO() } : item)),
      };
    case 'ADD_JOURNAL': {
      const next: JournalEntry = {
        ...action.payload,
        id: action.id,
      };
      return { ...state, journalEntries: [next, ...state.journalEntries] };
    }
    case 'UPDATE_JOURNAL':
      return {
        ...state,
        journalEntries: state.journalEntries.map((item) => (item.id === action.id ? { ...item, ...action.payload } : item)),
      };
    case 'ARCHIVE_JOURNAL':
      return {
        ...state,
        journalEntries: state.journalEntries.map((item) => (item.id === action.id ? { ...item, archived: action.archived } : item)),
      };
    case 'DELETE_JOURNAL':
      return { ...state, journalEntries: state.journalEntries.filter((item) => item.id !== action.id) };
    case 'DISMISS_SUGGESTION':
      return state.dismissedSuggestionIds.includes(action.id)
        ? state
        : { ...state, dismissedSuggestionIds: [...state.dismissedSuggestionIds, action.id] };
    default:
      return state;
  }
}

function withinDays(dateISO: string, days: number) {
  const d = new Date(dateISO);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - days);
  return d >= threshold;
}

function computeSuggestions(state: NotesState): AiSuggestion[] {
  const list: AiSuggestion[] = [];

  const recentNotes = state.notes.filter((item) => !item.archived && withinDays(item.updatedAtISO, 7));
  if (recentNotes.length >= 3) {
    list.push({
      id: 'sg-weekly-summary',
      title: 'Summarize your recent notes?',
      body: 'Relay can generate a weekly summary and save it to Reference.',
      route: '/notes/voice-summary',
    });
  }

  const oldDocs = state.documents.filter((item) => !item.archived && !withinDays(item.updatedAtISO, 30));
  if (oldDocs.length) {
    list.push({
      id: 'sg-doc-cleanup',
      title: 'Review older documents',
      body: 'Some documents have not been opened in 30+ days. Archive them?',
      route: '/notes/archive',
    });
  }

  const noPinned = state.notes.filter((item) => !item.archived && item.pinned).length === 0;
  if (noPinned) {
    list.push({
      id: 'sg-pin-reference',
      title: 'Pin a key reference note',
      body: 'Pinned notes make repeat lookups faster for everyday tasks.',
      route: '/notes/category/reference',
    });
  }

  if (!list.length) {
    list.push({
      id: 'sg-all-good',
      title: 'Your knowledge base is organized',
      body: 'Relay will surface new suggestions when patterns change.',
      route: '/notes',
    });
  }

  return list.filter((item) => !state.dismissedSuggestionIds.includes(item.id));
}

export type SearchResult = {
  id: string;
  type: 'note' | 'doc' | 'journal' | 'suggestion';
  title: string;
  subtitle: string;
  route: string;
};

type NotesContextValue = {
  state: NotesState;
  suggestions: AiSuggestion[];
  getCategory: (slug: string) => Category | undefined;
  getTag: (tagId: string) => Tag | undefined;
  getNote: (id: string) => Note | undefined;
  getDocument: (id: string) => Document | undefined;
  getJournalEntry: (id: string) => JournalEntry | undefined;
  setNoteDraft: (draft: NoteDraft) => void;
  clearNoteDraft: () => void;
  setDocDraft: (draft: DocDraft) => void;
  clearDocDraft: () => void;
  addNote: (payload: Omit<Note, 'id' | 'createdAtISO' | 'updatedAtISO'>) => string;
  updateNote: (id: string, payload: Partial<Note>) => void;
  archiveNote: (id: string, archived: boolean) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  moveNote: (id: string, categorySlug: string) => void;
  addDocument: (payload: Omit<Document, 'id' | 'createdAtISO' | 'updatedAtISO'>) => string;
  updateDocument: (id: string, payload: Partial<Document>) => void;
  archiveDocument: (id: string, archived: boolean) => void;
  deleteDocument: (id: string) => void;
  togglePinDocument: (id: string) => void;
  moveDocument: (id: string, categorySlug: string) => void;
  setDocTags: (id: string, tagIds: string[]) => void;
  setNoteTags: (id: string, tagIds: string[]) => void;
  addJournalEntry: (payload: Omit<JournalEntry, 'id'>) => string;
  updateJournalEntry: (id: string, payload: Partial<JournalEntry>) => void;
  archiveJournalEntry: (id: string, archived: boolean) => void;
  deleteJournalEntry: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  search: (query: string, filter: NotesFilter) => SearchResult[];
};

const NotesContext = createContext<NotesContextValue | null>(null);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const applyPendingAction = (action: PendingVoiceAction) => {
      if (action.type === 'delete_note') {
        const query =
          typeof action.payload.query === 'string' ? action.payload.query.toLowerCase().trim() : '';
        if (!query) return;
        const note = state.notes.find((item) =>
          !item.archived && item.title.toLowerCase().includes(query)
        );
        if (!note) return;
        dispatch({ type: 'DELETE_NOTE', id: note.id });
        return;
      }

      if (action.type !== 'create_note' && action.type !== 'save_summary_as_note') return;

      const title =
        typeof action.payload.title === 'string' && action.payload.title.trim()
          ? action.payload.title.trim()
          : 'Voice note';
      const body =
        typeof action.payload.body === 'string' && action.payload.body.trim()
          ? action.payload.body.trim()
          : 'Captured by Relay voice.';

      dispatch({
        type: 'ADD_NOTE',
        id: idGen('note'),
        payload: {
          title,
          body,
          categorySlug: 'personal',
          tagIds: [],
          checklist: [],
          pinned: false,
          archived: false,
          source: 'voice',
          shared: false,
          addedBy: 'Relay',
          aiSummary: 'Voice-captured note pending manual review.',
          relatedNoteIds: [],
        },
      });
    };

    consumePendingVoiceActions('notes').forEach(applyPendingAction);
    return subscribePendingVoiceActions('notes', applyPendingAction);
  }, [state.notes]);

  useEffect(() => {
    const notesCount = state.notes.filter((note) => !note.archived).length;
    const docsCount = state.documents.filter((doc) => !doc.archived).length;
    const journalCount = state.journalEntries.filter((entry) => !entry.archived).length;
    const pinnedCount =
      state.notes.filter((note) => note.pinned && !note.archived).length +
      state.documents.filter((doc) => doc.pinned && !doc.archived).length;
    const mostUsedTag = [...state.tags].sort((a, b) => b.usageCount - a.usageCount)[0]?.label ?? '';

    emitAIMemoryEvent({
      source: 'notes',
      kind: 'snapshot',
      payload: {
        notesCount,
        docsCount,
        journalCount,
        pinnedCount,
        topTag: mostUsedTag,
        voiceEntries:
          state.notes.filter((note) => note.source === 'voice' || note.source === 'mixed').length +
          state.journalEntries.filter((entry) => entry.source === 'voice').length,
      },
    });
  }, [state.documents, state.journalEntries, state.notes, state.tags]);

  const value = useMemo<NotesContextValue>(() => {
    return {
      state,
      suggestions: computeSuggestions(state),
      getCategory: (slug) => state.categories.find((item) => item.slug === slug),
      getTag: (tagId) => state.tags.find((item) => item.id === tagId),
      getNote: (id) => state.notes.find((item) => item.id === id),
      getDocument: (id) => state.documents.find((item) => item.id === id),
      getJournalEntry: (id) => state.journalEntries.find((item) => item.id === id),
      setNoteDraft: (draft) => dispatch({ type: 'SET_NOTE_DRAFT', payload: draft }),
      clearNoteDraft: () => dispatch({ type: 'CLEAR_NOTE_DRAFT' }),
      setDocDraft: (draft) => dispatch({ type: 'SET_DOC_DRAFT', payload: draft }),
      clearDocDraft: () => dispatch({ type: 'CLEAR_DOC_DRAFT' }),
      addNote: (payload) => {
        const id = idGen('note');
        dispatch({ type: 'ADD_NOTE', id, payload });
        return id;
      },
      updateNote: (id, payload) => dispatch({ type: 'UPDATE_NOTE', id, payload }),
      archiveNote: (id, archived) => dispatch({ type: 'ARCHIVE_NOTE', id, archived }),
      deleteNote: (id) => dispatch({ type: 'DELETE_NOTE', id }),
      togglePinNote: (id) => dispatch({ type: 'TOGGLE_PIN_NOTE', id }),
      moveNote: (id, categorySlug) => dispatch({ type: 'MOVE_NOTE', id, categorySlug }),
      addDocument: (payload) => {
        const id = idGen('doc');
        dispatch({ type: 'ADD_DOCUMENT', id, payload });
        return id;
      },
      updateDocument: (id, payload) => dispatch({ type: 'UPDATE_DOCUMENT', id, payload }),
      archiveDocument: (id, archived) => dispatch({ type: 'ARCHIVE_DOCUMENT', id, archived }),
      deleteDocument: (id) => dispatch({ type: 'DELETE_DOCUMENT', id }),
      togglePinDocument: (id) => dispatch({ type: 'TOGGLE_PIN_DOCUMENT', id }),
      moveDocument: (id, categorySlug) => dispatch({ type: 'MOVE_DOCUMENT', id, categorySlug }),
      setDocTags: (id, tagIds) => dispatch({ type: 'SET_DOC_TAGS', id, tagIds }),
      setNoteTags: (id, tagIds) => dispatch({ type: 'SET_NOTE_TAGS', id, tagIds }),
      addJournalEntry: (payload) => {
        const id = idGen('jr');
        dispatch({ type: 'ADD_JOURNAL', id, payload });
        return id;
      },
      updateJournalEntry: (id, payload) => dispatch({ type: 'UPDATE_JOURNAL', id, payload }),
      archiveJournalEntry: (id, archived) => dispatch({ type: 'ARCHIVE_JOURNAL', id, archived }),
      deleteJournalEntry: (id) => dispatch({ type: 'DELETE_JOURNAL', id }),
      dismissSuggestion: (id) => dispatch({ type: 'DISMISS_SUGGESTION', id }),
      search: (query, filter) => {
        const q = query.trim().toLowerCase();

        const notes = state.notes
          .filter((item) => !item.archived)
          .filter((item) => (filter.categorySlug ? item.categorySlug === filter.categorySlug : true))
          .filter((item) => {
            if (filter.time === '7d') return withinDays(item.updatedAtISO, 7);
            if (filter.time === '30d') return withinDays(item.updatedAtISO, 30);
            return true;
          })
          .filter((item) => (filter.tagId ? item.tagIds.includes(filter.tagId) : true))
          .filter((item) => (q ? item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q) : true))
          .map<SearchResult>((item) => ({
            id: item.id,
            type: 'note',
            title: item.title,
            subtitle: item.aiSummary,
            route: `/notes/note/${item.id}`,
          }));

        const docs = state.documents
          .filter((item) => !item.archived)
          .filter((item) => (filter.categorySlug ? item.categorySlug === filter.categorySlug : true))
          .filter((item) => {
            if (filter.time === '7d') return withinDays(item.updatedAtISO, 7);
            if (filter.time === '30d') return withinDays(item.updatedAtISO, 30);
            return true;
          })
          .filter((item) => (filter.tagId ? item.tagIds.includes(filter.tagId) : true))
          .filter((item) => (q ? item.name.toLowerCase().includes(q) || (item.extractedText || '').toLowerCase().includes(q) : true))
          .map<SearchResult>((item) => ({
            id: item.id,
            type: 'doc',
            title: item.name,
            subtitle: item.aiSummary,
            route: `/notes/doc/${item.id}`,
          }));

        const journals = state.journalEntries
          .filter((item) => !item.archived)
          .filter((item) => {
            if (filter.time === '7d') return withinDays(item.dateISO, 7);
            if (filter.time === '30d') return withinDays(item.dateISO, 30);
            return true;
          })
          .filter((item) => (filter.tagId ? item.tagIds.includes(filter.tagId) : true))
          .filter((item) => (q ? item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q) : true))
          .map<SearchResult>((item) => ({
            id: item.id,
            type: 'journal',
            title: item.title,
            subtitle: item.aiReflection,
            route: `/notes/journal/entry/${item.id}`,
          }));

        const suggestions = q
          ? [
              {
                id: 's-find-tax',
                type: 'suggestion' as const,
                title: `Try “Find ${query} in receipts”`,
                subtitle: 'Relay can narrow by category and time.',
                route: '/notes/search?type=doc&category=receipts',
              },
            ]
          : [];

        const merged = [...notes, ...docs, ...journals, ...suggestions];

        if (filter.type === 'note') return merged.filter((item) => item.type === 'note');
        if (filter.type === 'doc') return merged.filter((item) => item.type === 'doc');
        if (filter.type === 'journal') return merged.filter((item) => item.type === 'journal');
        return merged;
      },
    };
  }, [state]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotesStore() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotesStore must be used within NotesProvider');
  return ctx;
}

export function formatDateTimeLabel(dateISO: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(dateISO));
}
