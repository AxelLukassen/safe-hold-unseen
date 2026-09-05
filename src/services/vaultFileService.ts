import type { PasswordEntry, EncryptedVaultFile, PlaintextVault } from "@/types/vault";

import { encryptEntries, decryptVault } from "./cryptoService";
import { computeChecksum, verifyChecksum } from "./checksumService";

const UNSUPPORTED_FORMAT_MESSAGE =
  "Diese Datei stammt aus einer älteren Version und wird nicht mehr unterstützt. Bitte den Tresor mit der aktuellen Version neu exportieren.";

export async function exportEncrypted(
  entries: PasswordEntry[],
  masterPassword: string
): Promise<void> {
  const vault = await encryptEntries(entries, masterPassword);
  downloadJSON(vault, "securevault-encrypted.json");
}

export async function exportPlaintext(entries: PasswordEntry[]): Promise<void> {
  const entriesJson = JSON.stringify(entries);
  const checksum = await computeChecksum(entriesJson);
  const data = { version: 1 as const, format: "plaintext" as const, entries, checksum };
  downloadJSON(data, "securevault-plaintext.json");
}

function isEncryptedVaultFile(parsed: unknown): parsed is EncryptedVaultFile {
  if (typeof parsed !== "object" || parsed === null) {
    return false;
  }
  const candidate = parsed as Record<string, unknown>;
  return (
    typeof candidate.s === "string" &&
    typeof candidate.i === "string" &&
    typeof candidate.d === "string"
  );
}

export async function importFile(
  file: File,
  masterPassword: string
): Promise<PasswordEntry[]> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);

  // Klartext-Import mit Prüfsumme
  if (
    typeof parsed === "object" && parsed !== null &&
    (parsed as PlaintextVault).format === "plaintext" &&
    Array.isArray((parsed as PlaintextVault).entries)
  ) {
    const plaintext = parsed as PlaintextVault & { checksum?: string };
    if (plaintext.checksum) {
      const entriesJson = JSON.stringify(plaintext.entries);
      const valid = await verifyChecksum(entriesJson, plaintext.checksum);
      if (!valid) {
        throw new Error("Prüfsumme ungültig – die Datei wurde möglicherweise beschädigt oder manipuliert.");
      }
    }
    return plaintext.entries;
  }

  // Verschlüsselter Import: nur Salt, IV und Datenblob sind außen lesbar.
  if (isEncryptedVaultFile(parsed)) {
    try {
      return await decryptVault(parsed, masterPassword);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Prüfsumme")) {
        throw error;
      }
      throw new Error(
        "Entschlüsselung fehlgeschlagen – falsches Masterpasswort oder die Datei wurde verändert."
      );
    }
  }

  // Ältere verschlüsselte Formate erkennen und klar ablehnen
  if (
    typeof parsed === "object" && parsed !== null &&
    "salt" in parsed && "iv" in parsed && "data" in parsed
  ) {
    throw new Error(UNSUPPORTED_FORMAT_MESSAGE);
  }

  throw new Error("Unbekanntes Dateiformat");
}

function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
