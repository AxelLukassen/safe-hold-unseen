import type { PasswordEntry } from "@/types/vault";

import { encryptEntries, decryptVault } from "./cryptoService";

/**
 * Erzeugt eine neue verschlüsselte Tresordatei mit einem neuen Masterpasswort.
 *
 * Das aktuelle Passwort wird geprüft, indem der aktuelle Bestand testweise
 * damit ver- und wieder entschlüsselt wird. AES-GCM schlägt bei falschem
 * Passwort fehl, dadurch ist der Vergleich manipulationssicher. Bei Erfolg
 * wird mit dem neuen Passwort (frisches Salt und IV) neu verschlüsselt.
 */
export async function changeMasterPassword(
  entries: PasswordEntry[],
  currentPassword: string,
  newPassword: string
): Promise<unknown> {
  const probe = await encryptEntries(entries, currentPassword);
  try {
    await decryptVault(probe, currentPassword);
  } catch {
    throw new Error("Das aktuelle Masterpasswort stimmt nicht.");
  }

  return encryptEntries(entries, newPassword);
}
