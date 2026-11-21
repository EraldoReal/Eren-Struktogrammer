import React, { useEffect, useState } from 'react';
import { Check, Copy, Link2, Loader2, ShieldCheck, X } from 'lucide-react';
import { useEditorStore } from '../store/editorStore.ts';
import {
  createShareLink,
  fetchAndDecryptShare,
  type CreatedShareLink,
} from '../utils/shareLink.ts';

interface ShareModalProps {
  mode: 'create' | 'open';
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ mode, onClose }) => {
  const language = useEditorStore((s) => s.appSettings.language);
  const getActiveProject = useEditorStore((s) => s.getActiveProject);
  const openProjectFromContent = useEditorStore((s) => s.openProjectFromContent);
  const isDe = language === 'de';

  const [loading, setLoading] = useState(mode === 'create');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [inputLink, setInputLink] = useState('');

  useEffect(() => {
    if (mode !== 'create') return;
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const project = getActiveProject();
        const result = await createShareLink(project, language);
        if (cancelled) return;
        setCreated(result);
        try {
          await navigator.clipboard.writeText(result.url);
          setCopied(true);
        } catch {
          // Clipboard permission may be unavailable in some contexts
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [mode, getActiveProject, language]);

  const handleCopy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLink.trim() || loading) return;
    try {
      setLoading(true);
      setError(null);
      const json = await fetchAndDecryptShare(inputLink, language);
      openProjectFromContent(json);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100">
            <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>
              {mode === 'create'
                ? isDe
                  ? 'Link erstellen (24h gültig)'
                  : 'Create Share Link (valid 24h)'
                : isDe
                  ? 'Geteilten Link öffnen'
                  : 'Open Share Link'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-sm">
          {mode === 'create' ? (
            <>
              {loading && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>
                    {isDe
                      ? 'Projekt wird verschlüsselt & Link erstellt…'
                      : 'Encrypting project & creating link…'}
                  </span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                  {error}
                </div>
              )}

              {created && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isDe
                      ? 'Teile diesen Link mit deiner Lehrkraft oder auf einem anderen Gerät. Das Projekt ist Ende-zu-Ende-verschlüsselt und wird nach 24 Stunden automatisch vom Server gelöscht.'
                      : 'Share this link with your teacher or open it on another device. The project is end-to-end encrypted and automatically deleted from the server after 24 hours.'}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={created.url}
                      onFocus={(e) => e.target.select()}
                      className="flex-1 px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>{isDe ? 'Kopiert' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isDe ? 'Kopieren' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {isDe
                        ? `Kurzcode: ${created.id} · Gültig für 24 Stunden`
                        : `Short ID: ${created.id} · Valid for 24 hours`}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleOpen} className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {isDe
                  ? 'Füge einen geteilten Struktogrammer-Link (https://strukto.best-tools.app/#s=...) oder den Code (ID.KEY) ein:'
                  : 'Paste a shared Struktogrammer link (https://strukto.best-tools.app/#s=...) or code (ID.KEY):'}
              </p>
              <input
                type="text"
                autoFocus
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                placeholder="https://strukto.best-tools.app/#s=A7K9M2...."
                className="w-full px-3 py-2 text-xs font-mono rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && (
                <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
                  {error}
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  {isDe ? 'Abbrechen' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={loading || !inputLink.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white cursor-pointer"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDe ? 'Öffnen' : 'Open'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
