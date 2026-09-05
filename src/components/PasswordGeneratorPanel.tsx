import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PASSWORD_LENGTH_MAX, PASSWORD_LENGTH_MIN } from "@/services/passwordGenerator";
import type { PasswordGeneratorOptions } from "@/types/vault";

interface Props {
  password: string;
  options: PasswordGeneratorOptions;
  onOptionChange: <K extends keyof PasswordGeneratorOptions>(
    key: K,
    value: PasswordGeneratorOptions[K]
  ) => void;
  onRegenerate: () => void;
}

const CHARSET_TOGGLES = [
  ["uppercase", "Großbuchstaben (A-Z)"],
  ["lowercase", "Kleinbuchstaben (a-z)"],
  ["numbers", "Zahlen (0-9)"],
  ["symbols", "Sonderzeichen (!@#...)"],
] as const;

export function PasswordGeneratorPanel({
  password,
  options,
  onOptionChange,
  onRegenerate,
}: Props) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Input readOnly value={password} className="font-mono text-sm flex-1" />
        <Button variant="outline" size="icon" onClick={onRegenerate} title="Neu generieren">
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
          onValueChange={([value]) => onOptionChange("length", value)}
          min={PASSWORD_LENGTH_MIN}
          max={PASSWORD_LENGTH_MAX}
          step={1}
        />
      </div>

      <div className="space-y-3">
        {CHARSET_TOGGLES.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <Label className="text-sm">{label}</Label>
            <Switch
              checked={options[key]}
              onCheckedChange={(isChecked) => onOptionChange(key, isChecked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
