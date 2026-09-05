import { AlertTriangle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  entryTitle: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteEntryDialog({ entryTitle, onConfirm, onCancel }: Props) {
  return (
    <AlertDialog
      open={entryTitle !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Eintrag löschen?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Der Eintrag{" "}
            <span className="font-semibold text-foreground">{entryTitle}</span>{" "}
            wird endgültig aus dem Tresor entfernt. Diese Aktion kann nicht
            rückgängig gemacht werden – nur eine zuvor exportierte Datei kann
            ihn wiederherstellen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Endgültig löschen
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
