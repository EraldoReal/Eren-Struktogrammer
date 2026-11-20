import React from 'react';
import { X } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';
import type { DiagramNode } from '../model/types';
import { getPlatformAdapter } from '../platform/adapter';

function countNodes(nodes: readonly DiagramNode[]): number {
  let total = 0;
  for (const node of nodes) {
    total += 1;
    switch (node.type) {
      case 'if':
        total += countNodes(node.thenBranch) + countNodes(node.elseBranch);
        break;
      case 'switch':
        for (const c of node.cases) {
          total += countNodes(c.body);
        }
        total += countNodes(node.defaultBranch);
        break;
      case 'while':
      case 'doWhile':
      case 'for':
        total += countNodes(node.body);
        break;
      case 'sequence':
      case 'subroutine':
        break;
    }
  }
  return total;
}

export const StatusBar: React.FC = () => {
  const activeInsertTool = useEditorStore((s) => s.activeInsertTool);
  const setActiveInsertTool = useEditorStore((s) => s.setActiveInsertTool);
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);
  const language = useEditorStore((s) => s.appSettings.language);
  const project = useEditorStore((s) => s.getActiveProject());

  const t = getTranslations(language);
  const isDe = language === 'de';
  const isDesktop = getPlatformAdapter().isDesktop;

  const activeDiagram =
    project.diagrams.find((d) => d.id === (selectedDiagramId ?? project.activeDiagramId)) ??
    project.diagrams[0] ??
    null;

  const nodeCount = activeDiagram ? countNodes(activeDiagram.nodes) : 0;
  const zoomPercent = Math.round(project.zoom * 100);

  return (
    <footer className="flex items-center justify-between gap-4 px-3 h-7 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 select-none">
      {/* Left: Insertion tool hint or ready state */}
      <div className="flex items-center gap-2 min-w-0">
        {activeInsertTool ? (
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-medium truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse shrink-0" />
            <span className="truncate">
              {isDe
                ? `Einfügemodus aktiv (${t.tools[activeInsertTool]}): ${t.tools.insertModeHint}`
                : `Insert mode (${t.tools[activeInsertTool]}): ${t.tools.insertModeHint}`}
            </span>
            <button
              type="button"
              onClick={() => setActiveInsertTool(null)}
              title={t.tools.cancelInsert}
              className="p-0.5 rounded hover:bg-blue-200/70 dark:hover:bg-blue-800/70 shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <span className="truncate text-slate-500 dark:text-slate-400">
            {t.status.ready}
          </span>
        )}
      </div>

      {/* Right: Diagram name, node count, zoom, platform */}
      <div className="flex items-center gap-3 shrink-0">
        {activeDiagram && (
          <>
            <span className="truncate max-w-[180px] font-medium text-slate-700 dark:text-slate-200">
              {activeDiagram.name}
            </span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
            <span className="tabular-nums">
              {nodeCount} {isDe ? (nodeCount === 1 ? 'Element' : 'Elemente') : nodeCount === 1 ? 'Element' : 'Elements'}
            </span>
            <span className="text-slate-400 dark:text-slate-600">|</span>
          </>
        )}

        <span className="tabular-nums font-mono">
          {t.status.zoom}: {zoomPercent}%
        </span>

        <span className="text-slate-400 dark:text-slate-600">|</span>

        <span className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-[10px] font-medium uppercase tracking-wide">
          {isDesktop ? 'Desktop' : 'Web'}
        </span>
      </div>
    </footer>
  );
};
