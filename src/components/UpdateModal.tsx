import React, { useEffect, useState } from 'react';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { getVersion } from '@tauri-apps/api/app';
import { CheckCircle2, Download, Loader2, RefreshCw, X, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

export interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  available: boolean;
  notes: string;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose }) => {
  const theme = useEditorStore((s) => s.appSettings.theme);
  const language = useEditorStore((s) => s.appSettings.language);
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [status, setStatus] = useState<'checking' | 'ready' | 'installing' | 'error'>('checking');
  const [result, setResult] = useState<UpdateCheckResult | null>(null);
  const [update, setUpdate] = useState<Update | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number | null }>({
    done: 0,
    total: null,
  });
  const [errorMsg, setErrorMsg] = useState<string>('');

  const checkForUpdates = async () => {
    setStatus('checking');
    setErrorMsg('');
    try {
      const found = await check();
      setUpdate(found);
      if (found) {
        setResult({
          currentVersion: found.currentVersion,
          latestVersion: found.version,
          available: true,
          notes: found.body ?? '',
        });
      } else {
        setResult({
          currentVersion: await getVersion(),
          latestVersion: '',
          available: false,
          notes: '',
        });
      }
      setStatus('ready');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      void checkForUpdates();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstall = async () => {
    if (!update) return;

    // The app restarts after the install: never discard unsaved work silently.
    const hasDirty = useEditorStore.getState().projects.some((p) => p.dirty);
    if (hasDirty) {
      const msg =
        language === 'de'
          ? 'Es gibt ungespeicherte Änderungen. Sie gehen beim Neustart verloren. Trotzdem aktualisieren?'
          : 'You have unsaved changes that will be lost on restart. Update anyway?';
      if (!window.confirm(msg)) return;
    }

    setStatus('installing');
    setErrorMsg('');
    setProgress({ done: 0, total: null });
    try {
      await update.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          setProgress({ done: 0, total: event.data.contentLength ?? null });
        } else if (event.event === 'Progress') {
          setProgress((prev) => ({ ...prev, done: prev.done + event.data.chunkLength }));
        }
      });
      await relaunch();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  const panelBg = isDark
    ? 'bg-slate-900 text-slate-100 border-slate-700'
    : 'bg-white text-slate-900 border-slate-200';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && status !== 'installing') onClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden flex flex-col ${panelBg}`}
        role="dialog"
        aria-modal="true"
        aria-label="Nach Updates suchen"
      >
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold">Software-Update</h2>
          </div>
          <button
            type="button"
            disabled={status === 'installing'}
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          {status === 'checking' && (
            <div className="flex items-center gap-3 py-4 justify-center text-slate-500 dark:text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span>Suche nach neuer Version auf strukto.best-tools.app…</span>
            </div>
          )}

          {status === 'installing' && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <div className="space-y-1">
                <p className="font-medium">Update wird heruntergeladen &amp; installiert…</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {progress.total
                    ? `${Math.round((progress.done / progress.total) * 100)} % – `
                    : ''}
                  Die App startet anschließend automatisch neu.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => void checkForUpdates()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                >
                  Erneut prüfen
                </button>
              </div>
            </div>
          )}

          {status === 'ready' && result && (
            <div className="space-y-4">
              {result.available ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                    <Download className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">
                        Neue Version v{result.latestVersion} verfügbar!
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Installiert: v{result.currentVersion}
                      </p>
                      {result.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                          {result.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      Später
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleInstall()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Jetzt aktualisieren &amp; neu starten
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                        Du nutzt bereits die neueste Version (v{result.currentVersion}).
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700"
                    >
                      OK
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
