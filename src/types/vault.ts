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

export const CURRENT_VAULT_VERSION = 3;

/**
 * Version 3: Argon2id-Ableitung, AES-256-GCM, Metadaten als "associated data"
 * authentifiziert. Ältere Versionen werden nicht mehr unterstützt.
 */
export interface EncryptedVault {
  version: 3;
  algorithm: "AES-256-GCM";
  kdf: KdfName;
  kdfParams: Argon2idParams;
  salt: string;
  iv: string;
  data: string;
  checksum: string;
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
