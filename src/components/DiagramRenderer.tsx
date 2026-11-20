import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  layoutDiagram,
  type LayoutNode,
  type LayoutTextBlock,
  type Rect,
} from '../engine/layout';
import { updateNodeById } from '../model/operations';
import type { StruktogrammDocument } from '../model/types';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';
import { SymbolPicker } from './SymbolPicker';

export interface DiagramRendererProps {
  doc: StruktogrammDocument;
  onContextMenuNode?: (e: React.MouseEvent, diagramId: string, nodeId: string) => void;
}

type EditTarget =
  | { kind: 'nodeText'; nodeId: string; rect: Rect; fontSize: number; fontFamily: string; align: 'left' | 'center' | 'right' }
  | { kind: 'ifLabel'; nodeId: string; side: 'true' | 'false'; rect: Rect; fontSize: number; fontFamily: string; align: 'left' | 'center' | 'right' }
  | { kind: 'switchCase'; nodeId: string; caseKey: string; rect: Rect; fontSize: number; fontFamily: string; align: 'left' | 'center' | 'right' };

function SvgTextBlock({ block }: { block: LayoutTextBlock }) {
  const lineH = Math.ceil(block.fontSize * 1.35);
  const totalTextH = block.lines.length * lineH;

  let textX = block.x;
  let anchor: 'start' | 'middle' | 'end' = 'start';
  if (block.align === 'center') {
    textX = block.x + block.width / 2;
    anchor = 'middle';
  } else if (block.align === 'right') {
    textX = block.x + block.width;
    anchor = 'end';
  }

  let startY = block.y + lineH / 2;
  if (block.verticalAlign === 'middle') {
    startY = block.y + (block.height - totalTextH) / 2 + lineH / 2;
  } else if (block.verticalAlign === 'bottom') {
    startY = block.y + block.height - totalTextH + lineH / 2;
  }

  return (
    <text
      x={textX}
      y={startY}
      textAnchor={anchor}
      dominantBaseline="central"
      fontFamily={block.fontFamily}
      fontSize={block.fontSize}
      fontWeight={block.fontWeight ?? 'normal'}
      fontStyle={block.fontStyle ?? 'normal'}
      fill={block.color}
      style={{ userSelect: 'none', pointerEvents: 'none' }}
    >
      {block.lines.map((line, idx) => (
        <tspan key={idx} x={textX} y={startY + idx * lineH}>
          {line.length > 0 ? line : '\u00A0'}
        </tspan>
      ))}
    </text>
  );
}

function getNodeEditorRect(ln: LayoutNode): {
  rect: Rect;
  fontSize: number;
  fontFamily: string;
  align: 'left' | 'center' | 'right';
} {
  const tb = ln.textBlocks[0];
  if (ln.type === 'if' && ln.headerRect) {
    return {
      rect: {
        x: ln.headerRect.x + ln.headerRect.width * 0.15,
        y: ln.headerRect.y + 2,
        width: Math.max(80, ln.headerRect.width * 0.7),
        height: Math.max(24, ln.headerRect.height * 0.62),
      },
      fontSize: tb?.fontSize ?? ln.style.fontSize,
      fontFamily: tb?.fontFamily ?? ln.style.fontFamily,
      align: 'center',
    };
  }
  if (ln.type === 'switch' && ln.headerRect && tb) {
    return {
      rect: {
        x: ln.headerRect.x + 4,
        y: ln.headerRect.y + 2,
        width: Math.max(80, ln.headerRect.width - 8),
        height: Math.max(24, tb.height + 6),
      },
      fontSize: tb.fontSize,
      fontFamily: tb.fontFamily,
      align: 'center',
    };
  }
  if (ln.type === 'while' || ln.type === 'for') {
    const r = ln.headerRect ?? { x: ln.x, y: ln.y, width: ln.width, height: 28 };
    return {
      rect: r,
      fontSize: tb?.fontSize ?? ln.style.fontSize,
      fontFamily: tb?.fontFamily ?? ln.style.fontFamily,
      align: 'left',
    };
  }
  if (ln.type === 'doWhile') {
    const r = ln.footerRect ?? { x: ln.x, y: ln.y + ln.height - 28, width: ln.width, height: 28 };
    return {
      rect: r,
      fontSize: tb?.fontSize ?? ln.style.fontSize,
      fontFamily: tb?.fontFamily ?? ln.style.fontFamily,
      align: 'left',
    };
  }
  return {
    rect: { x: ln.x, y: ln.y, width: ln.width, height: ln.height },
    fontSize: tb?.fontSize ?? ln.style.fontSize,
    fontFamily: tb?.fontFamily ?? ln.style.fontFamily,
    align: ln.type === 'subroutine' ? 'center' : 'left',
  };
}

export const DiagramRenderer: React.FC<DiagramRendererProps> = ({
  doc,
  onContextMenuNode,
}) => {
  const globalStyle = useEditorStore(
    (s) => (s.projects.find((p) => p.id === s.activeProjectId) ?? s.projects[0]).globalStyle,
  );
  const activeInsertTool = useEditorStore((s) => s.activeInsertTool);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);
  const editingNodeId = useEditorStore((s) => s.editingNodeId);
  const showInsertionHints = useEditorStore((s) => s.appSettings.showInsertionHints);
  const language = useEditorStore((s) => s.appSettings.language);

  const selectNode = useEditorStore((s) => s.selectNode);
  const setEditingNode = useEditorStore((s) => s.setEditingNode);
  const setActiveInsertTool = useEditorStore((s) => s.setActiveInsertTool);
  const insertNode = useEditorStore((s) => s.insertNode);
  const updateNodeText = useEditorStore((s) => s.updateNodeText);
  const updateIfLabels = useEditorStore((s) => s.updateIfLabels);
  const focusDiagram = useEditorStore((s) => s.focusDiagram);

  const t = getTranslations(language);

  const layout = useMemo(() => layoutDiagram(doc, globalStyle), [doc, globalStyle]);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredZoneIdx, setHoveredZoneIdx] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editValue, setEditValue] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editStateRef = useRef<{ target: EditTarget; value: string } | null>(null);
  editStateRef.current = editTarget ? { target: editTarget, value: editValue } : null;

  // Sync external editingNodeId (e.g. from context menu "Edit Text" or Enter key)
  useEffect(() => {
    if (!editingNodeId || selectedDiagramId !== doc.id) {
      if (editTarget && editTarget.kind === 'nodeText' && editingNodeId === null) {
        commitEdit();
      }
      return;
    }
    if (editTarget && editTarget.nodeId === editingNodeId && editTarget.kind === 'nodeText') {
      return;
    }
    const ln = layout.flatNodes.find((n) => n.id === editingNodeId);
    if (!ln) return;
    const editorInfo = getNodeEditorRect(ln);
    setEditTarget({
      kind: 'nodeText',
      nodeId: ln.id,
      ...editorInfo,
    });
    setEditValue(ln.node.text);
  }, [editingNodeId, selectedDiagramId, doc.id, layout.flatNodes, editTarget]);

  // Focus and select textarea when editTarget opens
  useEffect(() => {
    if (!editTarget) return;
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.select();
  }, [editTarget]);

  // Press Enter on selected node to start inline editing
  useEffect(() => {
    if (selectedDiagramId !== doc.id || !selectedNodeId || editTarget || editingNodeId) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.ctrlKey || e.metaKey || e.altKey) return;
      const active = document.activeElement;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement
      ) {
        return;
      }
      e.preventDefault();
      setEditingNode(selectedNodeId);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDiagramId, selectedNodeId, doc.id, editTarget, editingNodeId, setEditingNode]);

  const commitEdit = () => {
    const current = editStateRef.current;
    if (!current) return;
    editStateRef.current = null;
    const { target: activeTarget, value: activeValue } = current;

    if (activeTarget.kind === 'nodeText') {
      updateNodeText(doc.id, activeTarget.nodeId, activeValue);
    } else if (activeTarget.kind === 'ifLabel') {
      const ln = layout.flatNodes.find((n) => n.id === activeTarget.nodeId);
      if (ln && ln.node.type === 'if') {
        const nextTrue = activeTarget.side === 'true' ? activeValue : ln.node.trueLabel;
        const nextFalse = activeTarget.side === 'false' ? activeValue : ln.node.falseLabel;
        updateIfLabels(doc.id, activeTarget.nodeId, nextTrue, nextFalse);
      }
    } else if (activeTarget.kind === 'switchCase') {
      useEditorStore.setState((state) => {
        const projIdx = state.projects.findIndex((p) => p.id === state.activeProjectId);
        if (projIdx === -1) return state;
        const proj = state.projects[projIdx];
        const diagIdx = proj.diagrams.findIndex((d) => d.id === doc.id);
        if (diagIdx === -1) return state;
        const diag = proj.diagrams[diagIdx];
        const nextNodes = updateNodeById(diag.nodes, activeTarget.nodeId, (node) => {
          if (node.type !== 'switch') return node;
          if (activeTarget.caseKey === 'default') {
            return { ...node, defaultLabel: activeValue };
          }
          return {
            ...node,
            cases: node.cases.map((c) =>
              c.id === activeTarget.caseKey ? { ...c, label: activeValue } : c,
            ),
          };
        });
        const nextDiagrams = [...proj.diagrams];
        nextDiagrams[diagIdx] = { ...diag, nodes: nextNodes, dirty: true };
        const nextProjects = [...state.projects];
        nextProjects[projIdx] = { ...proj, diagrams: nextDiagrams, dirty: true };
        return { projects: nextProjects };
      });
    }

    setEditTarget(null);
    setEditingNode(null);
  };

  const cancelEdit = () => {
    editStateRef.current = null;
    setEditTarget(null);
    setEditingNode(null);
  };

  const handleInsertSymbol = (symbol: string) => {
    const el = textareaRef.current;
    if (!el) {
      setEditValue((prev) => prev + symbol);
      return;
    }
    const start = el.selectionStart ?? editValue.length;
    const end = el.selectionEnd ?? editValue.length;
    const next = editValue.slice(0, start) + symbol + editValue.slice(end);
    setEditValue(next);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const pos = start + symbol.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(pos, pos);
      }
    });
  };

  const startNodeTextEdit = (ln: LayoutNode) => {
    const editorInfo = getNodeEditorRect(ln);
    setEditTarget({
      kind: 'nodeText',
      nodeId: ln.id,
      ...editorInfo,
    });
    setEditValue(ln.node.text);
    setEditingNode(ln.id);
  };

  const startIfLabelEdit = (ln: LayoutNode, side: 'true' | 'false') => {
    if (ln.node.type !== 'if') return;
    const block = side === 'true' ? ln.textBlocks[1] : ln.textBlocks[2];
    if (!block) return;
    setEditTarget({
      kind: 'ifLabel',
      nodeId: ln.id,
      side,
      rect: {
        x: block.x - 2,
        y: block.y - 2,
        width: Math.max(48, block.width + 4),
        height: Math.max(22, block.height + 4),
      },
      fontSize: block.fontSize,
      fontFamily: block.fontFamily,
      align: block.align,
    });
    setEditValue(side === 'true' ? ln.node.trueLabel : ln.node.falseLabel);
  };

  const startSwitchCaseEdit = (ln: LayoutNode, branchIdx: number) => {
    if (ln.node.type !== 'switch') return;
    const branch = ln.branches[branchIdx];
    const block = ln.textBlocks[branchIdx + 1];
    if (!branch || !block) return;
    setEditTarget({
      kind: 'switchCase',
      nodeId: ln.id,
      caseKey: branch.key,
      rect: {
        x: block.x - 2,
        y: block.y - 2,
        width: Math.max(48, block.width + 4),
        height: Math.max(22, block.height + 4),
      },
      fontSize: block.fontSize,
      fontFamily: block.fontFamily,
      align: 'center',
    });
    setEditValue(branch.label ?? '');
  };

  const renderNode = (ln: LayoutNode): React.ReactNode => {
    const isSelected = selectedDiagramId === doc.id && selectedNodeId === ln.id;
    const isHovered = !activeInsertTool && hoveredNodeId === ln.id;
    const { style } = ln;

    return (
      <g
        key={ln.id}
        data-node-id={ln.id}
        data-node-type={ln.type}
        onMouseOver={(e) => {
          e.stopPropagation();
          setHoveredNodeId(ln.id);
        }}
        onMouseOut={(e) => {
          e.stopPropagation();
          setHoveredNodeId((prev) => (prev === ln.id ? null : prev));
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (activeInsertTool) return;
          focusDiagram(doc.id);
          selectNode(ln.id, doc.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (activeInsertTool) return;
          focusDiagram(doc.id);
          selectNode(ln.id, doc.id);
          startNodeTextEdit(ln);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          focusDiagram(doc.id);
          selectNode(ln.id, doc.id);
          onContextMenuNode?.(e, doc.id, ln.id);
        }}
        style={{ cursor: activeInsertTool ? 'crosshair' : 'pointer' }}
      >
        {ln.lFramePath ? (
          <>
            {ln.bodyRect && (
              <rect
                x={ln.bodyRect.x}
                y={ln.bodyRect.y}
                width={ln.bodyRect.width}
                height={ln.bodyRect.height}
                fill={style.backgroundColor}
                stroke={style.borderColor}
                strokeWidth={style.lineWidth}
              />
            )}
            <path
              d={ln.lFramePath}
              fill={style.backgroundColor}
              stroke={style.borderColor}
              strokeWidth={style.lineWidth}
              strokeLinejoin="miter"
            />
          </>
        ) : (
          <rect
            x={ln.x}
            y={ln.y}
            width={ln.width}
            height={ln.height}
            fill={style.backgroundColor}
            stroke={style.borderColor}
            strokeWidth={style.lineWidth}
          />
        )}

        {/* Child branches */}
        {ln.branches.map((branch) => {
          if (branch.isEmpty && branch.emptyBox) {
            const eb = branch.emptyBox;
            return (
              <g key={branch.key}>
                <rect
                  x={eb.x}
                  y={eb.y}
                  width={eb.width}
                  height={eb.height}
                  fill={style.backgroundColor}
                  stroke={style.borderColor}
                  strokeWidth={style.lineWidth}
                />
                <text
                  x={eb.x + eb.width / 2}
                  y={eb.y + eb.height / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={11}
                  fontStyle="italic"
                  fill="#94a3b8"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {t.placeholders.emptyBranch}
                </text>
              </g>
            );
          }
          return branch.nodes.map((child) => renderNode(child));
        })}

        {/* Structural DIN 66261 lines */}
        {ln.lines.map((line, idx) => (
          <line
            key={idx}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={style.borderColor}
            strokeWidth={line.strokeWidth ?? style.lineWidth}
            strokeDasharray={line.dashed ? '4 3' : undefined}
            pointerEvents="none"
          />
        ))}

        {/* Text blocks */}
        {ln.textBlocks.map((tb, idx) => (
          <SvgTextBlock key={idx} block={tb} />
        ))}

        {/* Interactive double-click targets for IF true/false labels */}
        {ln.type === 'if' && !activeInsertTool && (
          <>
            {ln.textBlocks[1] && (
              <rect
                x={ln.textBlocks[1].x}
                y={ln.textBlocks[1].y - 2}
                width={ln.textBlocks[1].width}
                height={ln.textBlocks[1].height + 4}
                fill="transparent"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  selectNode(ln.id, doc.id);
                  startIfLabelEdit(ln, 'true');
                }}
              />
            )}
            {ln.textBlocks[2] && (
              <rect
                x={ln.textBlocks[2].x}
                y={ln.textBlocks[2].y - 2}
                width={ln.textBlocks[2].width}
                height={ln.textBlocks[2].height + 4}
                fill="transparent"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  selectNode(ln.id, doc.id);
                  startIfLabelEdit(ln, 'false');
                }}
              />
            )}
          </>
        )}

        {/* Interactive double-click targets for SWITCH case labels */}
        {ln.type === 'switch' &&
          !activeInsertTool &&
          ln.branches.map((branch, idx) => {
            const block = ln.textBlocks[idx + 1];
            if (!block) return null;
            return (
              <rect
                key={`lbl-${branch.key}`}
                x={block.x}
                y={block.y - 2}
                width={block.width}
                height={block.height + 4}
                fill="transparent"
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  selectNode(ln.id, doc.id);
                  startSwitchCaseEdit(ln, idx);
                }}
              />
            );
          })}

        {/* Hover / Selection overlay */}
        {isSelected && (
          <rect
            x={ln.x + 1}
            y={ln.y + 1}
            width={Math.max(0, ln.width - 2)}
            height={Math.max(0, ln.height - 2)}
            fill="rgba(37, 99, 235, 0.08)"
            stroke="#2563eb"
            strokeWidth={2}
            pointerEvents="none"
          />
        )}
        {!isSelected && isHovered && (
          <rect
            x={ln.x + 0.5}
            y={ln.y + 0.5}
            width={Math.max(0, ln.width - 1)}
            height={Math.max(0, ln.height - 1)}
            fill="rgba(59, 130, 246, 0.05)"
            stroke="#60a5fa"
            strokeWidth={1.5}
            pointerEvents="none"
          />
        )}
      </g>
    );
  };

  const pickerAbove = editTarget ? editTarget.rect.y >= 46 : true;

  return (
    <div className="relative inline-block select-none">
      <svg
        width={layout.width}
        height={layout.height}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="block overflow-visible"
      >
        {/* Diagram Header */}
        <g>
          <rect
            x={layout.header.x}
            y={layout.header.y}
            width={layout.header.width}
            height={layout.header.height}
            fill={layout.style.backgroundColor}
            stroke={layout.style.borderColor}
            strokeWidth={layout.style.lineWidth}
          />
          <SvgTextBlock block={layout.header.textBlock} />
        </g>

        {/* Body */}
        {layout.nodes.length === 0 ? (
          layout.emptyBranches[0] ? (
            <g>
              <rect
                x={layout.emptyBranches[0].x}
                y={layout.emptyBranches[0].y}
                width={layout.emptyBranches[0].width}
                height={layout.emptyBranches[0].height}
                fill={layout.style.backgroundColor}
                stroke={layout.style.borderColor}
                strokeWidth={layout.style.lineWidth}
              />
              <text
                x={layout.emptyBranches[0].x + layout.emptyBranches[0].width / 2}
                y={layout.emptyBranches[0].y + layout.emptyBranches[0].height / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontStyle="italic"
                fill="#94a3b8"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {t.placeholders.emptyDiagram}
              </text>
            </g>
          ) : null
        ) : (
          layout.nodes.map((n) => renderNode(n))
        )}

        {/* Outer crisp frame */}
        <rect
          x={0}
          y={0}
          width={layout.width}
          height={layout.height}
          fill="none"
          stroke={layout.style.borderColor}
          strokeWidth={layout.style.lineWidth}
          pointerEvents="none"
        />

        {/* Insertion Zones when an insert tool is active */}
        {activeInsertTool &&
          layout.insertionZones.map((zone, idx) => {
            const isZoneHovered = hoveredZoneIdx === idx;
            const hitHeight = 18;
            return (
              <g
                key={idx}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setHoveredZoneIdx(idx);
                }}
                onMouseLeave={(e) => {
                  e.stopPropagation();
                  setHoveredZoneIdx((prev) => (prev === idx ? null : prev));
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  focusDiagram(doc.id);
                  insertNode(zone.target, activeInsertTool);
                  setActiveInsertTool(null);
                  setHoveredZoneIdx(null);
                }}
                style={{ cursor: 'copy' }}
              >
                <rect
                  x={zone.x}
                  y={zone.y - hitHeight / 2}
                  width={zone.width}
                  height={hitHeight}
                  fill="transparent"
                />
                {showInsertionHints && !isZoneHovered && (
                  <line
                    x1={zone.x + 6}
                    y1={zone.y}
                    x2={zone.x + zone.width - 6}
                    y2={zone.y}
                    stroke="#93c5fd"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    pointerEvents="none"
                  />
                )}
                {isZoneHovered && (
                  <g pointerEvents="none">
                    <line
                      x1={zone.x + 2}
                      y1={zone.y}
                      x2={zone.x + zone.width - 2}
                      y2={zone.y}
                      stroke="#2563eb"
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                    <circle
                      cx={zone.x + zone.width / 2}
                      cy={zone.y}
                      r={9}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    />
                    <text
                      x={zone.x + zone.width / 2}
                      y={zone.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#ffffff"
                      fontSize={13}
                      fontWeight="bold"
                    >
                      +
                    </text>
                  </g>
                )}
              </g>
            );
          })}
      </svg>

      {/* Inline Textarea Editor + Floating SymbolPicker */}
      {editTarget && (
        <div
          style={{
            position: 'absolute',
            left: editTarget.rect.x,
            top: editTarget.rect.y,
            width: editTarget.rect.width,
            height: editTarget.rect.height,
            zIndex: 50,
          }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              ...(pickerAbove
                ? { bottom: editTarget.rect.height + 6 }
                : { top: editTarget.rect.height + 6 }),
              zIndex: 60,
            }}
          >
            <SymbolPicker onInsert={handleInsertSymbol} />
          </div>

          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commitEdit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEdit();
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              fontSize: editTarget.fontSize,
              fontFamily: editTarget.fontFamily,
              textAlign: editTarget.align,
              lineHeight: 1.35,
            }}
            className="w-full h-full resize-none rounded border-2 border-blue-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-1.5 py-1 shadow-md outline-none"
          />
        </div>
      )}
    </div>
  );
};
