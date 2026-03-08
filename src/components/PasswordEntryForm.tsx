import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type { PasswordEntry } from "@/types/vault";

interface Props {
  entry: PasswordEntry | null;
  onSave: (entry: PasswordEntry) => void;
  onClose: () => void;
}

export function PasswordEntryForm({ entry, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    title: entry?.title ?? "",
    username: entry?.username ?? "",
    password: entry?.password ?? "",
    url: entry?.url ?? "",
    notes: entry?.notes ?? "",
  });

  const handleSave = () => {
    if (!form.title || !form.password) return;
    const now = Date.now();
    onSave({
      id: entry?.id ?? crypto.randomUUID(),
      ...form,
      createdAt: entry?.createdAt ?? now,
      updatedAt: now,
    });
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "Eintrag bearbeiten" : "Neuer Eintrag"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="z.B. Gmail" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Benutzername</Label>
            <Input id="username" value={form.username} onChange={(e) => update("username", e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort *</Label>
            <Input id="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Passwort" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" value={form.url} onChange={(e) => update("url", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={!form.title || !form.password}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
