import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { PasswordEntry } from "@/types/vault";

interface VaultState {
  isUnlocked: boolean;
  entries: PasswordEntry[];
  masterPassword: string | null;
}

interface VaultContextValue {
  state: VaultState;
  unlock: (password: string) => void;
  lock: () => void;
  setEntries: (entries: PasswordEntry[]) => void;
  addEntry: (entry: PasswordEntry) => void;
  updateEntry: (entry: PasswordEntry) => void;
  deleteEntry: (id: string) => void;
  getMasterPassword: () => string | null;
}

const VaultContext = createContext<VaultContextValue | null>(null);

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<VaultState>({
    isUnlocked: false,
    entries: [],
    masterPassword: null,
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lock = useCallback(() => {
    setState({ isUnlocked: false, entries: [], masterPassword: null });
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (state.isUnlocked) {
      timeoutRef.current = setTimeout(lock, INACTIVITY_TIMEOUT);
    }
  }, [state.isUnlocked, lock]);

  useEffect(() => {
    if (!state.isUnlocked) return;

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => document.addEventListener(e, resetTimer));
    resetTimer();

    const handleVisibility = () => {
      if (document.hidden) lock();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      events.forEach((e) => document.removeEventListener(e, resetTimer));
      document.removeEventListener("visibilitychange", handleVisibility);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [state.isUnlocked, resetTimer, lock]);

  const unlock = useCallback((password: string) => {
    setState({ isUnlocked: true, entries: [], masterPassword: password });
  }, []);

  const setEntries = useCallback((entries: PasswordEntry[]) => {
    setState((prev) => ({ ...prev, entries }));
  }, []);

  const addEntry = useCallback((entry: PasswordEntry) => {
    setState((prev) => ({ ...prev, entries: [...prev.entries, entry] }));
  }, []);

  const updateEntry = useCallback((entry: PasswordEntry) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === entry.id ? entry : e)),
    }));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== id),
    }));
  }, []);

  const getMasterPassword = useCallback(() => state.masterPassword, [state.masterPassword]);

  return (
    <VaultContext.Provider
      value={{ state, unlock, lock, setEntries, addEntry, updateEntry, deleteEntry, getMasterPassword }}
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
