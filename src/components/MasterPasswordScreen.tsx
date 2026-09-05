import { useMemo, useState } from "react";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVault } from "@/context/VaultContext";
import { evaluateStrength } from "@/services/passwordGenerator";

const MIN_MASTER_PASSWORD_LENGTH = 12;
const MAX_STRENGTH_SCORE = 6;

export function MasterPasswordScreen() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { unlock } = useVault();

  const strength = useMemo(() => evaluateStrength(password), [password]);
  const strengthPercent = Math.round((strength.score / MAX_STRENGTH_SCORE) * 100);

  const handleUnlock = () => {
    if (password.length < MIN_MASTER_PASSWORD_LENGTH) {
      setError(
        `Das Masterpasswort muss mindestens ${MIN_MASTER_PASSWORD_LENGTH} Zeichen lang sein.`
      );
      return;
    }
    unlock(password);
    setPassword("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleUnlock();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SecureVault
          </h1>
          <p className="text-sm text-muted-foreground">
            Gib dein Masterpasswort ein, um fortzufahren
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Masterpasswort"
              value={password}
              maxLength={255}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {password.length > 0 && (
            <div className="space-y-1 text-left">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${strengthPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Stärke: {strength.label}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleUnlock} className="w-full">
            Entsperren
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Nimm eine lange, einmalige Passphrase (mindestens {MIN_MASTER_PASSWORD_LENGTH}{" "}
          Zeichen), die du nirgends sonst verwendest. Alle Daten bleiben lokal auf deinem
          Gerät – kein Server, keine Cloud.
        </p>
      </div>
    </div>
  );
}
