import { VoiceDebugEntry } from './types';

type Listener = () => void;

let debugEnabled = false;
let entries: VoiceDebugEntry[] = [];
const listeners = new Set<Listener>();

const id = (() => {
  let c = 0;
  return () => {
    c += 1;
    return `voice-debug-${c}`;
  };
})();

function notify() {
  listeners.forEach((listener) => listener());
}

export function isVoiceDebugEnabled() {
  return debugEnabled;
}

export function setVoiceDebugEnabled(enabled: boolean) {
  debugEnabled = enabled;
  notify();
}

export function toggleVoiceDebugEnabled() {
  setVoiceDebugEnabled(!debugEnabled);
}

export function getVoiceDebugEntries() {
  return entries;
}

export function clearVoiceDebugEntries() {
  entries = [];
  notify();
}

export function pushVoiceDebugEntry(
  entry: Omit<VoiceDebugEntry, 'id' | 'atISO'>
) {
  const next: VoiceDebugEntry = {
    ...entry,
    id: id(),
    atISO: new Date().toISOString(),
  };

  entries = [next, ...entries].slice(0, 120);
  notify();
}

export function subscribeVoiceDebug(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
