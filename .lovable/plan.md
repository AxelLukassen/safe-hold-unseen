# Einträge als gruppierte Tabelle

## Ziel
Die Passwort-Einträge werden nicht mehr als Kartenliste, sondern als Tabelle mit aufklappbaren Gruppen angezeigt. Jeder Eintrag gehört zu genau einer Gruppe.

## Was entsteht

**Gruppen**
- Neues Feld "Gruppe" pro Eintrag (Text, optional). Ohne Angabe landet ein Eintrag in "Ohne Gruppe".
- Im Neu-/Bearbeiten-Fenster: Auswahlfeld mit allen bereits vorhandenen Gruppen plus Möglichkeit, eine neue Gruppe einzutippen.
- Umgruppieren geschieht durch Bearbeiten des Eintrags.

**Tabelle**
- Gruppen als Überschriftszeile mit Namen und Anzahl der Einträge, per Klick auf-/zuklappbar (standardmäßig aufgeklappt).
- Spalten am Desktop: Titel, Benutzername, Adresse, Passwort (maskiert, mit Anzeigen/Kopieren) und Aktionen (Bearbeiten, Löschen).
- Auf kleinen Bildschirmen bleibt es eine Tabelle, zeigt aber nur Titel und Aktionen; die übrigen Spalten werden ausgeblendet.
- Die Suche filtert wie bisher; leere Gruppen werden dabei ausgeblendet.

**Dateien**
- Gespeicherte Dateien enthalten das neue Gruppenfeld. Ältere Dateien ohne Gruppe lassen sich weiterhin laden und landen in "Ohne Gruppe".

## Technische Umsetzung
- `src/types/vault.ts`: `group: string` in `PasswordEntry`, Längenlimit 100 in `ENTRY_FIELD_LIMITS`, Konstante für "Ohne Gruppe".
- `src/services/entryValidation.ts`: Gruppe als optionales Stringfeld prüfen, fehlender Wert wird zu leerem String normalisiert (keine Ablehnung alter Dateien).
- Neuer Helper `src/services/entryGrouping.ts`: reine Funktion, die gefilterte Einträge nach Gruppe sortiert bündelt (`GroupedEntries[]`).
- Neue Komponenten: `src/components/EntryTable.tsx` (Tabelle plus Gruppenzeilen), `src/components/EntryTableRow.tsx` (eine Zeile mit Maskierung, Kopieren, Aktionen). Basis: vorhandene `ui/table`-Komponenten.
- `src/components/VaultDashboard.tsx`: rendert `EntryTable` statt der Kartenliste; Filterlogik bleibt, Gruppe wird mitdurchsucht. Aufklapp-Zustand als lokaler State im Table-Container.
- `src/components/PasswordEntryForm.tsx`: Gruppenfeld mit Vorschlagsliste (`datalist` oder Combobox), `trim()` beim Speichern.
- `PasswordEntryCard.tsx` entfällt; Kopier- und Maskierungslogik wandert in einen kleinen wiederverwendbaren Hook, damit die Zeile schlank bleibt.
- Responsiv über Tailwind-Spaltenklassen (`hidden sm:table-cell`), keine zusätzliche Bibliothek.
