import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LockWarningDialogProps {
  isOpen: boolean;
  secondsLeft: number;
  isSaving: boolean;
  errorMessage: string | null;
  hasUnsavedChanges: boolean;
  onSaveAndLock: () => void;
  onStayUnlocked: () => void;
  onLockNow: () => void;
}

export function LockWarningDialog({
  isOpen,
  secondsLeft,
  isSaving,
  errorMessage,
  hasUnsavedChanges,
  onSaveAndLock,
  onStayUnlocked,
  onLockNow,
}: LockWarningDialogProps) {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Tresor wird gleich gesperrt
          </AlertDialogTitle>
          <AlertDialogDescription>
            Keine Aktivität erkannt. In{" "}
            <span className="font-semibold text-foreground">{secondsLeft} Sekunden</span> wird
            der Tresor gesperrt und dein Masterpasswort aus dem Speicher entfernt.
            {hasUnsavedChanges
              ? " Dein aktueller Stand wird vorher als neue verschlüsselte Datei gespeichert – frühere Dateien bleiben erhalten."
              : " Es gibt keine ungespeicherten Änderungen."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage && (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}

        <AlertDialogFooter className="gap-2">
          <Button variant="ghost" onClick={onLockNow} disabled={isSaving}>
            Ohne Speichern sperren
          </Button>
          <Button variant="outline" onClick={onStayUnlocked} disabled={isSaving}>
            Weiterarbeiten
          </Button>
          <Button onClick={onSaveAndLock} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Jetzt speichern und sperren
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
