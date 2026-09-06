# SecureVault

Ein minimalistischer, vollständig clientseitiger Passwort-Manager. Alle Daten
bleiben auf deinem Gerät – es gibt keinen Server, keine Datenbank, keine Cloud.

## Sicherheitsmodell

- **Zero-Knowledge**: Das Masterpasswort lebt nur im Arbeitsspeicher des Browsers.
  Es wird nirgends gespeichert und nirgends hin übertragen.
- **Verschlüsselung**: AES-256-GCM (128-Bit-Authentifizierungstag) mit einem
  Schlüssel, der per Argon2id (64 MiB, 3 Durchläufe, individuelles 16-Byte-Salt)
  abgeleitet wird. Jede Verschlüsselung verwendet eine frische IV.
- **Dateibasiert**: Der Tresor ist eine verschlüsselte JSON-Datei, die du selbst
  herunterlädst und wieder hochlädst. Optional gibt es einen Klartext-Export
  (mit ausdrücklicher Warnung).
- **Automatisches Sperren**: Nach 5 Minuten Inaktivität, beim Schließen des Tabs
  oder beim Verlassen der Seite werden alle sensiblen Daten aus dem Speicher
  entfernt. Ungespeicherte Änderungen können vorher automatisch als neue Datei
  gesichert werden (alte Dateien werden nie überschrieben).
- **Kein Zurücksetzen**: Ein vergessenes Masterpasswort kann nicht
  wiederhergestellt werden.

## Build-Integrität prüfen

Der Build erzeugt zwei zusätzliche Dateien in `dist/`:

- `SHA256SUMS` – SHA-256-Hash jeder ausgelieferten Datei
- `build-id.json` – die Build-ID (SHA-256 über die SHA256SUMS) mit Zeitstempel

Die App zeigt die Build-ID im Info-Bereich „Sicherheit & Funktionsweise" an.

So prüfst du, ob die gehostete Version unverändert aus diesem Quellcode stammt:

1. Repo klonen und lokal bauen:

   ```sh
   npm install
   npm run build
   ```

2. Die Hashes der gehosteten Dateien mit `dist/SHA256SUMS` vergleichen, z. B.:

   ```sh
   curl -s https://DEINE-DOMAIN/assets/index-XXXX.js | sha256sum
   ```

   Der Hash muss mit dem Eintrag in `SHA256SUMS` übereinstimmen.

> Hinweis: Hashes können zwischen verschiedenen Build-Umgebungen abweichen
> (z. B. durch unterschiedliche Toolchain-Versionen). Der Vergleich ist daher
> am aussagekräftigsten, wenn du denselben Stand in derselben Umgebung baust.

## Technologien

- Vite, TypeScript, React, Tailwind CSS, shadcn-ui
- [hash-wasm](https://github.com/Daninet/hash-wasm) für Argon2id (WebAssembly)
- Web Crypto API für AES-256-GCM

## Entwicklung

```sh
npm install
npm run dev
```

## Lizenz

[MIT](LICENSE)
