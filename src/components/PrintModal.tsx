import React, { useMemo, useState } from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { renderDiagramToSvgString } from '../engine/svgExport';
import type { PrintSettings } from '../model/types';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';

export interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_DIMENSIONS_MM: Record<PrintSettings['pageFormat'], { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  Letter: { w: 215.9, h: 279.4 },
};

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose }) => {
  const appSettings = useEditorStore((s) => s.appSettings);
  const activeProject = useEditorStore((s) => s.getActiveProject());
  const updatePrintSettings = useEditorStore((s) => s.updatePrintSettings);

  const [scope, setScope] = useState<'active' | 'all'>('active');

  const printSettings = activeProject.printSettings;

  const diagramsToPrint = useMemo(() => {
    if (scope === 'all') {
      return activeProject.diagrams;
    }
    const active =
      activeProject.diagrams.find((d) => d.id === activeProject.activeDiagramId) ??
      activeProject.diagrams[0];
    return active ? [active] : [];
  }, [activeProject.diagrams, activeProject.activeDiagramId, scope]);

  const svgPreviews = useMemo(() => {
    return diagramsToPrint.map((doc) => ({
      id: doc.id,
      name: doc.name,
      svg: renderDiagramToSvgString(doc, activeProject.globalStyle, {
        transparent: false,
        padding: 8,
      }),
    }));
  }, [diagramsToPrint, activeProject.globalStyle]);

  if (!isOpen) return null;

  const lang = appSettings.language;
  const t = getTranslations(lang);
  const isDark =
    appSettings.theme === 'dark' ||
    (appSettings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const rawDims = PAGE_DIMENSIONS_MM[printSettings.pageFormat];
  const pageWidthMm =
    printSettings.orientation === 'landscape' ? rawDims.h : rawDims.w;
  const pageHeightMm =
    printSettings.orientation === 'landscape' ? rawDims.w : rawDims.h;

  const previewScale = 1.65;
  const previewWidthPx = Math.round(pageWidthMm * previewScale);
  const previewHeightPx = Math.round(pageHeightMm * previewScale);
  const previewMarginPx = Math.round(printSettings.marginMm * previewScale);

  const handlePrint = () => {
    window.print();
  };

  const panelBg = isDark
    ? 'bg-slate-900 text-slate-100 border-slate-700'
    : 'bg-white text-slate-900 border-slate-200';
  const inputCls = isDark
    ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500'
    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600';

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: ${printSettings.pageFormat} ${printSettings.orientation};
            margin: ${printSettings.marginMm}mm;
          }
        }
      `}</style>

      {/* Dedicated print-only output */}
      <div className="hidden print:block fixed inset-0 bg-white text-black p-0 m-0 z-[9999]">
        {svgPreviews.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-col justify-between min-h-screen"
            style={{ pageBreakAfter: idx < svgPreviews.length - 1 ? 'always' : 'auto' }}
          >
            {printSettings.headerText && (
              <div className="text-xs text-slate-600 border-b border-slate-300 pb-2 mb-4">
                {printSettings.headerText}
              </div>
            )}
            <div
              className={`flex-1 flex items-start justify-center ${
                printSettings.scaleToFit ? '[&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[85vh]' : ''
              }`}
              dangerouslySetInnerHTML={{ __html: item.svg }}
            />
            {(printSettings.footerText || printSettings.showPageNumbers) && (
              <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-300 pt-2 mt-4">
                <span>{printSettings.footerText}</span>
                {printSettings.showPageNumbers && (
                  <span>
                    {idx + 1} / {svgPreviews.length}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal UI */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className={`w-full max-w-5xl rounded-xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${panelBg}`}
          role="dialog"
          aria-modal="true"
          aria-label={t.menu.printSettings}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-5 py-3.5 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Printer className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold">{t.menu.printSettings}</h2>
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

          {/* Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
            {/* Left Settings Column */}
            <div
              className={`lg:col-span-4 p-5 border-b lg:border-b-0 lg:border-r overflow-y-auto space-y-4 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              {/* Scope */}
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  {lang === 'de' ? 'Umfang' : 'Scope'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setScope('active')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      scope === 'active'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDark
                          ? 'border-slate-700 hover:bg-slate-800'
                          : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {lang === 'de' ? 'Aktives Diagramm' : 'Active Diagram'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setScope('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      scope === 'all'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDark
                          ? 'border-slate-700 hover:bg-slate-800'
                          : 'border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {lang === 'de'
                      ? `Alle (${activeProject.diagrams.length})`
                      : `All (${activeProject.diagrams.length})`}
                  </button>
                </div>
              </div>

              {/* Page Format & Orientation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.pageFormat}
                  </label>
                  <select
                    value={printSettings.pageFormat}
                    onChange={(e) =>
                      updatePrintSettings({
                        pageFormat: e.target.value as PrintSettings['pageFormat'],
                      })
                    }
                    className={`w-full rounded-lg border px-2.5 py-2 text-sm outline-none ${inputCls}`}
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    {t.dialogs.orientation}
                  </label>
                  <select
                    value={printSettings.orientation}
                    onChange={(e) =>
                      updatePrintSettings({
                        orientation: e.target.value as PrintSettings['orientation'],
                      })
                    }
                    className={`w-full rounded-lg border px-2.5 py-2 text-sm outline-none ${inputCls}`}
                  >
                    <option value="portrait">{t.dialogs.portrait}</option>
                    <option value="landscape">{t.dialogs.landscape}</option>
                  </select>
                </div>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  {t.dialogs.marginMm}
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={printSettings.marginMm}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(50, Number(e.target.value) || 0));
                    updatePrintSettings({ marginMm: val });
                  }}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
                />
              </div>

              {/* Header / Footer */}
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  {t.dialogs.headerText}
                </label>
                <input
                  type="text"
                  value={printSettings.headerText}
                  placeholder={t.placeholders.headerText}
                  onChange={(e) => updatePrintSettings({ headerText: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">
                  {t.dialogs.footerText}
                </label>
                <input
                  type="text"
                  value={printSettings.footerText}
                  placeholder={t.placeholders.footerText}
                  onChange={(e) => updatePrintSettings({ footerText: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={printSettings.scaleToFit}
                    onChange={(e) => updatePrintSettings({ scaleToFit: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm">{t.dialogs.scaleToFit}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={printSettings.showPageNumbers}
                    onChange={(e) => updatePrintSettings({ showPageNumbers: e.target.checked })}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm">{t.dialogs.showPageNumbers}</span>
                </label>
              </div>
            </div>

            {/* Right Live Paper Preview */}
            <div
              className={`lg:col-span-8 p-6 overflow-auto flex flex-col items-center gap-6 ${
                isDark ? 'bg-slate-950' : 'bg-slate-100'
              }`}
            >
              {svgPreviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-sm opacity-60 gap-2">
                  <FileText className="w-8 h-8" />
                  <span>{t.placeholders.emptyDiagram}</span>
                </div>
              ) : (
                svgPreviews.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      width: `${previewWidthPx}px`,
                      minHeight: `${previewHeightPx}px`,
                      padding: `${previewMarginPx}px`,
                    }}
                    className="bg-white text-slate-900 shadow-lg border border-slate-300 flex flex-col justify-between shrink-0"
                  >
                    {printSettings.headerText ? (
                      <div className="text-[10px] text-slate-500 border-b border-slate-200 pb-1 mb-2 truncate">
                        {printSettings.headerText}
                      </div>
                    ) : (
                      <div />
                    )}

                    <div
                      className={`flex-1 flex items-start justify-center overflow-hidden ${
                        printSettings.scaleToFit ? '[&>svg]:w-full [&>svg]:h-auto' : ''
                      }`}
                      dangerouslySetInnerHTML={{ __html: item.svg }}
                    />

                    {(printSettings.footerText || printSettings.showPageNumbers) && (
                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-200 pt-1 mt-2">
                        <span className="truncate">{printSettings.footerText}</span>
                        {printSettings.showPageNumbers && (
                          <span>
                            {idx + 1} / {svgPreviews.length}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div
            className={`flex items-center justify-end gap-2 px-5 py-3.5 border-t ${
              isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded-lg text-sm border transition-colors ${
                isDark
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.dialogs.close}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              {lang === 'de' ? 'Drucken / Als PDF speichern' : 'Print / Save as PDF'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
