import { useCallback, useState } from "react";

import { useVault } from "@/context/VaultContext";
import { changeMasterPassword } from "@/services/masterPasswordService";
import { validateMasterPasswordChange } from "@/services/masterPasswordValidation";
import { buildVaultFilename, downloadJSON } from "@/services/vaultFileService";
import { toErrorMessage } from "@/lib/errors";
import { toast } from "@/hooks/use-toast";

const CHANGE_ERROR_FALLBACK = "Passwortwechsel fehlgeschlagen.";

export interface MasterPasswordChangeInput {
  currentPassword: string;
  newPassword: string;
  confirmation: string;
}

interface ChangeMasterPasswordActions {
  isChanging: boolean;
  changePassword: (input: MasterPasswordChangeInput) => Promise<boolean>;
}

/**
 * Kapselt den Masterpasswort-Wechsel samt Validierung, Verschlüsselung
 * und Download, damit der Dialog nur Darstellung enthält.
 * Liefert true, wenn der Wechsel erfolgreich war.
 */
export function useChangeMasterPassword(): ChangeMasterPasswordActions {
  const { state, replaceMasterPassword } = useVault();
  const [isChanging, setIsChanging] = useState(false);

  const changePassword = useCallback(
    async (input: MasterPasswordChangeInput): Promise<boolean> => {
      const validationError = validateMasterPasswordChange(
        input.currentPassword,
        input.newPassword,
        input.confirmation
      );
      if (validationError) {
        toast({
          title: "Eingabe prüfen",
          description: validationError,
          variant: "destructive",
        });
        return false;
      }

      setIsChanging(true);
      try {
        const vault = await changeMasterPassword(
          state.entries,
          input.currentPassword,
          input.newPassword
        );
        downloadJSON(vault, buildVaultFilename("securevault-encrypted"));
        replaceMasterPassword(input.newPassword);
        toast({
          title: "Masterpasswort geändert",
          description:
            "Neue verschlüsselte Datei heruntergeladen. Nutze sie ab jetzt für Importe.",
        });
        return true;
      } catch (error) {
        toast({
          title: "Fehler",
          description: toErrorMessage(error, CHANGE_ERROR_FALLBACK),
          variant: "destructive",
        });
        return false;
      } finally {
        setIsChanging(false);
      }
    },
    [state.entries, replaceMasterPassword]
  );

  return { isChanging, changePassword };
}
