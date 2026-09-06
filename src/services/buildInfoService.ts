/**
 * Liest die Build-Integritätsinformationen, die das Post-Build-Skript
 * (scripts/build-hashes.mjs) als /build-id.json ausliefert.
 * Im Dev-Modus existiert die Datei nicht – dann wird null zurückgegeben.
 */

export interface BuildInfo {
  buildId: string;
  builtAt: string;
  algorithm: string;
}

export async function fetchBuildInfo(): Promise<BuildInfo | null> {
  try {
    const response = await fetch("/build-id.json", { cache: "no-store" });
    if (!response.ok) return null;
    const data: unknown = await response.json();
    if (!isBuildInfo(data)) return null;
    return data;
  } catch {
    return null;
  }
}

function isBuildInfo(value: unknown): value is BuildInfo {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.buildId === "string" &&
    typeof candidate.builtAt === "string" &&
    typeof candidate.algorithm === "string"
  );
}
