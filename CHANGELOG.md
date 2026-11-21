# Changelog

Alle Änderungen an **Eren Struktogrammer** (Deutsch & English).

## [1.2.0] - 2026-11-21
### Deutsch
- 1-Klick-Screenshot in die Zwischenablage repariert (XML-Header im SVG-Combine sauber übersprungen).
- Browser-Speichern aus „Zuletzt verwendet“ fällt sauber auf den Speichern-Dialog zurück; eindeutige Handle-Keys verhindern Dateinamens-Konflikte.
- Robustes Laden & Normalisieren beschädigter Projekt-/Diagramm-Dateien sowie automatische Auflösung doppelter IDs.
- Undo/Redo behält den gespeicherten Dateipfad und `.xml`-Dateien werden korrekt als XML gespeichert.
- Open-Source- & Gatekeeper-/SmartScreen-Hinweis-Popup bei Desktop-Downloads ergänzt.

### English
- Fixed 1-click clipboard screenshot by properly stripping outer XML declarations before merging SVGs.
- Browser saving from Recent Files cleanly falls back to Save As dialog; unique handle keys prevent filename collisions.
- Added recursive node normalization for malformed files and automatic deduplication of duplicate diagram/file IDs.
- Undo/Redo now preserves saved file paths, and `.xml` files save as XML instead of JSON.
- Added open-source transparency & Gatekeeper/SmartScreen notice modal for desktop downloads.

## [1.1.0] - 2026-11-17
### Deutsch
- Native deutsche macOS-Menüleiste und ausgeblendete System-Menüleiste unter Windows/Linux.
- UI- / Programmzoom (80 % – 140 %) und direktes In-App-Update (Desktop).
- Schließen-Warnung bei ungespeicherten Änderungen, `*`-Marker im Tab und „Zuletzt verwendet“-Untermenü.
- Eigene Operatoren speicherbar; helle DIN-66261-Landingpage mit SEO-Unterseiten.

### English
- Native German macOS system menu bar and removed duplicate system menu bar on Windows/Linux.
- Global UI zoom (80%–140%) and built-in desktop self-updater.
- Unsaved-changes close warnings, tab dirty asterisk (`*`), and Recent Files submenu.
- Custom operators support and light DIN 66261 landing page with SEO subpages.

## [1.0.0] - 2026-11-17
### Deutsch
- Erstveröffentlichung mit allen 7 DIN-66261-Elementen, Tabs + freier 2D-Arbeitsfläche, SVG/PNG/PDF-Export und `.stgp`/`.stgr`/`.nsd`-Support.

### English
- Initial release with all 7 DIN 66261 elements, tabs + bounded 2D workspace, SVG/PNG/PDF export, and `.stgp`/`.stgr`/`.nsd` support.
