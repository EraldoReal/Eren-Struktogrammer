import React from 'react';
import { Apple, Download, ExternalLink, Monitor, ShieldCheck, X } from 'lucide-react';

export type DownloadPlatform = 'mac' | 'windows';

export interface DownloadNoticeModalProps {
  platform: DownloadPlatform | null;
  onClose: () => void;
  language?: 'de' | 'en';
}

const GITHUB_REPO_URL = 'https://github.com/EraldoReal/Eren-Struktogrammer';

export const DownloadNoticeModal: React.FC<DownloadNoticeModalProps> = ({
  platform,
  onClose,
  language = 'de',
}) => {
  if (!platform) return null;

  const isDe = language === 'de';
  const isMac = platform === 'mac';
  const downloadUrl = isMac
    ? '/downloads/Eren-Struktogrammer-macOS.dmg'
    : '/downloads/Eren-Struktogrammer-Windows.exe';
  const fileName = isMac
    ? 'Eren-Struktogrammer-macOS.dmg'
    : 'Eren-Struktogrammer-Windows.exe';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={isDe ? 'Download-Hinweis' : 'Download Notice'}
        className="w-full max-w-lg rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            {isMac ? (
              <Apple className="w-5 h-5 text-slate-800 dark:text-slate-200" />
            ) : (
              <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
            <h2 className="text-sm font-semibold">
              {isMac
                ? isDe
                  ? 'macOS-Installer (.dmg) herunterladen'
                  : 'Download macOS Installer (.dmg)'
                : isDe
                  ? 'Windows-Installer (.exe) herunterladen'
                  : 'Download Windows Installer (.exe)'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 dark:hover:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            aria-label={isDe ? 'Schließen' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Open Source Security Box */}
          <div className="flex items-start gap-3 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/30">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                {isDe
                  ? '100 % Open Source & frei von Schadstoffen'
                  : '100% Open Source & Malware-Free'}
              </p>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-200/90 leading-relaxed">
                {isDe
                  ? 'Der gesamte Quellcode ist öffentlich unter MIT-Lizenz auf GitHub einsehbar. Es gibt keine Tracker, keine Werbung und keine versteckten Hintergrunddienste.'
                  : 'The entire source code is publicly auditable under the MIT license on GitHub. No trackers, no ads, no hidden background services.'}
              </p>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline pt-0.5"
              >
                GitHub-Repository prüfen
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Gatekeeper / SmartScreen Instructions */}
          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 space-y-1.5">
            <p className="font-semibold text-amber-900 dark:text-amber-200 text-xs">
              {isDe
                ? 'Hinweis beim ersten Start (ohne teures Developer-Zertifikat):'
                : 'First-launch notice (unsigned open-source build):'}
            </p>
            {isMac ? (
              <p className="text-xs text-amber-900/85 dark:text-amber-200/85 leading-relaxed">
                {isDe
                  ? 'Da die App nicht kostenpflichtig bei Apple notarisiert ist, öffne sie nach dem Ziehen in „Programme“ beim ersten Mal per Rechtsklick → Öffnen (oder unter Systemeinstellungen → Datenschutz & Sicherheit → „Dennoch öffnen“).'
                  : 'Because this open-source build is not notarized with a paid Apple Developer account, right-click the app in Applications and select Open on first launch.'}
              </p>
            ) : (
              <p className="text-xs text-amber-900/85 dark:text-amber-200/85 leading-relaxed">
                {isDe
                  ? 'Da der kostenlose Open-Source-Installer kein bezahltes EV-Zertifikat besitzt, zeigt Windows ggf. SmartScreen. Klicke einfach auf „Weitere Informationen“ → „Trotzdem ausführen“.'
                  : 'Because this free open-source installer does not use a paid EV certificate, Windows SmartScreen may appear. Click "More info" → "Run anyway".'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isDe ? 'Abbrechen' : 'Cancel'}
          </button>
          <a
            href={downloadUrl}
            download={fileName}
            onClick={() => setTimeout(onClose, 250)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {isDe ? `${fileName} jetzt laden` : `Download ${fileName}`}
          </a>
        </div>
      </div>
    </div>
  );
};
