import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { getTranslations } from '../store/i18n';
import type { DiagramNode, InsertionTarget, NodeType } from '../model/types';
import { layoutDiagram } from '../engine/layout';
import { renderDiagramToSvgString } from '../engine/svgExport';
import { exportPngFile, exportSvgFile } from '../export/exporter';
import { getPlatformAdapter } from '../platform/adapter';
import { DinNodeIcon, NODE_TOOL_ORDER } from './Toolbar';

import type { HelpTab } from './HelpModal';

export interface MenuBarProps {
  onOpenSettings: () => void;
  onOpenPrint: () => void;
  onOpenHelp: (tab?: HelpTab) => void;
  onOpenUpdate?: () => void;
}

type MenuKey = 'file' | 'edit' | 'insert' | 'view' | 'options' | 'help';

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

interface MenuItemProps {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
}

const IS_MAC =
  typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

function formatShortcut(shortcut: string): string {
  if (!IS_MAC) return shortcut;
  return shortcut.replace(/Ctrl\+/g, '⌘').replace(/Shift\+/g, '⇧');
}

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  shortcut,
  disabled = false,
  checked,
  icon,
  onClick,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="w-full flex items-center justify-between gap-6 px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
  >
    <span className="flex items-center gap-2 min-w-0">
      <span className="w-4 flex items-center justify-center shrink-0">
        {checked ? <Check className="w-3.5 h-3.5" /> : icon ?? null}
      </span>
      <span className="truncate">{label}</span>
    </span>
    {shortcut && (
      <span className="text-[11px] opacity-65 font-mono shrink-0">
        {formatShortcut(shortcut)}
      </span>
    )}
  </button>
);

const MenuDivider: React.FC = () => (
  <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
);

const MenuSectionLabel: React.FC<{ title: string }> = ({ title }) => (
  <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
    {title}
  </div>
);

function getFileDisplayName(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1] || filePath;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onOpenSettings,
  onOpenPrint,
  onOpenHelp,
  onOpenUpdate,
}) => {
  const isDesktop = getPlatformAdapter().isDesktop;
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [pngSubmenuOpen, setPngSubmenuOpen] = useState(false);
  const [recentSubmenuOpen, setRecentSubmenuOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const appSettings = useEditorStore((s) => s.appSettings);
  const updateAppSettings = useEditorStore((s) => s.updateAppSettings);
  const activeInsertTool = useEditorStore((s) => s.activeInsertTool);
  const setActiveInsertTool = useEditorStore((s) => s.setActiveInsertTool);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedDiagramId = useEditorStore((s) => s.selectedDiagramId);
  const clipboardNode = useEditorStore((s) => s.clipboardNode);

  const newProject = useEditorStore((s) => s.newProject);
  const openProjectFile = useEditorStore((s) => s.openProjectFile);
  const saveProjectFile = useEditorStore((s) => s.saveProjectFile);
  const closeProject = useEditorStore((s) => s.closeProject);
  const openRecentFile = useEditorStore((s) => s.openRecentFile);
  const clearRecentFiles = useEditorStore((s) => s.clearRecentFiles);

  const addDiagram = useEditorStore((s) => s.addDiagram);
  const openDiagramFile = useEditorStore((s) => s.openDiagramFile);
  const saveDiagramFile = useEditorStore((s) => s.saveDiagramFile);
  const arrangeDiagramsGrid = useEditorStore((s) => s.arrangeDiagramsGrid);

  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);

  const cutNode = useEditorStore((s) => s.cutNode);
  const copyNode = useEditorStore((s) => s.copyNode);
  const pasteNode = useEditorStore((s) => s.pasteNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const deleteNode = useEditorStore((s) => s.deleteNode);
  const moveNodeUp = useEditorStore((s) => s.moveNodeUp);
  const moveNodeDown = useEditorStore((s) => s.moveNodeDown);

  const setZoom = useEditorStore((s) => s.setZoom);
  const resetView = useEditorStore((s) => s.resetView);
  const project = useEditorStore((s) => s.getActiveProject());

  const t = getTranslations(appSettings.language);
  const isDe = appSettings.language === 'de';

  const activeDiagram =
    project.diagrams.find((d) => d.id === (selectedDiagramId ?? project.activeDiagramId)) ??
    project.diagrams[0] ??
    null;

  useEffect(() => {
    if (!openMenu) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setPngSubmenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenu(null);
        setPngSubmenuOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenu]);

  const closeAndRun = (fn: () => void) => {
    setOpenMenu(null);
    setPngSubmenuOpen(false);
    fn();
  };

  const handleExportSvg = async () => {
    if (!activeDiagram) return;
    const svg = renderDiagramToSvgString(activeDiagram, project.globalStyle);
    await exportSvgFile(svg, activeDiagram.name, getPlatformAdapter());
  };

  const handleExportPng = async (scale: 1 | 2 | 3) => {
    if (!activeDiagram) return;
    const padding = 16;
    const layout = layoutDiagram(activeDiagram, project.globalStyle);
    const svg = renderDiagramToSvgString(activeDiagram, project.globalStyle, { padding });
    await exportPngFile(
      svg,
      layout.width + padding * 2,
      layout.height + padding * 2,
      scale,
      false,
      activeDiagram.name,
      getPlatformAdapter()
    );
  };

  const handlePaste = () => {
    if (!activeDiagram || !clipboardNode) return;
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
    pasteNode(target);
  };

  const handleInsertElement = (type: NodeType) => {
    setActiveInsertTool(type);
  };

  const hasSelectedNode = Boolean(selectedNodeId && activeDiagram);

  const menuDefs: { key: MenuKey; label: string }[] = [
    { key: 'file', label: t.menu.file },
    { key: 'edit', label: t.menu.edit },
    { key: 'insert', label: isDe ? 'Element' : 'Insert' },
    { key: 'view', label: t.menu.view },
    { key: 'options', label: isDe ? 'Optionen' : 'Options' },
    { key: 'help', label: t.menu.help },
  ];

  return (
    <div
      ref={barRef}
      role="menubar"
      className="relative z-40 flex items-center gap-0.5 px-2 h-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs select-none"
    >
      {/* App Title Badge */}
      <div className="flex items-center gap-1.5 pr-3 mr-1 border-r border-slate-200 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-100">
        <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-blue-600 text-white text-[10px] font-bold">
          E
        </span>
        <span className="hidden sm:inline">{t.app.title}</span>
      </div>

      {menuDefs.map(({ key, label }) => {
        const isOpen = openMenu === key;
        return (
          <div key={key} className="relative">
            <button
              type="button"
              role="menuitem"
              aria-expanded={isOpen}
              onClick={() => {
                setOpenMenu(isOpen ? null : key);
                setPngSubmenuOpen(false);
              }}
              onMouseEnter={() => {
                if (openMenu !== null && openMenu !== key) {
                  setOpenMenu(key);
                  setPngSubmenuOpen(false);
                }
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                isOpen
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {label}
            </button>

            {isOpen && (
              <div className="absolute left-0 top-full mt-0.5 min-w-[270px] py-1 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-50">
                {key === 'file' && (
                  <>
                    <MenuSectionLabel
                      title={
                        isDe ? 'Projekt · ganzer Tab (.stgp)' : 'Project · whole tab (.stgp)'
                      }
                    />
                    <MenuItem
                      label={t.menu.newProject}
                      shortcut="Ctrl+N"
                      onClick={() => closeAndRun(() => newProject())}
                    />
                    <MenuItem
                      label={t.menu.openProject}
                      shortcut="Ctrl+O"
                      onClick={() => closeAndRun(() => void openProjectFile())}
                    />
                    <MenuItem
                      label={t.menu.saveProject}
                      shortcut="Ctrl+S"
                      onClick={() => closeAndRun(() => void saveProjectFile(false))}
                    />
                    <MenuItem
                      label={t.menu.saveProjectAs}
                      shortcut="Ctrl+Shift+S"
                      onClick={() => closeAndRun(() => void saveProjectFile(true))}
                    />

                    <MenuDivider />
                    <MenuSectionLabel
                      title={
                        isDe
                          ? 'Struktogramm · einzelnes Diagramm (.stgr)'
                          : 'Diagram · single chart (.stgr)'
                      }
                    />
                    <MenuItem
                      label={t.menu.newDiagram}
                      shortcut="Ctrl+Shift+N"
                      onClick={() => closeAndRun(() => addDiagram())}
                    />
                    <MenuItem
                      label={t.menu.openDiagram}
                      onClick={() => closeAndRun(() => void openDiagramFile())}
                    />
                    <MenuItem
                      label={t.menu.saveDiagram}
                      disabled={!activeDiagram}
                      onClick={() =>
                        closeAndRun(() => void saveDiagramFile(activeDiagram?.id, false))
                      }
                    />
                    <MenuItem
                      label={t.menu.saveDiagramAs}
                      disabled={!activeDiagram}
                      onClick={() =>
                        closeAndRun(() => void saveDiagramFile(activeDiagram?.id, true))
                      }
                    />

                    <MenuDivider />
                    {/* Zuletzt verwendet / Recent Files */}
                    <div
                      className="relative"
                      onMouseEnter={() => setRecentSubmenuOpen(true)}
                      onMouseLeave={() => setRecentSubmenuOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={() => setRecentSubmenuOpen((v) => !v)}
                        className="w-full flex items-center justify-between gap-4 px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-4 shrink-0" />
                          <span>{t.menu.recentFiles}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {recentSubmenuOpen && (
                        <div className="absolute left-full top-0 ml-0.5 min-w-[240px] max-w-[320px] py-1 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-50">
                          {appSettings.recentFiles.length === 0 ? (
                            <div className="px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500">
                              {t.menu.noRecentFiles}
                            </div>
                          ) : (
                            <>
                              {appSettings.recentFiles.map((filePath) => {
                                const fileName = getFileDisplayName(filePath);
                                const isProj = /\.(stgp|stpr)$/i.test(filePath);
                                return (
                                  <button
                                    key={filePath}
                                    type="button"
                                    title={filePath}
                                    onClick={() =>
                                      closeAndRun(() => void openRecentFile(filePath))
                                    }
                                    className="w-full flex items-center justify-between gap-3 px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
                                  >
                                    <span className="truncate">{fileName}</span>
                                    <span className="text-[10px] font-mono opacity-65 shrink-0">
                                      {isProj ? '.stgp' : '.stgr'}
                                    </span>
                                  </button>
                                );
                              })}
                              <MenuDivider />
                              <MenuItem
                                label={isDe ? 'Liste leeren' : 'Clear recent files'}
                                onClick={() => closeAndRun(() => clearRecentFiles())}
                              />
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <MenuDivider />
                    <MenuItem
                      label={t.menu.exportSvg}
                      disabled={!activeDiagram}
                      onClick={() => closeAndRun(() => void handleExportSvg())}
                    />
                    <div
                      className="relative"
                      onMouseEnter={() => setPngSubmenuOpen(true)}
                      onMouseLeave={() => setPngSubmenuOpen(false)}
                    >
                      <button
                        type="button"
                        disabled={!activeDiagram}
                        onClick={() => setPngSubmenuOpen((v) => !v)}
                        className="w-full flex items-center justify-between gap-4 px-3 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-4 shrink-0" />
                          <span>{t.menu.exportPng}</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {pngSubmenuOpen && activeDiagram && (
                        <div className="absolute left-full top-0 ml-0.5 min-w-[160px] py-1 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-50">
                          {([1, 2, 3] as const).map((scale) => (
                            <MenuItem
                              key={scale}
                              label={`PNG (${scale}x)`}
                              onClick={() => closeAndRun(() => void handleExportPng(scale))}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <MenuItem
                      label={t.menu.print}
                      shortcut="Ctrl+P"
                      onClick={() => closeAndRun(onOpenPrint)}
                    />
                    <MenuDivider />
                    <MenuItem
                      label={t.menu.closeProject}
                      onClick={() =>
                        closeAndRun(() => {
                          if (project.dirty) {
                            const msg = isDe
                              ? `Das Projekt „${project.name}“ enthält ungespeicherte Änderungen. Trotzdem schließen?`
                              : `Project "${project.name}" has unsaved changes. Close anyway?`;
                            if (!window.confirm(msg)) return;
                          }
                          closeProject(project.id);
                        })
                      }
                    />
                  </>
                )}

                {key === 'edit' && (
                  <>
                    <MenuItem
                      label={t.menu.undo}
                      shortcut="Ctrl+Z"
                      disabled={!canUndo()}
                      onClick={() => closeAndRun(undo)}
                    />
                    <MenuItem
                      label={t.menu.redo}
                      shortcut="Ctrl+Y"
                      disabled={!canRedo()}
                      onClick={() => closeAndRun(redo)}
                    />
                    <MenuDivider />
                    <MenuItem
                      label={t.menu.cut}
                      shortcut="Ctrl+X"
                      disabled={!hasSelectedNode}
                      onClick={() =>
                        closeAndRun(() => {
                          if (activeDiagram && selectedNodeId) {
                            cutNode(activeDiagram.id, selectedNodeId);
                          }
                        })
                      }
                    />
                    <MenuItem
                      label={t.menu.copy}
                      shortcut="Ctrl+C"
                      disabled={!hasSelectedNode}
                      onClick={() =>
                        closeAndRun(() => {
                          if (activeDiagram && selectedNodeId) {
                            copyNode(activeDiagram.id, selectedNodeId);
                          }
                        })
                      }
                    />
                    <MenuItem
                      label={t.menu.paste}
                      shortcut="Ctrl+V"
                      disabled={!clipboardNode || !activeDiagram}
                      onClick={() => closeAndRun(handlePaste)}
                    />
                    <MenuItem
                      label={t.menu.duplicate}
                      shortcut="Ctrl+D"
                      disabled={!hasSelectedNode}
                      onClick={() =>
                        closeAndRun(() => {
                          if (activeDiagram && selectedNodeId) {
                            duplicateNode(activeDiagram.id, selectedNodeId);
                          }
                        })
                      }
                    />
                    <MenuDivider />
                    <MenuItem
                      label={t.menu.moveUp}
                      shortcut="Alt+↑"
                      disabled={!hasSelectedNode}
                      onClick={() =>
                        closeAndRun(() => {
                          if (activeDiagram && selectedNodeId) {
                            moveNodeUp(activeDiagram.id, selectedNodeId);
                          }
                        })
                      }
                    />
                    <MenuItem
                      label={t.menu.moveDown}
                      shortcut="Alt+↓"
                      disabled={!hasSelectedNode}
                      onClick={() =>
                        closeAndRun(() => {
                          if (activeDiagram && selectedNodeId) {
                            moveNodeDown(activeDiagram.id, selectedNodeId);
                          }
                        })
                      }
                    />
                    <MenuDivider />
                    <MenuItem
                      label={t.menu.delete}
                      shortcut="Del"
                      disabled={!hasSelectedNode}
                      onClick={() =>
                        closeAndRun(() => {
                          if (activeDiagram && selectedNodeId) {
                            deleteNode(activeDiagram.id, selectedNodeId);
                          }
                        })
                      }
                    />
                  </>
                )}

                {key === 'insert' && (
                  <>
                    <MenuItem
                      label={t.tools.select}
                      shortcut="Esc"
                      checked={activeInsertTool === null}
                      onClick={() => closeAndRun(() => setActiveInsertTool(null))}
                    />
                    <MenuDivider />
                    {NODE_TOOL_ORDER.map((type, idx) => (
                      <MenuItem
                        key={type}
                        label={t.tools[type]}
                        shortcut={`${idx + 1}`}
                        checked={activeInsertTool === type}
                        icon={<DinNodeIcon type={type} className="w-4 h-3.5" />}
                        onClick={() => closeAndRun(() => handleInsertElement(type))}
                      />
                    ))}
                  </>
                )}

                {key === 'view' && (
                  <>
                    <MenuItem
                      label={t.menu.zoomIn}
                      shortcut="Ctrl++"
                      onClick={() => closeAndRun(() => setZoom(project.zoom + 0.15))}
                    />
                    <MenuItem
                      label={t.menu.zoomOut}
                      shortcut="Ctrl+-"
                      onClick={() => closeAndRun(() => setZoom(project.zoom - 0.15))}
                    />
                    <MenuItem
                      label={t.menu.resetView}
                      shortcut="Ctrl+0"
                      onClick={() => closeAndRun(resetView)}
                    />
                    <MenuDivider />
                    <MenuItem
                      label={
                        isDe
                          ? `Programmoberfläche vergrößern (${Math.round((appSettings.uiScale ?? 1) * 100)}%)`
                          : `Zoom UI In (${Math.round((appSettings.uiScale ?? 1) * 100)}%)`
                      }
                      onClick={() =>
                        closeAndRun(() =>
                          updateAppSettings({
                            uiScale: Math.min(1.4, Number(((appSettings.uiScale ?? 1) + 0.1).toFixed(2))),
                          })
                        )
                      }
                    />
                    <MenuItem
                      label={isDe ? 'Programmoberfläche verkleinern' : 'Zoom UI Out'}
                      onClick={() =>
                        closeAndRun(() =>
                          updateAppSettings({
                            uiScale: Math.max(0.8, Number(((appSettings.uiScale ?? 1) - 0.1).toFixed(2))),
                          })
                        )
                      }
                    />
                    <MenuItem
                      label={isDe ? 'Oberfläche zurücksetzen (100%)' : 'Reset UI Zoom (100%)'}
                      onClick={() =>
                        closeAndRun(() => updateAppSettings({ uiScale: 1 }))
                      }
                    />
                    <MenuDivider />
                    <MenuItem
                      label={t.menu.arrangeGrid}
                      disabled={project.diagrams.length === 0}
                      onClick={() => closeAndRun(() => arrangeDiagramsGrid())}
                    />
                    <MenuDivider />
                    <MenuItem
                      label={t.menu.toggleInsertionHints}
                      checked={appSettings.showInsertionHints}
                      onClick={() =>
                        closeAndRun(() =>
                          updateAppSettings({
                            showInsertionHints: !appSettings.showInsertionHints,
                          })
                        )
                      }
                    />
                  </>
                )}

                {key === 'options' && (
                  <>
                    <MenuItem
                      label={t.menu.appSettings}
                      shortcut="Ctrl+,"
                      onClick={() => closeAndRun(onOpenSettings)}
                    />
                    <MenuDivider />
                    <MenuItem
                      label={`${t.menu.theme}: ${t.menu.themeLight}`}
                      checked={appSettings.theme === 'light'}
                      onClick={() =>
                        closeAndRun(() => updateAppSettings({ theme: 'light' }))
                      }
                    />
                    <MenuItem
                      label={`${t.menu.theme}: ${t.menu.themeDark}`}
                      checked={appSettings.theme === 'dark'}
                      onClick={() =>
                        closeAndRun(() => updateAppSettings({ theme: 'dark' }))
                      }
                    />
                    <MenuItem
                      label={`${t.menu.theme}: ${t.menu.themeSystem}`}
                      checked={appSettings.theme === 'system'}
                      onClick={() =>
                        closeAndRun(() => updateAppSettings({ theme: 'system' }))
                      }
                    />
                    <MenuDivider />
                    <MenuItem
                      label="Deutsch"
                      checked={appSettings.language === 'de'}
                      onClick={() =>
                        closeAndRun(() => updateAppSettings({ language: 'de' }))
                      }
                    />
                    <MenuItem
                      label="English"
                      checked={appSettings.language === 'en'}
                      onClick={() =>
                        closeAndRun(() => updateAppSettings({ language: 'en' }))
                      }
                    />
                  </>
                )}

                {key === 'help' && (
                  <>
                    <MenuItem
                      label={t.menu.shortcuts}
                      shortcut="F1"
                      onClick={() => closeAndRun(() => onOpenHelp('elements'))}
                    />
                    <MenuItem
                      label="Download (macOS / Windows)"
                      onClick={() => closeAndRun(() => onOpenHelp('download'))}
                    />
                    {isDesktop && onOpenUpdate && (
                      <MenuItem
                        label="Nach Updates suchen…"
                        onClick={() => closeAndRun(onOpenUpdate)}
                      />
                    )}
                    <MenuDivider />
                    <MenuItem
                      label={`${t.menu.about} / Impressum`}
                      onClick={() => closeAndRun(() => onOpenHelp('imprint'))}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
