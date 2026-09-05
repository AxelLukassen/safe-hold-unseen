import { Eye, EyeOff, Copy, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { useSecretField } from "@/hooks/useSecretField";
import type { PasswordEntry } from "@/types/vault";

interface Props {
  entry: PasswordEntry;
  onEdit: () => void;
  onDelete: () => void;
}

const MASKED_PASSWORD = "••••••••";

export function EntryTableRow({ entry, onEdit, onDelete }: Props) {
  const { isRevealed, toggleReveal, copyToClipboard } = useSecretField();

  return (
    <TableRow>
      <TableCell className="font-medium text-foreground max-w-[10rem] truncate">
        {entry.title}
      </TableCell>
      <TableCell className="hidden sm:table-cell max-w-[12rem] truncate text-muted-foreground">
        {entry.username || "—"}
      </TableCell>
      <TableCell className="hidden lg:table-cell max-w-[14rem] truncate text-muted-foreground">
        {entry.url || "—"}
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex items-center gap-2">
          <code className="font-mono text-sm text-foreground">
            {isRevealed ? entry.password : MASKED_PASSWORD}
          </code>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleReveal}
            title={isRevealed ? "Verbergen" : "Anzeigen"}
          >
            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => void copyToClipboard(entry.password, "Passwort")}
            title="Passwort kopieren"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => void copyToClipboard(entry.password, "Passwort")}
            title="Passwort kopieren"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit} title="Bearbeiten">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onDelete}
            title="Löschen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
