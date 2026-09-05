import type { PasswordEntry } from "@/types/vault";

const SEARCHABLE_FIELDS = ["title", "username", "url", "group"] as const;

/**
 * Filtert Einträge über Titel, Benutzername, Adresse und Gruppe.
 * Ein leerer Suchbegriff liefert alle Einträge zurück.
 */
export function filterEntries(entries: PasswordEntry[], query: string): PasswordEntry[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return entries;

  return entries.filter((entry) =>
    SEARCHABLE_FIELDS.some((field) => entry[field].toLowerCase().includes(normalizedQuery))
  );
}
