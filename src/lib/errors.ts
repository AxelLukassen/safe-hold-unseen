/**
 * Wandelt einen unbekannten Fehlerwert in eine für Nutzer lesbare Meldung um.
 */
export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
