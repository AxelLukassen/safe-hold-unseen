# Plan: Sicherheits-Info auf der Startseite

## Ziel
Auf dem Masterpasswort-Bildschirm (Startseite) soll ein ausklappbarer, minimalistischer Info-Bereich erklären, wie SecureVault funktioniert und warum es sicher ist. Das erhöht das Vertrauen, besonders wenn die App später von einem VPS geladen wird.

## Inhalt des Info-Bereichs
Der Bereich enthält kurze, verständliche Punkte:
- **Lokale Dateien**: Tresor wird als verschlüsselte Datei auf dem Gerät gespeichert, nicht auf einem Server.
- **Zero-Knowledge**: Das Masterpasswort bleibt im RAM und wird nirgends gespeichert oder übertragen.
- **Verschlüsselung**: AES-256-GCM mit Argon2id-Schlüsselableitung.
- **RAM-only**: Nach Sperren, Tab-Schließen oder 5 Minuten Inaktivität werden sensible Daten aus dem Speicher entfernt.
- **Kein Zurücksetzen**: Ein vergessenes Masterpasswort kann nicht wiederhergestellt werden – die Datei ist dann nicht mehr lesbar.
- **Hosting-Hinweis**: Lade die App nur von einer vertrauenswürdigen Quelle (HTTPS) herunter; der Server könnte theoretisch die Dateien verändern.

## UI-Umsetzung
- Einführung eines Collapsible/Accordion-Blocks unterhalb des Entsperren-Buttons in `MasterPasswordScreen.tsx`.
- Verwendung der bestehenden `Collapsible`- oder `Accordion`-Komponente aus `@/components/ui`.
- Überschrift: „Sicherheit & Funktionsweise".
- Icons passend zu den Punkten (z. B. `Shield`, `FileLock`, `ServerOff`, `Lock`).
- Responsive: volle Breite innerhalb der max-w-sm Card, Text klein und gut lesbar.
- Keine Änderung am Verhalten des Entsperrens oder der Verschlüsselung.

## Betroffene Dateien
- `src/components/MasterPasswordScreen.tsx`: Info-Bereich einbauen.
- Keine neuen Abhängigkeiten; bestehende UI-Komponenten und Lucide-Icons verwenden.

## Nicht im Scope
- Keine Änderung an Crypto, Dateiformat, Import/Export oder Auto-Lock.
- Keine separate Seite; der Hinweis bleibt auf dem Startbildschirm.
- Keine Server-Konfiguration (HTTPS, HSTS, SRI) – das bleibt VPS-Setup.
