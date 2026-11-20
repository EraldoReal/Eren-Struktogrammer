import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  FileCode2,
  Image as ImageIcon,
  Printer,
  Camera,
  BookOpen,
  Check,
  Sun,
  Moon,
  Settings,
  MousePointer2,
  Plus,
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';
import type { DiagramNode, InsertionTarget, NodeType } from '../model/types';
import { layoutDiagram } from '../engine/layout';
import { renderDiagramToSvgString } from '../engine/svgExport';
import {
  exportPngFile,
  exportProjectScreenshotToClipboard,
  exportSvgFile,
} from '../export/exporter';
import { getPlatformAdapter } from '../platform/adapter';

export interface ToolbarProps {
  onOpenSettings: () => void;
  onOpenPrint: () => void;
  operatorsOpen?: boolean;
  onToggleOperators?: () => void;
  onNotify?: (message: string) => void;
}

export const NODE_TOOL_ORDER: NodeType[] = [
  'sequence',
  'subroutine',
  'if',
  'switch',
  'while',
  'doWhile',
  'for',
];

export function DinNodeIcon({
  type,
  className = 'w-5 h-4',
}: {
  type: NodeType;
  className?: string;
}) {
  switch (type) {
    case 'sequence':
      return (
        <svg viewBox="0 0 24 20" fill="none" className={className} aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="1" stroke="currentColor" strokeWidth="1.6" />
          <line x1="6" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <line x1="6" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'subroutine':
      return (
        <svg viewBox="0 0 24 20" fill="none" className={className} aria-hidden="true">
          <rect x="2" y="3" width="20" height="14" rx="1" stroke="currentColor" strokeWidth="1.6" />
          <line x1="5.5" y1="3" x2="5.5" y2="17" stroke="currentColor" strokeWidth="1.4" />
          <line x1="18.5" y1="3" x2="18.5" y2="17" stroke="currentColor" strokeWidth="1.4" />
          <line x1="8.5" y1="10" x2="15.5" y2="10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    case 'if':
      return (
        <svg viewBox="0 0 24 20" fill="none" className={className} aria-hidden="true">
          <rect x="2" y="2.5" width="20" height="15" rx="1" stroke="currentColor" strokeWidth="1.6" />
          <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.3" />
          <line x1="2" y1="2.5" x2="12" y2="10" stroke="currentColor" strokeWidth="1.3" />
          <line x1="22" y1="2.5" x2="12" y2="10" stroke="currentColor" strokeWidth="1.3" />
          <line x1="12" y1="10" x2="12" y2="17.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case 'switch':
      return (
        <svg viewBox="0 0 24 20" fill="none" className={className} aria-hidden="true">
          <rect x="2" y="2.5" width="20" height="15" rx="1" stroke="currentColor" strokeWidth="1.6" />
          <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.3" />
          <line x1="2" y1="2.5" x2="16" y2="10" stroke="currentColor" strokeWidth="1.3" />
          <line x1="22" y1="2.5" x2="16" y2="10" stroke="currentColor" strokeWidth="1.3" />
          <line x1="9" y1="10" x2="9" y2="17.5" stroke="currentColor" strokeWidth="1.3" />
          <line x1="16" y1="10" x2="16" y2="17.5" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case 'while':
      return (
        <svg viewBox="0 0 24 20" fill="none" className={className} aria-hidden="true">
          <path
            d="M2 2.5 H22 V7.5 H7 V17.5 H2 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="7" y="7.5" width="15" height="10" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case 'doWhile':
      return (
        <svg viewBox="0 0 24 20" fill="none" className={className} aria-hidden="true">
          <path
            d="M2 2.5 H7 V12.5 H22 V17.5 H2 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <rect x="7" y="2.5" width="15" height="10" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case 'for':
      return (
        <svg viewBox="0 0 24 20" fill="none" className={className} aria-hidden="true">
          <path
            d="M2 2.5 H22 V7.5 H7 V17.5 H2 Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <line x1="5" y1="5" x2="19" y2="5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <rect x="7" y="7.5" width="15" height="10" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
  }
}

function findAfterNodeTarget(
  nodes: readonly DiagramNode[],
  nodeId: string,
  diagramId: string,
  parentId: string | null = null,
  branchKey?: InsertionTarget['branchKey']
): InsertionTarget | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.id === nodeId) {
      return {
        diagramId,
        parentId,
        ...(branchKey !== undefined ? { branchKey } : {}),
        index: i + 1,
      };
    }
    switch (node.type) {
      case 'if': {
        const t = findAfterNodeTarget(node.thenBranch, nodeId, diagramId, node.id, 'then');
        if (t) return t;
        const e = findAfterNodeTarget(node.elseBranch, nodeId, diagramId, node.id, 'else');
        if (e) return e;
        break;
      }
      case 'switch': {
        for (const c of node.cases) {
          const hit = findAfterNodeTarget(c.body, nodeId, diagramId, node.id, c.id);
          if (hit) return hit;
        }
        const d = findAfterNodeTarget(node.defaultBranch, nodeId, diagramId, node.id, 'default');
        if (d) return d;
        break;
      }
      case 'while':
      case 'doWhile':
      case 'for': {
        const b = findAfterNodeTarget(node.body, nodeId, diagramId, node.id, 'body');
        if (b) return b;
        break;
      }
      case 'sequence':
      case 'subroutine':
        break;
    }
  }
  return null;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onOpenSettings,
  onOpenPrint,
  operatorsOpen = false,
  onToggleOperators,
  onNotify,
}) => {
  const [screenshotStatus, setScreenshotStatus] = useState<'idle' | 'copied' | 'saved'>('idle');
  const activeInsertTool = useEditorStore((s) => s.activeInsertTool);
  const setActiveInsertTool = useEditorStore((s) => s.setActiveInsertTool);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);
  const insertNode = useEditorStore((s) => s.insertNode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const setZoom = useEditorStore((s) => s.setZoom);
  const resetView = useEditorStore((s) => s.resetView);
  const arrangeDiagramsGrid = useEditorStore((s) => s.arrangeDiagramsGrid);
  const appSettings = useEditorStore((s) => s.appSettings);
  const updateAppSettings = useEditorStore((s) => s.updateAppSettings);
  const project = useEditorStore((s) => s.getActiveProject());

  const t = getTranslations(appSettings.language);
  const isDark =
    appSettings.theme === 'dark' ||
    (appSettings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  const activeDiagram =
    project.diagrams.find((d) => d.id === (selectedDiagramId ?? project.activeDiagramId)) ??
    project.diagrams[0] ??
    null;

  const handleQuickAdd = () => {
    if (!activeDiagram) return;
    const toolToAdd: NodeType = activeInsertTool ?? 'sequence';
    let target: InsertionTarget | null = null;
    if (selectedNodeId) {
      target = findAfterNodeTarget(activeDiagram.nodes, selectedNodeId, activeDiagram.id);
    }
    if (!target) {
      target = {
        diagramId: activeDiagram.id,
        parentId: null,
        index: activeDiagram.nodes.length,
      };
    }
    insertNode(target, toolToAdd);
  };

  const handleExportSvg = async () => {
    if (!activeDiagram) return;
    const svg = renderDiagramToSvgString(activeDiagram, project.globalStyle);
    await exportSvgFile(svg, activeDiagram.name, getPlatformAdapter());
  };

  const handleExportPng = async () => {
    if (!activeDiagram) return;
    const padding = 16;
    const layout = layoutDiagram(activeDiagram, project.globalStyle);
    const svg = renderDiagramToSvgString(activeDiagram, project.globalStyle, { padding });
    await exportPngFile(
      svg,
      layout.width + padding * 2,
      layout.height + padding * 2,
      2,
      false,
      activeDiagram.name,
      getPlatformAdapter()
    );
  };

  const toggleTheme = () => {
    updateAppSettings({ theme: isDark ? 'light' : 'dark' });
  };

  const undoDisabled = !canUndo();
  const redoDisabled = !canRedo();
  const zoomPercent = Math.round(project.zoom * 100);

  return (
    <div
      role="toolbar"
      aria-label="Editor Toolbar"
      className="flex flex-wrap items-center gap-1 gap-y-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 select-none"
    >
      {/* Pointer / Select Tool */}
      <button
        type="button"
        onClick={() => setActiveInsertTool(null)}
        title={`${t.tools.select} (Esc)`}
        className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
          activeInsertTool === null
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800'
        }`}
      >
        <MousePointer2 className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* 7 DIN 66261 Element Tools */}
      <div className="flex items-center gap-0.5">
        {NODE_TOOL_ORDER.map((type, idx) => {
          const isActive = activeInsertTool === type;
          const label = t.tools[type];
          const desc = t.tools[`${type}Desc` as keyof typeof t.tools] as string;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveInsertTool(isActive ? null : type)}
              title={`${label} (${idx + 1}) – ${desc}`}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800'
              }`}
            >
              <DinNodeIcon type={type} className="w-5 h-4 shrink-0" />
              <span className="hidden xl:inline whitespace-nowrap">{label}</span>
            </button>
          );
        })}

        {/* Quick Add button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!activeDiagram}
          title={
            appSettings.language === 'de'
              ? `Schnell einfügen (${t.tools[activeInsertTool ?? 'sequence']})`
              : `Quick Add (${t.tools[activeInsertTool ?? 'sequence']})`
          }
          className="ml-0.5 flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">
            {appSettings.language === 'de' ? 'Einfügen' : 'Quick Add'}
          </span>
        </button>
      </div>

      <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Undo / Redo */}
      <button
        type="button"
        onClick={undo}
        disabled={undoDisabled}
        title={`${t.menu.undo} (Ctrl+Z)`}
        className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none transition-colors"
      >
        <Undo2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={redo}
        disabled={redoDisabled}
        title={`${t.menu.redo} (Ctrl+Y)`}
        className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none transition-colors"
      >
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Zoom controls */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => setZoom(project.zoom - 0.15)}
          title={`${t.menu.zoomOut} (Ctrl+-)`}
          className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={resetView}
          title={`${t.menu.resetView} (Ctrl+0)`}
          className="px-1.5 py-1 rounded text-xs font-mono tabular-nums text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 min-w-[46px] text-center transition-colors"
        >
          {zoomPercent}%
        </button>
        <button
          type="button"
          onClick={() => setZoom(project.zoom + 0.15)}
          title={`${t.menu.zoomIn} (Ctrl++)`}
          className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

      {/* Arrange Grid */}
      <button
        type="button"
        onClick={() => arrangeDiagramsGrid()}
        disabled={project.diagrams.length === 0}
        title={t.menu.arrangeGrid}
        className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none transition-colors"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>

      {/* Export SVG / PNG / Print */}
      <button
        type="button"
        onClick={() => void handleExportSvg()}
        disabled={!activeDiagram}
        title={t.menu.exportSvg}
        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none transition-colors"
      >
        <FileCode2 className="w-4 h-4" />
        <span className="hidden md:inline">SVG</span>
      </button>
      <button
        type="button"
        onClick={() => void handleExportPng()}
        disabled={!activeDiagram}
        title={`${t.menu.exportPng} (2x)`}
        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none transition-colors"
      >
        <ImageIcon className="w-4 h-4" />
        <span className="hidden md:inline">PNG</span>
      </button>
      <button
        type="button"
        onClick={onOpenPrint}
        title={`${t.menu.print} (Ctrl+P)`}
        className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
      >
        <Printer className="w-4 h-4" />
      </button>

      {/* Complete Screenshot -> Clipboard */}
      <button
        type="button"
        onClick={async () => {
          const result = await exportProjectScreenshotToClipboard(
            project,
            getPlatformAdapter()
          );
          if (result === 'clipboard' || result === 'downloaded') {
            setScreenshotStatus(result === 'clipboard' ? 'copied' : 'saved');
            onNotify?.(
              result === 'clipboard'
                ? 'Screenshot aller Struktogramme in die Zwischenablage kopiert!'
                : 'Screenshot als PNG-Datei gespeichert!'
            );
            setTimeout(() => setScreenshotStatus('idle'), 2000);
          }
        }}
        disabled={project.diagrams.length === 0}
        title="Kompletten Screenshot aller Struktogramme in Zwischenablage kopieren"
        className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 disabled:opacity-35 disabled:pointer-events-none transition-colors"
      >
        {screenshotStatus !== 'idle' ? (
          <>
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">
              {screenshotStatus === 'copied' ? 'Kopiert!' : 'Gespeichert'}
            </span>
          </>
        ) : (
          <>
            <Camera className="w-4 h-4" />
            <span className="hidden lg:inline">Screenshot</span>
          </>
        )}
      </button>

      {/* Sticky Operators Sidebar Toggle */}
      {onToggleOperators && (
        <button
          type="button"
          onClick={onToggleOperators}
          aria-pressed={operatorsOpen}
          title="Operatorenliste (BW Abitur v2.2) ein-/ausblenden"
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            operatorsOpen
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden md:inline">Operatoren</span>
        </button>
      )}

      <div className="flex-1" />

      {/* Theme Toggle & Settings */}
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? t.menu.themeLight : t.menu.themeDark}
        className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={onOpenSettings}
        title={t.menu.appSettings}
        className="p-1.5 rounded text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
};
