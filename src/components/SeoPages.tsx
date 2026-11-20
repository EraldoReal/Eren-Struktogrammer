import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { OPERATOR_CATEGORIES, OPERATORS_LIST } from '../data/operators';
import { renderDiagramToSvgString } from '../engine/svgExport';
import { createDefaultStyle } from '../model/defaults';
import type { StruktogrammDocument } from '../model/types';
import { DownloadNoticeModal, type DownloadPlatform } from './DownloadNoticeModal';

const GITHUB_REPO_URL = 'https://github.com/EraldoReal/Eren-Struktogrammer';

export type SeoPageRoute =
  | '/din-66261'
  | '/operatorenliste-abitur'
  | '/hus-struktogrammer-alternative'
  | '/faq';

export interface SeoPageProps {
  route: SeoPageRoute;
  onNavigate: (path: string) => void;
  onLaunchEditor: () => void;
  onOpenImprint: () => void;
}

const EXAMPLE_IF_LOOP: StruktogrammDocument = {
  id: 'seo-ex-1',
  name: 'passwortPruefen',
  x: 0,
  y: 0,
  width: 420,
  zIndex: 1,
  nodes: [
    { id: 's1', type: 'sequence', text: 'Deklaration: eingabe als Text' },
    {
      id: 's2',
      type: 'doWhile',
      text: 'eingabe == "geheim123"',
      body: [{ id: 's3', type: 'sequence', text: 'Einlesen: eingabe als Text' }],
    },
    {
      id: 's4',
      type: 'subroutine',
      text: 'Aufruf: zugriffErlauben()',
    },
  ],
};

const PAGE_META: Record<SeoPageRoute, { title: string; description: string }> = {
  '/din-66261': {
    title: 'DIN 66261 Struktogramm-Symbole & Elemente erklärt | Eren Struktogrammer',
    description:
      'Alle 7 Nassi-Shneiderman-Struktogramm-Elemente nach DIN 66261 einfach erklärt: Sequenz, Unterprogramm, Verzweigung, Fallunterscheidung, Kopf-, Fuß- und Zählschleife.',
  },
  '/operatorenliste-abitur': {
    title: 'Operatorenliste für Struktogramme (BW Informatik Abitur v2.2) | Strukto Online',
    description:
      'Vollständige Operatorenliste für Struktogramme im Informatik-Abitur Baden-Württemberg (v2.2): Deklaration, Initialisierung, Schleifen, Arrays und Unterprogramme.',
  },
  '/hus-struktogrammer-alternative': {
    title: 'HuS Struktogrammer Alternative ohne Java (Browser, Mac & Windows)',
    description:
      'Moderne HuS Struktogrammer Alternative: Läuft direkt im Browser sowie nativ unter macOS & Windows ohne Java. Mit Dark Mode, SVG/PNG-Export und Operatorenliste.',
  },
  '/faq': {
    title: 'Häufige Fragen (FAQ) – Struktogramme online erstellen | Eren Struktogrammer',
    description:
      'Antworten zu Dateiformaten (.stgp, .stgr, .nsd), Datenschutz, Java-freier Nutzung, macOS/Windows-Download und Abitur-Operatoren im Struktogrammer.',
  },
};

export const SeoSubPage: React.FC<SeoPageProps> = ({
  route,
  onNavigate,
  onLaunchEditor,
  onOpenImprint,
}) => {
  const [downloadModal, setDownloadModal] = useState<DownloadPlatform | null>(null);
  useEffect(() => {
    const meta = PAGE_META[route];
    document.title = meta.title;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) {
      descEl.setAttribute('content', meta.description);
    }
    window.scrollTo({ top: 0 });
  }, [route]);

  const exampleSvg = useMemo(
    () =>
      renderDiagramToSvgString(EXAMPLE_IF_LOOP, createDefaultStyle(), {
        transparent: false,
        padding: 12,
      }),
    []
  );

  return (
    <div
      className="h-screen w-screen overflow-y-auto bg-slate-50 text-slate-900 select-text"
      style={{
        backgroundImage:
          'linear-gradient(to right, rgba(148, 163, 184, 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.16) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-300 bg-white/95 backdrop-blur-xs">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-2 font-semibold text-sm text-slate-900 hover:text-blue-600 cursor-pointer"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-600 text-white font-bold text-xs">
                E
              </span>
              <span className="truncate">Eren Struktogrammer</span>
            </button>
          </div>

          <nav aria-label="Ratgeber-Navigation" className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/din-66261')}
              className={`hidden md:inline-block px-2 py-1 text-xs rounded cursor-pointer ${
                route === '/din-66261'
                  ? 'font-semibold text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              DIN 66261
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/operatorenliste-abitur')}
              className={`hidden md:inline-block px-2 py-1 text-xs rounded cursor-pointer ${
                route === '/operatorenliste-abitur'
                  ? 'font-semibold text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Operatorenliste
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/hus-struktogrammer-alternative')}
              className={`hidden lg:inline-block px-2 py-1 text-xs rounded cursor-pointer ${
                route === '/hus-struktogrammer-alternative'
                  ? 'font-semibold text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              HuS Alternative
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/faq')}
              className={`hidden sm:inline-block px-2 py-1 text-xs rounded cursor-pointer ${
                route === '/faq'
                  ? 'font-semibold text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={onLaunchEditor}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              Editor öffnen
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Zurück zur Startseite
        </button>

        {route === '/din-66261' && (
          <article className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-blue-700">DIN 66261 REFERENZ</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Struktogramm-Symbole &amp; Elemente nach DIN 66261
              </h1>
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                Ein Nassi-Shneiderman-Struktogramm bildet Algorithmen ausschließlich durch
                strukturierte Kontrollblöcke ab. Dadurch werden Spaghetticode und unkontrollierte
                Sprünge (<code>goto</code>) verhindert.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3 text-xs sm:text-sm">
                {[
                  {
                    t: '1. Sequenz (Anweisung)',
                    d: 'Ein einfaches Rechteck für Anweisungen, Deklarationen, Initialisierungen, Ein- und Ausgaben, die nacheinander von oben nach unten ausgeführt werden.',
                  },
                  {
                    t: '2. Unterprogramm (Subroutine)',
                    d: 'Rechteck mit doppelten vertikalen Seitenlinien. Markiert den Aufruf einer Methode, Funktion oder Prozedur.',
                  },
                  {
                    t: '3. Zweifachverzweigung (If / Else)',
                    d: 'Kopfzeile mit zwei diagonalen Trennlinien für Wahr- und Falsch-Zweig. Beide Zweige werden nebeneinander dargestellt.',
                  },
                  {
                    t: '4. Fallunterscheidung (Switch / Case)',
                    d: 'Mehrfachverzweigung für mehrere diskrete Fälle plus optionalem Sonst-/Default-Zweig.',
                  },
                  {
                    t: '5. Kopfgesteuerte Schleife (While)',
                    d: 'L-förmiger Rahmen (Kopf oben + Balken links). Die Bedingung wird vor jedem Schleifendurchlauf geprüft.',
                  },
                  {
                    t: '6. Fußgesteuerte Schleife (Do-While)',
                    d: 'Umgekehrter L-Rahmen (Balken links + Fuß unten). Der Schleifenkörper wird mindestens einmal durchlaufen.',
                  },
                  {
                    t: '7. Zählschleife (For)',
                    d: 'Kopfgesteuerte Schleife mit fester Zählvariable, Startwert, Endwert und Schrittweite.',
                  },
                ].map((item) => (
                  <div key={item.t} className="p-3.5 rounded-md border border-slate-200 bg-slate-50/70">
                    <h2 className="font-semibold text-slate-900">{item.t}</h2>
                    <p className="text-slate-600 mt-1 leading-relaxed">{item.d}</p>
                  </div>
                ))}
              </div>

              <div className="lg:col-span-5 border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="text-xs font-mono text-slate-600">
                  Beispiel: Fußgesteuerte Schleife + Unterprogramm
                </div>
                <div
                  className="bg-white p-3 rounded border border-slate-200 overflow-x-auto [&>svg]:max-w-full [&>svg]:h-auto"
                  dangerouslySetInnerHTML={{ __html: exampleSvg }}
                />
                <button
                  type="button"
                  onClick={onLaunchEditor}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  Selbst im Editor ausprobieren
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </article>
        )}

        {route === '/operatorenliste-abitur' && (
          <article className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-blue-700">
                  INFORMATIK ABITUR BADEN-WÜRTTEMBERG · VERSION 2.2
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  Operatorenliste für Struktogramme
                </h1>
                <p className="text-sm text-slate-600 max-w-3xl">
                  Alle offiziellen Plain-Text-Operatoren für Deklaration, Zuweisung, Schleifen,
                  Unterprogramme und Arrays — im Editor direkt als sticky Seitenleiste integriert.
                </p>
              </div>
              <button
                type="button"
                onClick={onLaunchEditor}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shrink-0 cursor-pointer"
              >
                Im Editor öffnen
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-6">
              {OPERATOR_CATEGORIES.map((cat) => {
                const items = OPERATORS_LIST.filter((op) => op.category === cat.id);
                return (
                  <section key={cat.id} className="space-y-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      {cat.label}
                    </h2>
                    <div className="overflow-x-auto border border-slate-200 rounded-md">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 w-48">Operator</th>
                            <th className="px-3 py-2">Syntax (Plain Text)</th>
                            <th className="px-3 py-2">Beispiel</th>
                            <th className="px-3 py-2">Beschreibung</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {items.map((op) => (
                            <tr key={op.id}>
                              <td className="px-3 py-2 font-semibold text-slate-800">{op.title}</td>
                              <td className="px-3 py-2 font-mono text-blue-700">{op.syntax}</td>
                              <td className="px-3 py-2 font-mono text-slate-600">{op.example}</td>
                              <td className="px-3 py-2 text-slate-600">{op.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })}
            </div>
          </article>
        )}

        {route === '/hus-struktogrammer-alternative' && (
          <article className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-blue-700">HUS STRUKTOGRAMMER ALTERNATIVE</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Die moderne HuS Struktogrammer Alternative — ohne Java
              </h1>
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                Der klassische HuS Struktogrammer benötigt eine installierte Java-Runtime (JRE)
                und wirkt auf modernen HiDPI-Displays oft veraltet. Eren Struktogrammer (Strukto
                Online) bildet den gesamten Funktionsumfang 1:1 nach — direkt im Browser und als
                native App für macOS und Windows.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              {[
                'Keine Java-Installation (.jar / JRE) erforderlich',
                'Läuft auf Schul-iPads, Chromebooks, Windows, macOS & Linux',
                'Gestochen scharfes Vektor-Rendering (SVG) & hochauflösendes PNG (bis 3x)',
                '1-Klick-Screenshot aller Struktogramme direkt in die Zwischenablage',
                'Integrierte BW-Abitur-Operatorenliste v2.2 + eigene Operatoren',
                'Dark Mode, UI-Zoom (80 % – 140 %), Schließen-Warnung & Zuletzt verwendet',
              ].map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-2.5 p-3 rounded-md border border-slate-200 bg-slate-50/70"
                >
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{point}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onLaunchEditor}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Jetzt im Browser starten
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDownloadModal('mac')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer"
              >
                macOS (.dmg) laden
              </button>
              <button
                type="button"
                onClick={() => setDownloadModal('windows')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer"
              >
                Windows (.exe) laden
              </button>
            </div>
          </article>
        )}

        {route === '/faq' && (
          <article className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-blue-700">FAQ &amp; HILFE</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Häufige Fragen zu Eren Struktogrammer (Strukto Online)
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              {[
                {
                  q: 'Was ist der Unterschied zwischen Projekt (.stgp) und Struktogramm (.stgr)?',
                  a: 'Ein Projekt (.stgp) speichert einen kompletten Tab mit allen enthaltenen Struktogrammen, Fensterpositionen, Zoom und Druckeinstellungen. Eine .stgr-Datei speichert dagegen ein einzelnes Struktogramm-Fenster, das du auch einzeln in einen bestehenden Tab laden kannst.',
                },
                {
                  q: 'Kann ich alte .stgr-Dateien aus dem Java-HuS öffnen?',
                  a: 'Alte binäre Java-Serialization-Dateien aus dem Original-HuS werden beim Laden erkannt, können aber nicht automatisch konvertiert werden. Für den Austausch mit anderen Tools unterstützt die App jedoch Structorizer .nsd (XML) Im- und Export.',
                },
                {
                  q: 'Funktionieren Strg+S / Cmd+S im Browser?',
                  a: 'Ja! In modernen Chromium-Browsern (Chrome, Edge, Brave, Arc) merkt sich die App die geöffnete/gespeicherte Datei und überschreibt sie bei Strg+S / Cmd+S direkt ohne erneuten Dialog.',
                },
                {
                  q: 'Wie mache ich einen Screenshot für meine Abgabe / Dokumentation?',
                  a: 'Klicke in der Toolbar auf „Screenshot“ — alle Struktogramme deines Projekts werden automatisch in ein sauber skaliertes 2x PNG zusammengefügt und direkt in die Zwischenablage kopiert.',
                },
                {
                  q: 'Kann ich die Schriftgröße eines ganzen Struktogramms ändern?',
                  a: 'Ja, ziehe einfach am unteren Rand oder an der Ecke unten rechts eines Struktogramm-Fensters. Breite, Höhe und Schriftgröße skalieren dabei proportional mit.',
                },
                {
                  q: 'Werden meine Daten an einen Server gesendet?',
                  a: 'Nein. Alles läuft zu 100 % lokal im Browser bzw. auf deinem PC/Mac. Schriftarten sind lokal eingebunden, es gibt keine Tracking-Cookies und keine Cloud-Pflicht.',
                },
              ].map((item) => (
                <div key={item.q} className="p-4 rounded-md border border-slate-200 bg-slate-50/70 space-y-1.5">
                  <h2 className="font-semibold text-slate-900">{item.q}</h2>
                  <p className="text-slate-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </article>
        )}
      </main>

      <footer className="border-t border-slate-300 bg-white mt-6">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Eren Struktogrammer · DIN 66261 Editor · Eren Kazokoglu</span>
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 underline underline-offset-4"
            >
              Open Source (GitHub)
            </a>
            <button
              type="button"
              onClick={onOpenImprint}
              className="hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              Impressum &amp; Datenschutz
            </button>
            <a href="mailto:info@best-tools.app" className="hover:text-slate-900">
              info@best-tools.app
            </a>
          </div>
        </div>
      </footer>

      <DownloadNoticeModal
        platform={downloadModal}
        onClose={() => setDownloadModal(null)}
        language="de"
      />
    </div>
  );
};
