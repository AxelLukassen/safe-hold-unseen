import { useMemo, useState } from "react";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  FileLock,
  ServerOff,
  Timer,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useVault } from "@/context/VaultContext";
import { evaluateStrength } from "@/services/passwordGenerator";
import { MIN_MASTER_PASSWORD_LENGTH } from "@/constants/security";
import { BuildIntegrityInfo } from "@/components/BuildIntegrityInfo";

const MAX_STRENGTH_SCORE = 6;

interface InfoItemProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function InfoItem({ icon, title, children }: InfoItemProps) {
  return (
    <li className="flex gap-3 text-left">
      <div className="mt-0.5 shrink-0 text-primary">{icon}</div>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </li>
  );
}

export function MasterPasswordScreen() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [infoOpen, setInfoOpen] = useState(false);
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
      <div className="w-full max-w-sm space-y-6 text-center">
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

        <Collapsible open={infoOpen} onOpenChange={setInfoOpen}>
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Sicherheit & Funktionsweise (hier klicken)
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  infoOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-4 space-y-4 rounded-xl border border-border bg-card/50 p-4 text-left">
              <InfoItem icon={<FileLock className="h-4 w-4" />} title="Lokale Dateien">
                Dein Tresor wird als verschlüsselte JSON-Datei auf deinem Gerät
                gespeichert. Es gibt keinen Server, keine Cloud und keine Datenbank.
              </InfoItem>
              <InfoItem icon={<Lock className="h-4 w-4" />} title="Zero-Knowledge">
                Das Masterpasswort bleibt ausschließlich im Arbeitsspeicher deines
                Browsers. Es wird nirgends gespeichert, nicht übertragen und bei
                Sperren sofort gelöscht.
              </InfoItem>
              <InfoItem icon={<Shield className="h-4 w-4" />} title="Starke Verschlüsselung">
                AES-256-GCM mit einem 128-Bit-Authentifizierungstag. Der Schlüssel
                wird über Argon2id abgeleitet.
              </InfoItem>
              <InfoItem icon={<Timer className="h-4 w-4" />} title="Automatisches Sperren">
                Nach fünf Minuten Inaktivität, beim Schließen des Tabs oder beim
                Verlassen der Seite werden alle sensiblen Daten aus dem Speicher
                entfernt.
              </InfoItem>
              <InfoItem icon={<ServerOff className="h-4 w-4" />} title="Kein Zurücksetzen">
                Ein vergessenes Masterpasswort kann nicht wiederhergestellt werden.
                Ohne das richtige Passwort ist die Tresordatei nicht lesbar.
              </InfoItem>
              <InfoItem icon={<AlertTriangle className="h-4 w-4" />} title="Vertrauenswürdige Quelle">
                Lade die App nur über HTTPS von einer Quelle, der du vertraust. Wer
                die Dateien auf dem Server verändern kann, könnte theoretisch die
                App manipulieren.
              </InfoItem>
              <BuildIntegrityInfo />
            </ul>
          </CollapsibleContent>
        </Collapsible>

        <p className="text-xs text-muted-foreground">
          Nimm ein langes, einmaliges Masterpasswort (mindestens {MIN_MASTER_PASSWORD_LENGTH}{" "}
          Zeichen), das du nirgends sonst verwendest.{"\u00a0"}
          <br />
          <br />
          Mit deinem Masterpasswort wird dein Tresor verschlüsselt.{"\u00a0"}
          <br />
          <br />
          Ein vergessenes Masterpasswort kann nicht zurückgesetzt werden; ohne es ist die
          Tresordatei nicht lesbar.
          <br />
          <br />
          <br />
          Du könntest deinen Tresor zur Sicherheit im Klartext speichern. Dann kannst du ihn
          wieder importieren, falls du dein Masterpasswort vergessen hast. Aber dann musst du
          sicherstellen, dass dein Klartext-Tresor irgendwo gespeichert oder vielleicht
          ausgedruckt ist, wo niemand außer dir Zugriff hat.
          <br />
          <br />
          <br />
          Kurz und gut:{"\u00a0"}
          <br />
          am sichersten ist es wenn du dein Masterpasswort einfach nicht vergisst!{"\u00a0"}
          <br />
          <br />
        </p>
      </div>
    </div>
  );
}
