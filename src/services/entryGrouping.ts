import type { PasswordEntry } from "@/types/vault";
import { UNGROUPED_LABEL } from "@/types/vault";

export interface EntryGroup {
  name: string;
  entries: PasswordEntry[];
}

/**
 * Bündelt Einträge nach Gruppe. Einträge ohne Gruppe landen in einer
 * gesonderten Gruppe, die immer als letzte einsortiert wird.
 */
export function groupEntries(entries: PasswordEntry[]): EntryGroup[] {
  const buckets = new Map<string, PasswordEntry[]>();

  for (const entry of entries) {
    const name = entry.group.trim() || UNGROUPED_LABEL;
    const bucket = buckets.get(name);
    if (bucket) {
      bucket.push(entry);
    } else {
      buckets.set(name, [entry]);
    }
  }

  return [...buckets.entries()]
    .map(([name, groupEntriesList]) => ({
      name,
      entries: [...groupEntriesList].sort((a, b) => a.title.localeCompare(b.title, "de")),
    }))
    .sort((a, b) => {
      if (a.name === UNGROUPED_LABEL) return 1;
      if (b.name === UNGROUPED_LABEL) return -1;
      return a.name.localeCompare(b.name, "de");
    });
}

export function collectGroupNames(entries: PasswordEntry[]): string[] {
  const names = new Set<string>();
  for (const entry of entries) {
    const name = entry.group.trim();
    if (name) names.add(name);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "de"));
}
