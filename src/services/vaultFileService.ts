import type { PasswordEntry, EncryptedVault, PlaintextVault } from "@/types/vault";
import { encryptEntries, decryptVault } from "./cryptoService";
import { computeChecksum, verifyChecksum } from "./checksumService";

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

export async function importFile(
  file: File,
  masterPassword: string
): Promise<PasswordEntry[]> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  // Klartext-Import mit Prüfsumme
  if (parsed.format === "plaintext" && Array.isArray(parsed.entries)) {
    if (parsed.checksum) {
      const entriesJson = JSON.stringify(parsed.entries);
      const valid = await verifyChecksum(entriesJson, parsed.checksum);
      if (!valid) {
        throw new Error("Prüfsumme ungültig – die Datei wurde möglicherweise beschädigt oder manipuliert.");
      }
    }
    return parsed.entries as PasswordEntry[];
  }

  // Verschlüsselter Import mit Prüfsumme
  if (parsed.salt && parsed.iv && parsed.data) {
    if (parsed.checksum) {
      const checksumInput = `${parsed.salt}:${parsed.iv}:${parsed.data}`;
      const valid = await verifyChecksum(checksumInput, parsed.checksum);
      if (!valid) {
        throw new Error("Prüfsumme ungültig – die Datei wurde möglicherweise beschädigt oder manipuliert.");
      }
    }
    return decryptVault(parsed as EncryptedVault, masterPassword);
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
