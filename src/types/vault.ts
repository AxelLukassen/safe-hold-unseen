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

export interface EncryptedVault {
  version: 1;
  salt: string;
  iv: string;
  data: string;
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
