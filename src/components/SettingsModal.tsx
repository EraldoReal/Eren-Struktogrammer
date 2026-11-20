import React, { useEffect, useState } from 'react';
import { X, RotateCcw, Globe, Palette, Sliders } from 'lucide-react';
import { createDefaultAppSettings, createDefaultStyle } from '../model/defaults';
import type { AppSettings, DiagramStyle } from '../model/types';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'style';

const FONT_FAMILIES = [
  { label: 'Inter / System Sans', value: 'Inter, system-ui, -apple-system, sans-serif' },
  { label: 'Arial / Helvetica', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Segoe UI / Tahoma', value: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' },
  { label: 'JetBrains Mono / Monospace', value: '"JetBrains Mono", Consolas, monospace' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const appSettings = useEditorStore((s) => s.appSettings);
  const activeProject = useEditorStore((s) => s.getActiveProject());
  const updateAppSettings = useEditorStore((s) => s.updateAppSettings);
  const updateProjectStyle = useEditorStore((s) => s.updateProjectStyle);

  const [tab, setTab] = useState<SettingsTab>('general');
  const [draftApp, setDraftApp] = useState<AppSettings>(appSettings);
  const [draftStyle, setDraftStyle] = useState<DiagramStyle>(activeProject.globalStyle);

  useEffect(() => {
    if (isOpen) {
      setDraftApp(appSettings);
      setDraftStyle(activeProject.globalStyle);
    }
  }, [isOpen, appSettings, activeProject.globalStyle]);

  if (!isOpen) return null;

  const t = getTranslations(draftApp.language);
  const isDark =
    draftApp.theme === 'dark' ||
    (draftApp.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleSave = () => {
    updateAppSettings({
      ...draftApp,
      defaultStyle: draftStyle,
    });
    updateProjectStyle(draftStyle);
    onClose();
  };

  const handleReset = () => {
    const defaults = createDefaultAppSettings();
    const defaultStyle = createDefaultStyle();
    setDraftApp({
      ...defaults,
      recentFiles: draftApp.recentFiles,
    });
    setDraftStyle(defaultStyle);
  };

  const setLabelPreset = (trueLabel: string, falseLabel: string) => {
    setDraftApp((prev) => ({
      ...prev,
      defaultTrueLabel: trueLabel,
      defaultFalseLabel: falseLabel,
    }));
  };

  const panelBg = isDark
    ? 'bg-slate-900 text-slate-100 border-slate-700'
    : 'bg-white text-slate-900 border-slate-200';
  const mutedText = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = isDark
    ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500'
    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600';
  const tabActive = isDark
    ? 'border-blue-500 text-blue-400 bg-slate-800/60'
    : 'border-blue-600 text-blue-600 bg-blue-50/60';
  const tabInactive = isDark
    ? 'border-transparent text-slate-400 hover:text-slate-200'
    : 'border-transparent text-slate-500 hover:text-slate-800';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${panelBg}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.dialogs.settingsTitle}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h2 className="text-base font-semibold">{t.dialogs.settingsTitle}</h2>
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
            onClick={() => setTab('general')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'general' ? tabActive : tabInactive
            }`}
          >
            <Globe className="w-4 h-4" />
            {t.dialogs.generalTab}
          </button>
          <button
            type="button"
            onClick={() => setTab('style')}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'style' ? tabActive : tabInactive
            }`}
          >
            <Palette className="w-4 h-4" />
            {t.dialogs.styleTab}
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {tab === 'general' ? (
            <div className="space-y-4">
              {/* Language & Theme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.languageLabel}
                  </label>
                  <select
                    value={draftApp.language}
                    onChange={(e) =>
                      setDraftApp((prev) => ({
                        ...prev,
                        language: e.target.value as 'de' | 'en',
                      }))
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`}
                  >
                    <option value="de">Deutsch (DE)</option>
                    <option value="en">English (EN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.themeLabel}
                  </label>
                  <select
                    value={draftApp.theme}
                    onChange={(e) =>
                      setDraftApp((prev) => ({
                        ...prev,
                        theme: e.target.value as AppSettings['theme'],
                      }))
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`}
                  >
                    <option value="light">{t.menu.themeLight}</option>
                    <option value="dark">{t.menu.themeDark}</option>
                    <option value="system">{t.menu.themeSystem}</option>
                  </select>
                </div>
              </div>

              {/* Default If Branch Labels */}
              <div
                className={`rounded-lg border p-3.5 space-y-3 ${
                  isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                    {t.dialogs.ifLabelsTitle}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLabelPreset('wahr', 'falsch')}
                      className={`px-2 py-1 rounded text-xs border transition-colors ${
                        draftApp.defaultTrueLabel === 'wahr' &&
                        draftApp.defaultFalseLabel === 'falsch'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isDark
                            ? 'border-slate-700 hover:bg-slate-700'
                            : 'border-slate-300 bg-white hover:bg-slate-100'
                      }`}
                    >
                      wahr / falsch
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabelPreset('ja', 'nein')}
                      className={`px-2 py-1 rounded text-xs border transition-colors ${
                        draftApp.defaultTrueLabel === 'ja' &&
                        draftApp.defaultFalseLabel === 'nein'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isDark
                            ? 'border-slate-700 hover:bg-slate-700'
                            : 'border-slate-300 bg-white hover:bg-slate-100'
                      }`}
                    >
                      ja / nein
                    </button>
                    <button
                      type="button"
                      onClick={() => setLabelPreset('true', 'false')}
                      className={`px-2 py-1 rounded text-xs border transition-colors ${
                        draftApp.defaultTrueLabel === 'true' &&
                        draftApp.defaultFalseLabel === 'false'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isDark
                            ? 'border-slate-700 hover:bg-slate-700'
                            : 'border-slate-300 bg-white hover:bg-slate-100'
                      }`}
                    >
                      true / false
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      {t.dialogs.defaultTrueLabel}
                    </label>
                    <input
                      type="text"
                      value={draftApp.defaultTrueLabel}
                      onChange={(e) =>
                        setDraftApp((prev) => ({
                          ...prev,
                          defaultTrueLabel: e.target.value,
                        }))
                      }
                      className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      {t.dialogs.defaultFalseLabel}
                    </label>
                    <input
                      type="text"
                      value={draftApp.defaultFalseLabel}
                      onChange={(e) =>
                        setDraftApp((prev) => ({
                          ...prev,
                          defaultFalseLabel: e.target.value,
                        }))
                      }
                      className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
                    />
                  </div>
                </div>
              </div>

              {/* Default Switch Cases & Insertion Hints */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.defaultSwitchCasesLabel}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={draftApp.defaultSwitchCases}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(12, Number(e.target.value) || 2));
                      setDraftApp((prev) => ({ ...prev, defaultSwitchCases: val }));
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`}
                  />
                </div>

                <label className="flex items-center gap-2.5 pt-5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={draftApp.showInsertionHints}
                    onChange={(e) =>
                      setDraftApp((prev) => ({
                        ...prev,
                        showInsertionHints: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm">{t.dialogs.showInsertionHintsLabel}</span>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.backgroundColor}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draftStyle.backgroundColor}
                      onChange={(e) =>
                        setDraftStyle((prev) => ({ ...prev, backgroundColor: e.target.value }))
                      }
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={draftStyle.backgroundColor}
                      onChange={(e) =>
                        setDraftStyle((prev) => ({ ...prev, backgroundColor: e.target.value }))
                      }
                      className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono outline-none ${inputCls}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.borderColor}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draftStyle.borderColor}
                      onChange={(e) =>
                        setDraftStyle((prev) => ({ ...prev, borderColor: e.target.value }))
                      }
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={draftStyle.borderColor}
                      onChange={(e) =>
                        setDraftStyle((prev) => ({ ...prev, borderColor: e.target.value }))
                      }
                      className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono outline-none ${inputCls}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.textColor}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={draftStyle.textColor}
                      onChange={(e) =>
                        setDraftStyle((prev) => ({ ...prev, textColor: e.target.value }))
                      }
                      className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={draftStyle.textColor}
                      onChange={(e) =>
                        setDraftStyle((prev) => ({ ...prev, textColor: e.target.value }))
                      }
                      className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono outline-none ${inputCls}`}
                    />
                  </div>
                </div>
              </div>

              {/* Font Family & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.fontFamily}
                  </label>
                  <select
                    value={draftStyle.fontFamily}
                    onChange={(e) =>
                      setDraftStyle((prev) => ({ ...prev, fontFamily: e.target.value }))
                    }
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`}
                  >
                    {FONT_FAMILIES.map((ff) => (
                      <option key={ff.value} value={ff.value}>
                        {ff.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.fontSize}
                  </label>
                  <input
                    type="number"
                    min={9}
                    max={28}
                    value={draftStyle.fontSize}
                    onChange={(e) => {
                      const val = Math.max(9, Math.min(28, Number(e.target.value) || 14));
                      setDraftStyle((prev) => ({ ...prev, fontSize: val }));
                    }}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none ${inputCls}`}
                  />
                </div>
              </div>

              {/* Line Width & Padding */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.lineWidth}
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={4}
                    step={0.5}
                    value={draftStyle.lineWidth}
                    onChange={(e) => {
                      const val = Math.max(0.5, Math.min(4, Number(e.target.value) || 1.5));
                      setDraftStyle((prev) => ({ ...prev, lineWidth: val }));
                    }}
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.paddingX}
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={32}
                    value={draftStyle.paddingX}
                    onChange={(e) => {
                      const val = Math.max(4, Math.min(32, Number(e.target.value) || 12));
                      setDraftStyle((prev) => ({ ...prev, paddingX: val }));
                    }}
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.paddingY}
                  </label>
                  <input
                    type="number"
                    min={4}
                    max={24}
                    value={draftStyle.paddingY}
                    onChange={(e) => {
                      const val = Math.max(4, Math.min(24, Number(e.target.value) || 8));
                      setDraftStyle((prev) => ({ ...prev, paddingY: val }));
                    }}
                    className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
                  />
                </div>
              </div>

              {/* Live Style Preview */}
              <div
                className={`rounded-lg border p-4 flex flex-col items-center justify-center ${
                  isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-100'
                }`}
              >
                <span className={`text-[11px] uppercase tracking-wider mb-2 ${mutedText}`}>
                  Preview
                </span>
                <div
                  style={{
                    backgroundColor: draftStyle.backgroundColor,
                    color: draftStyle.textColor,
                    borderColor: draftStyle.borderColor,
                    borderWidth: `${draftStyle.lineWidth}px`,
                    borderStyle: 'solid',
                    fontFamily: draftStyle.fontFamily,
                    fontSize: `${draftStyle.fontSize}px`,
                    padding: `${draftStyle.paddingY}px ${draftStyle.paddingX}px`,
                  }}
                  className="min-w-56 text-center shadow-xs"
                >
                  summe := summe + i
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-t ${
            isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <button
            type="button"
            onClick={handleReset}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.dialogs.reset}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.dialogs.cancel}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {t.dialogs.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
