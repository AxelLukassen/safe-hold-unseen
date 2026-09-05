import { MIN_MASTER_PASSWORD_LENGTH } from "@/constants/security";

export const SAME_PASSWORD_MESSAGE =
  "Das neue Masterpasswort muss sich vom bisherigen unterscheiden.";
export const CONFIRMATION_MISMATCH_MESSAGE =
  "Die Wiederholung stimmt nicht mit dem neuen Masterpasswort überein.";
export const TOO_SHORT_MESSAGE = `Das neue Masterpasswort muss mindestens ${MIN_MASTER_PASSWORD_LENGTH} Zeichen lang sein.`;
export const CURRENT_PASSWORD_REQUIRED_MESSAGE =
  "Bitte gib dein aktuelles Masterpasswort ein.";
export const WRONG_CURRENT_PASSWORD_MESSAGE =
  "Das aktuelle Masterpasswort stimmt nicht.";

/**
 * Prüft die Eingaben des Passwortwechsel-Dialogs und liefert die erste
 * passende Fehlermeldung oder null, wenn alles gültig ist.
 */
export function validateMasterPasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmation: string
): string | null {
  if (currentPassword.length === 0) return CURRENT_PASSWORD_REQUIRED_MESSAGE;
  if (newPassword.length < MIN_MASTER_PASSWORD_LENGTH) return TOO_SHORT_MESSAGE;
  if (newPassword === currentPassword) return SAME_PASSWORD_MESSAGE;
  if (newPassword !== confirmation) return CONFIRMATION_MISMATCH_MESSAGE;
  return null;
}
