import type { PasswordGeneratorOptions } from "@/types/vault";

const CHARS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

export function generatePassword(options: PasswordGeneratorOptions): string {
  let charset = "";
  if (options.uppercase) charset += CHARS.uppercase;
  if (options.lowercase) charset += CHARS.lowercase;
  if (options.numbers) charset += CHARS.numbers;
  if (options.symbols) charset += CHARS.symbols;

  if (!charset) charset = CHARS.lowercase + CHARS.numbers;

  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  return Array.from(array, (val) => charset[val % charset.length]).join("");
}

export function evaluateStrength(password: string): {
  score: number;
  label: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 20) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  const labels = ["Sehr schwach", "Schwach", "Mittel", "Stark", "Sehr stark", "Exzellent", "Maximum"];
  return { score, label: labels[Math.min(score, labels.length - 1)] };
}
