# Plan: Build-Integrität, Lizenz und GitHub-Veröffentlichung

## Ziel
Nutzer sollen prüfen können, dass die ausgelieferte App unverändert aus dem vertrauenswürdigen Quellcode stammt. Dazu werden Build-Hashes erzeugt und in der App angezeigt. Das Projekt bekommt eine öffentliche Lizenz und wird auf GitHub veröffentlicht.

## Schritte

### 1. Build-Hash-Skript (`scripts/build-hashes.sh` oder Node-Skript)
- Läuft nach `npm run build` (als `postbuild`-Skript in `package.json`).
- Berechnet SHA-256 über alle Dateien in `dist/` (HTML, JS, CSS, WASM).
- Erzeugt:
  - `dist/SHA256SUMS` — Referenz-Hashes aller ausgelieferten Dateien.
  - `dist/build-id.json` — Build-ID (z. B. Git-Commit-Hash oder Zeitstempel-Hash) plus Hash der `SHA256SUMS` selbst.
- Vite-Config bindet die `build-id.json` in den Build ein, damit die App sie lesen kann.

### 2. Build-ID in der App anzeigen
- Im ausklappbaren Info-Bereich „Sicherheit & Funktionsweise" auf dem Masterpasswort-Screen wird ein neuer Punkt „Build-Integrität" ergänzt:
  - Anzeige der Build-ID (gekürzt, mit Copy-Button).
  - Kurzer Hinweis, wie man prüft: Hashes der ausgelieferten Dateien mit den im GitHub-Repo veröffentlichten `SHA256SUMS` vergleichen.
  - Link zum GitHub-Repo (konfigurierbar über Konstante).
- Kein Einfluss auf Entsperren, Verschlüsselung oder Auto-Lock.

### 3. Lizenz
- Neue Datei `LICENSE` mit der **MIT-Lizenz** (Standard für öffentliche Open-Source-Projekte; permissiv, kurz, verständlich).
- Copyright-Zeile: Jahr 2026, Platzhalter-Name wird auf den GitHub-Account-Namen gesetzt bzw. ist anpassbar.
- README.md wird ergänzt: Projektbeschreibung von SecureVault, Sicherheitsmodell, Hinweis auf Hash-Verifikation, Lizenzverweis.

### 4. GitHub-Veröffentlichung
- Die eigentliche Verbindung erfolgt durch den Nutzer im Lovable-Editor: Plus-Menü → GitHub → Connect project → Repository erstellen.
- Danach synchronisiert Lovable den Code automatisch in beide Richtungen.
- Das Repo wird mit den vorbereiteten Dateien (LICENSE, README, Hash-Skript) angelegt.
- Hinweis: Sichtbarkeit (public) wird beim Erstellen des Repos in GitHub gewählt; die MIT-Lizenz passt zu einem öffentlichen Repo.

## Betroffene Dateien
- `package.json` (neu: `postbuild`-Skript)
- `scripts/build-hashes.mjs` (neu)
- `vite.config.ts` (build-id einbinden, falls nötig)
- `src/components/MasterPasswordScreen.tsx` (Info-Punkt Build-Integrität)
- `src/constants/security.ts` oder neue Konstante (GitHub-Repo-URL)
- `LICENSE` (neu), `README.md` (überarbeitet)

## Nicht im Scope
- Reproducible Builds im strengen Sinne (bit-identische Builds über Umgebungen hinweg) — Hinweis in README, dass Hashes je nach Build-Umgebung abweichen können.
- Keine Änderung an Verschlüsselung, Dateiformat oder Vault-Logik.
- Das Erstellen/Verbinden des GitHub-Repos selbst (manueller Schritt durch den Nutzer im Editor).

## Verifikation
- Build läuft inklusive Hash-Skript fehlerfrei; `dist/SHA256SUMS` und `build-id.json` existieren.
- Browser-Test: Info-Bereich zeigt Build-ID mit Copy-Button an.
