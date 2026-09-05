import type { Argon2idParams, EncryptedVaultFile, PasswordEntry, VaultPayload } from "@/types/vault";
import { CURRENT_VAULT_VERSION } from "@/types/vault";
import { computeChecksum, verifyChecksum } from "./checksumService";
import { validateImportedEntries } from "./entryValidation";
import { ARGON2ID_PARAMS, deriveVaultKey } from "./kdf/keyDerivation";

const ALGORITHM = "AES-256-GCM" as const;
const KDF_NAME = "argon2id" as const;
const AES_TAG_LENGTH_BITS = 128;
const SALT_BYTES = 16;
const IV_BYTES = 12;

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

/**
 * Salt und IV werden als "associated data" mitauthentifiziert, damit sie
 * nicht unbemerkt ausgetauscht werden können. Alle übrigen Metadaten
 * liegen bereits im verschlüsselten Paket und brauchen das nicht.
 */
function buildAssociatedData(saltBase64: string, ivBase64: string): Uint8Array {
  return new TextEncoder().encode(JSON.stringify([saltBase64, ivBase64]));
}

export async function encryptEntries(
  entries: PasswordEntry[],
  masterPassword: string
): Promise<EncryptedVaultFile> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveVaultKey(masterPassword, salt, ARGON2ID_PARAMS);

  const saltBase64 = bufferToBase64(salt.buffer);
  const ivBase64 = bufferToBase64(iv.buffer);

  const entriesJson = JSON.stringify(entries);
  const payload: VaultPayload = {
    version: CURRENT_VAULT_VERSION,
    algorithm: ALGORITHM,
    kdf: KDF_NAME,
    kdfParams: ARGON2ID_PARAMS,
    checksum: await computeChecksum(entriesJson),
    entries,
  };

  const plaintext = new TextEncoder().encode(JSON.stringify(payload));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: buildAssociatedData(saltBase64, ivBase64) as BufferSource,
      tagLength: AES_TAG_LENGTH_BITS,
    },
    key,
    plaintext
  );

  return {
    s: saltBase64,
    i: ivBase64,
    d: bufferToBase64(ciphertext),
  };
}

function isValidKdfParams(params: Argon2idParams): boolean {
  return (
    Number.isInteger(params.memorySizeKiB) && params.memorySizeKiB >= 8192 &&
    Number.isInteger(params.iterations) && params.iterations >= 1 &&
    Number.isInteger(params.parallelism) && params.parallelism >= 1 &&
    params.hashLength === 32
  );
}

export async function decryptVault(
  file: EncryptedVaultFile,
  masterPassword: string
): Promise<PasswordEntry[]> {
  const salt = new Uint8Array(base64ToBuffer(file.s));
  const iv = new Uint8Array(base64ToBuffer(file.i));
  const data = base64ToBuffer(file.d);
  const key = await deriveVaultKey(masterPassword, salt, ARGON2ID_PARAMS);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: buildAssociatedData(file.s, file.i) as BufferSource,
      tagLength: AES_TAG_LENGTH_BITS,
    },
    key,
    data
  );

  const payload = JSON.parse(new TextDecoder().decode(decrypted)) as VaultPayload;

  if (
    payload.version !== CURRENT_VAULT_VERSION ||
    payload.algorithm !== ALGORITHM ||
    payload.kdf !== KDF_NAME ||
    !isValidKdfParams(payload.kdfParams) ||
    !Array.isArray(payload.entries)
  ) {
    throw new Error("Ungültiger Tresor-Inhalt");
  }

  const entriesJson = JSON.stringify(payload.entries);
  const checksumValid = await verifyChecksum(entriesJson, payload.checksum);
  if (!checksumValid) {
    throw new Error("Prüfsumme ungültig – die Datei wurde möglicherweise beschädigt oder manipuliert.");
  }

  return validateImportedEntries(payload.entries);
}

export function clearSensitiveString(str: string): void {
  // In JS we can't truly zero memory, but we can dereference
  // and encourage GC by overwriting references
  void str;
}
