import { useMemo, useState } from "react";
import { KeyRound, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useVault } from "@/context/VaultContext";
import { EntryTable } from "@/components/EntryTable";
import { VaultToolbar } from "@/components/VaultToolbar";
import { PasswordEntryForm } from "@/components/PasswordEntryForm";
import { LockWarningDialog } from "@/components/LockWarningDialog";
import { DeleteEntryDialog } from "@/components/DeleteEntryDialog";
import { PlaintextExportDialog } from "@/components/PlaintextExportDialog";
import { ChangeMasterPasswordDialog } from "@/components/ChangeMasterPasswordDialog";
import { useAutoLockSave } from "@/hooks/useAutoLockSave";
import { useVaultFileActions } from "@/hooks/useVaultFileActions";
import { collectGroupNames } from "@/services/entryGrouping";
import { filterEntries } from "@/services/entrySearch";
import type { PasswordEntry } from "@/types/vault";

export function VaultDashboard() {
  const { state, lock, addEntry, updateEntry, deleteEntry } = useVault();
  const autoLock = useAutoLockSave();
  const fileActions = useVaultFileActions();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<PasswordEntry | null>(null);
  const [isPlaintextWarningOpen, setIsPlaintextWarningOpen] = useState(false);
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = useState(false);

  const filteredEntries = useMemo(
    () => filterEntries(state.entries, search),
    [state.entries, search]
  );
  const existingGroups = useMemo(() => collectGroupNames(state.entries), [state.entries]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingEntry(null);
  };

  const handleSaveEntry = (entry: PasswordEntry) => {
    if (editingEntry) {
      updateEntry({ ...entry, updatedAt: Date.now() });
    } else {
      addEntry(entry);
    }
    closeForm();
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

  const handleConfirmPlaintextExport = () => {
    setIsPlaintextWarningOpen(false);
    void fileActions.exportPlaintextVault();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">SecureVault</h1>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsPasswordChangeOpen(true)}
              title="Masterpasswort ändern"
            >
              <KeyRound className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={lock} title="Sperren">
              <Lock className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <VaultToolbar
          search={search}
          isBusy={fileActions.isBusy}
          onSearchChange={setSearch}
          onCreateEntry={() => {
            setEditingEntry(null);
            setIsFormOpen(true);
          }}
          onImportFile={(file) => void fileActions.importVaultFile(file)}
          onExportEncrypted={() => void fileActions.exportEncryptedVault()}
          onExportPlaintext={() => setIsPlaintextWarningOpen(true)}
        />

        {filteredEntries.length === 0 ? (
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
            entries={filteredEntries}
            onEditEntry={(entry) => {
              setEditingEntry(entry);
              setIsFormOpen(true);
            }}
            onDeleteEntry={handleRequestDelete}
          />
        )}
      </main>

      {isFormOpen && (
        <PasswordEntryForm
          entry={editingEntry}
          existingGroups={existingGroups}
          onSave={handleSaveEntry}
          onClose={closeForm}
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

      <DeleteEntryDialog
        entryTitle={deletingEntry?.title ?? null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingEntry(null)}
      />

      <PlaintextExportDialog
        isOpen={isPlaintextWarningOpen}
        onOpenChange={setIsPlaintextWarningOpen}
        onConfirm={handleConfirmPlaintextExport}
      />

      <ChangeMasterPasswordDialog
        isOpen={isPasswordChangeOpen}
        onOpenChange={setIsPasswordChangeOpen}
      />
    </div>
  );
}
