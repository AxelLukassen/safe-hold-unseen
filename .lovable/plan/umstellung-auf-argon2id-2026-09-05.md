# Umstellung auf Argon2id

Die Schlüsselableitung aus dem Masterpasswort wechselt von PBKDF2 auf Argon2id mit 64 MiB Speicher, 3 Durchläufen, Parallelität 1 und einem frischen 16-Byte-Salt pro Export.

Rückwärtskompatibilität entfällt bewusst: Bereits exportierte Dateien lassen sich danach nicht mehr importieren. Wer noch alte Dateien hat, sollte sie vor der Umstellung entschlüsselt öffnen und neu exportieren.

## Was sich für dich ändert

- Das Entsperren und jeder Import/Export dauert spürbar länger (grob 0,5–1,5 Sekunden, auf älteren Handys mehr) und braucht kurzzeitig 64 MiB Arbeitsspeicher.
- Während der Berechnung zeigt die Oberfläche einen Ladezustand; der Button ist so lange gesperrt.
- Alte Vault-Dateien werden mit einer klaren Meldung abgelehnt statt still zu scheitern.

## Umsetzung

1. Bibliothek `hash-wasm` hinzufügen (kleine, etablierte WASM-Implementierung von Argon2id).
2. Ableitung in einen Web Worker auslagern, damit die Oberfläche während der 64-MiB-Berechnung nicht einfriert.
3. Dateiformat auf Version 3 heben: `kdf: "argon2id"` mit `memorySize`, `iterations`, `parallelism`, `hashLength`. Diese Metadaten bleiben – wie bisher – als „associated data“ mit AES-256-GCM authentifiziert.
4. Import: alles außer Version 3 wird mit der Meldung abgelehnt, dass das Format nicht mehr unterstützt wird.
5. Lade- und Fehlerzustände in Entsperr-Bildschirm und Dashboard-Aktionen ergänzen.

## Technische Details

- `src/types/vault.ts`: `KdfName = "argon2id"`, `Argon2idParams { memorySizeKiB: 65536; iterations: 3; parallelism: 1; hashLength: 32 }`, `EncryptedVault.version: 3`.
- Neu `src/services/kdf/argon2Worker.ts` (Worker) + `src/services/kdf/keyDerivation.ts` (typisierte Promise-API `deriveVaultKey(password, salt, params): Promise<CryptoKey>`); Worker liefert Rohbytes, `crypto.subtle.importKey` erzeugt daraus den nicht-extrahierbaren AES-GCM-Schlüssel im Hauptthread.
- `src/services/cryptoService.ts`: PBKDF2-Pfad und `PBKDF2_ITERATIONS` entfernen, `deriveKey` durch `deriveVaultKey` ersetzen; AAD-Serialisierung um die Argon2-Parameter erweitern; `encryptEntries`/`decryptVault` bleiben async mit gleicher Signatur.
- `src/services/vaultFileService.ts`: Versionsprüfung `parsed.version !== 3` → verständlicher Fehler; Prüfsummenlogik unverändert.
- `src/components/MasterPasswordScreen.tsx` und `src/components/VaultDashboard.tsx`: `isDeriving`-Zustand, deaktivierte Buttons, Spinner, Fehler-Toast.
- Der Worker läuft über Vites `new Worker(new URL(...), { type: "module" })`; kein Zugriff auf sensible Daten außer dem übergebenen Passwort, das nach der Ableitung dereferenziert wird.
