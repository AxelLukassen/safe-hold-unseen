import type { PasswordEntry } from "@/types/vault";
import { ENTRY_FIELD_LIMITS } from "@/types/vault";

const INVALID_ENTRIES_MESSAGE =
  "Die Datei enthält ungültige Einträge und wurde aus Sicherheitsgründen abgelehnt.";

type StringField = "title" | "username" | "password" | "url" | "notes";

const STRING_FIELDS: StringField[] = [
  "title",
  "username",
  "password",
  "url",
  "notes",
];

function isValidStringField(candidate: Record<string, unknown>, field: StringField): boolean {
  const value = candidate[field];
  return typeof value === "string" && value.length <= ENTRY_FIELD_LIMITS[field];
}

function isValidTimestamp(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isValidOptionalGroup(candidate: Record<string, unknown>): boolean {
  const value = candidate.group;
  if (value === undefined) return true;
  return typeof value === "string" && value.length <= ENTRY_FIELD_LIMITS.group;
}

function sanitizeEntry(candidate: Record<string, unknown>): PasswordEntry | null {
  if (!STRING_FIELDS.every((field) => isValidStringField(candidate, field))) {
    return null;
  }
  if (!isValidOptionalGroup(candidate)) {
    return null;
  }
  if (!isValidTimestamp(candidate.createdAt) || !isValidTimestamp(candidate.updatedAt)) {
    return null;
  }

  return {
    id: typeof candidate.id === "string" && candidate.id.length > 0
      ? candidate.id
      : crypto.randomUUID(),
    title: candidate.title as string,
    username: candidate.username as string,
    password: candidate.password as string,
    url: candidate.url as string,
    notes: candidate.notes as string,
    group: typeof candidate.group === "string" ? candidate.group : "",
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
}

/**
 * Strikte Strukturprüfung importierter Einträge. Handgebastelte oder
 * beschädigte Dateien werden komplett abgelehnt, statt einzelne
 * defekte Einträge in die Oberfläche zu lassen.
 */
export function validateImportedEntries(entries: unknown): PasswordEntry[] {
  if (!Array.isArray(entries)) {
    throw new Error(INVALID_ENTRIES_MESSAGE);
  }

  const validated: PasswordEntry[] = [];
  for (const raw of entries) {
    if (typeof raw !== "object" || raw === null) {
      throw new Error(INVALID_ENTRIES_MESSAGE);
    }
    const entry = sanitizeEntry(raw as Record<string, unknown>);
    if (!entry) {
      throw new Error(INVALID_ENTRIES_MESSAGE);
    }
    validated.push(entry);
  }
  return validated;
}
