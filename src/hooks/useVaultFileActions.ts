import { useCallback, useState } from "react";

import { useVault } from "@/context/VaultContext";
import { exportEncrypted, exportPlaintext, importFile } from "@/services/vaultFileService";
import { toErrorMessage } from "@/lib/errors";
import { toast } from "@/hooks/use-toast";

const EXPORT_ERROR_FALLBACK = "Export fehlgeschlagen.";
const IMPORT_ERROR_FALLBACK = "Import fehlgeschlagen. Ungültige Datei.";

interface VaultFileActions {
  isBusy: boolean;
  exportEncryptedVault: () => Promise<void>;
  exportPlaintextVault: () => Promise<void>;
  importVaultFile: (file: File) => Promise<void>;
}

/**
 * Kapselt Import und Export des Tresors samt Lade- und Fehlerzuständen,
 * damit die Oberfläche keine Dateilogik enthält.
 */
export function useVaultFileActions(): VaultFileActions {
  const { state, setEntries, markSaved, getMasterPassword } = useVault();
  const [isBusy, setIsBusy] = useState(false);

  const runWithBusyState = useCallback(
    async (action: () => Promise<void>, errorFallback: string) => {
      setIsBusy(true);
      try {
        await action();
      } catch (error) {
        toast({
          title: "Fehler",
          description: toErrorMessage(error, errorFallback),
          variant: "destructive",
        });
      } finally {
        setIsBusy(false);
      }
    },
    []
  );

  const exportEncryptedVault = useCallback(async () => {
    const masterPassword = getMasterPassword();
    if (!masterPassword) return;

    await runWithBusyState(async () => {
      await exportEncrypted(state.entries, masterPassword);
      markSaved();
      toast({ title: "Exportiert", description: "Verschlüsselte Datei heruntergeladen." });
    }, EXPORT_ERROR_FALLBACK);
  }, [getMasterPassword, markSaved, runWithBusyState, state.entries]);

  const exportPlaintextVault = useCallback(async () => {
    await runWithBusyState(async () => {
      await exportPlaintext(state.entries);
      toast({ title: "Exportiert", description: "Klartext-Datei heruntergeladen." });
    }, EXPORT_ERROR_FALLBACK);
  }, [runWithBusyState, state.entries]);

  const importVaultFile = useCallback(
    async (file: File) => {
      const masterPassword = getMasterPassword();
      if (!masterPassword) return;

      await runWithBusyState(async () => {
        const entries = await importFile(file, masterPassword);
        setEntries(entries);
        toast({ title: "Importiert", description: `${entries.length} Einträge geladen.` });
      }, IMPORT_ERROR_FALLBACK);
    },
    [getMasterPassword, runWithBusyState, setEntries]
  );

  return { isBusy, exportEncryptedVault, exportPlaintextVault, importVaultFile };
}
