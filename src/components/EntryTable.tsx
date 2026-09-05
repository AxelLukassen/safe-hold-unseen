import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { EntryTableRow } from "@/components/EntryTableRow";
import { groupEntries } from "@/services/entryGrouping";
import type { PasswordEntry } from "@/types/vault";

interface Props {
  entries: PasswordEntry[];
  onEditEntry: (entry: PasswordEntry) => void;
  onDeleteEntry: (id: string) => void;
}

const TOTAL_COLUMN_COUNT = 5;

export function EntryTable({ entries, onEditEntry, onDeleteEntry }: Props) {
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const groups = useMemo(() => groupEntries(entries), [entries]);

  const toggleGroup = (name: string) =>
    setCollapsedGroups((previous) =>
      previous.includes(name) ? previous.filter((item) => item !== name) : [...previous, name]
    );

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead className="hidden sm:table-cell">Benutzername</TableHead>
            <TableHead className="hidden lg:table-cell">Adresse</TableHead>
            <TableHead className="hidden md:table-cell">Passwort</TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => {
            const isCollapsed = collapsedGroups.includes(group.name);
            return (
              <Fragment key={group.name}>
                <TableRow className="bg-muted/50 hover:bg-muted/70">
                  <TableCell colSpan={TOTAL_COLUMN_COUNT} className="p-0">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.name)}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-semibold text-foreground"
                      aria-expanded={!isCollapsed}
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="truncate">{group.name}</span>
                      <span className="text-muted-foreground font-normal">
                        ({group.entries.length})
                      </span>
                    </button>
                  </TableCell>
                </TableRow>
                {!isCollapsed &&
                  group.entries.map((entry) => (
                    <EntryTableRow
                      key={entry.id}
                      entry={entry}
                      onEdit={() => onEditEntry(entry)}
                      onDelete={() => onDeleteEntry(entry.id)}
                    />
                  ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
