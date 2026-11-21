import React, { useEffect, useState } from 'react';
import {
  X,
  HelpCircle,
  Keyboard,
  MousePointerClick,
  Layers,
  Scale,
  Download,
  Monitor,
  Apple,
} from 'lucide-react';
import type { NodeType } from '../model/types';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';

import { DownloadNoticeModal, type DownloadPlatform } from './DownloadNoticeModal';

export type HelpTab = 'elements' | 'insertion' | 'shortcuts' | 'download' | 'imprint';

export interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: HelpTab;
}

function MiniDinSvg({ type }: { type: NodeType }) {
  const stroke = 'currentColor';
  switch (type) {
    case 'sequence':
      return (
        <svg viewBox="0 0 120 56" className="w-28 h-14">
          <rect x="4" y="10" width="112" height="36" fill="none" stroke={stroke} strokeWidth="2" />
          <text x="60" y="32" textAnchor="middle" fontSize="11" fill="currentColor">
            x := x + 1
          </text>
        </svg>
      );
    case 'subroutine':
      return (
        <svg viewBox="0 0 120 56" className="w-28 h-14">
          <rect x="4" y="10" width="112" height="36" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="14" y1="10" x2="14" y2="46" stroke={stroke} strokeWidth="2" />
          <line x1="106" y1="10" x2="106" y2="46" stroke={stroke} strokeWidth="2" />
          <text x="60" y="32" textAnchor="middle" fontSize="11" fill="currentColor">
            sortiere()
          </text>
        </svg>
      );
    case 'if':
      return (
        <svg viewBox="0 0 120 56" className="w-28 h-14">
          <rect x="4" y="4" width="112" height="48" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="4" y1="4" x2="60" y2="26" stroke={stroke} strokeWidth="1.8" />
          <line x1="116" y1="4" x2="60" y2="26" stroke={stroke} strokeWidth="1.8" />
          <line x1="4" y1="26" x2="116" y2="26" stroke={stroke} strokeWidth="1.8" />
          <line x1="60" y1="26" x2="60" y2="52" stroke={stroke} strokeWidth="1.8" />
          <text x="60" y="14" textAnchor="middle" fontSize="9" fill="currentColor">
            x &gt; 0
          </text>
          <text x="14" y="23" fontSize="8" fill="currentColor">
            W
          </text>
          <text x="106" y="23" textAnchor="end" fontSize="8" fill="currentColor">
            F
          </text>
        </svg>
      );
    case 'switch':
      return (
        <svg viewBox="0 0 120 56" className="w-28 h-14">
          <rect x="4" y="4" width="112" height="48" fill="none" stroke={stroke} strokeWidth="2" />
          <line x1="4" y1="4" x2="60" y2="26" stroke={stroke} strokeWidth="1.6" />
          <line x1="116" y1="4" x2="60" y2="26" stroke={stroke} strokeWidth="1.6" />
          <line x1="4" y1="26" x2="116" y2="26" stroke={stroke} strokeWidth="1.8" />
          <line x1="41" y1="26" x2="41" y2="52" stroke={stroke} strokeWidth="1.6" />
          <line x1="79" y1="26" x2="79" y2="52" stroke={stroke} strokeWidth="1.6" />
          <text x="60" y="13" textAnchor="middle" fontSize="8.5" fill="currentColor">
            wahl
          </text>
          <text x="22" y="23" textAnchor="middle" fontSize="8" fill="currentColor">
            1
          </text>
          <text x="60" y="23" textAnchor="middle" fontSize="8" fill="currentColor">
            2
          </text>
          <text x="98" y="23" textAnchor="middle" fontSize="8" fill="currentColor">
            *
          </text>
        </svg>
      );
    case 'while':
      return (
        <svg viewBox="0 0 120 56" className="w-28 h-14">
          <path
            d="M 4 4 H 116 V 20 H 22 V 52 H 4 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
          />
          <rect x="22" y="20" width="94" height="32" fill="none" stroke={stroke} strokeWidth="1.5" />
          <text x="64" y="15" textAnchor="middle" fontSize="9" fill="currentColor">
            solange i &lt; n
          </text>
        </svg>
      );
    case 'doWhile':
      return (
        <svg viewBox="0 0 120 56" className="w-28 h-14">
          <path
            d="M 4 4 H 22 V 36 H 116 V 52 H 4 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
          />
          <rect x="22" y="4" width="94" height="32" fill="none" stroke={stroke} strokeWidth="1.5" />
          <text x="64" y="47" textAnchor="middle" fontSize="9" fill="currentColor">
            bis x = 0
          </text>
        </svg>
      );
    case 'for':
      return (
        <svg viewBox="0 0 120 56" className="w-28 h-14">
          <path
            d="M 4 4 H 116 V 20 H 22 V 52 H 4 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
          />
          <rect x="22" y="20" width="94" height="32" fill="none" stroke={stroke} strokeWidth="1.5" />
          <text x="64" y="15" textAnchor="middle" fontSize="9" fill="currentColor">
            i := 1 bis 10
          </text>
        </svg>
      );
  }
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'elements',
}) => {
  const appSettings = useEditorStore((s) => s.appSettings);
  const [tab, setTab] = useState<HelpTab>(initialTab);
  const [selectedType, setSelectedType] = useState<NodeType>('sequence');
  const [downloadModal, setDownloadModal] = useState<DownloadPlatform | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const lang = appSettings.language;
  const t = getTranslations(lang);
  const isDark =
    appSettings.theme === 'dark' ||
    (appSettings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const elements: Array<{ type: NodeType; name: string; desc: string; key: string }> = [
    { type: 'sequence', name: t.tools.sequence, desc: t.tools.sequenceDesc, key: '1' },
    { type: 'subroutine', name: t.tools.subroutine, desc: t.tools.subroutineDesc, key: '2' },
    { type: 'if', name: t.tools.if, desc: t.tools.ifDesc, key: '3' },
    { type: 'switch', name: t.tools.switch, desc: t.tools.switchDesc, key: '4' },
    { type: 'while', name: t.tools.while, desc: t.tools.whileDesc, key: '5' },
    { type: 'doWhile', name: t.tools.doWhile, desc: t.tools.doWhileDesc, key: '6' },
    { type: 'for', name: t.tools.for, desc: t.tools.forDesc, key: '7' },
  ];

  const shortcutRows: Array<{ keys: string; label: string }> = [
    { keys: 'Ctrl / Cmd + Z', label: t.shortcuts.undo },
    { keys: 'Ctrl / Cmd + Shift + Z', label: t.shortcuts.redo },
    { keys: 'Ctrl / Cmd + Y', label: t.shortcuts.redo },
    { keys: 'Ctrl / Cmd + C', label: t.shortcuts.copy },
    { keys: 'Ctrl / Cmd + X', label: t.shortcuts.cut },
    { keys: 'Ctrl / Cmd + V', label: t.shortcuts.paste },
    { keys: 'Delete / Backspace', label: t.shortcuts.deleteNode },
    { keys: '1 – 7', label: lang === 'de' ? 'Einfügewerkzeug wählen' : 'Select insert tool' },
    { keys: 'Esc', label: t.shortcuts.cancelTool },
    { keys: 'Double-Click', label: t.shortcuts.editText },
  ];

  const panelBg = isDark
    ? 'bg-slate-900 text-slate-100 border-slate-700'
    : 'bg-white text-slate-900 border-slate-200';
  const tabActive = isDark
    ? 'border-blue-500 text-blue-400 bg-slate-800/60'
    : 'border-blue-600 text-blue-600 bg-blue-50/60';
  const tabInactive = isDark
    ? 'border-transparent text-slate-400 hover:text-slate-200'
    : 'border-transparent text-slate-500 hover:text-slate-800';

  const activeEl = elements.find((e) => e.type === selectedType) ?? elements[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-3xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${panelBg}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.menu.help}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <div>
              <h2 className="text-base font-semibold">{t.dialogs.aboutTitle}</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.app.subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
            aria-label={t.dialogs.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`flex border-b px-5 gap-2 ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50/70'
          }`}
        >
          <button
            type="button"
            onClick={() => setTab('elements')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'elements' ? tabActive : tabInactive
            }`}
          >
            <Layers className="w-4 h-4" />
            DIN 66261
          </button>
          <button
            type="button"
            onClick={() => setTab('insertion')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'insertion' ? tabActive : tabInactive
            }`}
          >
            <MousePointerClick className="w-4 h-4" />
            {lang === 'de' ? 'Einfügemodus' : 'Insertion Mode'}
          </button>
          <button
            type="button"
            onClick={() => setTab('shortcuts')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'shortcuts' ? tabActive : tabInactive
            }`}
          >
            <Keyboard className="w-4 h-4" />
            {t.dialogs.shortcutsTitle}
          </button>
          <button
            type="button"
            onClick={() => setTab('download')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'download' ? tabActive : tabInactive
            }`}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            type="button"
            onClick={() => setTab('imprint')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'imprint' ? tabActive : tabInactive
            }`}
          >
            <Scale className="w-4 h-4" />
            {lang === 'de' ? 'Über & Impressum' : 'About & Imprint'}
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {tab === 'elements' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 space-y-1.5">
                {elements.map((el) => {
                  const selected = el.type === selectedType;
                  return (
                    <button
                      key={el.type}
                      type="button"
                      onClick={() => setSelectedType(el.type)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm border transition-colors ${
                        selected
                          ? isDark
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-blue-50 border-blue-500 text-blue-700'
                          : isDark
                            ? 'border-slate-800 hover:bg-slate-800/70'
                            : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="font-medium">{el.name}</span>
                      <kbd
                        className={`px-1.5 py-0.5 text-[11px] rounded font-mono ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {el.key}
                      </kbd>
                    </button>
                  );
                })}
              </div>

              <div
                className={`md:col-span-7 rounded-xl border p-5 flex flex-col items-center justify-center text-center gap-4 ${
                  isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div
                  className={`p-4 rounded-lg border shadow-xs ${
                    isDark
                      ? 'bg-white text-slate-900 border-slate-700'
                      : 'bg-white text-slate-900 border-slate-200'
                  }`}
                >
                  <MiniDinSvg type={activeEl.type} />
                </div>
                <div>
                  <h3 className="text-base font-semibold">{activeEl.name}</h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {activeEl.desc}
                  </p>
                </div>
              </div>
            </div>
          )}

          {tab === 'insertion' && (
            <div className="space-y-4 text-sm leading-relaxed">
              <div
                className={`rounded-xl border p-4 space-y-3 ${
                  isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <h3 className="font-semibold text-base">
                  {lang === 'de'
                    ? 'Wie funktioniert der Einfügemodus (HuS-Prinzip)?'
                    : 'How does Insertion Mode work?'}
                </h3>
                <ol className="list-decimal list-inside space-y-2 opacity-90">
                  <li>
                    {lang === 'de'
                      ? 'Wählen Sie ein DIN-66261-Element in der Werkzeugleiste (oder drücken Sie die Tasten 1–7).'
                      : 'Select a DIN 66261 element from the toolbar (or press keys 1–7).'}
                  </li>
                  <li>
                    {lang === 'de'
                      ? 'Fahren Sie mit der Maus über das Struktogramm: Zwischen Elementen und in leeren Zweigen erscheinen schwarze/blaue Einfügebalken.'
                      : 'Hover over the diagram: insertion bars appear between elements and inside empty branches.'}
                  </li>
                  <li>
                    {lang === 'de'
                      ? 'Klicken Sie auf einen Einfügebalken, um das Element exakt an dieser Stelle einzufügen.'
                      : 'Click an insertion bar to insert the element at that exact position.'}
                  </li>
                  <li>
                    {lang === 'de'
                      ? 'Doppelklicken Sie auf ein Element, um den Text direkt zu bearbeiten. Drücken Sie Esc, um den Einfügemodus zu beenden.'
                      : 'Double-click any element to edit its text inline. Press Esc to exit insertion mode.'}
                  </li>
                </ol>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {t.dialogs.aboutDescription}
              </p>
            </div>
          )}

          {tab === 'shortcuts' && (
            <div
              className={`rounded-xl border divide-y overflow-hidden ${
                isDark ? 'border-slate-800 divide-slate-800' : 'border-slate-200 divide-slate-200'
              }`}
            >
              {shortcutRows.map((row) => (
                <div
                  key={`${row.keys}-${row.label}`}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span>{row.label}</span>
                  <kbd
                    className={`px-2 py-0.5 rounded text-xs font-mono border ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-slate-100 border-slate-300 text-slate-800'
                    }`}
                  >
                    {row.keys}
                  </kbd>
                </div>
              ))}
            </div>
          )}

          {tab === 'download' && (
            <div className="space-y-4 text-sm">
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                {lang === 'de'
                  ? 'Lade Eren Struktogrammer als native Desktop-App herunter – inklusive nativer Datei-Dialoge (.stgr / .stgp) und Offline-Nutzung.'
                  : 'Download Eren Struktogrammer as a native desktop app with native file dialogs (.stgr / .stgp) and offline support.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* macOS Installer */}
                <div
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                    isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 text-white dark:bg-slate-700 shrink-0">
                      <Apple className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">macOS (Apple Silicon)</h3>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        DMG-Installer · v1.2.0
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDownloadModal('mac')}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    macOS (.dmg) herunterladen
                  </button>
                </div>

                {/* Windows Installer */}
                <div
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${
                    isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Windows (64-Bit)</h3>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        EXE-Installer (NSIS) · v1.2.0
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDownloadModal('windows')}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Windows (.exe) herunterladen
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'imprint' && (
            <div className="space-y-4 text-sm leading-relaxed">
              <div
                className={`rounded-xl border p-4 space-y-2 ${
                  isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <h3 className="font-semibold text-base">Impressum</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)
                </p>
                <div className="pt-1 space-y-1">
                  <p className="font-medium">Eren Kazokoglu</p>
                  <p>Wiesach 13</p>
                  <p>73230 Kirchheim unter Teck</p>
                </div>
                <div className="pt-2 space-y-1">
                  <p>
                    <span className="font-medium">Kontakt / E-Mail:</span>{' '}
                    <a
                      href="mailto:info@best-tools.app"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      info@best-tools.app
                    </a>
                  </p>
                </div>
                <div className="pt-2 text-xs opacity-85 space-y-1">
                  <p>
                    <span className="font-medium">
                      Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:
                    </span>{' '}
                    Eren Kazokoglu, Anschrift wie oben.
                  </p>
                </div>
              </div>

              <div
                className={`rounded-xl border p-4 space-y-1.5 text-xs ${
                  isDark
                    ? 'border-slate-800 bg-slate-900/60 text-slate-300'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  {lang === 'de'
                    ? 'Hinweis zu Datenschutz & lokaler Verarbeitung'
                    : 'Privacy & Local Processing Notice'}
                </h4>
                <p>
                  {lang === 'de'
                    ? `${t.app.title} verarbeitet alle Struktogramme, Projekte und Einstellungen standardmäßig ausschließlich lokal in Ihrem Browser bzw. auf Ihrem Gerät. Alle Schriftarten sind lokal eingebunden und es werden keine Tracking-Cookies eingesetzt.`
                    : `${t.app.title} processes all structograms, projects, and settings locally in your browser or on your device by default. All fonts are bundled locally and no tracking cookies are used.`}
                </p>
                <p>
                  {lang === 'de'
                    ? 'Optionales 24h-Link-Teilen: Wenn Sie aktiv „Datei → Link erstellen (24h)…“ auslösen, wird das Projekt vor dem Upload lokal per AES-GCM Ende-zu-Ende verschlüsselt. Der Server speichert ausschließlich die verschlüsselten Daten unter einer zufälligen Kurz-ID und löscht sie spätestens nach 24 Stunden automatisch. Der Entschlüsselungsschlüssel steht nur hinter dem „#“ im Link und wird niemals an den Server übertragen.'
                    : 'Optional 24h Share Links: Only when you actively trigger “File → Create Share Link (24h)…” is the project encrypted locally using AES-GCM before upload. The server stores only the encrypted payload under a random short ID and deletes it automatically after at most 24 hours. The decryption key stays in the URL fragment (“#”) and is never sent to the server.'}
                </p>
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100 pt-2">
                  {lang === 'de'
                    ? 'Webanalyse durch selbstgehostetes Umami'
                    : 'Web Analytics via Self-Hosted Umami'}
                </h4>
                <p>
                  {lang === 'de'
                    ? 'Wir nutzen auf dieser Website das Open-Source-Analysetool Umami, um die Nutzung unserer Website statistisch auszuwerten und unser Angebot zu verbessern. Umami wird vollständig auf unseren eigenen Servern in Deutschland betrieben.'
                    : 'We use the open-source analytics tool Umami on this website to statistically evaluate usage and improve our offering. Umami is operated entirely on our own servers in Germany.'}
                </p>
                <p>
                  {lang === 'de'
                    ? 'Das Tool verwendet keine Cookies und speichert keine personenbezogenen Daten. Ihre IP-Adresse wird nicht gespeichert, sondern unmittelbar nach dem Aufruf anonymisiert gehasht. Ein Rückschluss auf Ihre Person oder ein seitenübergreifendes Tracking (Cross-Site-Tracking) ist technisch ausgeschlossen.'
                    : 'The tool does not use cookies and does not store personal data. Your IP address is not stored, but immediately anonymized via hashing upon request. Any identification of your person or cross-site tracking is technically excluded.'}
                </p>
                <p>
                  {lang === 'de'
                    ? 'Rechtsgrundlage für die Datenverarbeitung ist unser berechtigtes Interesse an der bedarfsgerechten Gestaltung und Optimierung unseres Webangebots gemäß Art. 6 Abs. 1 lit. f DSGVO.'
                    : 'The legal basis for data processing is our legitimate interest in the needs-based design and optimization of our web offering pursuant to Art. 6(1)(f) GDPR.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex justify-end px-5 py-3.5 border-t ${
            isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {t.dialogs.close}
          </button>
        </div>
      </div>

      <DownloadNoticeModal
        platform={downloadModal}
        onClose={() => setDownloadModal(null)}
        language={lang}
      />
    </div>
  );
};
