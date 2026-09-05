import { useState } from "react";
import { Eye, EyeOff, Copy, Pencil, Trash2, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useVault } from "@/context/VaultContext";
import { toast } from "@/hooks/use-toast";
import type { PasswordEntry } from "@/types/vault";

interface Props {
  entry: PasswordEntry;
  onEdit: () => void;
}

export function PasswordEntryCard({ entry, onEdit }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const { deleteEntry } = useVault();

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Kopiert", description: `${label} in die Zwischenablage kopiert.` });
    // Auto-clear clipboard after 1 minute
    setTimeout(() => {
      navigator.clipboard.writeText("").catch(() => {});
    }, 60000);
  };

  const handleShowPassword = () => {
    setShowPassword(true);
    setTimeout(() => setShowPassword(false), 5000);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-medium text-foreground truncate">{entry.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{entry.username}</span>
          </div>
          {entry.url && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Globe className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{entry.url}</span>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <code className="text-sm font-mono text-foreground">
              {showPassword ? entry.password : "••••••••"}
            </code>
            <button
              onClick={handleShowPassword}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => copyToClipboard(entry.password, "Passwort")}
              className="text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => deleteEntry(entry.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
