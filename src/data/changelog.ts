export interface ChangelogRelease {
  version: string;
  date: string;
  titleDe: string;
  titleEn: string;
  changesDe: string[];
  changesEn: string[];
}

export const CHANGELOG_RELEASES: ChangelogRelease[] = [
  {
    version: '1.2.1',
    date: '2026-11-21',
    titleDe: 'macOS-Fenster, Zuletzt verwendet & Tab-Verhalten',
    titleEn: 'macOS Window Close, Recent Files & Tab Replacement',
    changesDe: [
      'macOS-App lässt sich wieder zuverlässig über das rote Schließen-Symbol (×) schließen; Bestätigungsdialog nutzt nun native Desktop-Dialoge.',
      '„Zuletzt verwendet“ wird jetzt direkt beim Öffnen/Speichern gespeichert und über das Rust-Backend zuverlässig von jedem Dateipfad geladen.',
      'Beim Öffnen eines Struktogramms oder Projekts wird ein unbenutzter, unveränderter Standard-Tab direkt ersetzt statt einen leeren Tab offen zu lassen.',
    ],
    changesEn: [
      'Fixed closing the macOS app via the window close button (×) by granting window destroy permissions and using native confirmation dialogs.',
      'Recent Files are now persisted immediately on open/save and loaded reliably from any path via the Rust backend.',
      'Opening a diagram or project now replaces an unused, unmodified initial tab instead of leaving an empty tab behind.',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-11-21',
    titleDe: 'Stabilitäts- & Bugfix-Release',
    titleEn: 'Stability & Bugfix Release',
    changesDe: [
      '1-Klick-Screenshot in die Zwischenablage repariert (XML-Header im SVG-Combine sauber übersprungen).',
      'Browser-Speichern aus „Zuletzt verwendet“ fällt sauber auf den Speichern-Dialog zurück; eindeutige Handle-Keys verhindern Dateinamens-Konflikte.',
      'Robustes Laden & Normalisieren beschädigter Projekt-/Diagramm-Dateien sowie automatische Auflösung doppelter IDs.',
      'Undo/Redo behält den gespeicherten Dateipfad und .xml-Dateien werden korrekt als XML gespeichert.',
      'Open-Source- & Gatekeeper-/SmartScreen-Hinweis-Popup bei Desktop-Downloads ergänzt.',
    ],
    changesEn: [
      'Fixed 1-click clipboard screenshot by properly stripping outer XML declarations before merging SVGs.',
      'Browser saving from Recent Files cleanly falls back to Save As dialog; unique handle keys prevent filename collisions.',
      'Added recursive node normalization for malformed files and automatic deduplication of duplicate diagram/file IDs.',
      'Undo/Redo now preserves saved file paths, and .xml files save as XML instead of JSON.',
      'Added open-source transparency & Gatekeeper/SmartScreen notice modal for desktop downloads.',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-11-17',
    titleDe: 'Native Menüs, UI-Zoom & In-App-Updater',
    titleEn: 'Native Menus, UI Zoom & Self-Updater',
    changesDe: [
      'macOS nutzt jetzt eine echte deutsche System-Menüleiste; unter Windows/Linux wird die doppelte Systemleiste ausgeblendet.',
      'UI- / Programmzoom (80 % – 140 %) unter Ansicht sowie direktes In-App-Update unter Hilfe (Desktop).',
      'Schließen-Warnung bei ungespeicherten Änderungen + Sternchen (*) im Tab und „Zuletzt verwendet“-Untermenü.',
      'Eigene Operatoren zusätzlich zur BW-Abitur-Liste v2.2 anlegbar.',
      'Helle DIN-66261-Landingpage mit SEO-Unterseiten (/din-66261, /operatorenliste-abitur, /hus-struktogrammer-alternative, /faq).',
    ],
    changesEn: [
      'Added native German macOS system menu bar and removed duplicate system menu bar on Windows/Linux.',
      'Added global UI zoom (80%–140%) under View and built-in desktop self-updater under Help.',
      'Added unsaved-changes close warnings, tab dirty asterisk (*), and Recent Files submenu.',
      'Added support for saving custom user operators alongside the standard operator list.',
      'Added light DIN 66261 landing page with bilingual DE/EN support and dedicated SEO subpages.',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-11-17',
    titleDe: 'Erstveröffentlichung',
    titleEn: 'Initial Release',
    changesDe: [
      'Kompletter Nachbau des HuS Struktogrammers mit allen 7 DIN-66261-Elementen.',
      'Multi-Projekt-Tabs mit freier 2D-Arbeitsfläche, Raster-Anordnung, Dark/Light Mode und lokalen Schriftarten.',
      'Export als SVG, PNG (1x/2x/3x), PDF/Druck sowie .stgp, .stgr und Structorizer .nsd.',
    ],
    changesEn: [
      'Complete modern reimplementation of HuS Struktogrammer with all 7 DIN 66261 elements.',
      'Multi-project tabs with bounded 2D workspace, grid arrangement, Dark/Light Mode, and bundled local fonts.',
      'Export to SVG, PNG (1x/2x/3x), Print/PDF, plus .stgp, .stgr, and Structorizer .nsd.',
    ],
  },
];
