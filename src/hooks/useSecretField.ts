import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

const REVEAL_DURATION_MS = 5000;
const CLIPBOARD_CLEAR_MS = 60000;

/**
 * Kapselt das zeitlich begrenzte Anzeigen eines Passworts und das Kopieren
 * in die Zwischenablage inklusive automatischem Leeren.
 */
export function useSecretField() {
  const [isRevealed, setIsRevealed] = useState(false);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  const toggleReveal = useCallback(() => {
    setIsRevealed((previous) => {
      if (previous) {
        if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
        return false;
      }
      revealTimeoutRef.current = setTimeout(() => setIsRevealed(false), REVEAL_DURATION_MS);
      return true;
    });
  }, []);

  const copyToClipboard = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: "Kopiert", description: `${label} kopiert. Wird in 1 Min. gelöscht.` });
      setTimeout(() => {
        navigator.clipboard.writeText("").catch(() => undefined);
      }, CLIPBOARD_CLEAR_MS);
    } catch {
      toast({
        title: "Fehler",
        description: "Kopieren in die Zwischenablage nicht möglich.",
        variant: "destructive",
      });
    }
  }, []);

  return { isRevealed, toggleReveal, copyToClipboard };
}
