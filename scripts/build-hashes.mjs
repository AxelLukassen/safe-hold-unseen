/**
 * Post-Build-Skript: Erzeugt Integritäts-Hashes für alle Dateien in dist/.
 *
 * Ausgabe:
 * - dist/SHA256SUMS   – SHA-256-Hash jeder ausgelieferten Datei (Format: "<hash>  <pfad>")
 * - dist/build-id.json – Build-ID (SHA-256 über SHA256SUMS) plus Zeitstempel
 *
 * Die Build-ID identifiziert den gesamten Build. Nutzer können die vom Server
 * ausgelieferten Dateien hashen und mit den im GitHub-Repo veröffentlichten
 * SHA256SUMS vergleichen, um Manipulationen zu erkennen.
 */
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIST_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const CHECKSUM_FILE = "SHA256SUMS";
const BUILD_ID_FILE = "build-id.json";

function sha256Hex(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function collectFiles(dir, prefix = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(path.join(dir, entry.name), relativePath)));
    } else if (entry.isFile() && entry.name !== CHECKSUM_FILE && entry.name !== BUILD_ID_FILE) {
      files.push(relativePath);
    }
  }
  return files.sort();
}

const files = await collectFiles(DIST_DIR);
if (files.length === 0) {
  throw new Error("Keine Dateien in dist/ gefunden – wurde der Build ausgeführt?");
}

const lines = [];
for (const file of files) {
  const content = await readFile(path.join(DIST_DIR, file));
  lines.push(`${sha256Hex(content)}  ${file}`);
}
const checksums = lines.join("\n") + "\n";
await writeFile(path.join(DIST_DIR, CHECKSUM_FILE), checksums, "utf8");

const buildInfo = {
  buildId: sha256Hex(checksums),
  builtAt: new Date().toISOString(),
  algorithm: "SHA-256",
};
await writeFile(path.join(DIST_DIR, BUILD_ID_FILE), JSON.stringify(buildInfo, null, 2), "utf8");

console.log(`[build-hashes] ${files.length} Dateien gehasht, Build-ID: ${buildInfo.buildId.slice(0, 16)}…`);
