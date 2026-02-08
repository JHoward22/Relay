export type AIMemoryEventSource = 'relay' | 'family' | 'meals' | 'finances' | 'pets' | 'notes' | 'voice';
export type AIMemoryEventKind = 'snapshot' | 'action' | 'query';

export type AIMemoryEvent = {
  id: string;
  source: AIMemoryEventSource;
  kind: AIMemoryEventKind;
  payload: Record<string, unknown>;
  atISO: string;
};

type AIMemoryEventInput = {
  id?: string;
  source: AIMemoryEventSource;
  kind: AIMemoryEventKind;
  payload: Record<string, unknown>;
  atISO?: string;
};

type Listener = (event: AIMemoryEvent) => void;

const listeners = new Set<Listener>();

const nextId = (() => {
  let c = 9000;
  return () => {
    c += 1;
    return `aim-event-${c}`;
  };
})();

export function emitAIMemoryEvent(input: AIMemoryEventInput) {
  const event: AIMemoryEvent = {
    id: input.id ?? nextId(),
    source: input.source,
    kind: input.kind,
    payload: input.payload,
    atISO: input.atISO ?? new Date().toISOString(),
  };

  listeners.forEach((listener) => {
    listener(event);
  });
}

export function subscribeAIMemoryEvents(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
