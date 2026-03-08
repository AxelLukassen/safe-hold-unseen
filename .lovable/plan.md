

## SecureVault – Lokaler Passwort-Manager

### Konzept
Eine rein clientseitige Passwort-Manager-App ohne Datenbank. Alle Passwörter werden mit AES verschlüsselt und als JSON-Datei heruntergeladen/hochgeladen. Nach jeder Operation wird der interne Speicher sofort gelöscht.

### Seiten & Ablauf

**1. Master-Passwort Eingabe (Startseite)**
- Minimalistisches Eingabefeld für das Masterpasswort
- Masterpasswort wird nur zur Laufzeit genutzt (AES-Key-Ableitung via PBKDF2) und sofort aus dem Speicher gelöscht
- Kein "Angemeldet bleiben" – bei Inaktivität oder Tab-Wechsel wird alles gelöscht

**2. Dashboard (nach Entsperrung)**
- Liste aller geladenen Passwort-Einträge (Name, Benutzername, URL)
- Passwörter standardmäßig maskiert, per Klick kurzzeitig sichtbar
- Suche/Filter über Einträge
- Buttons: Neuer Eintrag, Import, Export, Sperren

**3. Passwort-Einträge verwalten**
- Felder: Titel, Benutzername, Passwort, URL, Notizen
- Passwort in die Zwischenablage kopieren (auto-clear nach 10 Sek.)
- Bearbeiten und Löschen

**4. Passwort-Generator**
- Einstellbare Länge (8–64 Zeichen)
- Optionen: Großbuchstaben, Kleinbuchstaben, Zahlen, Sonderzeichen
- Direkt in einen Eintrag übernehmen oder kopieren

**5. Import/Export**
- **Verschlüsselter Export**: JSON-Datei mit AES-verschlüsselten Daten → Download
- **Klartext-Export**: JSON/CSV mit Passwörtern im Klartext → Download (mit Warnung)
- **Import**: Verschlüsselte oder Klartext-Datei hochladen
- Nach jedem Import/Export wird der interne Speicher geleert

### Sicherheitsmaßnahmen
- AES-256-GCM Verschlüsselung via Web Crypto API (kein externes Paket nötig)
- PBKDF2 Key-Ableitung aus dem Masterpasswort
- Variablen mit sensiblen Daten werden nach Nutzung überschrieben
- Automatische Sperrung bei Inaktivität (z.B. 5 Min.)
- Kein localStorage, kein sessionStorage, kein Cookie – alles nur im RAM

### Design
- Minimalistisch, dunkel mit Akzentfarben (Tresor/Sicherheits-Ästhetik)
- Responsive: Mobile-first, funktioniert auf Handy und Desktop
- Icons von Lucide (Lock, Shield, Eye, Copy, Download, Upload)

