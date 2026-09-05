# Code-Review: notwendige Refactorings

Die App funktioniert, aber an einigen Stellen weicht sie von den Projekt-Guidelines ab. Nichts davon ist ein Sicherheitsproblem – es geht um Wartbarkeit. Das Verhalten der App bleibt exakt gleich.

## Befunde

**1. Dashboard macht zu viel (292 Zeilen)**
Die Dashboard-Komponente enthält gleichzeitig: Suchleiste, Werkzeugleiste, Tabelle, Formular, zwei Warndialoge sowie die komplette Import-/Export-Ablaufsteuerung mit Fehlerbehandlung. Laut Guideline gehört Fachlogik nicht in UI-Komponenten.

**2. Doppelte Logik**
- Passwort kopieren ist im Formular noch einmal von Hand gebaut, obwohl es dafür bereits den gemeinsamen Baustein gibt (inkl. Fehlerbehandlung, die im Formular fehlt).
- Fehlermeldungs-Auswertung existiert doppelt (Dashboard und Auto-Sperre).

**3. Formular zu groß (226 Zeilen)**
Der Passwort-Generator (Regler, Schalter, Stärkeanzeige) steckt mitten im Eintragsformular.

**4. Magische Werte im Code**
Fest eingetragene Zahlen: Generator-Länge 8–64, Stärke-Maximum 6, Zwischenablage-Timeout 60000, Farb-Schwellen der Stärkeanzeige.

**5. Typisierung**
Die Feld-Aktualisierung im Formular akzeptiert einen beliebigen String als Feldnamen statt der erlaubten Feldnamen. (`any` wird nirgends verwendet – das ist erfüllt.)

**6. Kleinigkeiten**
- Suche berechnet den Suchbegriff pro Eintrag viermal neu und läuft bei jedem Render ohne `useMemo`.
- `clearSensitiveString` ist eine Funktion ohne Wirkung und ohne Aufrufer – toter Code.
- Abkürzungen `mp`, `e` für Fehlerobjekte statt sprechender Namen.

## Geplante Änderungen

**Neue Dateien**
- `src/hooks/useVaultFileActions.ts` – Import/Export/Klartext-Export inkl. Lade- und Fehlerzustand, aus dem Dashboard herausgelöst.
- `src/services/entrySearch.ts` – reine Filterfunktion `filterEntries(entries, query)`.
- `src/lib/errors.ts` – `toErrorMessage(error, fallback)`.
- `src/components/VaultToolbar.tsx` – Suche, Neu, Import, Export-Menü.
- `src/components/DeleteEntryDialog.tsx`, `src/components/PlaintextExportDialog.tsx` – die beiden Warndialoge.
- `src/components/PasswordGeneratorPanel.tsx` – Generator-Block aus dem Formular.
- `src/components/PasswordStrengthMeter.tsx` – Stärkeanzeige inkl. Farblogik.

**Anpassungen**
- `VaultDashboard.tsx` schrumpft auf Zusammenbau plus Auswahl-/Dialog-State (~90 Zeilen).
- `PasswordEntryForm.tsx` schrumpft auf die Formularfelder (~110 Zeilen), nutzt `useSecretField` zum Kopieren und typisiert die Feldnamen über `keyof`.
- `useAutoLockSave.ts` nutzt `toErrorMessage`.
- Konstanten (Generator-Grenzen, Stärke-Maximum, Zwischenablage-Timeout) wandern nach `src/types/vault.ts` bzw. `src/services/passwordGenerator.ts`.
- `clearSensitiveString` in `cryptoService.ts` entfällt.

**Bewusst unverändert**
Verschlüsselung, Dateiformat, Validierung, Auto-Sperre, Layout und Texte. Keine neuen Abhängigkeiten.

## Prüfung
Typecheck und Build, anschließend ein Durchlauf im Browser: Eintrag anlegen mit Generator, kopieren, bearbeiten, löschen mit Sicherheitsabfrage, verschlüsselt exportieren und wieder importieren.
