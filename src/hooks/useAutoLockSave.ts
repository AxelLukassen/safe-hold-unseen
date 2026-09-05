import { useCallback, useEffect, useRef, useState } from "react";

import { useVault, WARNING_LEAD_TIME } from "@/context/VaultContext";
import { exportEncrypted } from "@/services/vaultFileService";
import { toErrorMessage } from "@/lib/errors";
import { toast } from "@/hooks/use-toast";


const COUNTDOWN_SECONDS = Math.round(WARNING_LEAD_TIME / 1000);
const TICK_INTERVAL_MS = 1000;

interface AutoLockSaveResult {
  isWarningOpen: boolean;
  secondsLeft: number;
  isSaving: boolean;
  errorMessage: string | null;
  handleSaveAndLock: () => Promise<void>;
  handleStayUnlocked: () => void;
  handleLockNow: () => void;
}

export function useAutoLockSave(): AutoLockSaveResult {
  const { state, isLockWarningActive, lock, extendSession, markSaved, getMasterPassword } =
    useVault();

  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isHandlingRef = useRef(false);

  const saveVault = useCallback(async (): Promise<boolean> => {
    const masterPassword = getMasterPassword();
    if (!masterPassword || !state.hasUnsavedChanges) return true;

    setIsSaving(true);
    setErrorMessage(null);
    try {
      await exportEncrypted(state.entries, masterPassword);
      markSaved();
      toast({ title: "Gespeichert", description: "Neue verschlüsselte Datei heruntergeladen." });
      return true;
    } catch (error) {
      const message = toErrorMessage(error, "Speichern fehlgeschlagen.");
      setErrorMessage(message);
      toast({ title: "Fehler", description: message, variant: "destructive" });

      return false;
    } finally {
      setIsSaving(false);
    }
  }, [getMasterPassword, markSaved, state.entries, state.hasUnsavedChanges]);

  const handleSaveAndLock = useCallback(async () => {
    if (isHandlingRef.current) return;
    isHandlingRef.current = true;
    const saved = await saveVault();
    isHandlingRef.current = false;
    if (saved) lock();
  }, [lock, saveVault]);

  const handleStayUnlocked = useCallback(() => {
    setErrorMessage(null);
    extendSession();
  }, [extendSession]);

  const handleLockNow = useCallback(() => {
    lock();
  }, [lock]);

  useEffect(() => {
    if (!isLockWarningActive) {
      setSecondsLeft(COUNTDOWN_SECONDS);
      setErrorMessage(null);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, TICK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isLockWarningActive]);

  useEffect(() => {
    if (!isLockWarningActive || secondsLeft > 0 || isSaving) return;
    void handleSaveAndLock();
  }, [isLockWarningActive, secondsLeft, isSaving, handleSaveAndLock]);

  return {
    isWarningOpen: isLockWarningActive,
    secondsLeft,
    isSaving,
    errorMessage,
    handleSaveAndLock,
    handleStayUnlocked,
    handleLockNow,
  };
}
