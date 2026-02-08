export type PendingVoiceActionDomain =
  | 'meals'
  | 'finances'
  | 'pets'
  | 'notes'
  | 'family';

export type PendingVoiceAction = {
  id: string;
  domain: PendingVoiceActionDomain;
  type: string;
  payload: Record<string, string | number | boolean | null | undefined>;
  createdAtISO: string;
};

type Listener = (action: PendingVoiceAction) => void;

const queue: Record<PendingVoiceActionDomain, PendingVoiceAction[]> = {
  meals: [],
  finances: [],
  pets: [],
  notes: [],
  family: [],
};

const listeners: Record<PendingVoiceActionDomain, Set<Listener>> = {
  meals: new Set(),
  finances: new Set(),
  pets: new Set(),
  notes: new Set(),
  family: new Set(),
};

const idGen = (() => {
  let counter = 0;
  return () => {
    counter += 1;
    return `vp-${Date.now()}-${counter}`;
  };
})();

export function enqueuePendingVoiceAction(
  domain: PendingVoiceActionDomain,
  type: string,
  payload: PendingVoiceAction['payload']
) {
  const action: PendingVoiceAction = {
    id: idGen(),
    domain,
    type,
    payload,
    createdAtISO: new Date().toISOString(),
  };
  queue[domain] = [...queue[domain], action];
  listeners[domain].forEach((listener) => listener(action));
  return action;
}

export function consumePendingVoiceActions(domain: PendingVoiceActionDomain) {
  const pending = [...queue[domain]];
  queue[domain] = [];
  return pending;
}

export function subscribePendingVoiceActions(
  domain: PendingVoiceActionDomain,
  listener: Listener
) {
  listeners[domain].add(listener);
  return () => {
    listeners[domain].delete(listener);
  };
}

