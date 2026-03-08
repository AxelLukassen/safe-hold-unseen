/**
 * Berechnet eine SHA-256 Prüfsumme für beliebige Daten.
 * Wird verwendet, um die Integrität von exportierten Vault-Dateien zu verifizieren.
 */
export async function computeChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verifiziert die Prüfsumme einer Datei.
 * Gibt true zurück wenn die Prüfsumme übereinstimmt, false wenn nicht.
 */
export async function verifyChecksum(data: string, expectedChecksum: string): Promise<boolean> {
  const actual = await computeChecksum(data);
  return actual === expectedChecksum;
}
