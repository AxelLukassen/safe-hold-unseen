import { AlertTriangle } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
}

export function PlaintextExportDialog({ isOpen, onOpenChange, onConfirm }: Props) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Klartext-Export
          </AlertDialogTitle>
          <AlertDialogDescription>
            Achtung: Diese Datei enthält alle Passwörter vollständig lesbar – ohne
            Verschlüsselung und ohne Schutz durch dein Masterpasswort. Wer die Datei in
            die Hände bekommt, hat sofort Zugriff auf alle Zugänge. Nutze sie nur kurzzeitig
            (z. B. zum Wechsel zu einem anderen Programm), speichere sie nicht in Cloud-Ordnern
            und lösche sie danach sicher. Für Backups ist der verschlüsselte Export die
            richtige Wahl.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Trotzdem exportieren</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
