import { useState, useRef } from "react";
import {
  Plus, Download, Upload, Lock, Search, FileDown, FileText, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVault } from "@/context/VaultContext";
import { PasswordEntryCard } from "@/components/PasswordEntryCard";
import { PasswordEntryForm } from "@/components/PasswordEntryForm";
import { exportEncrypted, exportPlaintext, importFile } from "@/services/vaultFileService";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PasswordEntry } from "@/types/vault";

export function VaultDashboard() {
  const { state, lock, setEntries, addEntry, updateEntry, getMasterPassword } = useVault();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [showPlaintextWarning, setShowPlaintextWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = state.entries.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.username.toLowerCase().includes(search.toLowerCase()) ||
      e.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleExportEncrypted = async () => {
    const mp = getMasterPassword();
    if (!mp) return;
    try {
      await exportEncrypted(state.entries, mp);
      toast({ title: "Exportiert", description: "Verschlüsselte Datei heruntergeladen." });
    } catch {
      toast({ title: "Fehler", description: "Export fehlgeschlagen.", variant: "destructive" });
    }
  };

  const handleExportPlaintext = async () => {
    try {
      await exportPlaintext(state.entries);
      toast({ title: "Exportiert", description: "Klartext-Datei heruntergeladen." });
    } catch {
      toast({ title: "Fehler", description: "Export fehlgeschlagen.", variant: "destructive" });
    }
    setShowPlaintextWarning(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const mp = getMasterPassword();
    if (!mp) return;
    try {
      const entries = await importFile(file, mp);
      setEntries(entries);
      toast({ title: "Importiert", description: `${entries.length} Einträge geladen.` });
    } catch {
      toast({ title: "Fehler", description: "Import fehlgeschlagen. Falsches Passwort oder ungültige Datei.", variant: "destructive" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
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
            <Button size="sm" variant="outline" onClick={() => setShowGenerator(true)}>
              Erzeugen
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4" />
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
          <div className="space-y-2">
            {filtered.map((entry) => (
              <PasswordEntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => { setEditingEntry(entry); setShowForm(true); }}
              />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <PasswordEntryForm
          entry={editingEntry}
          onSave={handleSaveEntry}
          onClose={() => { setShowForm(false); setEditingEntry(null); }}
        />
      )}

      {showGenerator && (
        <PasswordGenerator onClose={() => setShowGenerator(false)} />
      )}

      <AlertDialog open={showPlaintextWarning} onOpenChange={setShowPlaintextWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Klartext-Export
            </AlertDialogTitle>
            <AlertDialogDescription>
              Alle Passwörter werden unverschlüsselt gespeichert. Diese Datei sollte nur
              für Backups verwendet und sicher aufbewahrt werden.
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
