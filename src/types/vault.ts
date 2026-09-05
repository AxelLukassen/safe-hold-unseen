export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export type KdfName = "argon2id";

export interface Argon2idParams {
  memorySizeKiB: number;
  iterations: number;
  parallelism: number;
  hashLength: number;
}

export const CURRENT_VAULT_VERSION = 4;

/**
 * Äußeres Dateiformat: nur Salt, IV und der verschlüsselte Datenblob.
 * Neutral gehaltene Feldnamen, damit die Struktur der Datei nichts verrät.
 */
export interface EncryptedVaultFile {
  s: string;
  i: string;
  d: string;
}

/**
 * Inneres Paket, das komplett verschlüsselt wird. Version, Verfahren,
 * KDF-Parameter, Prüfsumme und Einträge sind ohne Masterpasswort nicht lesbar.
 */
export interface VaultPayload {
  version: 4;
  algorithm: "AES-256-GCM";
  kdf: KdfName;
  kdfParams: Argon2idParams;
  checksum: string;
  entries: PasswordEntry[];
}

export interface PlaintextVaultWithChecksum {
  version: 1;
  format: "plaintext";
  entries: PasswordEntry[];
  checksum: string;
}

export interface PlaintextVault {
  version: 1;
  format: "plaintext";
  entries: PasswordEntry[];
}

export interface PasswordGeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}
