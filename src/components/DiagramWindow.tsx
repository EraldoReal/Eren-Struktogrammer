import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  Image as ImageIcon,
  Maximize2,
  Minus,
  X,
} from 'lucide-react';
import { DEFAULT_DIAGRAM_WIDTH, layoutDiagram } from '../engine/layout';
import { renderDiagramToSvgString } from '../engine/svgExport';
import { exportPngFile, exportSvgFile } from '../export/exporter';
import type { StruktogrammDocument } from '../model/types';
import { getPlatformAdapter } from '../platform/adapter';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';
import { DiagramRenderer } from './DiagramRenderer';

export interface DiagramWindowProps {
  doc: StruktogrammDocument;
  zoom: number;
  isActive: boolean;
  onContextMenuNode: (e: React.MouseEvent, diagramId: string, nodeId: string) => void;
}

export const DiagramWindow: React.FC<DiagramWindowProps> = ({
  doc,
  zoom,
  isActive,
  onContextMenuNode,
}) => {
  const globalStyle = useEditorStore(
    (s) => (s.projects.find((p) => p.id === s.activeProjectId) ?? s.projects[0]).globalStyle,
  );
  const language = useEditorStore((s) => s.appSettings.language);
  const focusDiagram = useEditorStore((s) => s.focusDiagram);
  const moveDiagram = useEditorStore((s) => s.moveDiagram);
  const resizeDiagram = useEditorStore((s) => s.resizeDiagram);
  const scaleDiagram = useEditorStore((s) => s.scaleDiagram);
  const renameDiagram = useEditorStore((s) => s.renameDiagram);
  const toggleMinimizeDiagram = useEditorStore((s) => s.toggleMinimizeDiagram);
  const removeDiagram = useEditorStore((s) => s.removeDiagram);

  const t = getTranslations(language);

  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeWidth, setResizeWidth] = useState<number | null>(null);
  const [scalePreview, setScalePreview] = useState<{
    width: number;
    fontSize: number;
    paddingX: number;
    paddingY: number;
  } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(doc.name);
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const handleWindowMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    focusDiagram(doc.id);
  };

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || isRenaming) return;
    if ((e.target as HTMLElement).closest('button, input')) return;

    e.preventDefault();
    e.stopPropagation();
    focusDiagram(doc.id);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const origX = doc.x;
    const origY = doc.y;
    let latestX = origX;
    let latestY = origY;

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startClientX) / zoom;
      const dy = (ev.clientY - startClientY) / zoom;
      latestX = Math.round(origX + dx);
      latestY = Math.round(origY + dy);
      setDragPos({ x: latestX, y: latestY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setDragPos(null);
      if (latestX !== origX || latestY !== origY) {
        moveDiagram(doc.id, latestX, latestY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    focusDiagram(doc.id);

    const startClientX = e.clientX;
    const origWidth = doc.width ?? DEFAULT_DIAGRAM_WIDTH;
    let latestWidth = origWidth;

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startClientX) / zoom;
      latestWidth = Math.max(220, Math.min(2400, Math.round(origWidth + dx)));
      setResizeWidth(latestWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setResizeWidth(null);
      // Compare with the width at drag start: a plain click must not create a history entry.
      if (latestWidth !== origWidth) {
        resizeDiagram(doc.id, latestWidth);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleScaleMouseDown = (e: React.MouseEvent, mode: 'vertical' | 'corner') => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    focusDiagram(doc.id);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const currentLayout = layoutDiagram(doc, globalStyle);
    const origWidth = doc.width ?? currentLayout.width ?? DEFAULT_DIAGRAM_WIDTH;
    const origHeight = Math.max(80, currentLayout.height);
    const origFontSize = doc.style?.fontSize ?? globalStyle.fontSize;
    const origPaddingX = doc.style?.paddingX ?? globalStyle.paddingX;
    const origPaddingY = doc.style?.paddingY ?? globalStyle.paddingY;

    let latest = {
      width: origWidth,
      fontSize: origFontSize,
      paddingX: origPaddingX,
      paddingY: origPaddingY,
    };

    const handleMouseMove = (ev: MouseEvent) => {
      const dx = (ev.clientX - startClientX) / zoom;
      const dy = (ev.clientY - startClientY) / zoom;
      const factorY = Math.max(0.6, Math.min(2.8, (origHeight + dy) / origHeight));
      const nextFontSize = Math.max(9, Math.min(36, Math.round(origFontSize * factorY)));
      const actualFactor = nextFontSize / origFontSize;
      const nextWidth =
        mode === 'corner'
          ? Math.max(220, Math.min(2400, Math.round(origWidth + dx)))
          : Math.max(220, Math.min(2400, Math.round(origWidth * actualFactor)));

      latest = {
        width: nextWidth,
        fontSize: nextFontSize,
        paddingX: Math.max(4, Math.round(origPaddingX * actualFactor)),
        paddingY: Math.max(4, Math.round(origPaddingY * actualFactor)),
      };
      setScalePreview(latest);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      setScalePreview(null);
      scaleDiagram(
        doc.id,
        latest.width,
        latest.fontSize,
        latest.paddingX,
        latest.paddingY,
      );
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== doc.name) {
      renameDiagram(doc.id, trimmed);
    }
    setIsRenaming(false);
  };

  const handleExportSvg = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const svg = renderDiagramToSvgString(doc, globalStyle, { padding: 16 });
    await exportSvgFile(svg, doc.name || 'diagram', getPlatformAdapter());
  };

  const handleExportPng = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const padding = 16;
    const layout = layoutDiagram(doc, globalStyle);
    const svg = renderDiagramToSvgString(doc, globalStyle, { padding });
    await exportPngFile(
      svg,
      layout.width + padding * 2,
      layout.height + padding * 2,
      2,
      false,
      doc.name || 'diagram',
      getPlatformAdapter(),
    );
  };

  const displayX = dragPos?.x ?? doc.x;
  const displayY = dragPos?.y ?? doc.y;
  const previewDoc: StruktogrammDocument = scalePreview
    ? {
        ...doc,
        width: scalePreview.width,
        style: {
          ...doc.style,
          fontSize: scalePreview.fontSize,
          paddingX: scalePreview.paddingX,
          paddingY: scalePreview.paddingY,
        },
      }
    : resizeWidth !== null
      ? { ...doc, width: resizeWidth }
      : doc;

  return (
    <div
      style={{
        position: 'absolute',
        left: displayX,
        top: displayY,
        zIndex: doc.zIndex,
        minWidth: doc.minimized ? 260 : undefined,
      }}
      onMouseDown={handleWindowMouseDown}
      onContextMenu={(e) => e.stopPropagation()}
      className={`pointer-events-auto rounded-xl border bg-white dark:bg-slate-900 shadow-lg transition-shadow ${
        isActive
          ? 'border-blue-500/70 ring-2 ring-blue-500/25 shadow-xl'
          : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
      }`}
    >
      {/* Window Chrome Header */}
      <div
        onMouseDown={handleHeaderMouseDown}
        className={`flex items-center justify-between gap-2 px-3 py-2 select-none cursor-grab active:cursor-grabbing border-b ${
          doc.minimized ? 'rounded-xl border-b-0' : 'rounded-t-xl'
        } ${
          isActive
            ? 'bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700'
            : 'bg-slate-100/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
        }`}
      >
        <div
          className="flex items-center gap-1.5 min-w-0 flex-1"
          onDoubleClick={(e) => {
            e.stopPropagation();
            setRenameValue(doc.name);
            setIsRenaming(true);
          }}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isActive ? 'bg-blue-500' : 'bg-slate-400 dark:bg-slate-500'
            }`}
          />
          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitRename();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  setIsRenaming(false);
                }
              }}
              className="w-full min-w-[120px] px-1.5 py-0.5 text-xs font-semibold rounded border border-blue-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
            />
          ) : (
            <div className="flex items-baseline gap-1 min-w-0 truncate">
              <span
                title={doc.name}
                className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate"
              >
                {doc.name}
              </span>
              {doc.parameterList?.trim() && (
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  ({doc.parameterList.trim()})
                </span>
              )}
              {doc.dirty && (
                <span
                  title={t.status.unsaved}
                  className="text-amber-500 text-xs font-bold leading-none shrink-0"
                >
                  •
                </span>
              )}
            </div>
          )}
        </div>

        {/* Window Action Buttons */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={handleExportSvg}
            title={t.menu.exportSvg}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/70 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleExportPng}
            title={t.menu.exportPng}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/70 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMinimizeDiagram(doc.id);
            }}
            title={doc.minimized ? t.menu.restoreDiagram : t.menu.minimizeDiagram}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/70 transition-colors cursor-pointer"
          >
            {doc.minimized ? (
              <Maximize2 className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeDiagram(doc.id);
            }}
            title={t.menu.removeDiagram}
            className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body */}
      {!doc.minimized && (
        <div className="relative p-3 bg-white dark:bg-slate-950/60 rounded-b-xl">
          <DiagramRenderer doc={previewDoc} onContextMenuNode={onContextMenuNode} />

          {/* Right-edge horizontal resize handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            title="Breite anpassen"
            className="absolute top-0 right-0 bottom-3 w-2 cursor-ew-resize group flex items-center justify-center"
          >
            <div className="w-0.5 h-8 rounded-full bg-transparent group-hover:bg-blue-400 transition-colors" />
          </div>

          {/* Bottom-edge vertical scale handle (scales height & font size) */}
          <div
            onMouseDown={(e) => handleScaleMouseDown(e, 'vertical')}
            title="Größe & Textgröße nach unten anpassen"
            className="absolute left-0 right-3 bottom-0 h-2 cursor-ns-resize group flex items-center justify-center"
          >
            <div className="h-0.5 w-8 rounded-full bg-transparent group-hover:bg-blue-400 transition-colors" />
          </div>

          {/* Bottom-right corner proportional scale handle */}
          <div
            onMouseDown={(e) => handleScaleMouseDown(e, 'corner')}
            title="Größe & Textgröße proportional anpassen"
            className="absolute right-0 bottom-0 w-3.5 h-3.5 cursor-nwse-resize group flex items-end justify-end p-0.5"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400/60 group-hover:border-blue-500 rounded-br-sm transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
};
