import { useState, useRef } from "react";
import {
  Plus, Download, Upload, Lock, Search, FileDown, FileText, AlertTriangle, Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVault } from "@/context/VaultContext";
import { EntryTable } from "@/components/EntryTable";
import { PasswordEntryForm } from "@/components/PasswordEntryForm";
import { LockWarningDialog } from "@/components/LockWarningDialog";
import { useAutoLockSave } from "@/hooks/useAutoLockSave";
import { exportEncrypted, exportPlaintext, importFile } from "@/services/vaultFileService";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { collectGroupNames } from "@/services/entryGrouping";
import type { PasswordEntry } from "@/types/vault";

export function VaultDashboard() {
  const { state, lock, setEntries, addEntry, updateEntry, deleteEntry, markSaved, getMasterPassword } = useVault();
  const autoLock = useAutoLockSave();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<PasswordEntry | null>(null);
  const [showPlaintextWarning, setShowPlaintextWarning] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = state.entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.url.toLowerCase().includes(search.toLowerCase()) ||
      e.group.toLowerCase().includes(search.toLowerCase())
  );

  const existingGroups = collectGroupNames(state.entries);

  const getErrorMessage = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

  const handleExportEncrypted = async () => {
    const mp = getMasterPassword();
    if (!mp) return;
    setIsBusy(true);
    try {
      await exportEncrypted(state.entries, mp);
      markSaved();
      toast({ title: "Exportiert", description: "Verschlüsselte Datei heruntergeladen." });
    } catch (error) {
      toast({
        title: "Fehler",
        description: getErrorMessage(error, "Export fehlgeschlagen."),
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleExportPlaintext = async () => {
    setShowPlaintextWarning(false);
    setIsBusy(true);
    try {
      await exportPlaintext(state.entries);
      toast({ title: "Exportiert", description: "Klartext-Datei heruntergeladen." });
    } catch (error) {
      toast({
        title: "Fehler",
        description: getErrorMessage(error, "Export fehlgeschlagen."),
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mp = getMasterPassword();
    if (!mp) return;
    setIsBusy(true);
    try {
      const entries = await importFile(file, mp);
      setEntries(entries);
      toast({ title: "Importiert", description: `${entries.length} Einträge geladen.` });
    } catch (error) {
      toast({
        title: "Fehler",
        description: getErrorMessage(error, "Import fehlgeschlagen. Ungültige Datei."),
        variant: "destructive",
      });
    } finally {
      setIsBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };


  const handleSaveEntry = (entry: PasswordEntry) => {
    if (editingEntry) {
      updateEntry({ ...entry, updatedAt: Date.now() });
    } else {
      addEntry(entry);
    }
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleRequestDelete = (id: string) => {
    const entry = state.entries.find((item) => item.id === id);
    if (entry) setDeletingEntry(entry);
  };

  const handleConfirmDelete = () => {
    if (!deletingEntry) return;
    deleteEntry(deletingEntry.id);
    setDeletingEntry(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">SecureVault</h1>
          <Button variant="ghost" size="icon" onClick={lock} title="Sperren">
            <Lock className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Suchen..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" onClick={() => { setEditingEntry(null); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Neu
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBusy}
              title="Importieren"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" disabled={isBusy} title="Exportieren">
                  {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportEncrypted}>
                  <FileDown className="h-4 w-4 mr-2" /> Verschlüsselt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowPlaintextWarning(true)}>
                  <FileText className="h-4 w-4 mr-2" /> Klartext
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Lock className="h-12 w-12 mb-4 opacity-30" />
            <p className="text-sm">
              {state.entries.length === 0
                ? "Noch keine Einträge. Erstelle einen oder importiere eine Datei."
                : "Keine Ergebnisse gefunden."}
            </p>
          </div>
        ) : (
          <EntryTable
            entries={filtered}
            onEditEntry={(entry) => { setEditingEntry(entry); setShowForm(true); }}
            onDeleteEntry={deleteEntry}
          />
        )}
      </main>

      {showForm && (
        <PasswordEntryForm
          entry={editingEntry}
          existingGroups={existingGroups}
          onSave={handleSaveEntry}
          onClose={() => { setShowForm(false); setEditingEntry(null); }}
        />
      )}

      <LockWarningDialog
        isOpen={autoLock.isWarningOpen}
        secondsLeft={autoLock.secondsLeft}
        isSaving={autoLock.isSaving}
        errorMessage={autoLock.errorMessage}
        hasUnsavedChanges={state.hasUnsavedChanges}
        onSaveAndLock={() => void autoLock.handleSaveAndLock()}
        onStayUnlocked={autoLock.handleStayUnlocked}
        onLockNow={autoLock.handleLockNow}
      />

      <AlertDialog open={showPlaintextWarning} onOpenChange={setShowPlaintextWarning}>
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
            <AlertDialogAction onClick={handleExportPlaintext}>
              Trotzdem exportieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
