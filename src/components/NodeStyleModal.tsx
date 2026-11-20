import React, { useEffect, useState } from 'react';
import { X, RotateCcw, Paintbrush } from 'lucide-react';
import { findNodeById } from '../model/operations';
import type { NodeStyle } from '../model/types';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';

export interface NodeStyleModalProps {
  target: { diagramId: string; nodeId: string } | null;
  onClose: () => void;
}

const COLOR_SWATCHES = [
  '#ffffff',
  '#fef9c3', // warm yellow
  '#dbeafe', // light blue
  '#dcfce7', // light green
  '#fee2e2', // light red
  '#f3e8ff', // light purple
  '#ffedd5', // light orange
  '#f1f5f9', // slate
];

export const NodeStyleModal: React.FC<NodeStyleModalProps> = ({ target, onClose }) => {
  const appSettings = useEditorStore((s) => s.appSettings);
  const activeProject = useEditorStore((s) => s.getActiveProject());
  const updateNodeStyle = useEditorStore((s) => s.updateNodeStyle);

  const diagram = target
    ? activeProject.diagrams.find((d) => d.id === target.diagramId)
    : undefined;
  const node = diagram && target ? findNodeById(diagram.nodes, target.nodeId) : null;
  const globalStyle = activeProject.globalStyle;

  const [bgColor, setBgColor] = useState(globalStyle.backgroundColor);
  const [textColor, setTextColor] = useState(globalStyle.textColor);
  const [borderColor, setBorderColor] = useState(globalStyle.borderColor);
  const [fontSize, setFontSize] = useState<number>(globalStyle.fontSize);

  useEffect(() => {
    if (node) {
      setBgColor(node.style?.backgroundColor ?? globalStyle.backgroundColor);
      setTextColor(node.style?.textColor ?? globalStyle.textColor);
      setBorderColor(node.style?.borderColor ?? globalStyle.borderColor);
      setFontSize(node.style?.fontSize ?? globalStyle.fontSize);
    }
  }, [node, globalStyle]);

  if (!target || !node) return null;

  const t = getTranslations(appSettings.language);
  const isDark =
    appSettings.theme === 'dark' ||
    (appSettings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleApply = () => {
    const patch: Partial<NodeStyle> = {
      backgroundColor: bgColor,
      textColor,
      borderColor,
      fontSize,
    };
    updateNodeStyle(target.diagramId, target.nodeId, patch);
    onClose();
  };

  const handleReset = () => {
    updateNodeStyle(target.diagramId, target.nodeId, undefined);
    onClose();
  };

  const panelBg = isDark
    ? 'bg-slate-900 text-slate-100 border-slate-700'
    : 'bg-white text-slate-900 border-slate-200';
  const inputCls = isDark
    ? 'bg-slate-800 border-slate-700 text-slate-100 focus:border-blue-500'
    : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 no-print"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-xl border shadow-2xl overflow-hidden ${panelBg}`}
        role="dialog"
        aria-modal="true"
        aria-label={t.dialogs.nodeStyleTitle}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-semibold">{t.dialogs.nodeStyleTitle}</h2>
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
        <div className="p-5 space-y-4">
          {/* Quick Swatches */}
          <div>
            <span className="block text-xs font-medium mb-2 opacity-75">
              {t.dialogs.backgroundColor}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setBgColor(swatch)}
                  style={{ backgroundColor: swatch }}
                  className={`w-7 h-7 rounded-md border transition-transform hover:scale-105 ${
                    bgColor.toLowerCase() === swatch.toLowerCase()
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'border-slate-300'
                  }`}
                  title={swatch}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-transparent"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono outline-none ${inputCls}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5">{t.dialogs.textColor}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono outline-none ${inputCls}`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">{t.dialogs.borderColor}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5 bg-transparent"
                />
                <input
                  type="text"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className={`w-full rounded-lg border px-2.5 py-1.5 text-xs font-mono outline-none ${inputCls}`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5">{t.dialogs.fontSize}</label>
            <input
              type="number"
              min={9}
              max={28}
              value={fontSize}
              onChange={(e) => {
                const val = Math.max(9, Math.min(28, Number(e.target.value) || globalStyle.fontSize));
                setFontSize(val);
              }}
              className={`w-full rounded-lg border px-3 py-1.5 text-sm outline-none ${inputCls}`}
            />
          </div>

          {/* Live Preview */}
          <div
            className={`rounded-lg border p-4 flex items-center justify-center ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-100'
            }`}
          >
            <div
              style={{
                backgroundColor: bgColor,
                color: textColor,
                borderColor: borderColor,
                borderWidth: `${globalStyle.lineWidth}px`,
                borderStyle: 'solid',
                fontFamily: globalStyle.fontFamily,
                fontSize: `${fontSize}px`,
                padding: `${globalStyle.paddingY}px ${globalStyle.paddingX}px`,
              }}
              className="min-w-48 max-w-full truncate text-center"
            >
              {node.text || t.placeholders.nodeText}
            </div>
          </div>
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
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {t.dialogs.apply}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
