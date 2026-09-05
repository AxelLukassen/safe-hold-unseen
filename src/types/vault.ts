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

export type KdfName = "pbkdf2";

export interface KdfParams {
  iterations: number;
  hash: "SHA-256";
}

/**
 * Version 1: ohne authentifizierte Metadaten (Altbestand, bleibt importierbar).
 * Version 2: Metadaten werden als "associated data" mit AES-GCM authentifiziert.
 */
export interface EncryptedVault {
  version: 1 | 2;
  salt: string;
  iv: string;
  data: string;
  checksum: string;
  algorithm?: "AES-256-GCM";
  kdf?: KdfName;
  kdfParams?: KdfParams;
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
