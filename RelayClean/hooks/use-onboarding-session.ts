import { useEffect, useMemo, useState } from 'react';

type GuidanceMode = 'gentle' | 'proactive' | null;

type OnboardingPreferences = {
  domains: string[];
  guidance: GuidanceMode;
};

let onboardingComplete = false;
let preferencesState: OnboardingPreferences = {
  domains: [],
  guidance: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function useOnboardingSession() {
  const [isComplete, setIsComplete] = useState(onboardingComplete);
  const [preferences, setPreferences] = useState(preferencesState);

  useEffect(() => {
    const listener = () => {
      setIsComplete(onboardingComplete);
      setPreferences(preferencesState);
    };

    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const api = useMemo(
    () => ({
      completeOnboarding: () => {
        onboardingComplete = true;
        emit();
      },
      toggleDomain: (domain: string) => {
        const exists = preferencesState.domains.includes(domain);
        preferencesState = {
          ...preferencesState,
          domains: exists
            ? preferencesState.domains.filter((item) => item !== domain)
            : [...preferencesState.domains, domain],
        };
        emit();
      },
      setGuidance: (mode: GuidanceMode) => {
        preferencesState = {
          ...preferencesState,
          guidance: mode,
        };
        emit();
      },
    }),
    []
  );

  return {
    isComplete,
    preferences,
    ...api,
  };
}
