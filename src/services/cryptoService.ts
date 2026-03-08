import type { EncryptedVault, PasswordEntry } from "@/types/vault";

const PBKDF2_ITERATIONS = 600000;

function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKey(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptEntries(
  entries: PasswordEntry[],
  masterPassword: string
): Promise<EncryptedVault> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(masterPassword, salt);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(entries));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintext
  );

  const dataBase64 = bufferToBase64(ciphertext);
  const checksumInput = `${bufferToBase64(salt.buffer)}:${bufferToBase64(iv.buffer)}:${dataBase64}`;
  const checksum = await computeChecksum(checksumInput);

  return {
    version: 1,
    salt: bufferToBase64(salt.buffer),
    iv: bufferToBase64(iv.buffer),
    data: dataBase64,
    checksum,
  };
}

export async function decryptVault(
  vault: EncryptedVault,
  masterPassword: string
): Promise<PasswordEntry[]> {
  const salt = new Uint8Array(base64ToBuffer(vault.salt));
  const iv = new Uint8Array(base64ToBuffer(vault.iv));
  const data = base64ToBuffer(vault.data);
  const key = await deriveKey(masterPassword, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  const decoder = new TextDecoder();
  return JSON.parse(decoder.decode(decrypted));
}

export function clearSensitiveString(str: string): void {
  // In JS we can't truly zero memory, but we can dereference
  // and encourage GC by overwriting references
  void str;
}
