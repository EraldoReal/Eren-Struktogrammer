# Eren Struktogrammer

Moderner, plattformübergreifender Editor für **Nassi-Shneiderman-Struktogramme nach DIN 66261** — als kostenlose Web-App sowie als native Desktop-App für **macOS, Windows und Linux** (ohne Java).

🌐 **Live Web-App & Downloads:** [https://strukto.best-tools.app](https://strukto.best-tools.app)

## Features
- **Alle 7 DIN-66261-Elemente:** Sequenz, Unterprogramm (doppelte Seitenlinien), Zweifachverzweigung, Fallunterscheidung, Kopf-, Fuß- und Zählschleife.
- **Einfügemodus & Shortcuts:** Klassische Einfügebalken, Inline-Bearbeitung, Sonderzeichen-Leiste (`← ≤ ≥ ≠ ∧ ∨ ¬`), Undo/Redo, Copy/Cut/Paste.
- **BW-Abitur Operatorenliste (v2.2) & Eigene Operatoren:** Sticky Seitenleiste mit Plain-Text-Befehlen zum 1-Klick-Kopieren und Einfügen.
- **Multi-Tab + Freie 2D-Arbeitsfläche:** Mehrere Struktogramme pro Projekt-Tab, Raster-Anordnung, Skalierung inkl. Schriftgröße.
- **Export & Screenshot:** 1-Klick-Screenshot aller Struktogramme in die Zwischenablage, SVG-, PNG- (1x/2x/3x) und PDF/Druck-Export.
- **Dateiformate:** `.stgp` (Projekt), `.stgr` (Einzel-Struktogramm) sowie Structorizer `.nsd` (XML) Im- und Export.
- **100 % Lokal & Datenschutzfreundlich:** Keine Cloud-Pflicht, keine Tracker, lokal eingebettete Schriftarten (`Inter` & `JetBrains Mono`).

## Entwicklung

```bash
# Abhängigkeiten installieren
npm install

# Web-App lokal starten
npm run dev

# Unit-Tests ausführen
npm run test

# Production Web-Build
npm run build

# Desktop-App lokal starten (Tauri v2)
npm run tauri dev
```

## Lizenz

MIT License — siehe [LICENSE](LICENSE).
