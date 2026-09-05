import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter";
import { useChangeMasterPassword } from "@/hooks/useChangeMasterPassword";

const PASSWORD_MAX_LENGTH = 255;

interface Props {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SecretFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function SecretField({ id, label, value, onChange }: SecretFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="space-y-1.5 text-left">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          maxLength={PASSWORD_MAX_LENGTH}
          autoComplete="off"
          onChange={(event) => onChange(event.target.value)}
          className="pr-10"
        />
        <button
          type="button"
          aria-label={isVisible ? "Passwort verbergen" : "Passwort anzeigen"}
          onClick={() => setIsVisible((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function ChangeMasterPasswordDialog({ isOpen, onOpenChange }: Props) {
  const { isChanging, changePassword } = useChangeMasterPassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmation("");
  };

  const handleOpenChange = (open: boolean) => {
    if (isChanging) return;
    if (!open) resetFields();
    onOpenChange(open);
  };

  const handleSubmit = async () => {
    const success = await changePassword({ currentPassword, newPassword, confirmation });
    if (success) {
      resetFields();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Masterpasswort ändern</DialogTitle>
          <DialogDescription>
            Deine bisherigen Dateien bleiben mit dem alten Passwort verschlüsselt. Nach dem
            Wechsel wird eine neue Datei heruntergeladen – nutze sie ab jetzt für Importe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <SecretField
            id="current-master-password"
            label="Aktuelles Masterpasswort"
            value={currentPassword}
            onChange={setCurrentPassword}
          />
          <div className="space-y-1">
            <SecretField
              id="new-master-password"
              label="Neues Masterpasswort"
              value={newPassword}
              onChange={setNewPassword}
            />
            {newPassword.length > 0 && <PasswordStrengthMeter password={newPassword} />}
          </div>
          <SecretField
            id="confirm-master-password"
            label="Neues Masterpasswort wiederholen"
            value={confirmation}
            onChange={setConfirmation}
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={() => void handleSubmit()} disabled={isChanging} className="w-full">
            {isChanging && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ändern und Datei speichern
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isChanging}
            className="w-full"
          >
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
