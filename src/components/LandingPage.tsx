import React, { useMemo, useState } from 'react';
import {
  Apple,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Code2,
  Download,
  FileCode2,
  Monitor,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { renderDiagramToSvgString } from '../engine/svgExport';
import { createDefaultStyle } from '../model/defaults';
import type { StruktogrammDocument } from '../model/types';
import { useEditorStore } from '../store/editorStore';
import { DownloadNoticeModal, type DownloadPlatform } from './DownloadNoticeModal';

const GITHUB_REPO_URL = 'https://github.com/EraldoReal/Eren-Struktogrammer';

export interface LandingPageProps {
  onLaunchEditor: () => void;
  onNavigate?: (path: string) => void;
  onOpenImprint: () => void;
}

const DEMO_DIAGRAM_DE: StruktogrammDocument = {
  id: 'demo-struktogramm-de',
  name: 'notenschnittBerechnen',
  parameterList: 'noten: Array',
  x: 0,
  y: 0,
  width: 560,
  zIndex: 1,
  nodes: [
    {
      id: 'd1',
      type: 'sequence',
      text: 'Deklaration und Initialisierung: summe = 0',
    },
    {
      id: 'd2',
      type: 'sequence',
      text: 'Deklaration und Initialisierung: anzahl = Anzahl der Elemente des Arrays noten',
    },
    {
      id: 'd3',
      type: 'for',
      text: 'Zähle i von 0 bis anzahl - 1, Schrittweite 1',
      body: [
        {
          id: 'd4',
          type: 'sequence',
          text: 'Zuweisung: summe = summe + noten[i]',
        },
      ],
    },
    {
      id: 'd5',
      type: 'if',
      text: 'anzahl > 0',
      trueLabel: 'wahr',
      falseLabel: 'falsch',
      thenBranch: [
        {
          id: 'd6',
          type: 'sequence',
          text: 'Rückgabe: summe / anzahl',
        },
      ],
      elseBranch: [
        {
          id: 'd7',
          type: 'sequence',
          text: 'Rückgabe: 0',
        },
      ],
    },
  ],
};

const DEMO_DIAGRAM_EN: StruktogrammDocument = {
  id: 'demo-struktogramm-en',
  name: 'calculateAverage',
  parameterList: 'grades: Array',
  x: 0,
  y: 0,
  width: 560,
  zIndex: 1,
  nodes: [
    {
      id: 'e1',
      type: 'sequence',
      text: 'sum ← 0',
    },
    {
      id: 'e2',
      type: 'sequence',
      text: 'count ← length(grades)',
    },
    {
      id: 'e3',
      type: 'for',
      text: 'for i ← 0 to count - 1',
      body: [
        {
          id: 'e4',
          type: 'sequence',
          text: 'sum ← sum + grades[i]',
        },
      ],
    },
    {
      id: 'e5',
      type: 'if',
      text: 'count > 0',
      trueLabel: 'true',
      falseLabel: 'false',
      thenBranch: [
        {
          id: 'e6',
          type: 'sequence',
          text: 'return sum / count',
        },
      ],
      elseBranch: [
        {
          id: 'e7',
          type: 'sequence',
          text: 'return 0',
        },
      ],
    },
  ],
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchEditor,
  onNavigate,
  onOpenImprint,
}) => {
  const [downloadModal, setDownloadModal] = useState<DownloadPlatform | null>(null);
  const language = useEditorStore((s) => s.appSettings.language);
  const updateAppSettings = useEditorStore((s) => s.updateAppSettings);
  const isDe = language === 'de';

  const demoSvg = useMemo(() => {
    return renderDiagramToSvgString(
      isDe ? DEMO_DIAGRAM_DE : DEMO_DIAGRAM_EN,
      createDefaultStyle(),
      { transparent: false, padding: 12 }
    );
  }, [isDe]);

  const dinElements = isDe
    ? [
        { key: '1', name: 'Sequenz / Anweisung', syntax: 'Deklaration / Zuweisung / Ausgabe' },
        { key: '2', name: 'Unterprogramm', syntax: 'Aufruf: methode(param) · doppelte Seitenlinien' },
        { key: '3', name: 'Zweifachverzweigung', syntax: 'If / Else · schräge Trennlinien (wahr / falsch)' },
        { key: '4', name: 'Fallunterscheidung', syntax: 'Switch / Case · beliebig viele Zweige + Sonst' },
        { key: '5', name: 'Kopfgesteuerte Schleife', syntax: 'While · Prüfung vor jedem Durchlauf' },
        { key: '6', name: 'Fußgesteuerte Schleife', syntax: 'Do-While · mind. 1 Durchlauf' },
        { key: '7', name: 'Zählschleife', syntax: 'For · Zählvariable, Bereich & Schrittweite' },
      ]
    : [
        { key: '1', name: 'Sequence / Statement', syntax: 'Declaration / Assignment / Output' },
        { key: '2', name: 'Subroutine', syntax: 'Call: method(param) · double side lines' },
        { key: '3', name: 'Branch (If-Else)', syntax: 'Diagonal divider lines (true / false)' },
        { key: '4', name: 'Multi-Branch (Switch)', syntax: 'Any number of cases + default branch' },
        { key: '5', name: 'Pre-Test Loop (While)', syntax: 'Condition checked before iteration' },
        { key: '6', name: 'Post-Test Loop (Do-While)', syntax: 'Executed at least once' },
        { key: '7', name: 'Counting Loop (For)', syntax: 'Counter variable, range & step' },
      ];

  const faqs = isDe
    ? [
        {
          q: 'Brauche ich Java für Eren Struktogrammer?',
          a: 'Nein. Im Gegensatz zum klassischen Java-HuS-Struktogrammer läuft Eren Struktogrammer direkt in jedem modernen Browser sowie als eigenständige native App unter Windows und macOS — komplett ohne JRE.',
        },
        {
          q: 'Welche Dateiformate werden unterstützt?',
          a: 'Einzelne Struktogramme werden als .stgr, ganze Projekt-Tabs als .stgp gespeichert. Zusätzlich gibt es Structorizer-.nsd (XML) Im- und Export sowie SVG-, PNG- (1x/2x/3x) und PDF/Druck-Export.',
        },
        {
          q: 'Werden meine Struktogramme auf einen Server hochgeladen?',
          a: 'Nein. Alle Diagramme, Einstellungen und Fonts bleiben zu 100 % lokal im Browser bzw. auf deinem Rechner. Es gibt kein Tracking und keine Cloud-Pflicht.',
        },
        {
          q: 'Kann ich eigene Operatoren ergänzen?',
          a: 'Ja. Neben der integrierten BW-Abitur-Operatorenliste v2.2 kannst du jederzeit eigene Befehle und Formeln in der Seitenleiste anlegen und dauerhaft speichern.',
        },
      ]
    : [
        {
          q: 'Do I need Java to run Eren Struktogrammer?',
          a: 'No. Unlike the legacy Java HuS Struktogrammer, Eren Struktogrammer runs natively in any modern browser and as a standalone desktop app on Windows and macOS — zero JRE required.',
        },
        {
          q: 'Which file formats are supported?',
          a: 'Single diagrams save as .stgr and full project tabs as .stgp. Structorizer .nsd (XML) import/export as well as SVG, PNG (1x/2x/3x), and PDF/Print export are built in.',
        },
        {
          q: 'Are my diagrams uploaded to any server?',
          a: 'No. All diagrams, custom operators, settings, and fonts stay 100% local in your browser or on your device. No tracking, no cloud lock-in.',
        },
        {
          q: 'Can I add my own custom operators?',
          a: 'Yes. Alongside the built-in standard operator list, you can add, search, copy, and 1-click insert your own custom commands directly in the sidebar.',
        },
      ];

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
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-blue-600 text-white font-bold text-xs">
              E
            </span>
            <span className="font-semibold text-sm text-slate-900">
              Eren Struktogrammer
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-600 border border-slate-300">
              DIN 66261 · v1.1.0
            </span>
          </div>

          <nav aria-label={isDe ? 'Hauptnavigation' : 'Main navigation'} className="flex items-center gap-2 sm:gap-3">
            <a
              href="/din-66261"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/din-66261');
                }
              }}
              className="hidden md:inline-block px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              DIN 66261
            </a>
            <a
              href="/operatorenliste-abitur"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/operatorenliste-abitur');
                }
              }}
              className="hidden lg:inline-block px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              {isDe ? 'Operatorenliste' : 'Operators'}
            </a>
            <a
              href="/hus-struktogrammer-alternative"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/hus-struktogrammer-alternative');
                }
              }}
              className="hidden lg:inline-block px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              HuS Alternative
            </a>
            <a
              href="/faq"
              onClick={(e) => {
                if (onNavigate) {
                  e.preventDefault();
                  onNavigate('/faq');
                }
              }}
              className="hidden md:inline-block px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              FAQ
            </a>

            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <Code2 className="w-3.5 h-3.5" />
              GitHub
            </a>

            {/* DE | EN Switcher */}
            <div className="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 p-0.5 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => {
                  updateAppSettings({ language: 'de' });
                  if (typeof window !== 'undefined' && window.location.pathname === '/en') {
                    window.history.pushState({}, '', '/');
                  }
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  isDe ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                DE
              </button>
              <button
                type="button"
                onClick={() => {
                  updateAppSettings({ language: 'en' });
                  if (typeof window !== 'undefined' && window.location.pathname !== '/en') {
                    window.history.pushState({}, '', '/en');
                  }
                }}
                className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                  !isDe ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onLaunchEditor}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              {isDe ? 'Editor öffnen' : 'Open Editor'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-10">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 bg-white border border-slate-300 rounded-lg p-5 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-600">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300">
                {isDe ? 'Nassi-Shneiderman-Editor' : 'Nassi-Shneiderman Editor'}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isDe ? 'Ohne Java · 100 % Lokal' : 'Zero Java · 100% Local'}
              </span>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                Open Source (MIT)
              </a>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
              {isDe
                ? 'Struktogramme nach DIN 66261 erstellen — im Browser, auf Mac & Windows.'
                : 'Create DIN 66261 Structograms — in the browser, on Mac & Windows.'}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {isDe ? (
                <>
                  Die moderne Alternative zum klassischen <strong>HuS Struktogrammer</strong>:
                  identische Logik ohne Code-Generierung, dafür mit gestochen scharfem
                  Vektor-Rendering, integrierter &amp; erweiterbarer{' '}
                  <strong>Operatorenliste</strong>, 1-Klick-Screenshot und nativen Apps.
                </>
              ) : (
                <>
                  A modern replacement for the classic <strong>HuS Struktogrammer</strong>:
                  clean DIN 66261 logic without code generation, crisp vector rendering,
                  customizable <strong>operator templates</strong>, 1-click screenshots,
                  and native desktop apps.
                </>
              )}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onLaunchEditor}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                {isDe ? 'Editor im Browser öffnen' : 'Open Editor in Browser'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setDownloadModal('mac')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-md text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
              >
                <Apple className="w-4 h-4" />
                macOS (.dmg)
              </button>

              <button
                type="button"
                onClick={() => setDownloadModal('windows')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-md text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
              >
                <Monitor className="w-4 h-4" />
                Windows (.exe)
              </button>
            </div>

            {/* Compact Spec Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-xs font-mono">
              <div>
                <div className="text-slate-400 text-[10px]">{isDe ? 'FORMATE' : 'FORMATS'}</div>
                <div className="text-slate-800 font-medium">.stgp · .stgr · .nsd</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">EXPORT</div>
                <div className="text-slate-800 font-medium">SVG · PNG · PDF</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">SHORTCUTS</div>
                <div className="text-slate-800 font-medium">{isDe ? 'Tasten 1–7 · ⌘/Ctrl' : 'Keys 1–7 · ⌘/Ctrl'}</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px]">{isDe ? 'LIZENZ' : 'LICENSE'}</div>
                <div className="text-slate-800 font-medium">{isDe ? 'Kostenlos · Offline' : 'Free · Offline'}</div>
              </div>
            </div>
          </div>

          {/* Right: Live Rendered Struktogramm */}
          <div className="lg:col-span-6 bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-200 bg-slate-100 text-xs font-mono text-slate-600">
              <span>{isDe ? 'beispiel_notenschnitt.stgr' : 'example_average.stgr'}</span>
              <span>DIN 66261 · Live-SVG</span>
            </div>
            <div className="p-4 sm:p-6 bg-white flex items-center justify-center overflow-x-auto">
              <div
                className="w-full flex justify-center [&>svg]:w-full [&>svg]:max-w-[620px] [&>svg]:h-auto"
                dangerouslySetInnerHTML={{ __html: demoSvg }}
              />
            </div>
          </div>
        </section>

        {/* Feature Cards + DIN 66261 Reference */}
        <section id="elemente" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 7 DIN Elements Table */}
          <article className="lg:col-span-6 bg-white border border-slate-300 rounded-lg p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {isDe
                  ? 'Alle 7 DIN-66261-Strukturelemente (Tasten 1–7)'
                  : 'All 7 DIN 66261 Control Structures (Keys 1–7)'}
              </h2>
              <span className="text-[11px] font-mono text-slate-500">1:1 HuS-Standard</span>
            </div>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-200 text-xs">
              {dinElements.map((el) => (
                <div
                  key={el.key}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[11px] font-semibold text-slate-700 shrink-0">
                      {el.key}
                    </kbd>
                    <span className="font-semibold text-slate-800 truncate">{el.name}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 truncate">
                    {el.syntax}
                  </span>
                </div>
              ))}
            </div>
          </article>

          {/* Right: Core Capabilities */}
          <article className="lg:col-span-6 bg-white border border-slate-300 rounded-lg p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              {isDe
                ? 'Gebaut für schnelles Arbeiten im Unterricht'
                : 'Built for Fast Classroom & Exam Workflows'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-md border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  {isDe ? 'Standard & Eigene Operatoren' : 'Standard & Custom Operators'}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {isDe
                    ? 'BW-Abitur-Liste v2.2 plus eigene Befehle anlegen, speichern und per 1-Klick einfügen.'
                    : 'Built-in standard operator list plus your own custom commands for 1-click copy & insert.'}
                </p>
              </div>

              <div className="p-3 rounded-md border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  {isDe ? '1-Klick-Screenshot' : '1-Click Screenshot'}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {isDe
                    ? 'Alle Struktogramme eines Projekts perfekt skaliert direkt als PNG in die Zwischenablage kopieren.'
                    : 'Copy all diagrams of a project as a cleanly scaled PNG directly to your clipboard.'}
                </p>
              </div>

              <div className="p-3 rounded-md border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                  {isDe ? 'Tabs + Freies 2D-Board' : 'Tabs + Free 2D Canvas'}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {isDe
                    ? 'Mehrere Struktogramme pro Projekt-Tab verschieben, im Raster anordnen und samt Schriftgröße skalieren.'
                    : 'Arrange multiple diagrams per project tab, snap to grid, and scale diagram + font size.'}
                </p>
              </div>

              <div className="p-3 rounded-md border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  {isDe ? 'SVG, PNG & Druck / PDF' : 'SVG, PNG & Print / PDF'}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {isDe
                    ? 'Verlustfreies SVG für Word & LaTeX, PNG bis 3x Auflösung sowie Druckvorschau mit Seitenrändern.'
                    : 'Lossless SVG for Word & LaTeX, up to 3x PNG export, and print preview with margins.'}
                </p>
              </div>
            </div>
          </article>
        </section>

        {/* Downloads */}
        <section
          id="downloads"
          className="bg-white border border-slate-300 rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-700">
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isDe
                  ? 'v1.1.0 · Desktop-Apps mit automatischem In-App-Update'
                  : 'v1.1.0 · Desktop apps with built-in self-updater'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {isDe
                ? 'Download für macOS & Windows — oder direkt im Browser starten'
                : 'Download for macOS & Windows — or launch right in your browser'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {isDe
                ? 'Native Datei-Dialoge für .stgp / .stgr, Dark & Light Mode, keine Java-Installation nötig.'
                : 'Native file dialogs for .stgp / .stgr, Dark & Light Mode, zero Java installation required.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setDownloadModal('mac')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              macOS (.dmg)
            </button>
            <button
              type="button"
              onClick={() => setDownloadModal('windows')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Windows (.exe)
            </button>
            <button
              type="button"
              onClick={onLaunchEditor}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {isDe ? 'Jetzt im Browser öffnen' : 'Open in Browser Now'}
            </button>
          </div>
        </section>

        {/* Comparison & DIN 66261 Guide (SEO Content) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <article className="lg:col-span-6 bg-white border border-slate-300 rounded-lg p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              {isDe
                ? 'Vergleich: Klassischer HuS Struktogrammer vs. Strukto Online'
                : 'Comparison: Legacy Java HuS vs. Eren Struktogrammer'}
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">{isDe ? 'Funktion' : 'Feature'}</th>
                    <th className="px-3 py-2">HuS (Java)</th>
                    <th className="px-3 py-2 text-blue-700">Eren Struktogrammer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  <tr>
                    <td className="px-3 py-2 font-medium">{isDe ? 'Direkt im Browser (Strukto Online)' : 'Runs in Browser'}</td>
                    <td className="px-3 py-2 text-slate-400">—</td>
                    <td className="px-3 py-2 font-medium text-emerald-700">✓ {isDe ? 'Sofort ohne Installation' : 'Instant, no install'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">{isDe ? 'Java-Runtime nötig?' : 'Java required?'}</td>
                    <td className="px-3 py-2 text-slate-500">{isDe ? 'Ja (JRE 8/11+)' : 'Yes (JRE)'}</td>
                    <td className="px-3 py-2 font-medium text-emerald-700">✓ {isDe ? 'Nein (Nativ & Web)' : 'No (Native & Web)'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">{isDe ? 'BW-Abitur-Operatorenliste + Eigene' : 'Standard & Custom Operators'}</td>
                    <td className="px-3 py-2 text-slate-400">—</td>
                    <td className="px-3 py-2 font-medium text-emerald-700">✓ {isDe ? 'Sticky Seitenleiste' : 'Sticky sidebar'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">{isDe ? '1-Klick-Screenshot in Zwischenablage' : '1-Click Clipboard Screenshot'}</td>
                    <td className="px-3 py-2 text-slate-400">—</td>
                    <td className="px-3 py-2 font-medium text-emerald-700">✓ {isDe ? 'PNG 2x skaliert' : 'Scaled 2x PNG'}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">{isDe ? 'Dark Mode & UI-Zoom' : 'Dark Mode & UI Zoom'}</td>
                    <td className="px-3 py-2 text-slate-400">—</td>
                    <td className="px-3 py-2 font-medium text-emerald-700">✓ 80 % – 140 %</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article className="lg:col-span-6 bg-white border border-slate-300 rounded-lg p-5 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900">
              {isDe
                ? 'Was ist ein Struktogramm nach DIN 66261?'
                : 'What is a Nassi-Shneiderman Structogram (DIN 66261)?'}
            </h2>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>
                {isDe ? (
                  <>
                    Ein <strong>Struktogramm</strong> (auch <strong>Nassi-Shneiderman-Diagramm</strong>)
                    ist eine genormte grafische Darstellungsform nach <strong>DIN 66261</strong>, um
                    Algorithmen im Informatik-Unterricht, Studium und Abitur sauber und ohne
                    unübersichtliche Sprungbefehle zu entwerfen.
                  </>
                ) : (
                  <>
                    A <strong>Nassi-Shneiderman diagram</strong> (structogram, standardized as{' '}
                    <strong>DIN 66261</strong>) is a structured visual notation used in computer
                    science education to design clean algorithms without unstructured jumps.
                  </>
                )}
              </p>
              <p>
                {isDe ? (
                  <>
                    Mit <strong>Strukto Online / Eren Struktogrammer</strong> fügst du über die
                    Tasten <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[11px]">1</kbd>–<kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[11px]">7</kbd> Sequenzen,
                    Unterprogramme, Verzweigungen und Schleifen per Einfügebalken ein, kopierst
                    offizielle Abitur-Operatoren aus der Seitenleiste und exportierst dein Ergebnis
                    mit einem Klick als <strong>SVG</strong>, <strong>PNG</strong> oder <strong>PDF</strong>.
                  </>
                ) : (
                  <>
                    With <strong>Eren Struktogrammer</strong>, press keys{' '}
                    <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[11px]">1</kbd>–<kbd className="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono text-[11px]">7</kbd>{' '}
                    to insert sequences, subroutines, branches, and loops via crisp insertion bars,
                    reuse custom operator templates, and export directly to <strong>SVG</strong>,{' '}
                    <strong>PNG</strong>, or <strong>PDF</strong>.
                  </>
                )}
              </p>
            </div>
          </article>
        </section>

        {/* FAQ (SEO) */}
        <section id="faq" className="bg-white border border-slate-300 rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            {isDe ? 'Häufige Fragen (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            {faqs.map((item) => (
              <div key={item.q} className="space-y-1">
                <h3 className="font-semibold text-slate-900">{item.q}</h3>
                <p className="text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300 bg-white mt-4">
        <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            Eren Struktogrammer · DIN 66261 Editor · Eren Kazokoglu
          </span>
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
              {isDe ? 'Impressum & Datenschutz' : 'Imprint & Privacy'}
            </button>
            <a
              href="mailto:info@best-tools.app"
              className="hover:text-slate-900 transition-colors"
            >
              info@best-tools.app
            </a>
          </div>
        </div>
      </footer>

      <DownloadNoticeModal
        platform={downloadModal}
        onClose={() => setDownloadModal(null)}
        language={language}
      />
    </div>
  );
};
