# Auto-Sperre mit Vorwarnung und versioniertem Speichern

## Was passiert künftig

Nach 5 Minuten ohne Aktivität wird der Tresor gesperrt. Damit dabei keine Änderungen verloren gehen, erscheint 30 Sekunden vorher ein Hinweis mit Countdown und drei Möglichkeiten:

- **Jetzt speichern und sperren** – lädt eine neue verschlüsselte Datei herunter und sperrt danach sofort.
- **Weiterarbeiten** – der Countdown wird abgebrochen, die 5 Minuten starten neu.
- **Ohne Speichern sperren** – sperrt sofort.

Reagiert niemand, wird nach Ablauf des Countdowns automatisch gespeichert (nur wenn es ungespeicherte Änderungen gibt) und danach gesperrt.

## Keine alten Dateien überschreiben

Jeder Speichervorgang erzeugt einen eigenen Dateinamen mit Datum und Uhrzeit, zum Beispiel:

```text
securevault-2026-09-05_121703.json
```

Dadurch bleiben frühere Stände im Download-Ordner erhalten. Auch der manuelle Export nutzt dieses Namensschema.

## Masterpasswort sicher entfernen

Beim Sperren werden Einträge und Masterpasswort aus dem Arbeitsspeicher entfernt (Zustand wird vollständig zurückgesetzt, keine Speicherung in Browser-Speichern). Das gilt für alle Sperrwege: Countdown, Sperren-Knopf, Tab-Wechsel und Schließen des Tabs.

## Technische Umsetzung

- `src/context/VaultContext.tsx`
  - Zwei Timer statt einem: Vorwarnung bei 4:30, Sperre bei 5:00. Konstanten `INACTIVITY_TIMEOUT`, `WARNING_LEAD_TIME`.
  - Neuer Zustand `isLockWarningActive` plus `extendSession()` zum Abbrechen der Warnung.
  - Während die Warnung sichtbar ist, setzen Maus-/Tastatur-Events den Timer **nicht** zurück (sonst ließe sich der Dialog nie beantworten).
  - `hasUnsavedChanges`-Flag, gesetzt bei add/update/delete/import, zurückgesetzt nach erfolgreichem Export.
  - `lock()` überschreibt Masterpasswort-Referenz und setzt den State zurück; zusätzlich `beforeunload`-Handler für Tab-Schließen.
- `src/services/vaultFileService.ts`
  - Helper `buildVaultFilename(prefix)` erzeugt Zeitstempel-Dateinamen; `exportEncrypted`/`exportPlaintext` verwenden ihn. Signaturen bleiben unverändert.
- `src/components/LockWarningDialog.tsx` (neu)
  - Reine Präsentationskomponente: Countdown-Anzeige, drei Aktionen als Props (`onSaveAndLock`, `onStayUnlocked`, `onLockNow`), Ladezustand während der Verschlüsselung, Fehleranzeige.
- `src/hooks/useAutoLockSave.ts` (neu)
  - Bündelt die Logik: Countdown-Tick, Aufruf von `exportEncrypted`, Fehlerbehandlung per Toast, anschließendes Sperren.
- `src/components/VaultDashboard.tsx`
  - Bindet Dialog und Hook ein, sonst unverändert.

Alle Typen bleiben streng typisiert, kein `any`; Verschlüsselung und Dateizugriff bleiben im Service-Layer.
