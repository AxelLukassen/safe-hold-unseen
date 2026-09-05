import type { Argon2idParams, EncryptedVault, PasswordEntry } from "@/types/vault";
import { CURRENT_VAULT_VERSION } from "@/types/vault";
import { computeChecksum } from "./checksumService";
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
 * Kanonische Serialisierung der Metadaten. Diese Bytes werden als
 * "associated data" mitauthentifiziert, damit Version, Verfahren und
 * KDF-Parameter nicht unbemerkt verändert werden können.
 */
function buildAssociatedData(vault: {
  version: number;
  algorithm: string;
  kdf: string;
  kdfParams: Argon2idParams;
  salt: string;
  iv: string;
}): Uint8Array {
  const canonical = JSON.stringify([
    vault.version,
    vault.algorithm,
    vault.kdf,
    vault.kdfParams.memorySizeKiB,
    vault.kdfParams.iterations,
    vault.kdfParams.parallelism,
    vault.kdfParams.hashLength,
    vault.salt,
    vault.iv,
  ]);
  return new TextEncoder().encode(canonical);
}

export async function encryptEntries(
  entries: PasswordEntry[],
  masterPassword: string
): Promise<EncryptedVault> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveVaultKey(masterPassword, salt, ARGON2ID_PARAMS);

  const saltBase64 = bufferToBase64(salt.buffer);
  const ivBase64 = bufferToBase64(iv.buffer);

  const additionalData = buildAssociatedData({
    version: CURRENT_VAULT_VERSION,
    algorithm: ALGORITHM,
    kdf: KDF_NAME,
    kdfParams: ARGON2ID_PARAMS,
    salt: saltBase64,
    iv: ivBase64,
  });

  const plaintext = new TextEncoder().encode(JSON.stringify(entries));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: additionalData as BufferSource,
      tagLength: AES_TAG_LENGTH_BITS,
    },
    key,
    plaintext
  );

  const dataBase64 = bufferToBase64(ciphertext);
  const checksum = await computeChecksum(`${saltBase64}:${ivBase64}:${dataBase64}`);

  return {
    version: CURRENT_VAULT_VERSION,
    algorithm: ALGORITHM,
    kdf: KDF_NAME,
    kdfParams: ARGON2ID_PARAMS,
    salt: saltBase64,
    iv: ivBase64,
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
  const key = await deriveVaultKey(masterPassword, salt, vault.kdfParams);

  const additionalData = buildAssociatedData({
    version: vault.version,
    algorithm: vault.algorithm,
    kdf: vault.kdf,
    kdfParams: vault.kdfParams,
    salt: vault.salt,
    iv: vault.iv,
  });

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource,
      additionalData: additionalData as BufferSource,
      tagLength: AES_TAG_LENGTH_BITS,
    },
    key,
    data
  );

  return JSON.parse(new TextDecoder().decode(decrypted)) as PasswordEntry[];
}

export function clearSensitiveString(str: string): void {
  // In JS we can't truly zero memory, but we can dereference
  // and encourage GC by overwriting references
  void str;
}
