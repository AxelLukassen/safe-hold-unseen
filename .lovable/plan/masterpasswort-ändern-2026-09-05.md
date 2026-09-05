# Masterpasswort ändern

## Ausgangslage

Ein vergessenes Masterpasswort kann nicht umgangen werden: Die Tresordatei ist damit verschlüsselt, ohne das Passwort sind die Inhalte mathematisch nicht lesbar. Es soll auch keinen Wiederherstellungsschlüssel geben.

Umgesetzt wird deshalb ein sauberer Passwortwechsel: Solange der Tresor mit dem aktuellen Passwort geöffnet ist, lässt sich ein neues Passwort setzen und die Datei damit neu verschlüsselt speichern – ohne Datenverlust.

## Ablauf für dich

1. Tresor wie gewohnt mit dem aktuellen Masterpasswort öffnen und die Tresordatei laden.
2. Im Kopfbereich den neuen Punkt "Masterpasswort ändern" wählen.
3. Im Dialog eingeben:
   - aktuelles Masterpasswort (zur Bestätigung)
   - neues Masterpasswort (mindestens 12 Zeichen, mit Stärkeanzeige)
   - neues Masterpasswort wiederholen
4. Nach Bestätigung wird sofort eine neue, mit dem neuen Passwort verschlüsselte Datei heruntergeladen (mit Zeitstempel im Namen, alte Stände bleiben erhalten). Ab da gilt für die Sitzung und alle weiteren Exporte das neue Passwort.
5. Deutlicher Hinweis im Dialog: Die alte Datei bleibt mit dem alten Passwort verschlüsselt; künftig ist die neu heruntergeladene Datei zu verwenden.

Zusätzlich wird der Hinweistext auf dem Anmeldebildschirm ergänzt: Ein vergessenes Masterpasswort kann nicht zurückgesetzt werden.

## Technische Umsetzung

- `src/services/masterPasswordService.ts` (neu): `changeMasterPassword(entries, currentPassword, newPassword)` – prüft das aktuelle Passwort, indem der aktuelle Bestand testweise mit ihm ver- und wieder entschlüsselt wird, und erzeugt anschließend über `encryptEntries` eine Datei mit dem neuen Passwort (frisches Salt und IV pro Export, Format Version 4 unverändert).
- `src/services/masterPasswordValidation.ts` (neu) oder Konstanten in `types/vault.ts`: Mindestlänge 12, Gleichheitsprüfung der Wiederholung, Ablehnung eines unveränderten Passworts – als reine Funktionen ohne UI-Bezug.
- `src/context/VaultContext.tsx`: neue Aktion `replaceMasterPassword(newPassword)`, die das im RAM gehaltene Masterpasswort ersetzt. Der bestehende Auto-Lock- und RAM-only-Ansatz bleibt unverändert.
- `src/hooks/useChangeMasterPassword.ts` (neu): kapselt Ablauf, Lade- und Fehlerzustände, nutzt `toErrorMessage` sowie `buildVaultFilename`/Download-Logik aus `vaultFileService.ts` (Download-Helfer wird dafür als benannter Export bereitgestellt).
- `src/components/ChangeMasterPasswordDialog.tsx` (neu): reine Darstellung mit drei Feldern (maskiert, `maxLength` 255), Wiederverwendung von `PasswordStrengthMeter`, Lade- und Fehleranzeige, Warnhinweis.
- `src/components/VaultDashboard.tsx`: Menüeintrag/Button zum Öffnen des Dialogs, Dialogeinbindung; keine Fachlogik in der Komponente.
- `src/components/MasterPasswordScreen.tsx`: ergänzter Hinweistext zur Nicht-Wiederherstellbarkeit.

Keine neuen Abhängigkeiten. Verschlüsselung, Dateiformat, Prüfsummen und Validierung bleiben unverändert; das Masterpasswort wird weiterhin nirgends gespeichert.
