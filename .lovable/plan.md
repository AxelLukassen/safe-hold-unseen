# Sicherheitsbewertung und Absicherung gegen Injection

## Kurzantwort: Weitgehend ja, mit zwei echten Lücken

Die App hat keine typischen Angriffsflächen für klassische Injection-Angriffe:

- **Kein SQL / keine Datenbank / kein Server** – SQL-Injection ist prinzipbedingt ausgeschlossen, alles läuft lokal im Browser.
- **XSS (eingeschleustes HTML/JavaScript):** Alle Einträge werden über React ausgegeben, das automatisch escaped. Es gibt kein `dangerouslySetInnerHTML` mit Nutzerdaten, kein `eval`, keine fremd steuerbaren Links.
- **Masterpasswort:** existiert nur im RAM, wird beim Sperren verworfen, nie gespeichert.
- **Dateien:** AES-256-GCM mit Argon2id, Manipulation schlägt bei der Entschlüsselung fehl.

## Offene Lücken, die geschlossen werden

### 1. Importierte Einträge werden nicht geprüft (Hauptlücke)
Beim Import werden die Einträge aus der Datei ohne Validierung übernommen. Eine manipulierte oder handgebastelte (Klartext-)Datei könnte Einträge mit falschen Datentypen, fehlenden Feldern oder absurd großen Inhalten einschleusen – das kann die Oberfläche zum Absturz bringen. Es wird eine strikte Strukturprüfung eingeführt: jeder Eintrag muss alle Felder mit den richtigen Typen und Längen haben, sonst wird die Datei mit verständlicher Meldung komplett abgelehnt.

### 2. Fehlende Eingabelimits im Formular
Die Eingabefelder haben keine Längenbegrenzung. Es werden `maxLength`-Attribute ergänzt (Titel/Benutzername/URL: 255 Zeichen, Notizen: 5000, Passwort: 255) und Eingaben werden vor dem Speichern mit `trim()` bereinigt.

### 3. Content-Security-Policy
Der Seite wird eine CSP hinzugefügt, die das Ausführen von inline eingeschleusten Skripten und das Laden fremder Ressourcen unterbindet – eine zusätzliche Schutzschicht gegen XSS, falls doch einmal etwas durchrutscht.

## Bewusst akzeptiert (kein Handlungsbedarf)

- Ein Angreifer mit physischem Zugriff auf den entsperrten Rechner oder den Download-Ordner sieht alles – dagegen hilft keine Software.
- Der Klartext-Export bleibt wie gewünscht unverschlüsselt und damit per Definition offen (die Warnung besteht bereits).
- Brute-Force gegen die Datei ist durch Argon2id (64 MiB, 3 Durchläufe) teuer; der Schutz hängt an der Länge deiner Passphrase.

## Technische Details

- Neu `src/services/entryValidation.ts`: typisierte `validateImportedEntries(entries: unknown): PasswordEntry[]` mit Feldprüfung (String-Typen, Längenlimits, numerische Zeitstempel, id-Generierung falls fehlend); wirft verständlichen Fehler bei ungültigen Einträgen.
- `src/services/vaultFileService.ts`: Klartext-Import-Pfad und (nach Entschlüsselung) `cryptoService.ts` rufen die Validierung auf, bevor Einträge in den State gelangen.
- `src/components/PasswordEntryForm.tsx`: `maxLength`-Konstanten in `src/types/vault.ts` (zentrale Konstanten), `trim()` beim Speichern, leere Pflichtfelder nach Trim blockieren.
- `index.html`: CSP-Meta-Tag (`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:`), angepasst an Vite-Build-Ergebnis.
