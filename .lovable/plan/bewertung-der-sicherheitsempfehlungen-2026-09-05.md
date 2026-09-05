# Bewertung der Sicherheitsempfehlungen

Kurzfassung: Die meisten Punkte sind fachlich richtig, aber nur zwei davon sind in dieser App wirklich offene Lücken. Der Rest ist bereits erfüllt oder bewusst so gebaut.

## Was heute schon stimmt

- **Authentifizierte Verschlüsselung**: Die App nutzt bereits AES-256-GCM über die Web Crypto API. Das 128-Bit-Authentifizierungs-Tag ist dort Standard und automatisch enthalten.
- **Neuer IV pro Verschlüsselung**: Bei jedem Export werden ein neues 12-Byte-IV und ein neues 16-Byte-Salt zufällig erzeugt. Keine Wiederverwendung.
- **Keine Eigenentwicklung**: Es wird ausschließlich die im Browser eingebaute, geprüfte Krypto-Schnittstelle verwendet.
- **Prüfsumme verrät nichts**: Die SHA-256-Prüfsumme wird über die *verschlüsselten* Daten gebildet, nicht über den Klartext. Sie ersetzt das GCM-Tag nicht und soll das auch nicht – sie erkennt nur beschädigte Dateien, bevor überhaupt entschlüsselt wird, und liefert eine verständliche Fehlermeldung statt eines kryptischen Absturzes.
- **Langes, einmaliges Masterpasswort**: Das ist eine Nutzerempfehlung, kein Code-Thema. Sinnvoll als Hinweis in der Oberfläche.

## Was tatsächlich verbessert werden sollte

### 1. Metadaten mitschützen (empfohlen, klein)
Version, Verfahren und die Ableitungsparameter werden aktuell nicht mitgeschützt. Sie werden künftig als „mitauthentifizierte Zusatzdaten“ an die Verschlüsselung gehängt. Eine nachträgliche Änderung dieser Werte in der Datei führt dann zu einer klaren Fehlermeldung.

### 2. Warnung bei Klartext-Export (empfohlen, klein)
Beim Klartext-Export steckt die Prüfsumme über den unverschlüsselten Einträgen in der Datei. Das ist unkritisch, weil die Datei ohnehin komplett im Klartext ist – die Datei selbst bleibt aber der gefährlichste Punkt. Die bestehende Warnung wird deutlicher.

### 3. Stärkeanzeige und Mindestlänge fürs Masterpasswort (empfohlen, klein)
Beim Entsperren wird die Länge geprüft und eine Stärkeanzeige plus Hinweis auf eine lange Passphrase angezeigt.

### 4. Argon2id statt PBKDF2 (sinnvoll, aber mit Preis)
Aktuell: PBKDF2 mit 600.000 Runden – das ist die offizielle OWASP-Empfehlung und keineswegs unsicher. Argon2id (64 MiB, 3 Durchläufe) ist gegen Spezialhardware trotzdem klar besser.

Nachteile, die vorher klar sein müssen:
- Es wird eine zusätzliche Bibliothek benötigt (Argon2 ist nicht im Browser eingebaut).
- Das Entsperren dauert spürbar länger (rund 0,5–1,5 Sekunden) und braucht 64 MiB Speicher; auf älteren Handys kann das eng werden.
- **Bereits exportierte Dateien** müssen weiterhin lesbar bleiben. Deshalb: Neue Exporte in Version 2 mit Argon2id, alte Version-1-Dateien werden beim Import weiterhin mit PBKDF2 entschlüsselt.

## Empfehlung

Punkte 1–3 umsetzen. Punkt 4 nur, wenn die längere Wartezeit beim Entsperren akzeptabel ist.

## Technische Details

- `src/types/vault.ts`: `EncryptedVault` um `version: 1 | 2`, `kdf: "pbkdf2" | "argon2id"` und `kdfParams` erweitern.
- `src/services/cryptoService.ts`: `additionalData` (kanonisch serialisierte Metadaten) an `crypto.subtle.encrypt`/`decrypt` übergeben; Ableitung hinter eine `deriveKey(password, salt, kdf, params)`-Funktion legen.
- Optional Argon2id über `hash-wasm` (WASM, klein, etabliert); Ableitung in einen Web Worker auslagern, damit die Oberfläche nicht blockiert.
- `src/services/vaultFileService.ts`: Import verzweigt anhand `version`/`kdf`; unverändertes Verhalten für Version-1-Dateien.
- `src/components/MasterPasswordScreen.tsx`: Mindestlänge, Stärkeanzeige, Ladezustand während der Ableitung.
- Prüfsummenlogik bleibt unverändert als reine Integritäts-Vorprüfung.
