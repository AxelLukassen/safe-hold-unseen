import type { PasswordEntry, EncryptedVault, PlaintextVault } from "@/types/vault";
import { encryptEntries, decryptVault } from "./cryptoService";

export async function exportEncrypted(
  entries: PasswordEntry[],
  masterPassword: string
): Promise<void> {
  const vault = await encryptEntries(entries, masterPassword);
  downloadJSON(vault, "securevault-encrypted.json");
}

export async function exportPlaintext(entries: PasswordEntry[]): Promise<void> {
  const data: PlaintextVault = { version: 1, format: "plaintext", entries };
  downloadJSON(data, "securevault-plaintext.json");
}

export async function importFile(
  file: File,
  masterPassword: string
): Promise<PasswordEntry[]> {
  const text = await file.text();
  const parsed = JSON.parse(text);

  if (parsed.format === "plaintext" && Array.isArray(parsed.entries)) {
    return parsed.entries as PasswordEntry[];
  }

  if (parsed.salt && parsed.iv && parsed.data) {
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
