import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { PasswordEntry } from "@/types/vault";

interface VaultState {
  isUnlocked: boolean;
  entries: PasswordEntry[];
  masterPassword: string | null;
  hasUnsavedChanges: boolean;
}

interface VaultContextValue {
  state: VaultState;
  isLockWarningActive: boolean;
  unlock: (password: string) => void;
  lock: () => void;
  extendSession: () => void;
  markSaved: () => void;
  setEntries: (entries: PasswordEntry[]) => void;
  addEntry: (entry: PasswordEntry) => void;
  updateEntry: (entry: PasswordEntry) => void;
  deleteEntry: (id: string) => void;
  getMasterPassword: () => string | null;
}

const VaultContext = createContext<VaultContextValue | null>(null);

export const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
export const WARNING_LEAD_TIME = 30 * 1000;

const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

const createLockedState = (): VaultState => ({
  isUnlocked: false,
  entries: [],
  masterPassword: null,
  hasUnsavedChanges: false,
});

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<VaultState>(createLockedState);
  const [isLockWarningActive, setIsLockWarningActive] = useState(false);

  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isWarningActiveRef = useRef(false);

  useEffect(() => {
    isWarningActiveRef.current = isLockWarningActive;
  }, [isLockWarningActive]);

  const clearWarningTimeout = useCallback(() => {
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const lock = useCallback(() => {
    clearWarningTimeout();
    setIsLockWarningActive(false);
    setState(createLockedState());
  }, [clearWarningTimeout]);

  const startWarningTimer = useCallback(() => {
    clearWarningTimeout();
    warningTimeoutRef.current = setTimeout(
      () => setIsLockWarningActive(true),
      INACTIVITY_TIMEOUT - WARNING_LEAD_TIME
    );
  }, [clearWarningTimeout]);

  const handleActivity = useCallback(() => {
    // Während die Vorwarnung sichtbar ist, darf Aktivität den Ablauf nicht
    // zurücksetzen – sonst könnte der Dialog nie beantwortet werden.
    if (isWarningActiveRef.current) return;
    startWarningTimer();
  }, [startWarningTimer]);

  const extendSession = useCallback(() => {
    setIsLockWarningActive(false);
    startWarningTimer();
  }, [startWarningTimer]);

  const markSaved = useCallback(() => {
    setState((prev) => ({ ...prev, hasUnsavedChanges: false }));
  }, []);

  useEffect(() => {
    if (!state.isUnlocked) return;

    ACTIVITY_EVENTS.forEach((event) => document.addEventListener(event, handleActivity));
    startWarningTimer();

    const handleVisibility = () => {
      if (document.hidden) lock();
    };
    const handleBeforeUnload = () => lock();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => document.removeEventListener(event, handleActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      clearWarningTimeout();
    };
  }, [state.isUnlocked, handleActivity, startWarningTimer, lock, clearWarningTimeout]);

  const unlock = useCallback((password: string) => {
    setState({
      isUnlocked: true,
      entries: [],
      masterPassword: password,
      hasUnsavedChanges: false,
    });
  }, []);

  const setEntries = useCallback((entries: PasswordEntry[]) => {
    setState((prev) => ({ ...prev, entries, hasUnsavedChanges: true }));
  }, []);

  const addEntry = useCallback((entry: PasswordEntry) => {
    setState((prev) => ({
      ...prev,
      entries: [...prev.entries, entry],
      hasUnsavedChanges: true,
    }));
  }, []);

  const updateEntry = useCallback((entry: PasswordEntry) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === entry.id ? entry : e)),
      hasUnsavedChanges: true,
    }));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== id),
      hasUnsavedChanges: true,
    }));
  }, []);

  const getMasterPassword = useCallback(() => state.masterPassword, [state.masterPassword]);

  return (
    <VaultContext.Provider
      value={{
        state,
        isLockWarningActive,
        unlock,
        lock,
        extendSession,
        markSaved,
        setEntries,
        addEntry,
        updateEntry,
        deleteEntry,
        getMasterPassword,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault(): VaultContextValue {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
