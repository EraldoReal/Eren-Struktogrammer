# Changelog

Alle Änderungen an **Eren Struktogrammer** (Deutsch & English).

## [1.2.1] - 2026-11-21
### Deutsch
- macOS-App lässt sich wieder zuverlässig über das rote Schließen-Symbol (`×`) schließen; Bestätigungsdialog nutzt nun native Desktop-Dialoge.
- „Zuletzt verwendet“ wird jetzt direkt beim Öffnen/Speichern gespeichert und über das Rust-Backend zuverlässig von jedem Dateipfad geladen.
- Beim Öffnen eines Struktogramms oder Projekts wird ein unbenutzter, unveränderter Standard-Tab direkt ersetzt statt einen leeren Tab offen zu lassen.

### English
- Fixed closing the macOS app via the window close button (`×`) by granting window destroy permissions and using native confirmation dialogs.
- Recent Files are now persisted immediately on open/save and loaded reliably from any path via the Rust backend.
- Opening a diagram or project now replaces an unused, unmodified initial tab instead of leaving an empty tab behind.

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
