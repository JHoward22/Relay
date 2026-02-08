import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { emitAIMemoryEvent } from '@/store/ai-memory-events';
import {
  consumePendingVoiceActions,
  PendingVoiceAction,
  subscribePendingVoiceActions,
} from '@/store/voice-router/pending-actions';

export type MealSlotType = 'breakfast' | 'lunch' | 'dinner';
export type DietTag = 'balanced' | 'high-protein' | 'vegetarian' | 'quick';
export type BudgetLevel = 'low' | 'medium' | 'flex';

export type RecipeSource = {
  id: string;
  type: 'manual' | 'link' | 'voice' | 'photo';
  originLabel: string;
  originUrl?: string;
  importedAt: string;
};

export type Recipe = {
  id: string;
  title: string;
  imageUri?: string;
  sourceId: string;
  sourceLabel: string;
  sourceUrl?: string;
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  tags: string[];
  ingredients: { id: string; name: string; quantity: string; group: GroceryGroup }[];
  steps: string[];
  notes?: string;
  isFavorite: boolean;
  collections: string[];
  createdAt: string;
  updatedAt: string;
};

export type MealSlot = {
  id: string;
  dayISO: string;
  slotType: MealSlotType;
  recipeId?: string;
  customMealTitle?: string;
  servings: number;
  assignedMemberId?: string;
  status: 'planned' | 'done' | 'skipped';
};

export type MealPlanDay = {
  id: string;
  dateISO: string;
  prepNotes?: string;
  slotIds: string[];
};

export type MealPlanWeek = {
  id: string;
  weekStartISO: string;
  dayIds: string[];
  generatedByAI: boolean;
  preferencesSnapshot?: PlanPreferences;
};

export type GroceryGroup = 'Produce' | 'Meat' | 'Dairy' | 'Pantry' | 'Frozen' | 'Other';

export type GroceryItem = {
  id: string;
  listId: string;
  name: string;
  quantity: string;
  unit?: string;
  group: GroceryGroup;
  checked: boolean;
  fromRecipeIds: string[];
  notes?: string;
  store?: string;
};

export type GroceryList = {
  id: string;
  weekId?: string;
  name: string;
  shared: boolean;
  itemIds: string[];
  lastOptimizedAt?: string;
};

export type PantryItem = {
  id: string;
  name: string;
  quantity: string;
  unit?: string;
  lowStock: boolean;
  staple: boolean;
};

export type PlanPreferences = {
  mealsPerDay: number;
  daysToPlan: number;
  dietPreference: DietTag;
  budgetLevel: BudgetLevel;
  maxCookMinutes: number;
  familySize: number;
};

export type ImportDraft = {
  url: string;
  title: string;
  source: string;
  thumbnail?: string;
  suggestedTags: string[];
  ingredients: { name: string; quantity: string; group: GroceryGroup }[];
  steps: string[];
};

type MealsState = {
  recipes: Recipe[];
  recipeSources: RecipeSource[];
  weekPlan: MealPlanWeek;
  days: MealPlanDay[];
  slots: MealSlot[];
  groceryList: GroceryList;
  groceryItems: GroceryItem[];
  pantryItems: PantryItem[];
  collections: string[];
  recentImports: ImportDraft[];
  generatedDraft?: {
    week: MealPlanWeek;
    days: MealPlanDay[];
    slots: MealSlot[];
    preferences: PlanPreferences;
  };
};

type MealsAction =
  | { type: 'CREATE_RECIPE'; payload: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_RECIPE'; id: string; payload: Partial<Recipe> }
  | { type: 'DELETE_RECIPE'; id: string }
  | { type: 'TOGGLE_RECIPE_FAVORITE'; id: string }
  | { type: 'ADD_RECIPE_TO_SLOT'; payload: { dayISO: string; slotType: MealSlotType; recipeId?: string; customMealTitle?: string; servings?: number; assignedMemberId?: string } }
  | { type: 'SET_DAY_NOTES'; payload: { dayISO: string; notes: string } }
  | { type: 'REMOVE_SLOT'; slotId: string }
  | { type: 'ADD_RECIPE_INGREDIENTS_TO_GROCERY'; recipeIds: string[] }
  | { type: 'ADD_GROCERY_ITEM'; payload: Omit<GroceryItem, 'id' | 'listId' | 'fromRecipeIds' | 'checked'> }
  | { type: 'UPDATE_GROCERY_ITEM'; id: string; payload: Partial<GroceryItem> }
  | { type: 'TOGGLE_GROCERY_ITEM'; id: string }
  | { type: 'DELETE_GROCERY_ITEM'; id: string }
  | { type: 'OPTIMIZE_GROCERY' }
  | { type: 'ADD_PANTRY_ITEM'; payload: Omit<PantryItem, 'id' | 'staple'> }
  | { type: 'UPDATE_PANTRY_ITEM'; id: string; payload: Partial<PantryItem> }
  | { type: 'DELETE_PANTRY_ITEM'; id: string }
  | { type: 'SET_IMPORT_DRAFT'; payload: ImportDraft }
  | { type: 'SAVE_IMPORT_TO_RECIPES'; payload: { draft: ImportDraft; title?: string; tags?: string[] } }
  | { type: 'GENERATE_PLAN_DRAFT'; payload: PlanPreferences }
  | { type: 'ACCEPT_PLAN_DRAFT' }
  | { type: 'CLEAR_PLAN_DRAFT' };

const id = (() => {
  let c = 1000;
  return (prefix: string) => {
    c += 1;
    return `${prefix}-${c}`;
  };
})();

function nowISO() {
  return new Date().toISOString();
}

function startOfWeekISO(base = new Date()) {
  const d = new Date(base);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function addDaysISO(dayISO: string, days: number) {
  const d = new Date(`${dayISO}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function toDayLabel(dayISO: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${dayISO}T00:00:00`));
}

function inferGroup(name: string): GroceryGroup {
  const s = name.toLowerCase();
  if (s.includes('milk') || s.includes('cheese') || s.includes('yogurt')) return 'Dairy';
  if (s.includes('chicken') || s.includes('beef') || s.includes('fish')) return 'Meat';
  if (s.includes('spinach') || s.includes('onion') || s.includes('tomato') || s.includes('lettuce')) return 'Produce';
  if (s.includes('frozen')) return 'Frozen';
  if (s.includes('rice') || s.includes('oil') || s.includes('salt') || s.includes('pasta')) return 'Pantry';
  return 'Other';
}

const seedWeekStart = startOfWeekISO();
const seedDays: MealPlanDay[] = Array.from({ length: 7 }).map((_, index) => {
  const dateISO = addDaysISO(seedWeekStart, index);
  return {
    id: `md-${index + 1}`,
    dateISO,
    prepNotes: index === 6 ? 'Sunday prep: chop veggies and marinate chicken.' : '',
    slotIds: [],
  };
});

const seedSources: RecipeSource[] = [
  {
    id: 'src-1',
    type: 'manual',
    originLabel: 'Relay kitchen favorites',
    importedAt: nowISO(),
  },
  {
    id: 'src-2',
    type: 'link',
    originLabel: 'Tasty social reel',
    originUrl: 'https://example.com/recipes/one-pan-lemon-chicken',
    importedAt: nowISO(),
  },
];

const seedRecipes: Recipe[] = [
  {
    id: 'r-1',
    title: 'One-Pan Lemon Chicken',
    imageUri: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=800',
    sourceId: 'src-2',
    sourceLabel: 'Imported link',
    sourceUrl: 'https://example.com/recipes/one-pan-lemon-chicken',
    prepMinutes: 15,
    cookMinutes: 30,
    servings: 4,
    tags: ['quick', 'balanced'],
    ingredients: [
      { id: 'ing-1', name: 'Chicken thighs', quantity: '1.5 lb', group: 'Meat' },
      { id: 'ing-2', name: 'Lemon', quantity: '2', group: 'Produce' },
      { id: 'ing-3', name: 'Olive oil', quantity: '2 tbsp', group: 'Pantry' },
      { id: 'ing-4', name: 'Baby potatoes', quantity: '1 lb', group: 'Produce' },
    ],
    steps: ['Preheat oven to 400F.', 'Season chicken and potatoes.', 'Bake 30 minutes, finish with lemon juice.'],
    notes: 'Great with green beans.',
    isFavorite: true,
    collections: ['Favorites', 'Quick meals'],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 'r-2',
    title: 'Turkey Taco Bowls',
    imageUri: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800',
    sourceId: 'src-1',
    sourceLabel: 'Manual',
    prepMinutes: 20,
    cookMinutes: 20,
    servings: 4,
    tags: ['high-protein', 'quick'],
    ingredients: [
      { id: 'ing-5', name: 'Ground turkey', quantity: '1 lb', group: 'Meat' },
      { id: 'ing-6', name: 'Rice', quantity: '2 cups', group: 'Pantry' },
      { id: 'ing-7', name: 'Black beans', quantity: '1 can', group: 'Pantry' },
      { id: 'ing-8', name: 'Lettuce', quantity: '1 head', group: 'Produce' },
    ],
    steps: ['Cook rice.', 'Brown turkey with taco seasoning.', 'Assemble bowls with toppings.'],
    notes: 'Use cauliflower rice for lighter version.',
    isFavorite: false,
    collections: ['Meal prep'],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 'r-3',
    title: 'Veggie Pasta Night',
    imageUri: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800',
    sourceId: 'src-1',
    sourceLabel: 'Manual',
    prepMinutes: 15,
    cookMinutes: 25,
    servings: 4,
    tags: ['vegetarian', 'balanced'],
    ingredients: [
      { id: 'ing-9', name: 'Pasta', quantity: '12 oz', group: 'Pantry' },
      { id: 'ing-10', name: 'Tomatoes', quantity: '2 cups', group: 'Produce' },
      { id: 'ing-11', name: 'Spinach', quantity: '3 cups', group: 'Produce' },
      { id: 'ing-12', name: 'Parmesan', quantity: '1/3 cup', group: 'Dairy' },
    ],
    steps: ['Boil pasta.', 'Saute vegetables.', 'Toss together and finish with parmesan.'],
    isFavorite: false,
    collections: ['Quick meals'],
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
];

const seedSlots: MealSlot[] = [
  { id: 'slot-1', dayISO: addDaysISO(seedWeekStart, 0), slotType: 'dinner', recipeId: 'r-1', servings: 4, status: 'planned' },
  { id: 'slot-2', dayISO: addDaysISO(seedWeekStart, 2), slotType: 'dinner', recipeId: 'r-2', servings: 4, status: 'planned' },
  { id: 'slot-3', dayISO: addDaysISO(seedWeekStart, 4), slotType: 'dinner', recipeId: 'r-3', servings: 4, status: 'planned' },
];

seedDays.forEach((day) => {
  day.slotIds = seedSlots.filter((slot) => slot.dayISO === day.dateISO).map((slot) => slot.id);
});

const initialState: MealsState = {
  recipes: seedRecipes,
  recipeSources: seedSources,
  weekPlan: {
    id: 'week-1',
    weekStartISO: seedWeekStart,
    dayIds: seedDays.map((d) => d.id),
    generatedByAI: false,
  },
  days: seedDays,
  slots: seedSlots,
  groceryList: {
    id: 'grocery-1',
    weekId: 'week-1',
    name: 'Week groceries',
    shared: false,
    itemIds: ['gi-1', 'gi-2', 'gi-3'],
  },
  groceryItems: [
    { id: 'gi-1', listId: 'grocery-1', name: 'Chicken thighs', quantity: '1.5', unit: 'lb', group: 'Meat', checked: false, fromRecipeIds: ['r-1'] },
    { id: 'gi-2', listId: 'grocery-1', name: 'Lemons', quantity: '2', group: 'Produce', checked: false, fromRecipeIds: ['r-1'] },
    { id: 'gi-3', listId: 'grocery-1', name: 'Black beans', quantity: '1', unit: 'can', group: 'Pantry', checked: false, fromRecipeIds: ['r-2'] },
  ],
  pantryItems: [
    { id: 'p-1', name: 'Olive oil', quantity: '1', unit: 'bottle', lowStock: false, staple: true },
    { id: 'p-2', name: 'Rice', quantity: '2', unit: 'lb', lowStock: false, staple: true },
    { id: 'p-3', name: 'Salt', quantity: '1', unit: 'jar', lowStock: false, staple: true },
  ],
  collections: ['Favorites', 'Quick meals', 'Meal prep'],
  recentImports: [
    {
      url: 'https://social.example.com/reel/99871',
      title: 'Creamy Pesto Chicken Pasta',
      source: 'social.example.com',
      thumbnail: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800',
      suggestedTags: ['quick', 'balanced'],
      ingredients: [
        { name: 'Chicken breast', quantity: '1 lb', group: 'Meat' },
        { name: 'Pesto', quantity: '1/2 cup', group: 'Pantry' },
        { name: 'Heavy cream', quantity: '1 cup', group: 'Dairy' },
      ],
      steps: ['Cook pasta.', 'Saute chicken.', 'Add pesto + cream and combine.'],
    },
  ],
};

function upsertDayWithSlot(days: MealPlanDay[], dayISO: string, slotId: string) {
  let found = false;
  const next = days.map((day) => {
    if (day.dateISO !== dayISO) return day;
    found = true;
    const slotIds = day.slotIds.includes(slotId) ? day.slotIds : [...day.slotIds, slotId];
    return { ...day, slotIds };
  });

  if (found) return next;

  return [
    ...next,
    {
      id: id('md'),
      dateISO: dayISO,
      prepNotes: '',
      slotIds: [slotId],
    },
  ];
}

function reducer(state: MealsState, action: MealsAction): MealsState {
  switch (action.type) {
    case 'CREATE_RECIPE': {
      const recipe: Recipe = {
        ...action.payload,
        id: id('r'),
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      return {
        ...state,
        recipes: [recipe, ...state.recipes],
      };
    }
    case 'UPDATE_RECIPE': {
      return {
        ...state,
        recipes: state.recipes.map((recipe) =>
          recipe.id === action.id ? { ...recipe, ...action.payload, updatedAt: nowISO() } : recipe
        ),
      };
    }
    case 'DELETE_RECIPE': {
      const recipes = state.recipes.filter((recipe) => recipe.id !== action.id);
      const slots = state.slots.map((slot) => (slot.recipeId === action.id ? { ...slot, recipeId: undefined } : slot));
      const groceryItems = state.groceryItems.filter((item) => !item.fromRecipeIds.includes(action.id));
      return {
        ...state,
        recipes,
        slots,
        groceryItems,
        groceryList: {
          ...state.groceryList,
          itemIds: groceryItems.map((item) => item.id),
        },
      };
    }
    case 'TOGGLE_RECIPE_FAVORITE': {
      return {
        ...state,
        recipes: state.recipes.map((recipe) =>
          recipe.id === action.id
            ? {
                ...recipe,
                isFavorite: !recipe.isFavorite,
                collections: recipe.isFavorite
                  ? recipe.collections.filter((collection) => collection !== 'Favorites')
                  : [...new Set([...recipe.collections, 'Favorites'])],
                updatedAt: nowISO(),
              }
            : recipe
        ),
      };
    }
    case 'ADD_RECIPE_TO_SLOT': {
      const existing = state.slots.find(
        (slot) => slot.dayISO === action.payload.dayISO && slot.slotType === action.payload.slotType
      );
      const nextSlot: MealSlot = existing
        ? {
            ...existing,
            recipeId: action.payload.recipeId,
            customMealTitle: action.payload.customMealTitle,
            servings: action.payload.servings ?? existing.servings,
            assignedMemberId: action.payload.assignedMemberId,
            status: 'planned',
          }
        : {
            id: id('slot'),
            dayISO: action.payload.dayISO,
            slotType: action.payload.slotType,
            recipeId: action.payload.recipeId,
            customMealTitle: action.payload.customMealTitle,
            servings: action.payload.servings ?? 2,
            assignedMemberId: action.payload.assignedMemberId,
            status: 'planned',
          };

      const slots = existing
        ? state.slots.map((slot) => (slot.id === existing.id ? nextSlot : slot))
        : [nextSlot, ...state.slots];

      const days = upsertDayWithSlot(state.days, action.payload.dayISO, nextSlot.id);

      return {
        ...state,
        slots,
        days,
      };
    }
    case 'SET_DAY_NOTES': {
      return {
        ...state,
        days: state.days.map((day) =>
          day.dateISO === action.payload.dayISO ? { ...day, prepNotes: action.payload.notes } : day
        ),
      };
    }
    case 'REMOVE_SLOT': {
      return {
        ...state,
        slots: state.slots.filter((slot) => slot.id !== action.slotId),
        days: state.days.map((day) => ({
          ...day,
          slotIds: day.slotIds.filter((slotId) => slotId !== action.slotId),
        })),
      };
    }
    case 'ADD_RECIPE_INGREDIENTS_TO_GROCERY': {
      const selected = state.recipes.filter((recipe) => action.recipeIds.includes(recipe.id));
      const pantryNames = new Set(state.pantryItems.map((item) => item.name.toLowerCase()));

      const additions = selected.flatMap((recipe) =>
        recipe.ingredients
          .filter((ing) => !pantryNames.has(ing.name.toLowerCase()))
          .map((ing) => {
            const existing = state.groceryItems.find((item) => item.name.toLowerCase() === ing.name.toLowerCase());
            if (existing) return null;

            return {
              id: id('gi'),
              listId: state.groceryList.id,
              name: ing.name,
              quantity: ing.quantity,
              group: ing.group,
              checked: false,
              fromRecipeIds: [recipe.id],
            } satisfies GroceryItem;
          })
          .filter(Boolean) as GroceryItem[]
      );

      const groceryItems = [...state.groceryItems, ...additions];

      return {
        ...state,
        groceryItems,
        groceryList: {
          ...state.groceryList,
          itemIds: groceryItems.map((item) => item.id),
        },
      };
    }
    case 'ADD_GROCERY_ITEM': {
      const item: GroceryItem = {
        id: id('gi'),
        listId: state.groceryList.id,
        name: action.payload.name,
        quantity: action.payload.quantity,
        unit: action.payload.unit,
        group: action.payload.group,
        checked: false,
        fromRecipeIds: [],
        notes: action.payload.notes,
        store: action.payload.store,
      };
      const groceryItems = [item, ...state.groceryItems];
      return {
        ...state,
        groceryItems,
        groceryList: {
          ...state.groceryList,
          itemIds: groceryItems.map((entry) => entry.id),
        },
      };
    }
    case 'UPDATE_GROCERY_ITEM': {
      return {
        ...state,
        groceryItems: state.groceryItems.map((item) =>
          item.id === action.id ? { ...item, ...action.payload } : item
        ),
      };
    }
    case 'TOGGLE_GROCERY_ITEM': {
      return {
        ...state,
        groceryItems: state.groceryItems.map((item) =>
          item.id === action.id ? { ...item, checked: !item.checked } : item
        ),
      };
    }
    case 'DELETE_GROCERY_ITEM': {
      const groceryItems = state.groceryItems.filter((item) => item.id !== action.id);
      return {
        ...state,
        groceryItems,
        groceryList: {
          ...state.groceryList,
          itemIds: groceryItems.map((item) => item.id),
        },
      };
    }
    case 'OPTIMIZE_GROCERY': {
      const deduped: GroceryItem[] = [];
      for (const item of state.groceryItems) {
        const existing = deduped.find(
          (entry) => entry.name.toLowerCase() === item.name.toLowerCase() && entry.group === item.group
        );
        if (!existing) {
          deduped.push(item);
          continue;
        }
        if (!existing.notes && item.notes) {
          existing.notes = item.notes;
        }
      }
      return {
        ...state,
        groceryItems: deduped,
        groceryList: {
          ...state.groceryList,
          itemIds: deduped.map((item) => item.id),
          lastOptimizedAt: nowISO(),
        },
      };
    }
    case 'ADD_PANTRY_ITEM': {
      const item: PantryItem = {
        id: id('p'),
        ...action.payload,
        staple: true,
      };
      return {
        ...state,
        pantryItems: [item, ...state.pantryItems],
      };
    }
    case 'UPDATE_PANTRY_ITEM': {
      return {
        ...state,
        pantryItems: state.pantryItems.map((item) =>
          item.id === action.id ? { ...item, ...action.payload } : item
        ),
      };
    }
    case 'DELETE_PANTRY_ITEM': {
      return {
        ...state,
        pantryItems: state.pantryItems.filter((item) => item.id !== action.id),
      };
    }
    case 'SET_IMPORT_DRAFT': {
      return {
        ...state,
        recentImports: [action.payload, ...state.recentImports.filter((entry) => entry.url !== action.payload.url)].slice(0, 6),
      };
    }
    case 'SAVE_IMPORT_TO_RECIPES': {
      const source: RecipeSource = {
        id: id('src'),
        type: 'link',
        originLabel: action.payload.draft.source,
        originUrl: action.payload.draft.url,
        importedAt: nowISO(),
      };

      const recipe: Recipe = {
        id: id('r'),
        title: action.payload.title || action.payload.draft.title,
        imageUri: action.payload.draft.thumbnail,
        sourceId: source.id,
        sourceLabel: action.payload.draft.source,
        sourceUrl: action.payload.draft.url,
        prepMinutes: 15,
        cookMinutes: 25,
        servings: 4,
        tags: action.payload.tags || action.payload.draft.suggestedTags,
        ingredients: action.payload.draft.ingredients.map((ing) => ({
          id: id('ing'),
          name: ing.name,
          quantity: ing.quantity,
          group: ing.group,
        })),
        steps: action.payload.draft.steps,
        isFavorite: false,
        collections: ['Quick meals'],
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };

      return {
        ...state,
        recipeSources: [source, ...state.recipeSources],
        recipes: [recipe, ...state.recipes],
      };
    }
    case 'GENERATE_PLAN_DRAFT': {
      const days = Array.from({ length: action.payload.daysToPlan }).map((_, index) => {
        const dateISO = addDaysISO(state.weekPlan.weekStartISO, index);
        return {
          id: id('md'),
          dateISO,
          prepNotes: '',
          slotIds: [] as string[],
        } satisfies MealPlanDay;
      });

      const pickRecipes = state.recipes
        .filter((recipe) =>
          action.payload.dietPreference === 'balanced'
            ? true
            : recipe.tags.includes(action.payload.dietPreference)
        )
        .slice(0, Math.max(4, action.payload.daysToPlan));

      const slots: MealSlot[] = [];

      days.forEach((day, dayIndex) => {
        (['breakfast', 'lunch', 'dinner'] as MealSlotType[])
          .slice(0, action.payload.mealsPerDay)
          .forEach((slotType, slotIndex) => {
            const recipe = pickRecipes[(dayIndex + slotIndex) % pickRecipes.length] || state.recipes[(dayIndex + slotIndex) % state.recipes.length];
            const slot: MealSlot = {
              id: id('slot'),
              dayISO: day.dateISO,
              slotType,
              recipeId: recipe?.id,
              servings: Math.max(1, action.payload.familySize),
              status: 'planned',
            };
            slots.push(slot);
            day.slotIds.push(slot.id);
          });
      });

      return {
        ...state,
        generatedDraft: {
          week: {
            id: id('week'),
            weekStartISO: state.weekPlan.weekStartISO,
            dayIds: days.map((day) => day.id),
            generatedByAI: true,
            preferencesSnapshot: action.payload,
          },
          days,
          slots,
          preferences: action.payload,
        },
      };
    }
    case 'ACCEPT_PLAN_DRAFT': {
      if (!state.generatedDraft) return state;
      return {
        ...state,
        weekPlan: state.generatedDraft.week,
        days: state.generatedDraft.days,
        slots: state.generatedDraft.slots,
        generatedDraft: undefined,
      };
    }
    case 'CLEAR_PLAN_DRAFT': {
      return {
        ...state,
        generatedDraft: undefined,
      };
    }
    default:
      return state;
  }
}

type MealsStore = {
  state: MealsState;
  createRecipe: (payload: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecipe: (id: string, payload: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  toggleRecipeFavorite: (id: string) => void;
  addRecipeToSlot: (payload: { dayISO: string; slotType: MealSlotType; recipeId?: string; customMealTitle?: string; servings?: number; assignedMemberId?: string }) => void;
  setDayNotes: (payload: { dayISO: string; notes: string }) => void;
  removeSlot: (slotId: string) => void;
  addRecipeIngredientsToGrocery: (recipeIds: string[]) => void;
  addGroceryItem: (payload: Omit<GroceryItem, 'id' | 'listId' | 'fromRecipeIds' | 'checked'>) => void;
  updateGroceryItem: (id: string, payload: Partial<GroceryItem>) => void;
  toggleGroceryItem: (id: string) => void;
  deleteGroceryItem: (id: string) => void;
  optimizeGrocery: () => void;
  addPantryItem: (payload: Omit<PantryItem, 'id' | 'staple'>) => void;
  updatePantryItem: (id: string, payload: Partial<PantryItem>) => void;
  deletePantryItem: (id: string) => void;
  setImportDraft: (payload: ImportDraft) => void;
  saveImportToRecipes: (payload: { draft: ImportDraft; title?: string; tags?: string[] }) => void;
  generatePlanDraft: (payload: PlanPreferences) => void;
  acceptPlanDraft: () => void;
  clearPlanDraft: () => void;
};

const MealsContext = createContext<MealsStore | null>(null);

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const applyPendingAction = (action: PendingVoiceAction) => {
      if (action.type === 'plan_meal') {
        const dayISO =
          typeof action.payload.dayISO === 'string'
            ? action.payload.dayISO
            : new Date().toISOString().slice(0, 10);
        const rawSlot = typeof action.payload.slotType === 'string' ? action.payload.slotType : 'dinner';
        const slotType: MealSlotType = rawSlot === 'breakfast' || rawSlot === 'lunch' ? rawSlot : 'dinner';
        const title = typeof action.payload.title === 'string' ? action.payload.title : 'Voice meal';
        dispatch({
          type: 'ADD_RECIPE_TO_SLOT',
          payload: {
            dayISO,
            slotType,
            customMealTitle: title,
            servings: 2,
          },
        });
        return;
      }

      if (action.type === 'add_grocery_item') {
        const name = typeof action.payload.name === 'string' ? action.payload.name : 'Grocery item';
        const quantity = typeof action.payload.quantity === 'string' ? action.payload.quantity : '1';
        dispatch({
          type: 'ADD_GROCERY_ITEM',
          payload: {
            name,
            quantity,
            group: fallbackGroupForInput(name),
          },
        });
        return;
      }

      if (action.type === 'import_recipe_link') {
        const url = typeof action.payload.url === 'string' ? action.payload.url : '';
        if (!url) return;
        dispatch({
          type: 'SET_IMPORT_DRAFT',
          payload: defaultImportDraft(url),
        });
      }
    };

    consumePendingVoiceActions('meals').forEach(applyPendingAction);
    return subscribePendingVoiceActions('meals', applyPendingAction);
  }, []);

  useEffect(() => {
    const groceryCounts = state.groceryItems.reduce<Record<string, number>>((acc, item) => {
      const key = item.name.toLowerCase().trim();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const groceryRepeats = Object.entries(groceryCounts)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    emitAIMemoryEvent({
      source: 'meals',
      kind: 'snapshot',
      payload: {
        recipesCount: state.recipes.length,
        plannedSlots: state.slots.length,
        completedSlots: state.slots.filter((slot) => slot.status === 'done').length,
        groceryItems: state.groceryItems.length,
        repeatedGroceryCount: groceryRepeats.length,
        groceryRepeats: groceryRepeats.slice(0, 12),
        pantryLowStock: state.pantryItems.filter((item) => item.lowStock).length,
      },
    });
  }, [state.groceryItems, state.pantryItems, state.recipes.length, state.slots]);

  const value = useMemo<MealsStore>(
    () => ({
      state,
      createRecipe: (payload) => dispatch({ type: 'CREATE_RECIPE', payload }),
      updateRecipe: (id, payload) => dispatch({ type: 'UPDATE_RECIPE', id, payload }),
      deleteRecipe: (id) => dispatch({ type: 'DELETE_RECIPE', id }),
      toggleRecipeFavorite: (id) => dispatch({ type: 'TOGGLE_RECIPE_FAVORITE', id }),
      addRecipeToSlot: (payload) => dispatch({ type: 'ADD_RECIPE_TO_SLOT', payload }),
      setDayNotes: (payload) => dispatch({ type: 'SET_DAY_NOTES', payload }),
      removeSlot: (slotId) => dispatch({ type: 'REMOVE_SLOT', slotId }),
      addRecipeIngredientsToGrocery: (recipeIds) => dispatch({ type: 'ADD_RECIPE_INGREDIENTS_TO_GROCERY', recipeIds }),
      addGroceryItem: (payload) => dispatch({ type: 'ADD_GROCERY_ITEM', payload }),
      updateGroceryItem: (id, payload) => dispatch({ type: 'UPDATE_GROCERY_ITEM', id, payload }),
      toggleGroceryItem: (id) => dispatch({ type: 'TOGGLE_GROCERY_ITEM', id }),
      deleteGroceryItem: (id) => dispatch({ type: 'DELETE_GROCERY_ITEM', id }),
      optimizeGrocery: () => dispatch({ type: 'OPTIMIZE_GROCERY' }),
      addPantryItem: (payload) => dispatch({ type: 'ADD_PANTRY_ITEM', payload }),
      updatePantryItem: (id, payload) => dispatch({ type: 'UPDATE_PANTRY_ITEM', id, payload }),
      deletePantryItem: (id) => dispatch({ type: 'DELETE_PANTRY_ITEM', id }),
      setImportDraft: (payload) => dispatch({ type: 'SET_IMPORT_DRAFT', payload }),
      saveImportToRecipes: (payload) => dispatch({ type: 'SAVE_IMPORT_TO_RECIPES', payload }),
      generatePlanDraft: (payload) => dispatch({ type: 'GENERATE_PLAN_DRAFT', payload }),
      acceptPlanDraft: () => dispatch({ type: 'ACCEPT_PLAN_DRAFT' }),
      clearPlanDraft: () => dispatch({ type: 'CLEAR_PLAN_DRAFT' }),
    }),
    [state]
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMealsStore() {
  const context = useContext(MealsContext);
  if (!context) {
    throw new Error('useMealsStore must be used within MealsProvider');
  }
  return context;
}

export function getWeekDays(weekStartISO: string) {
  return Array.from({ length: 7 }).map((_, index) => {
    const dateISO = addDaysISO(weekStartISO, index);
    return {
      dateISO,
      label: toDayLabel(dateISO),
    };
  });
}

export function getSlotLabel(slotType: MealSlotType) {
  if (slotType === 'breakfast') return 'Breakfast';
  if (slotType === 'lunch') return 'Lunch';
  return 'Dinner';
}

export function defaultImportDraft(url: string): ImportDraft {
  const host = url.replace(/^https?:\/\//, '').split('/')[0] || 'Imported link';
  return {
    url,
    title: 'Imported recipe preview',
    source: host,
    thumbnail: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800',
    suggestedTags: ['quick', 'balanced'],
    ingredients: [
      { name: 'Chicken breast', quantity: '1 lb', group: 'Meat' },
      { name: 'Garlic', quantity: '4 cloves', group: 'Produce' },
      { name: 'Greek yogurt', quantity: '1 cup', group: 'Dairy' },
      { name: 'Olive oil', quantity: '2 tbsp', group: 'Pantry' },
    ],
    steps: ['Prep ingredients.', 'Cook protein and aromatics.', 'Mix sauce and finish.'],
  };
}

export function fallbackGroupForInput(input: string): GroceryGroup {
  return inferGroup(input);
}
