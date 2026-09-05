import { useState } from "react";
import { Copy, RefreshCw, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { generatePassword, evaluateStrength } from "@/services/passwordGenerator";
import { toast } from "@/hooks/use-toast";
import type { PasswordEntry, PasswordGeneratorOptions } from "@/types/vault";
import { ENTRY_FIELD_LIMITS } from "@/types/vault";

interface Props {
  entry: PasswordEntry | null;
  existingGroups: string[];
  onSave: (entry: PasswordEntry) => void;
  onClose: () => void;
}

const DEFAULT_OPTIONS: PasswordGeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

export function PasswordEntryForm({ entry, existingGroups, onSave, onClose }: Props) {
  const [form, setForm] = useState({
    title: entry?.title ?? "",
    username: entry?.username ?? "",
    password: entry?.password ?? "",
    url: entry?.url ?? "",
    notes: entry?.notes ?? "",
    group: entry?.group ?? "",
  });

  const [showGenerator, setShowGenerator] = useState(false);
  const [options, setOptions] = useState<PasswordGeneratorOptions>(DEFAULT_OPTIONS);

  const strength = evaluateStrength(form.password);

  const handleSave = () => {
    const cleaned = {
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

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateOption = <K extends keyof PasswordGeneratorOptions>(
    key: K,
    value: PasswordGeneratorOptions[K]
  ) => {
    const next = { ...options, [key]: value };
    setOptions(next);
    setForm((prev) => ({ ...prev, password: generatePassword(next) }));
  };

  const regenerate = () => {
    setForm((prev) => ({ ...prev, password: generatePassword(options) }));
  };

  const copyPassword = async () => {
    if (!form.password) return;
    await navigator.clipboard.writeText(form.password);
    toast({ title: "Kopiert", description: "Passwort kopiert. Wird in 1 Min. gelöscht." });
    setTimeout(() => navigator.clipboard.writeText("").catch(() => {}), 60000);
  };

  const strengthColor =
    strength.score <= 2 ? "bg-destructive" : strength.score <= 4 ? "bg-yellow-500" : "bg-green-500";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? "Eintrag bearbeiten" : "Neuer Eintrag"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input id="title" value={form.title} maxLength={ENTRY_FIELD_LIMITS.title} onChange={(e) => update("title", e.target.value)} placeholder="z.B. Gmail" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Benutzername</Label>
            <Input id="username" value={form.username} maxLength={ENTRY_FIELD_LIMITS.username} onChange={(e) => update("username", e.target.value)} placeholder="user@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort *</Label>
            <div className="flex items-center gap-2">
              <Input
                id="password"
                value={form.password}
                maxLength={ENTRY_FIELD_LIMITS.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Passwort"
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={copyPassword} disabled={!form.password} title="Kopieren">
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant={showGenerator ? "default" : "outline"}
                size="icon"
                onClick={() => {
                  if (!showGenerator) {
                    setForm((prev) => ({ ...prev, password: generatePassword(options) }));
                  }
                  setShowGenerator((v) => !v);
                }}
                title="Generator ein-/ausblenden"
              >
                <Wand2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stärke</span>
                <span className="font-medium text-foreground">{strength.label}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${strengthColor}`}
                  style={{ width: `${(strength.score / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {showGenerator && (
            <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Input readOnly value={form.password} className="font-mono text-sm flex-1" />
                <Button variant="outline" size="icon" onClick={regenerate} title="Neu generieren">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Label>Länge</Label>
                  <span className="font-mono text-foreground">{options.length}</span>
                </div>
                <Slider
                  value={[options.length]}
                  onValueChange={([v]) => updateOption("length", v)}
                  min={8}
                  max={64}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                {([
                  ["uppercase", "Großbuchstaben (A-Z)"],
                  ["lowercase", "Kleinbuchstaben (a-z)"],
                  ["numbers", "Zahlen (0-9)"],
                  ["symbols", "Sonderzeichen (!@#...)"],
                ] as const).map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label className="text-sm">{label}</Label>
                    <Switch
                      checked={options[key]}
                      onCheckedChange={(v) => updateOption(key, v)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" value={form.url} maxLength={ENTRY_FIELD_LIMITS.url} onChange={(e) => update("url", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group">Gruppe</Label>
            <Input
              id="group"
              list="entry-group-options"
              value={form.group}
              maxLength={ENTRY_FIELD_LIMITS.group}
              onChange={(e) => update("group", e.target.value)}
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
            <Textarea id="notes" value={form.notes} maxLength={ENTRY_FIELD_LIMITS.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={!form.title.trim() || !form.password}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
