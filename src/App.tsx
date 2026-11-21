import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { ContextMenu, type ContextMenuState } from './components/ContextMenu';
import { HelpModal, type HelpTab } from './components/HelpModal';
import { LandingPage } from './components/LandingPage';
import { MenuBar } from './components/MenuBar';
import { NodeStyleModal } from './components/NodeStyleModal';
import { OperatorsSidebar } from './components/OperatorsSidebar';
import { PrintModal } from './components/PrintModal';
import { ProjectTabs } from './components/ProjectTabs';
import { SeoSubPage, type SeoPageRoute } from './components/SeoPages';
import { SettingsModal } from './components/SettingsModal';
import { StatusBar } from './components/StatusBar';
import { Toolbar } from './components/Toolbar';
import { UpdateModal } from './components/UpdateModal';
import { WorkspaceCanvas } from './components/WorkspaceCanvas';
import type { DiagramNode, InsertionTarget, NodeType } from './model/types';
import { getPlatformAdapter, isTauriEnvironment } from './platform/adapter';
import { useEditorStore } from './store/editorStore';

const TOOL_KEYS: NodeType[] = [
  'sequence',
  'subroutine',
  'if',
  'switch',
  'while',
  'doWhile',
  'for',
];

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
        const inThen = findAfterNodeTarget(node.thenBranch, nodeId, diagramId, node.id, 'then');
        if (inThen) return inThen;
        const inElse = findAfterNodeTarget(node.elseBranch, nodeId, diagramId, node.id, 'else');
        if (inElse) return inElse;
        break;
      }
      case 'switch': {
        for (const c of node.cases) {
          const inCase = findAfterNodeTarget(c.body, nodeId, diagramId, node.id, c.id);
          if (inCase) return inCase;
        }
        const inDefault = findAfterNodeTarget(
          node.defaultBranch,
          nodeId,
          diagramId,
          node.id,
          'default'
        );
        if (inDefault) return inDefault;
        break;
      }
      case 'while':
      case 'doWhile':
      case 'for': {
        const inBody = findAfterNodeTarget(node.body, nodeId, diagramId, node.id, 'body');
        if (inBody) return inBody;
        break;
      }
      case 'sequence':
      case 'subroutine':
        break;
    }
  }
  return null;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  );
}

export const App: React.FC = () => {
  const loadAppSettings = useEditorStore((s) => s.loadAppSettings);
  const themeSetting = useEditorStore((s) => s.appSettings.theme);
  const uiScale = useEditorStore((s) => s.appSettings.uiScale ?? 1);
  const lastError = useEditorStore((s) => s.lastError);
  const clearError = useEditorStore((s) => s.clearError);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState<HelpTab>('elements');
  const [updateOpen, setUpdateOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (isTauriEnvironment() || typeof window === 'undefined') return '/app';
    if (window.location.hash === '#app') return '/app';
    return window.location.pathname || '/';
  });

  useEffect(() => {
    if (isTauriEnvironment()) return;
    const onPopState = () => {
      setCurrentPath(
        window.location.hash === '#app' ? '/app' : window.location.pathname || '/'
      );
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = useCallback((path: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  }, []);

  const handleLaunchEditor = useCallback(() => {
    navigateTo('/app');
  }, [navigateTo]);
  const [operatorsOpen, setOperatorsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2500);
  }, []);
  const [nodeStyleTarget, setNodeStyleTarget] = useState<{
    diagramId: string;
    nodeId: string;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const [systemDark, setSystemDark] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Load persisted settings on mount (and sync /en route language on landing page)
  useEffect(() => {
    void loadAppSettings().then(() => {
      if (!isTauriEnvironment() && typeof window !== 'undefined') {
        if (window.location.pathname === '/en') {
          useEditorStore.getState().updateAppSettings({ language: 'en' });
        }
      }
    });
  }, [loadAppSettings]);

  // Listen to OS color scheme changes when theme === 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    setSystemDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const isDark =
    themeSetting === 'dark' || (themeSetting === 'system' && systemDark);
  const themeClass = isDark ? 'dark' : 'light';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(themeClass);
  }, [themeClass]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${Math.round(16 * uiScale)}px`;
  }, [uiScale]);

  // Warn before closing browser tab or desktop window with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasDirty = useEditorStore.getState().projects.some((p) => p.dirty);
      if (hasDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    let unlistenClose: (() => void) | undefined;
    let cancelled = false;
    if (getPlatformAdapter().isDesktop) {
      void import('@tauri-apps/api/window').then(async ({ getCurrentWindow }) => {
        const unlisten = await getCurrentWindow().onCloseRequested((event) => {
          const state = useEditorStore.getState();
          const hasDirty = state.projects.some((p) => p.dirty);
          if (hasDirty) {
            const msg =
              state.appSettings.language === 'de'
                ? 'Es gibt ungespeicherte Änderungen. App trotzdem schließen?'
                : 'You have unsaved changes. Quit anyway?';
            if (!window.confirm(msg)) {
              event.preventDefault();
            }
          }
        });
        // Effect may have been cleaned up while the import/listen was pending (StrictMode).
        if (cancelled) unlisten();
        else unlistenClose = unlisten;
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      unlistenClose?.();
    };
  }, []);

  // Listen to native macOS menu bar events in Tauri desktop app
  useEffect(() => {
    if (!getPlatformAdapter().isDesktop) return;
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    void import('@tauri-apps/api/event').then(async ({ listen }) => {
      const stop = await listen<string>('menu-action', (event) => {
        const state = useEditorStore.getState();
        const scale = state.appSettings.uiScale ?? 1;
        switch (event.payload) {
          case 'file-new-project':
            state.newProject();
            break;
          case 'file-new-diagram':
            state.addDiagram();
            break;
          case 'file-open-project':
            void state.openProjectFile();
            break;
          case 'file-save-project':
            void state.saveProjectFile(false);
            break;
          case 'file-save-project-as':
            void state.saveProjectFile(true);
            break;
          case 'file-print':
            setPrintOpen(true);
            break;
          case 'edit-undo':
            state.undo();
            break;
          case 'edit-redo':
            state.redo();
            break;
          case 'view-zoom-in':
            state.setZoom(state.getActiveProject().zoom + 0.15);
            break;
          case 'view-zoom-out':
            state.setZoom(state.getActiveProject().zoom - 0.15);
            break;
          case 'view-reset':
            state.resetView();
            break;
          case 'view-ui-up':
            state.updateAppSettings({
              uiScale: Math.min(1.4, Number((scale + 0.1).toFixed(2))),
            });
            break;
          case 'view-ui-down':
            state.updateAppSettings({
              uiScale: Math.max(0.8, Number((scale - 0.1).toFixed(2))),
            });
            break;
          case 'view-ui-reset':
            state.updateAppSettings({ uiScale: 1 });
            break;
          case 'view-arrange':
            state.arrangeDiagramsGrid();
            break;
          case 'options-settings':
            setSettingsOpen(true);
            break;
          case 'help-shortcuts':
            setHelpTab('elements');
            setHelpOpen(true);
            break;
          case 'help-download':
            setHelpTab('download');
            setHelpOpen(true);
            break;
          case 'help-update':
            setUpdateOpen(true);
            break;
          case 'help-about':
            setHelpTab('imprint');
            setHelpOpen(true);
            break;
        }
      });
      // Effect may have been cleaned up while the import/listen was pending (StrictMode).
      if (cancelled) stop();
      else unlisten = stop;
    });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = useEditorStore.getState();

      if (e.key === 'Escape') {
        if (contextMenu) setContextMenu(null);
        if (settingsOpen) setSettingsOpen(false);
        if (printOpen) setPrintOpen(false);
        if (helpOpen) setHelpOpen(false);
        if (nodeStyleTarget) setNodeStyleTarget(null);
        if (state.activeInsertTool !== null) state.setActiveInsertTool(null);
        if (state.editingNodeId !== null) state.setEditingNode(null);
        return;
      }

      // Skip shortcuts while editing text or inside form controls
      if (state.editingNodeId !== null || isEditableTarget(e.target)) {
        return;
      }

      // Skip canvas/editor shortcuts when a modal is open
      if (settingsOpen || printOpen || helpOpen || nodeStyleTarget !== null) {
        return;
      }

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          state.redo();
        } else {
          state.undo();
        }
        return;
      }

      if (mod && key === 'y') {
        e.preventDefault();
        state.redo();
        return;
      }

      if (mod && key === 'c') {
        if (state.selectedDiagramId && state.selectedNodeId) {
          e.preventDefault();
          state.copyNode(state.selectedDiagramId, state.selectedNodeId);
        }
        return;
      }

      if (mod && key === 'x') {
        if (state.selectedDiagramId && state.selectedNodeId) {
          e.preventDefault();
          state.cutNode(state.selectedDiagramId, state.selectedNodeId);
        }
        return;
      }

      if (mod && key === 'v') {
        if (state.clipboardNode) {
          e.preventDefault();
          const project = state.getActiveProject();
          const diagId =
            state.selectedDiagramId ??
            project.activeDiagramId ??
            project.diagrams[0]?.id;
          const diag = project.diagrams.find((d) => d.id === diagId);
          if (!diag) return;

          const afterTarget = state.selectedNodeId
            ? findAfterNodeTarget(diag.nodes, state.selectedNodeId, diag.id)
            : null;
          const target: InsertionTarget = afterTarget ?? {
            diagramId: diag.id,
            parentId: null,
            index: diag.nodes.length,
          };
          state.pasteNode(target);
        }
        return;
      }

      if (mod && key === 's') {
        e.preventDefault();
        void state.saveProjectFile(e.shiftKey);
        return;
      }

      if (mod && key === 'o') {
        e.preventDefault();
        void state.openProjectFile();
        return;
      }

      if (mod && key === 'n') {
        e.preventDefault();
        if (e.shiftKey) {
          state.addDiagram();
        } else {
          state.newProject();
        }
        return;
      }

      if (mod && key === 'd') {
        if (state.selectedDiagramId && state.selectedNodeId) {
          e.preventDefault();
          state.duplicateNode(state.selectedDiagramId, state.selectedNodeId);
        }
        return;
      }

      if (mod && key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
        return;
      }

      if (mod && (key === '=' || key === '+')) {
        e.preventDefault();
        state.setZoom(state.getActiveProject().zoom + 0.15);
        return;
      }

      if (mod && key === '-') {
        e.preventDefault();
        state.setZoom(state.getActiveProject().zoom - 0.15);
        return;
      }

      if (mod && key === '0') {
        e.preventDefault();
        state.resetView();
        return;
      }

      if (e.altKey && !mod && e.key === 'ArrowUp') {
        if (state.selectedDiagramId && state.selectedNodeId) {
          e.preventDefault();
          state.moveNodeUp(state.selectedDiagramId, state.selectedNodeId);
        }
        return;
      }

      if (e.altKey && !mod && e.key === 'ArrowDown') {
        if (state.selectedDiagramId && state.selectedNodeId) {
          e.preventDefault();
          state.moveNodeDown(state.selectedDiagramId, state.selectedNodeId);
        }
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

      if (mod && key === 'p') {
        e.preventDefault();
        setPrintOpen(true);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedDiagramId && state.selectedNodeId) {
          e.preventDefault();
          state.deleteNode(state.selectedDiagramId, state.selectedNodeId);
        }
        return;
      }

      if (!mod && !e.altKey && e.key >= '1' && e.key <= '7') {
        const tool = TOOL_KEYS[Number(e.key) - 1];
        if (tool) {
          e.preventDefault();
          state.setActiveInsertTool(
            state.activeInsertTool === tool ? null : tool
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [contextMenu, settingsOpen, printOpen, helpOpen, nodeStyleTarget]);

  const handleContextMenuNode = useCallback(
    (e: React.MouseEvent, diagramId: string, nodeId: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        diagramId,
        nodeId,
      });
    },
    []
  );

  const handleContextMenuCanvas = useCallback(
    (e: React.MouseEvent, diagramId?: string) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        ...(diagramId ? { diagramId } : {}),
      });
    },
    []
  );

  const handleOpenNodeStyle = useCallback((diagramId: string, nodeId: string) => {
    setNodeStyleTarget({ diagramId, nodeId });
  }, []);

  const seoRoutes: SeoPageRoute[] = [
    '/din-66261',
    '/operatorenliste-abitur',
    '/hus-struktogrammer-alternative',
    '/faq',
  ];

  if (!isTauriEnvironment() && seoRoutes.includes(currentPath as SeoPageRoute)) {
    return (
      <>
        <SeoSubPage
          route={currentPath as SeoPageRoute}
          onNavigate={navigateTo}
          onLaunchEditor={handleLaunchEditor}
          onOpenImprint={() => {
            setHelpTab('imprint');
            setHelpOpen(true);
          }}
        />
        <HelpModal
          isOpen={helpOpen}
          onClose={() => setHelpOpen(false)}
          initialTab={helpTab}
        />
      </>
    );
  }

  if (!isTauriEnvironment() && currentPath !== '/app') {
    return (
      <>
        <LandingPage
          onLaunchEditor={handleLaunchEditor}
          onNavigate={navigateTo}
          onOpenImprint={() => {
            setHelpTab('imprint');
            setHelpOpen(true);
          }}
        />
        <HelpModal
          isOpen={helpOpen}
          onClose={() => setHelpOpen(false)}
          initialTab={helpTab}
        />
      </>
    );
  }

  return (
    <div
      className={`${themeClass} h-screen w-screen flex flex-col overflow-hidden select-none ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Application Chrome */}
      <div className="no-print shrink-0">
        <MenuBar
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPrint={() => setPrintOpen(true)}
          onOpenHelp={(tab = 'elements') => {
            setHelpTab(tab);
            setHelpOpen(true);
          }}
          onOpenUpdate={() => setUpdateOpen(true)}
        />
        <ProjectTabs />
        <Toolbar
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenPrint={() => setPrintOpen(true)}
          operatorsOpen={operatorsOpen}
          onToggleOperators={() => setOperatorsOpen((v) => !v)}
          onNotify={showToast}
        />
      </div>

      {/* Error Banner */}
      {lastError && (
        <div className="no-print shrink-0 flex items-center justify-between gap-3 px-4 py-2 bg-red-600 text-white text-xs font-medium">
          <div className="flex items-center gap-2 truncate">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">{lastError}</span>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="p-0.5 rounded hover:bg-red-700 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main 2D Workspace + Sticky Operators Sidebar */}
      <div className="no-print flex-1 min-h-0 relative flex flex-row">
        <div className="flex-1 min-w-0 h-full relative">
          <WorkspaceCanvas
            onContextMenuNode={handleContextMenuNode}
            onContextMenuCanvas={handleContextMenuCanvas}
          />
          {toastMessage && (
            <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900/95 dark:bg-slate-800/95 text-white text-xs font-medium shadow-lg border border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>
        <OperatorsSidebar
          isOpen={operatorsOpen}
          onClose={() => setOperatorsOpen(false)}
        />
      </div>

      {/* Bottom Status Bar */}
      <div className="no-print shrink-0">
        <StatusBar />
      </div>

      {/* Context Menu */}
      <ContextMenu
        state={contextMenu}
        onClose={() => setContextMenu(null)}
        onOpenNodeStyle={handleOpenNodeStyle}
      />

      {/* Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <PrintModal isOpen={printOpen} onClose={() => setPrintOpen(false)} />
      <HelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        initialTab={helpTab}
      />
      <UpdateModal
        isOpen={updateOpen}
        onClose={() => setUpdateOpen(false)}
      />
      <NodeStyleModal
        target={nodeStyleTarget}
        onClose={() => setNodeStyleTarget(null)}
      />
    </div>
  );
};

export default App;
