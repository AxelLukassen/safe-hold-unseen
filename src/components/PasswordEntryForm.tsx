import { useState } from "react";
import { Copy, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { PasswordGeneratorPanel } from "@/components/PasswordGeneratorPanel";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { useSecretField } from "@/hooks/useSecretField";
import { generatePassword } from "@/services/passwordGenerator";
import type { PasswordEntry, PasswordGeneratorOptions } from "@/types/vault";
import { ENTRY_FIELD_LIMITS } from "@/types/vault";

interface Props {
  entry: PasswordEntry | null;
  existingGroups: string[];
  onSave: (entry: PasswordEntry) => void;
  onClose: () => void;
}

type EntryFormFields = Pick<
  PasswordEntry,
  "title" | "username" | "password" | "url" | "notes" | "group"
>;

const DEFAULT_OPTIONS: PasswordGeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

export function PasswordEntryForm({ entry, existingGroups, onSave, onClose }: Props) {
  const [form, setForm] = useState<EntryFormFields>({
    title: entry?.title ?? "",
    username: entry?.username ?? "",
    password: entry?.password ?? "",
    url: entry?.url ?? "",
    notes: entry?.notes ?? "",
    group: entry?.group ?? "",
  });

  const [isGeneratorVisible, setIsGeneratorVisible] = useState(false);
  const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_OPTIONS);
  const { copyToClipboard } = useSecretField();

  const updateField = (field: keyof EntryFormFields, value: string) =>
    setForm((previous) => ({ ...previous, [field]: value }));

  const setGeneratedPassword = (nextOptions: PasswordGeneratorOptions) =>
    setForm((previous) => ({ ...previous, password: generatePassword(nextOptions) }));

  const handleOptionChange = <K extends keyof PasswordGeneratorOptions>(
    key: K,
    value: PasswordGeneratorOptions[K]
  ) => {
    const nextOptions = { ...options, [key]: value };
    setOptions(nextOptions);
    setGeneratedPassword(nextOptions);
  };

  const handleToggleGenerator = () => {
    if (!isGeneratorVisible) setGeneratedPassword(options);
    setIsGeneratorVisible((previous) => !previous);
  };

  const handleSave = () => {
    const cleaned: EntryFormFields = {
      title: form.title.trim(),
      username: form.username.trim(),
      password: form.password,
      url: form.url.trim(),
      notes: form.notes.trim(),
      group: form.group.trim(),
    };
    if (!cleaned.title || !cleaned.password) return;

    const now = Date.now();
    onSave({
      id: entry?.id ?? crypto.randomUUID(),
      ...cleaned,
      createdAt: entry?.createdAt ?? now,
      updatedAt: now,
    });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Eintrag bearbeiten" : "Neuer Eintrag"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={form.title}
              maxLength={ENTRY_FIELD_LIMITS.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="z.B. Gmail"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Benutzername</Label>
            <Input
              id="username"
              value={form.username}
              maxLength={ENTRY_FIELD_LIMITS.username}
              onChange={(event) => updateField("username", event.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="password"
                value={form.password}
                maxLength={ENTRY_FIELD_LIMITS.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Passwort"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => void copyToClipboard(form.password, "Passwort")}
                disabled={!form.password}
                title="Kopieren"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant={isGeneratorVisible ? "default" : "outline"}
                size="icon"
                onClick={handleToggleGenerator}
                title="Generator ein-/ausblenden"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>

            <PasswordStrengthMeter password={form.password} />
          </div>

          {isGeneratorVisible && (
            <PasswordGeneratorPanel
              password={form.password}
              options={options}
              onOptionChange={handleOptionChange}
              onRegenerate={() => setGeneratedPassword(options)}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              value={form.url}
              maxLength={ENTRY_FIELD_LIMITS.url}
              onChange={(event) => updateField("url", event.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group">Gruppe</Label>
            <Input
              id="group"
              list="entry-group-options"
              value={form.group}
              maxLength={ENTRY_FIELD_LIMITS.group}
              onChange={(event) => updateField("group", event.target.value)}
              placeholder="z.B. Arbeit (leer = Ohne Gruppe)"
            />
            <datalist id="entry-group-options">
              {existingGroups.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={form.notes}
              maxLength={ENTRY_FIELD_LIMITS.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={!form.title.trim() || !form.password}>
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
