import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { generatePassword, evaluateStrength } from "@/services/passwordGenerator";
import { toast } from "@/hooks/use-toast";
import type { PasswordGeneratorOptions } from "@/types/vault";

interface Props {
  onClose: () => void;
}

export function PasswordGenerator({ onClose }: Props) {
  const [options, setOptions] = useState<PasswordGeneratorOptions>({
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const [password, setPassword] = useState(() => generatePassword(options));

  const strength = evaluateStrength(password);

  const regenerate = () => setPassword(generatePassword(options));

  const updateOption = <K extends keyof PasswordGeneratorOptions>(
    key: K,
    value: PasswordGeneratorOptions[K]
  ) => {
    const next = { ...options, [key]: value };
    setOptions(next);
    setPassword(generatePassword(next));
  };

  const copy = async () => {
    await navigator.clipboard.writeText(password);
    toast({ title: "Kopiert", description: "Passwort kopiert. Wird in 10 Sek. gelöscht." });
    setTimeout(() => navigator.clipboard.writeText("").catch(() => {}), 10000);
  };

  const strengthColor =
    strength.score <= 2 ? "bg-destructive" : strength.score <= 4 ? "bg-yellow-500" : "bg-green-500";

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Passwort-Generator</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Input readOnly value={password} className="font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={regenerate}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={copy}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-1">
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
      </DialogContent>
    </Dialog>
  );
}
