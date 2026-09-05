# Exportdatei: Struktur verbergen

## Ziel

Die Struktur der Exportdatei soll nicht mehr erkennbar sein. Aktuell verrät die Datei lesbare Felder wie `version`, `algorithm`, `kdf`, `kdfParams` und `checksum`. Künftig enthält die Datei außen nur noch drei Werte:

```text
{
  "s":  "<Salt, Zufallswert>",
  "i":  "<IV, Zufallswert>",
  "d":  "<verschlüsselter Datenblob>"
}
```

Alle anderen Informationen – Dateiversion, Verfahren, Argon2-Parameter, Prüfsumme und die eigentlichen Einträge – liegen **innerhalb** des verschlüsselten Blocks und sind ohne Masterpasswort nicht lesbar.

## Was sich ändert

- **Export**: Ein inneres Paket `{ version, kdf, kdfParams, entries, checksum }` wird als Ganzes mit AES-256-GCM verschlüsselt. Salt und IV stehen außen, weil sie zur Schlüsselableitung gebraucht werden. Als „associated data" werden nur Salt und IV mitauthentifiziert – die übrigen Metadaten brauchen das nicht mehr, weil sie jetzt selbst verschlüsselt sind.
- **Neutralere Feldnamen**: `s`, `i`, `d` statt sprechender Namen, damit die Datei auch vom Schema her nichts verrät.
- **Import**: Die App liest Salt/IV, leitet den Schlüssel ab (Argon2id, Parameter unverändert 64 MiB / 3 Durchläufe) und entschlüsselt den Blob. Danach werden Version, KDF-Angaben und Prüfsumme aus dem Inneren geprüft. Falsches Passwort oder manipulierte Datei → klare Fehlermeldung wie bisher.
- **Rückwärtskompatibilität entfällt weiterhin**: Dateien im bisherigen Version-3-Format werden mit dem bekannten Hinweis abgelehnt (vorher öffnen und neu exportieren).
- **Klartext-Export** bleibt unverändert – dort ist ohnehin alles lesbar; die bestehende Warnung bleibt.

## Grenzen (ehrlich benannt)

- Dass es eine JSON-Datei mit drei Base64-Werten ist, bleibt sichtbar; die Bedeutung der Felder und alle Details des Inhalts nicht.
- Ein Angreifer mit der App im Blick weiß weiterhin, wie das Format aussieht – das ist aber kein Sicherheitsproblem: die Sicherheit beruht allein auf dem Masterpasswort, nicht auf der Geheimhaltung des Formats.

## Technische Details

- `src/types/vault.ts`: Neues äußeres Format `EncryptedVaultFile { s: string; i: string; d: string }`; inneres Paket `VaultPayload { version: 4; kdf: "argon2id"; kdfParams: Argon2idParams; checksum: string; entries: PasswordEntry[] }`; `CURRENT_VAULT_VERSION = 4`.
- `src/services/cryptoService.ts`: `encryptEntries` serialisiert das innere Paket und verschlüsselt es; AAD = Salt+IV (kanonisch serialisiert). `decryptVault` entschlüsselt, parst das innere Paket, validiert Version/KDF/Prüfsumme.
- `src/services/vaultFileService.ts`: Erkennung des neuen Formats an `s`/`i`/`d`; alte Formate (`salt`/`iv`/`data` vorhanden) → Fehlermeldung „Format wird nicht mehr unterstützt". Prüfsummen-Vorprüfung entfällt außen (sie liegt jetzt im verschlüsselten Paket und wird nach dem Entschlüsseln geprüft).
- Argon2id-Parameter, Web Worker und UI-Ladezustände bleiben unverändert.
