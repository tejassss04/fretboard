'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { load, save } from './storage';

const STORAGE_EVENT = 'fretboard:storage-sync';

export function useStoredState<T>(key: string, fallback: T): [T, (value: T | ((prev: T) => T)) => void] {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === `fretboard:${key}`) {
        onStoreChange();
      }
    };
    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<{ key?: string }>;
      if (!customEvent.detail?.key || customEvent.detail.key === key) {
        onStoreChange();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(STORAGE_EVENT, handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(STORAGE_EVENT, handleCustom);
    };
  }, [key]);

  const fallbackJson = useMemo(() => JSON.stringify(fallback), [fallback]);

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return fallbackJson;
    try {
      return localStorage.getItem(`fretboard:${key}`) ?? fallbackJson;
    } catch {
      return fallbackJson;
    }
  }, [key, fallbackJson]);

  const getServerSnapshot = useCallback(() => fallbackJson, [fallbackJson]);

  const rawJson = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value: T = useMemo(() => {
    try {
      return JSON.parse(rawJson) as T;
    } catch {
      return fallback;
    }
  }, [rawJson, fallback]);

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const current = load(key, fallback);
      const next = typeof updater === 'function' ? (updater as (prev: T) => T)(current) : updater;
      save(key, next);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
      }
    },
    [key, fallback]
  );

  return [value, setValue];
}
