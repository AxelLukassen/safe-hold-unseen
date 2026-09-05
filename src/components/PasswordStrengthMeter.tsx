import { evaluateStrength, STRENGTH_MAX_SCORE } from "@/services/passwordGenerator";

interface Props {
  password: string;
}

const WEAK_SCORE_THRESHOLD = 2;
const MEDIUM_SCORE_THRESHOLD = 4;

function getStrengthColorClass(score: number): string {
  if (score <= WEAK_SCORE_THRESHOLD) return "bg-destructive";
  if (score <= MEDIUM_SCORE_THRESHOLD) return "bg-yellow-500";
  return "bg-green-500";
}

export function PasswordStrengthMeter({ password }: Props) {
  const strength = evaluateStrength(password);

  return (
    <div className="space-y-1 pt-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Stärke</span>
        <span className="font-medium text-foreground">{strength.label}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getStrengthColorClass(strength.score)}`}
          style={{ width: `${(strength.score / STRENGTH_MAX_SCORE) * 100}%` }}
        />
      </div>
    </div>
  );
}
