import React, { useEffect, useRef } from 'react';
import {
  Pencil,
  Scissors,
  Copy,
  ClipboardPaste,
  CopyPlus,
  ArrowUp,
  ArrowDown,
  Palette,
  PlusSquare,
  ToggleLeft,
  Trash2,
  FilePlus2,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';
import { findNodeById } from '../model/operations';
import type { DiagramNode, InsertionTarget } from '../model/types';

export type ContextMenuState = {
  x: number;
  y: number;
  diagramId?: string;
  nodeId?: string;
} | null;

export interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onOpenNodeStyle: (diagramId: string, nodeId: string) => void;
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

interface CtxItemProps {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}

const CtxItem: React.FC<CtxItemProps> = ({
  label,
  icon,
  disabled = false,
  danger = false,
  onClick,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-xs transition-colors disabled:opacity-40 disabled:pointer-events-none ${
      danger
        ? 'text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white'
        : 'text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white'
    }`}
  >
    <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0">{icon}</span>
    <span className="truncate">{label}</span>
  </button>
);

const CtxDivider: React.FC = () => (
  <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
);

export const ContextMenu: React.FC<ContextMenuProps> = ({
  state,
  onClose,
  onOpenNodeStyle,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const language = useEditorStore((s) => s.appSettings.language);
  const project = useEditorStore((s) => s.getActiveProject());
  const clipboardNode = useEditorStore((s) => s.clipboardNode);
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);

  const setEditingNode = useEditorStore((s) => s.setEditingNode);
  const cutNode = useEditorStore((s) => s.cutNode);
  const copyNode = useEditorStore((s) => s.copyNode);
  const pasteNode = useEditorStore((s) => s.pasteNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const moveNodeUp = useEditorStore((s) => s.moveNodeUp);
  const moveNodeDown = useEditorStore((s) => s.moveNodeDown);
  const deleteNode = useEditorStore((s) => s.deleteNode);
  const addSwitchCase = useEditorStore((s) => s.addSwitchCase);
  const toggleSwitchDefault = useEditorStore((s) => s.toggleSwitchDefault);
  const addDiagram = useEditorStore((s) => s.addDiagram);
  const arrangeDiagramsGrid = useEditorStore((s) => s.arrangeDiagramsGrid);
  const resetView = useEditorStore((s) => s.resetView);

  useEffect(() => {
    if (!state) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [state, onClose]);

  if (!state) return null;

  const t = getTranslations(language);

  const run = (fn: () => void) => {
    fn();
    onClose();
  };

  // Clamp position to keep menu inside viewport
  const menuWidth = 220;
  const menuHeight = state.nodeId ? 340 : 160;
  const clampedX =
    typeof window !== 'undefined'
      ? Math.min(state.x, Math.max(8, window.innerWidth - menuWidth - 8))
      : state.x;
  const clampedY =
    typeof window !== 'undefined'
      ? Math.min(state.y, Math.max(8, window.innerHeight - menuHeight - 8))
      : state.y;

  const targetDiagram = state.diagramId
    ? project.diagrams.find((d) => d.id === state.diagramId)
    : project.diagrams.find((d) => d.id === (selectedDiagramId ?? project.activeDiagramId)) ??
      project.diagrams[0];

  const targetNode =
    state.nodeId && targetDiagram
      ? findNodeById(targetDiagram.nodes, state.nodeId)
      : null;

  const handlePasteAfterNode = () => {
    if (!targetDiagram || !state.nodeId || !clipboardNode) return;
    const afterTarget = findAfterNodeTarget(
      targetDiagram.nodes,
      state.nodeId,
      targetDiagram.id
    );
    if (afterTarget) {
      pasteNode(afterTarget);
    }
  };

  const handlePasteOnCanvas = () => {
    if (!targetDiagram || !clipboardNode) return;
    pasteNode({
      diagramId: targetDiagram.id,
      parentId: null,
      index: targetDiagram.nodes.length,
    });
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      style={{ left: clampedX, top: clampedY }}
      className="fixed z-50 min-w-[210px] py-1 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 select-none"
    >
      {state.nodeId && state.diagramId && targetNode ? (
        <>
          <CtxItem
            label={t.contextMenu.editText}
            icon={<Pencil className="w-3.5 h-3.5" />}
            onClick={() => run(() => setEditingNode(state.nodeId!))}
          />
          <CtxDivider />
          <CtxItem
            label={t.contextMenu.cut}
            icon={<Scissors className="w-3.5 h-3.5" />}
            onClick={() => run(() => cutNode(state.diagramId!, state.nodeId!))}
          />
          <CtxItem
            label={t.contextMenu.copy}
            icon={<Copy className="w-3.5 h-3.5" />}
            onClick={() => run(() => copyNode(state.diagramId!, state.nodeId!))}
          />
          <CtxItem
            label={t.contextMenu.pasteHere}
            icon={<ClipboardPaste className="w-3.5 h-3.5" />}
            disabled={!clipboardNode}
            onClick={() => run(handlePasteAfterNode)}
          />
          <CtxItem
            label={t.contextMenu.duplicate}
            icon={<CopyPlus className="w-3.5 h-3.5" />}
            onClick={() => run(() => duplicateNode(state.diagramId!, state.nodeId!))}
          />
          <CtxDivider />
          <CtxItem
            label={t.contextMenu.moveUp}
            icon={<ArrowUp className="w-3.5 h-3.5" />}
            onClick={() => run(() => moveNodeUp(state.diagramId!, state.nodeId!))}
          />
          <CtxItem
            label={t.contextMenu.moveDown}
            icon={<ArrowDown className="w-3.5 h-3.5" />}
            onClick={() => run(() => moveNodeDown(state.diagramId!, state.nodeId!))}
          />
          <CtxDivider />
          <CtxItem
            label={t.contextMenu.nodeStyle}
            icon={<Palette className="w-3.5 h-3.5" />}
            onClick={() =>
              run(() => onOpenNodeStyle(state.diagramId!, state.nodeId!))
            }
          />
          {targetNode.type === 'switch' && (
            <>
              <CtxDivider />
              <CtxItem
                label={t.contextMenu.addSwitchCase}
                icon={<PlusSquare className="w-3.5 h-3.5" />}
                onClick={() => run(() => addSwitchCase(state.diagramId!, state.nodeId!))}
              />
              <CtxItem
                label={t.contextMenu.toggleSwitchDefault}
                icon={<ToggleLeft className="w-3.5 h-3.5" />}
                onClick={() =>
                  run(() => toggleSwitchDefault(state.diagramId!, state.nodeId!))
                }
              />
            </>
          )}
          <CtxDivider />
          <CtxItem
            label={t.contextMenu.delete}
            icon={<Trash2 className="w-3.5 h-3.5" />}
            danger
            onClick={() => run(() => deleteNode(state.diagramId!, state.nodeId!))}
          />
        </>
      ) : (
        <>
          <CtxItem
            label={t.contextMenu.newDiagram}
            icon={<FilePlus2 className="w-3.5 h-3.5" />}
            onClick={() => run(() => addDiagram())}
          />
          <CtxItem
            label={t.contextMenu.arrangeGrid}
            icon={<LayoutGrid className="w-3.5 h-3.5" />}
            disabled={project.diagrams.length === 0}
            onClick={() => run(() => arrangeDiagramsGrid())}
          />
          <CtxItem
            label={t.contextMenu.resetView}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={() => run(resetView)}
          />
          {clipboardNode && targetDiagram && (
            <>
              <CtxDivider />
              <CtxItem
                label={t.contextMenu.pasteHere}
                icon={<ClipboardPaste className="w-3.5 h-3.5" />}
                onClick={() => run(handlePasteOnCanvas)}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
