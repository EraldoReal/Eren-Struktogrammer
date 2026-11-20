import { create } from 'zustand';
import { layoutDiagram } from '../engine/layout';
import {
  createDefaultAppSettings,
  createNode,
  createProject,
  createStruktogramm,
} from '../model/defaults';
import {
  addSwitchCase as addSwitchCaseOp,
  cloneNodeWithNewIds,
  findNodeById,
  insertNodeAt,
  moveNodeDown as moveNodeDownOp,
  moveNodeUp as moveNodeUpOp,
  removeNodeById,
  removeSwitchCase as removeSwitchCaseOp,
  toggleSwitchDefault as toggleSwitchDefaultOp,
  updateNodeById,
} from '../model/operations';
import {
  exportToNsdXml,
  parseProject,
  parseStruktogramm,
  serializeProject,
  serializeStruktogramm,
} from '../model/serializer';
import type {
  AppSettings,
  DiagramNode,
  DiagramStyle,
  InsertionTarget,
  NodeStyle,
  NodeType,
  PrintSettings,
  ProjectDocument,
  StruktogrammDocument,
} from '../model/types';
import { getPlatformAdapter } from '../platform/adapter';

export const BOARD_WIDTH = 2800;
export const BOARD_HEIGHT = 2000;
export const MIN_ZOOM = 0.35;
export const MAX_ZOOM = 2.5;

const MAX_HISTORY = 100;
const MIN_DIAGRAM_WIDTH = 220;
const MAX_DIAGRAM_WIDTH = 2400;

export interface ProjectSnapshot {
  name: string;
  diagrams: StruktogrammDocument[];
  activeDiagramId: string | null;
  globalStyle: DiagramStyle;
  printSettings: PrintSettings;
}

export interface ProjectHistory {
  past: ProjectSnapshot[];
  future: ProjectSnapshot[];
}

function extractFileBaseName(filePath?: string): string | null {
  if (!filePath) return null;
  const fileName = filePath.split(/[/\\]/).pop() ?? '';
  const stripped = fileName.replace(/\.(stgp|stpr|stgr|nsd|json)$/i, '').trim();
  return stripped || null;
}

function detectIsProjectPayload(raw: string | Uint8Array, filePath?: string): boolean {
  if (filePath && /\.(stgp|stpr)$/i.test(filePath)) return true;
  if (filePath && /\.(stgr|nsd|xml)$/i.test(filePath)) return false;

  const text =
    typeof raw === 'string'
      ? raw
      : new TextDecoder('utf-8', { fatal: false }).decode(raw);
  const trimmed = text.trimStart();
  if (!trimmed.startsWith('{')) return false;
  try {
    const parsed = JSON.parse(trimmed) as { $schema?: string; diagrams?: unknown };
    if (typeof parsed.$schema === 'string' && parsed.$schema.includes('project')) {
      return true;
    }
    return Array.isArray(parsed.diagrams);
  } catch {
    return false;
  }
}

function createSnapshot(project: ProjectDocument): ProjectSnapshot {
  return {
    name: project.name,
    diagrams: project.diagrams,
    activeDiagramId: project.activeDiagramId,
    globalStyle: project.globalStyle,
    printSettings: project.printSettings,
  };
}

function getMaxZIndex(diagrams: readonly StruktogrammDocument[]): number {
  return diagrams.reduce((max, d) => Math.max(max, d.zIndex), 0);
}

function findAfterTarget(
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
        const inThen = findAfterTarget(node.thenBranch, nodeId, diagramId, node.id, 'then');
        if (inThen) return inThen;
        const inElse = findAfterTarget(node.elseBranch, nodeId, diagramId, node.id, 'else');
        if (inElse) return inElse;
        break;
      }
      case 'switch': {
        for (const c of node.cases) {
          const inCase = findAfterTarget(c.body, nodeId, diagramId, node.id, c.id);
          if (inCase) return inCase;
        }
        const inDefault = findAfterTarget(
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
        const inBody = findAfterTarget(node.body, nodeId, diagramId, node.id, 'body');
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

function nodeExistsInDiagrams(
  diagrams: readonly StruktogrammDocument[],
  nodeId: string | null
): boolean {
  if (!nodeId) return false;
  return diagrams.some((d) => findNodeById(d.nodes, nodeId) !== null);
}

function pushRecentFile(recentFiles: readonly string[], path?: string): string[] {
  if (!path) return [...recentFiles];
  return [path, ...recentFiles.filter((p) => p !== path)].slice(0, 10);
}

export interface EditorState {
  projects: ProjectDocument[];
  activeProjectId: string;
  historyByProject: Record<string, ProjectHistory>;

  activeInsertTool: NodeType | null;
  selectedNodeId: string | null;
  selectedDiagramId: string | null;
  editingNodeId: string | null;
  clipboardNode: DiagramNode | null;

  appSettings: AppSettings;
  lastError: string | null;

  // Selectors
  getActiveProject: () => ProjectDocument;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clearError: () => void;

  // Tool & selection
  setActiveInsertTool: (tool: NodeType | null) => void;
  selectNode: (nodeId: string | null, diagramId?: string | null) => void;
  selectDiagram: (diagramId: string | null) => void;
  setEditingNode: (nodeId: string | null) => void;

  // Project tabs
  newProject: (name?: string) => string;
  closeProject: (projectId: string) => void;
  setActiveProject: (projectId: string) => void;
  renameProject: (projectId: string, name: string) => void;
  openProjectFromContent: (raw: string | Uint8Array, filePath?: string) => ProjectDocument;
  openProjectFile: () => Promise<ProjectDocument | null>;
  saveProjectFile: (saveAs?: boolean) => Promise<string | null>;
  openRecentFile: (path: string) => Promise<boolean>;
  clearRecentFiles: () => void;

  // Diagrams on 2D canvas
  addDiagram: (name?: string, x?: number, y?: number) => string;
  removeDiagram: (diagramId: string) => void;
  focusDiagram: (diagramId: string) => void;
  moveDiagram: (diagramId: string, x: number, y: number) => void;
  resizeDiagram: (diagramId: string, width: number) => void;
  scaleDiagram: (
    diagramId: string,
    width: number,
    fontSize: number,
    paddingX?: number,
    paddingY?: number
  ) => void;
  renameDiagram: (diagramId: string, name: string, parameterList?: string) => void;
  toggleMinimizeDiagram: (diagramId: string) => void;
  arrangeDiagramsGrid: (columns?: number) => void;
  openDiagramFromContent: (raw: string | Uint8Array, filePath?: string) => StruktogrammDocument;
  openDiagramFile: () => Promise<StruktogrammDocument | null>;
  saveDiagramFile: (diagramId?: string, saveAs?: boolean) => Promise<string | null>;

  // Nodes
  insertNode: (target: InsertionTarget, typeOrNode: NodeType | DiagramNode) => string;
  deleteNode: (diagramId: string, nodeId: string) => void;
  updateNodeText: (diagramId: string, nodeId: string, text: string) => void;
  updateNodeStyle: (diagramId: string, nodeId: string, style: Partial<NodeStyle> | undefined) => void;
  updateIfLabels: (
    diagramId: string,
    nodeId: string,
    trueLabel: string,
    falseLabel: string
  ) => void;
  moveNodeUp: (diagramId: string, nodeId: string) => void;
  moveNodeDown: (diagramId: string, nodeId: string) => void;
  copyNode: (diagramId: string, nodeId: string) => void;
  cutNode: (diagramId: string, nodeId: string) => void;
  pasteNode: (target: InsertionTarget) => string | null;
  duplicateNode: (diagramId: string, nodeId: string) => string | null;
  addSwitchCase: (diagramId: string, nodeId: string, label?: string) => void;
  removeSwitchCase: (diagramId: string, nodeId: string, caseId: string) => void;
  toggleSwitchDefault: (diagramId: string, nodeId: string) => void;

  // Canvas & View
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
  resetView: () => void;

  // Settings
  loadAppSettings: () => Promise<void>;
  updateAppSettings: (patch: Partial<AppSettings>) => void;
  updateProjectStyle: (style: Partial<DiagramStyle>) => void;
  updatePrintSettings: (settings: Partial<PrintSettings>) => void;

  // Undo / Redo
  undo: () => void;
  redo: () => void;
}

const initialProject = createProject();

export const useEditorStore = create<EditorState>()((set, get) => {
  const mutateActiveProject = (
    mutator: (project: ProjectDocument) => ProjectDocument | null,
    recordHistory = true
  ) => {
    set((state) => {
      const idx = state.projects.findIndex((p) => p.id === state.activeProjectId);
      if (idx === -1) return state;

      const current = state.projects[idx];
      const updated = mutator(current);
      if (!updated || updated === current) return state;

      const nextProjects = [...state.projects];
      nextProjects[idx] = updated;

      if (!recordHistory) {
        return { projects: nextProjects };
      }

      const prevHistory = state.historyByProject[current.id] ?? { past: [], future: [] };
      const nextPast = [...prevHistory.past, createSnapshot(current)].slice(-MAX_HISTORY);

      return {
        projects: nextProjects,
        historyByProject: {
          ...state.historyByProject,
          [current.id]: {
            past: nextPast,
            future: [],
          },
        },
      };
    });
  };

  const mutateDiagramNodes = (
    diagramId: string,
    nodeMutator: (nodes: DiagramNode[]) => DiagramNode[] | null
  ) => {
    mutateActiveProject((project) => {
      const diagIdx = project.diagrams.findIndex((d) => d.id === diagramId);
      if (diagIdx === -1) return null;

      const diag = project.diagrams[diagIdx];
      const nextNodes = nodeMutator(diag.nodes);
      if (!nextNodes || nextNodes === diag.nodes) return null;

      const nextDiagrams = [...project.diagrams];
      nextDiagrams[diagIdx] = {
        ...diag,
        nodes: nextNodes,
        dirty: true,
      };

      return {
        ...project,
        diagrams: nextDiagrams,
        dirty: true,
      };
    });
  };

  return {
    projects: [initialProject],
    activeProjectId: initialProject.id,
    historyByProject: {
      [initialProject.id]: { past: [], future: [] },
    },

    activeInsertTool: null,
    selectedNodeId: null,
    selectedDiagramId: initialProject.activeDiagramId,
    editingNodeId: null,
    clipboardNode: null,

    appSettings: createDefaultAppSettings(),
    lastError: null,

    getActiveProject: () => {
      const { projects, activeProjectId } = get();
      return projects.find((p) => p.id === activeProjectId) ?? projects[0];
    },

    canUndo: () => {
      const { historyByProject, activeProjectId } = get();
      return (historyByProject[activeProjectId]?.past.length ?? 0) > 0;
    },

    canRedo: () => {
      const { historyByProject, activeProjectId } = get();
      return (historyByProject[activeProjectId]?.future.length ?? 0) > 0;
    },

    clearError: () => set({ lastError: null }),

    setActiveInsertTool: (tool) => set({ activeInsertTool: tool }),

    selectNode: (nodeId, diagramId) =>
      set((state) => ({
        selectedNodeId: nodeId,
        ...(diagramId !== undefined ? { selectedDiagramId: diagramId } : {}),
        editingNodeId: state.editingNodeId === nodeId ? state.editingNodeId : null,
      })),

    selectDiagram: (diagramId) =>
      set((state) => ({
        selectedDiagramId: diagramId,
        selectedNodeId:
          diagramId === state.selectedDiagramId ? state.selectedNodeId : null,
        editingNodeId: null,
      })),

    setEditingNode: (nodeId) => set({ editingNodeId: nodeId }),

    newProject: (name) => {
      const project = createProject(name);
      set((state) => ({
        projects: [...state.projects, project],
        activeProjectId: project.id,
        historyByProject: {
          ...state.historyByProject,
          [project.id]: { past: [], future: [] },
        },
        selectedDiagramId: project.activeDiagramId,
        selectedNodeId: null,
        editingNodeId: null,
      }));
      return project.id;
    },

    closeProject: (projectId) => {
      set((state) => {
        const idx = state.projects.findIndex((p) => p.id === projectId);
        if (idx === -1) return state;

        const nextHistory = { ...state.historyByProject };
        delete nextHistory[projectId];

        const remaining = state.projects.filter((p) => p.id !== projectId);
        if (remaining.length === 0) {
          const fallback = createProject();
          return {
            projects: [fallback],
            activeProjectId: fallback.id,
            historyByProject: {
              [fallback.id]: { past: [], future: [] },
            },
            selectedDiagramId: fallback.activeDiagramId,
            selectedNodeId: null,
            editingNodeId: null,
          };
        }

        let nextActiveId = state.activeProjectId;
        let nextSelectedDiagramId = state.selectedDiagramId;
        let nextSelectedNodeId = state.selectedNodeId;
        let nextEditingNodeId = state.editingNodeId;

        if (state.activeProjectId === projectId) {
          const nextIdx = Math.min(idx, remaining.length - 1);
          const nextProj = remaining[nextIdx];
          nextActiveId = nextProj.id;
          nextSelectedDiagramId = nextProj.activeDiagramId;
          nextSelectedNodeId = null;
          nextEditingNodeId = null;
        }

        return {
          projects: remaining,
          activeProjectId: nextActiveId,
          historyByProject: nextHistory,
          selectedDiagramId: nextSelectedDiagramId,
          selectedNodeId: nextSelectedNodeId,
          editingNodeId: nextEditingNodeId,
        };
      });
    },

    setActiveProject: (projectId) => {
      set((state) => {
        const target = state.projects.find((p) => p.id === projectId);
        if (!target || state.activeProjectId === projectId) return state;
        return {
          activeProjectId: projectId,
          selectedDiagramId: target.activeDiagramId,
          selectedNodeId: null,
          editingNodeId: null,
        };
      });
    },

    renameProject: (projectId, name) => {
      set((state) => {
        const idx = state.projects.findIndex((p) => p.id === projectId);
        if (idx === -1 || state.projects[idx].name === name) return state;
        const current = state.projects[idx];
        const nextProjects = [...state.projects];
        nextProjects[idx] = { ...current, name, dirty: true };
        const prevHistory = state.historyByProject[current.id] ?? { past: [], future: [] };
        return {
          projects: nextProjects,
          historyByProject: {
            ...state.historyByProject,
            [current.id]: {
              past: [...prevHistory.past, createSnapshot(current)].slice(-MAX_HISTORY),
              future: [],
            },
          },
        };
      });
    },

    openProjectFromContent: (raw, filePath) => {
      const parsed = parseProject(raw);
      const derivedName = extractFileBaseName(filePath);
      const project: ProjectDocument = {
        ...parsed,
        ...(derivedName ? { name: derivedName } : {}),
        ...(filePath ? { filePath } : {}),
        dirty: false,
      };

      set((state) => {
        const existingIdx = filePath
          ? state.projects.findIndex((p) => p.filePath === filePath)
          : state.projects.findIndex((p) => p.id === project.id);

        if (existingIdx !== -1) {
          const nextProjects = [...state.projects];
          nextProjects[existingIdx] = project;
          return {
            projects: nextProjects,
            activeProjectId: project.id,
            historyByProject: {
              ...state.historyByProject,
              [project.id]: { past: [], future: [] },
            },
            selectedDiagramId: project.activeDiagramId,
            selectedNodeId: null,
            editingNodeId: null,
            appSettings: {
              ...state.appSettings,
              recentFiles: pushRecentFile(state.appSettings.recentFiles, filePath),
            },
            lastError: null,
          };
        }

        return {
          projects: [...state.projects, project],
          activeProjectId: project.id,
          historyByProject: {
            ...state.historyByProject,
            [project.id]: { past: [], future: [] },
          },
          selectedDiagramId: project.activeDiagramId,
          selectedNodeId: null,
          editingNodeId: null,
          appSettings: {
            ...state.appSettings,
            recentFiles: pushRecentFile(state.appSettings.recentFiles, filePath),
          },
          lastError: null,
        };
      });

      return project;
    },

    openProjectFile: async () => {
      try {
        const adapter = getPlatformAdapter();
        const file = await adapter.openFileDialog({
          filters: [
            { name: 'Struktogrammer Projekt / Datei', extensions: ['stgp', 'stpr', 'stgr', 'nsd', 'json'] },
          ],
        });
        if (!file) return null;
        const path = file.path ?? file.name;
        if (!detectIsProjectPayload(file.bytes, path)) {
          get().openDiagramFromContent(file.bytes, path);
          return null;
        }
        return get().openProjectFromContent(file.bytes, path);
      } catch (err) {
        set({ lastError: (err as Error).message });
        return null;
      }
    },

    openRecentFile: async (path) => {
      try {
        const adapter = getPlatformAdapter();
        if (!adapter.readFileByPath) {
          set({
            lastError:
              get().appSettings.language === 'de'
                ? 'Direktes Öffnen aus der Dateihistorie wird auf dieser Plattform nicht unterstützt.'
                : 'Direct opening from recent files is not supported on this platform.',
          });
          return false;
        }

        const file = await adapter.readFileByPath(path);
        if (!file) {
          set((state) => {
            const nextRecent = state.appSettings.recentFiles.filter((p) => p !== path);
            const nextSettings = { ...state.appSettings, recentFiles: nextRecent };
            void adapter.saveSettings(nextSettings).catch(() => undefined);
            return {
              appSettings: nextSettings,
              lastError:
                state.appSettings.language === 'de'
                  ? `Datei „${path}“ wurde nicht gefunden oder ist nicht mehr im Browser-Cache.`
                  : `File "${path}" was not found or is no longer cached.`,
            };
          });
          return false;
        }

        const resolvedPath = file.path ?? file.name;
        if (detectIsProjectPayload(file.bytes, resolvedPath)) {
          get().openProjectFromContent(file.bytes, resolvedPath);
        } else {
          get().openDiagramFromContent(file.bytes, resolvedPath);
        }
        return true;
      } catch (err) {
        set({ lastError: (err as Error).message });
        return false;
      }
    },

    clearRecentFiles: () => {
      const adapter = getPlatformAdapter();
      adapter.clearRecentCache?.();
      set((state) => {
        const nextSettings = { ...state.appSettings, recentFiles: [] };
        void adapter.saveSettings(nextSettings).catch(() => undefined);
        return { appSettings: nextSettings };
      });
    },

    saveProjectFile: async (saveAs = false) => {
      try {
        const project = get().getActiveProject();
        const adapter = getPlatformAdapter();
        const serialized = serializeProject(project);

        let savedPath: string | null = null;
        if (!saveAs && project.filePath && adapter.writeTextFile) {
          try {
            await adapter.writeTextFile(project.filePath, serialized);
            savedPath = project.filePath;
          } catch {
            // Fall back to save dialog if browser handle is unavailable
          }
        }
        if (!savedPath) {
          savedPath = await adapter.saveFileDialog(serialized, {
            defaultName: `${project.name || 'projekt'}.stgp`,
            defaultPath: project.filePath,
            filters: [{ name: 'Struktogrammer Projekt', extensions: ['stgp', 'json'] }],
            mimeType: 'application/json',
          });
        }

        if (!savedPath) return null;

        const nextName = extractFileBaseName(savedPath) ?? project.name;

        set((state) => {
          const nextProjects = state.projects.map((p) =>
            p.id === project.id
              ? {
                  ...p,
                  name: nextName,
                  filePath: savedPath ?? p.filePath,
                  dirty: false,
                  diagrams: p.diagrams.map((d) => ({ ...d, dirty: false })),
                }
              : p
          );
          return {
            projects: nextProjects,
            appSettings: {
              ...state.appSettings,
              recentFiles: pushRecentFile(state.appSettings.recentFiles, savedPath ?? undefined),
            },
            lastError: null,
          };
        });

        return savedPath;
      } catch (err) {
        set({ lastError: (err as Error).message });
        return null;
      }
    },

    addDiagram: (name, x, y) => {
      const doc = createStruktogramm(name);
      const project = get().getActiveProject();
      const count = project.diagrams.length;
      const posX = Math.max(24, Math.min(BOARD_WIDTH - 460, x ?? 40 + (count % 5) * 60));
      const posY = Math.max(24, Math.min(BOARD_HEIGHT - 200, y ?? 40 + (count % 5) * 48));
      const nextDoc: StruktogrammDocument = {
        ...doc,
        x: posX,
        y: posY,
        zIndex: getMaxZIndex(project.diagrams) + 1,
        dirty: true,
      };

      mutateActiveProject((proj) => ({
        ...proj,
        diagrams: [...proj.diagrams, nextDoc],
        activeDiagramId: nextDoc.id,
        // Pan viewport so the newly created diagram is immediately visible
        panX: Math.min(0, -(posX - 48) * proj.zoom),
        panY: Math.min(0, -(posY - 48) * proj.zoom),
        dirty: true,
      }));

      set({
        selectedDiagramId: nextDoc.id,
        selectedNodeId: null,
        editingNodeId: null,
      });

      return nextDoc.id;
    },

    removeDiagram: (diagramId) => {
      mutateActiveProject((project) => {
        if (!project.diagrams.some((d) => d.id === diagramId)) return null;
        const remaining = project.diagrams.filter((d) => d.id !== diagramId);
        const nextActive =
          project.activeDiagramId === diagramId
            ? remaining[remaining.length - 1]?.id ?? null
            : project.activeDiagramId;

        return {
          ...project,
          diagrams: remaining,
          activeDiagramId: nextActive,
          dirty: true,
        };
      });

      set((state) => {
        if (state.selectedDiagramId !== diagramId) return state;
        const proj = state.projects.find((p) => p.id === state.activeProjectId);
        return {
          selectedDiagramId: proj?.activeDiagramId ?? null,
          selectedNodeId: null,
          editingNodeId: null,
        };
      });
    },

    focusDiagram: (diagramId) => {
      mutateActiveProject((project) => {
        const target = project.diagrams.find((d) => d.id === diagramId);
        if (!target) return null;

        const maxZ = getMaxZIndex(project.diagrams);
        const alreadyTop =
          target.zIndex === maxZ &&
          project.diagrams.filter((d) => d.zIndex === maxZ).length === 1;

        if (alreadyTop && project.activeDiagramId === diagramId) {
          return null;
        }

        const nextDiagrams = alreadyTop
          ? project.diagrams
          : project.diagrams.map((d) =>
              d.id === diagramId ? { ...d, zIndex: maxZ + 1 } : d
            );

        return {
          ...project,
          diagrams: nextDiagrams,
          activeDiagramId: diagramId,
        };
      }, false);

      set((state) => ({
        selectedDiagramId: diagramId,
        selectedNodeId:
          state.selectedDiagramId === diagramId ? state.selectedNodeId : null,
      }));
    },

    moveDiagram: (diagramId, x, y) => {
      mutateActiveProject((project) => {
        const target = project.diagrams.find((d) => d.id === diagramId);
        if (!target || (target.x === x && target.y === y)) return null;

        const clampedX = Math.max(0, Math.min(BOARD_WIDTH - MIN_DIAGRAM_WIDTH, x));
        const clampedY = Math.max(0, Math.min(BOARD_HEIGHT - 80, y));
        return {
          ...project,
          diagrams: project.diagrams.map((d) =>
            d.id === diagramId ? { ...d, x: clampedX, y: clampedY, dirty: true } : d
          ),
          dirty: true,
        };
      });
    },

    resizeDiagram: (diagramId, width) => {
      const clamped = Math.max(MIN_DIAGRAM_WIDTH, Math.min(MAX_DIAGRAM_WIDTH, width));
      mutateActiveProject((project) => {
        const target = project.diagrams.find((d) => d.id === diagramId);
        if (!target || target.width === clamped) return null;

        return {
          ...project,
          diagrams: project.diagrams.map((d) =>
            d.id === diagramId ? { ...d, width: clamped, dirty: true } : d
          ),
          dirty: true,
        };
      });
    },

    scaleDiagram: (diagramId, width, fontSize, paddingX, paddingY) => {
      const clampedWidth = Math.max(MIN_DIAGRAM_WIDTH, Math.min(MAX_DIAGRAM_WIDTH, width));
      const clampedFontSize = Math.max(9, Math.min(36, Math.round(fontSize)));
      mutateActiveProject((project) => {
        const target = project.diagrams.find((d) => d.id === diagramId);
        if (!target) return null;

        return {
          ...project,
          diagrams: project.diagrams.map((d) =>
            d.id === diagramId
              ? {
                  ...d,
                  width: clampedWidth,
                  style: {
                    ...d.style,
                    fontSize: clampedFontSize,
                    ...(paddingX !== undefined ? { paddingX: Math.max(4, Math.round(paddingX)) } : {}),
                    ...(paddingY !== undefined ? { paddingY: Math.max(4, Math.round(paddingY)) } : {}),
                  },
                  dirty: true,
                }
              : d
          ),
          dirty: true,
        };
      });
    },

    renameDiagram: (diagramId, name, parameterList) => {
      mutateActiveProject((project) => {
        const target = project.diagrams.find((d) => d.id === diagramId);
        if (!target) return null;
        const nextParams = parameterList !== undefined ? parameterList : target.parameterList;
        if (target.name === name && target.parameterList === nextParams) return null;

        return {
          ...project,
          diagrams: project.diagrams.map((d) =>
            d.id === diagramId
              ? { ...d, name, parameterList: nextParams, dirty: true }
              : d
          ),
          dirty: true,
        };
      });
    },

    toggleMinimizeDiagram: (diagramId) => {
      mutateActiveProject((project) => {
        const target = project.diagrams.find((d) => d.id === diagramId);
        if (!target) return null;

        return {
          ...project,
          diagrams: project.diagrams.map((d) =>
            d.id === diagramId
              ? { ...d, minimized: !d.minimized, dirty: true }
              : d
          ),
          dirty: true,
        };
      });
    },

    arrangeDiagramsGrid: (columns) => {
      const gap = 32;
      const margin = 40;
      const windowChromeHeight = 56;

      mutateActiveProject((project) => {
        const count = project.diagrams.length;
        if (count === 0) return null;

        const cols = Math.max(1, columns ?? Math.ceil(Math.sqrt(count)));
        const measured = project.diagrams.map((d) => {
          const layout = layoutDiagram(d, project.globalStyle);
          const w = Math.max(MIN_DIAGRAM_WIDTH, d.width ?? layout.width) + 24;
          const h = (d.minimized ? 42 : layout.height + windowChromeHeight);
          return { d, w, h };
        });

        const colWidths: number[] = Array.from({ length: cols }, () => 0);
        const rowHeights: number[] = Array.from(
          { length: Math.ceil(count / cols) },
          () => 0
        );

        measured.forEach((item, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          colWidths[col] = Math.max(colWidths[col], item.w);
          rowHeights[row] = Math.max(rowHeights[row], item.h);
        });

        const colOffsets: number[] = [];
        let accX = margin;
        for (let c = 0; c < cols; c++) {
          colOffsets[c] = accX;
          accX += colWidths[c] + gap;
        }

        const rowOffsets: number[] = [];
        let accY = margin;
        for (let r = 0; r < rowHeights.length; r++) {
          rowOffsets[r] = accY;
          accY += rowHeights[r] + gap;
        }

        return {
          ...project,
          diagrams: measured.map((item, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            return {
              ...item.d,
              x: Math.min(BOARD_WIDTH - MIN_DIAGRAM_WIDTH, colOffsets[col]),
              y: Math.min(BOARD_HEIGHT - 80, rowOffsets[row]),
              dirty: true,
            };
          }),
          panX: 0,
          panY: 0,
          dirty: true,
        };
      });
    },

    openDiagramFromContent: (raw, filePath) => {
      const parsed = parseStruktogramm(raw);
      const project = get().getActiveProject();
      const count = project.diagrams.length;
      const doc: StruktogrammDocument = {
        ...parsed,
        x: 40 + (count % 6) * 40,
        y: 40 + (count % 6) * 40,
        zIndex: getMaxZIndex(project.diagrams) + 1,
        ...(filePath ? { filePath } : {}),
        dirty: false,
      };

      mutateActiveProject((proj) => ({
        ...proj,
        diagrams: [...proj.diagrams, doc],
        activeDiagramId: doc.id,
        dirty: true,
      }));

      set((state) => ({
        selectedDiagramId: doc.id,
        selectedNodeId: null,
        editingNodeId: null,
        appSettings: {
          ...state.appSettings,
          recentFiles: pushRecentFile(state.appSettings.recentFiles, filePath),
        },
        lastError: null,
      }));

      return doc;
    },

    openDiagramFile: async () => {
      try {
        const adapter = getPlatformAdapter();
        const file = await adapter.openFileDialog({
          filters: [
            { name: 'Struktogramm', extensions: ['stgr', 'nsd', 'xml', 'stgp', 'json'] },
          ],
        });
        if (!file) return null;
        const path = file.path ?? file.name;
        if (detectIsProjectPayload(file.bytes, path)) {
          get().openProjectFromContent(file.bytes, path);
          return null;
        }
        return get().openDiagramFromContent(file.bytes, path);
      } catch (err) {
        set({ lastError: (err as Error).message });
        return null;
      }
    },

    saveDiagramFile: async (diagramId, saveAs = false) => {
      try {
        const project = get().getActiveProject();
        const targetId = diagramId ?? project.activeDiagramId ?? project.diagrams[0]?.id;
        const doc = project.diagrams.find((d) => d.id === targetId);
        if (!doc) return null;

        const adapter = getPlatformAdapter();
        const isNsd = doc.filePath?.toLowerCase().endsWith('.nsd') ?? false;
        const serialized = isNsd ? exportToNsdXml(doc) : serializeStruktogramm(doc);

        let savedPath: string | null = null;
        if (!saveAs && doc.filePath && adapter.writeTextFile) {
          await adapter.writeTextFile(doc.filePath, serialized);
          savedPath = doc.filePath;
        } else {
          savedPath = await adapter.saveFileDialog(serialized, {
            defaultName: `${doc.name || 'struktogramm'}.stgr`,
            defaultPath: doc.filePath,
            filters: [
              { name: 'HuS Struktogramm (.stgr)', extensions: ['stgr', 'json'] },
              { name: 'Structorizer XML (.nsd)', extensions: ['nsd'] },
            ],
            mimeType: 'application/json',
          });
        }

        if (!savedPath) return null;

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id
              ? {
                  ...p,
                  diagrams: p.diagrams.map((d) =>
                    d.id === doc.id
                      ? { ...d, filePath: savedPath ?? d.filePath, dirty: false }
                      : d
                  ),
                }
              : p
          ),
          appSettings: {
            ...state.appSettings,
            recentFiles: pushRecentFile(state.appSettings.recentFiles, savedPath ?? undefined),
          },
          lastError: null,
        }));

        return savedPath;
      } catch (err) {
        set({ lastError: (err as Error).message });
        return null;
      }
    },

    insertNode: (target, typeOrNode) => {
      const { appSettings } = get();
      const newNode =
        typeof typeOrNode === 'string'
          ? createNode(typeOrNode, appSettings)
          : cloneNodeWithNewIds(typeOrNode);

      mutateDiagramNodes(target.diagramId, (nodes) =>
        insertNodeAt(nodes, target, newNode)
      );

      set({
        selectedDiagramId: target.diagramId,
        selectedNodeId: newNode.id,
        editingNodeId: null,
      });

      return newNode.id;
    },

    deleteNode: (diagramId, nodeId) => {
      mutateDiagramNodes(diagramId, (nodes) => {
        const result = removeNodeById(nodes, nodeId);
        return result.removed ? result.nodes : null;
      });

      set((state) => ({
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        editingNodeId: state.editingNodeId === nodeId ? null : state.editingNodeId,
      }));
    },

    updateNodeText: (diagramId, nodeId, text) => {
      mutateDiagramNodes(diagramId, (nodes) => {
        const existing = findNodeById(nodes, nodeId);
        if (!existing || existing.text === text) return null;
        return updateNodeById(nodes, nodeId, (node) => ({ ...node, text }));
      });
    },

    updateNodeStyle: (diagramId, nodeId, style) => {
      mutateDiagramNodes(diagramId, (nodes) => {
        const existing = findNodeById(nodes, nodeId);
        if (!existing) return null;
        return updateNodeById(nodes, nodeId, (node) => {
          if (style === undefined) {
            const { style: _removed, ...rest } = node;
            return rest as DiagramNode;
          }
          return {
            ...node,
            style: { ...(node.style ?? {}), ...style },
          };
        });
      });
    },

    updateIfLabels: (diagramId, nodeId, trueLabel, falseLabel) => {
      mutateDiagramNodes(diagramId, (nodes) => {
        const existing = findNodeById(nodes, nodeId);
        if (!existing || existing.type !== 'if') return null;
        if (existing.trueLabel === trueLabel && existing.falseLabel === falseLabel) {
          return null;
        }
        return updateNodeById(nodes, nodeId, (node) =>
          node.type === 'if' ? { ...node, trueLabel, falseLabel } : node
        );
      });
    },

    moveNodeUp: (diagramId, nodeId) => {
      mutateDiagramNodes(diagramId, (nodes) => {
        const next = moveNodeUpOp(nodes, nodeId);
        return next === nodes ? null : next;
      });
    },

    moveNodeDown: (diagramId, nodeId) => {
      mutateDiagramNodes(diagramId, (nodes) => {
        const next = moveNodeDownOp(nodes, nodeId);
        return next === nodes ? null : next;
      });
    },

    copyNode: (diagramId, nodeId) => {
      const project = get().getActiveProject();
      const diag = project.diagrams.find((d) => d.id === diagramId);
      if (!diag) return;
      const found = findNodeById(diag.nodes, nodeId);
      if (!found) return;
      set({ clipboardNode: cloneNodeWithNewIds(found) });
    },

    cutNode: (diagramId, nodeId) => {
      const project = get().getActiveProject();
      const diag = project.diagrams.find((d) => d.id === diagramId);
      if (!diag) return;
      const found = findNodeById(diag.nodes, nodeId);
      if (!found) return;

      const cloned = cloneNodeWithNewIds(found);
      mutateDiagramNodes(diagramId, (nodes) => {
        const result = removeNodeById(nodes, nodeId);
        return result.removed ? result.nodes : null;
      });

      set((state) => ({
        clipboardNode: cloned,
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        editingNodeId: state.editingNodeId === nodeId ? null : state.editingNodeId,
      }));
    },

    pasteNode: (target) => {
      const { clipboardNode } = get();
      if (!clipboardNode) return null;

      const freshNode = cloneNodeWithNewIds(clipboardNode);
      mutateDiagramNodes(target.diagramId, (nodes) =>
        insertNodeAt(nodes, target, freshNode)
      );

      set({
        selectedDiagramId: target.diagramId,
        selectedNodeId: freshNode.id,
        editingNodeId: null,
      });

      return freshNode.id;
    },

    duplicateNode: (diagramId, nodeId) => {
      const project = get().getActiveProject();
      const diag = project.diagrams.find((d) => d.id === diagramId);
      if (!diag) return null;

      const found = findNodeById(diag.nodes, nodeId);
      if (!found) return null;

      const target = findAfterTarget(diag.nodes, nodeId, diagramId);
      if (!target) return null;

      const cloned = cloneNodeWithNewIds(found);
      mutateDiagramNodes(diagramId, (nodes) => insertNodeAt(nodes, target, cloned));

      set({
        selectedDiagramId: diagramId,
        selectedNodeId: cloned.id,
        editingNodeId: null,
      });

      return cloned.id;
    },

    addSwitchCase: (diagramId, nodeId, label) => {
      mutateDiagramNodes(diagramId, (nodes) => {
        const existing = findNodeById(nodes, nodeId);
        if (!existing || existing.type !== 'switch') return null;
        return updateNodeById(nodes, nodeId, (node) =>
          node.type === 'switch' ? addSwitchCaseOp(node, label) : node
        );
      });
    },

    removeSwitchCase: (diagramId, nodeId, caseId) => {
      mutateDiagramNodes(diagramId, (nodes) => {
        const existing = findNodeById(nodes, nodeId);
        if (!existing || existing.type !== 'switch') return null;
        return updateNodeById(nodes, nodeId, (node) =>
          node.type === 'switch' ? removeSwitchCaseOp(node, caseId) : node
        );
      });
    },

    toggleSwitchDefault: (diagramId, nodeId) => {
      mutateDiagramNodes(diagramId, (nodes) => {
        const existing = findNodeById(nodes, nodeId);
        if (!existing || existing.type !== 'switch') return null;
        return updateNodeById(nodes, nodeId, (node) =>
          node.type === 'switch' ? toggleSwitchDefaultOp(node) : node
        );
      });
    },

    setZoom: (zoom) => {
      const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
      mutateActiveProject(
        (project) => (project.zoom === clamped ? null : { ...project, zoom: clamped }),
        false
      );
    },

    setPan: (panX, panY) => {
      mutateActiveProject((project) => {
        const scaledW = BOARD_WIDTH * project.zoom;
        const scaledH = BOARD_HEIGHT * project.zoom;
        const clampedX = Math.max(-scaledW + 240, Math.min(240, panX));
        const clampedY = Math.max(-scaledH + 180, Math.min(180, panY));
        return project.panX === clampedX && project.panY === clampedY
          ? null
          : { ...project, panX: clampedX, panY: clampedY };
      }, false);
    },

    resetView: () => {
      mutateActiveProject(
        (project) =>
          project.zoom === 1 && project.panX === 0 && project.panY === 0
            ? null
            : { ...project, zoom: 1, panX: 0, panY: 0 },
        false
      );
    },

    loadAppSettings: async () => {
      try {
        const loaded = await getPlatformAdapter().loadSettings();
        if (loaded) {
          set({
            appSettings: {
              ...createDefaultAppSettings(),
              ...loaded,
              defaultStyle: {
                ...createDefaultAppSettings().defaultStyle,
                ...(loaded.defaultStyle ?? {}),
              },
            },
          });
        }
      } catch {
        // Ignore storage errors and keep defaults
      }
    },

    updateAppSettings: (patch) => {
      set((state) => {
        const next: AppSettings = {
          ...state.appSettings,
          ...patch,
          defaultStyle: {
            ...state.appSettings.defaultStyle,
            ...(patch.defaultStyle ?? {}),
          },
        };
        void getPlatformAdapter()
          .saveSettings(next)
          .catch(() => undefined);
        return { appSettings: next };
      });
    },

    updateProjectStyle: (style) => {
      mutateActiveProject((project) => ({
        ...project,
        globalStyle: { ...project.globalStyle, ...style },
        dirty: true,
      }));
    },

    updatePrintSettings: (settings) => {
      mutateActiveProject((project) => ({
        ...project,
        printSettings: { ...project.printSettings, ...settings },
        dirty: true,
      }));
    },

    undo: () => {
      set((state) => {
        const idx = state.projects.findIndex((p) => p.id === state.activeProjectId);
        if (idx === -1) return state;

        const current = state.projects[idx];
        const hist = state.historyByProject[current.id];
        if (!hist || hist.past.length === 0) return state;

        const previous = hist.past[hist.past.length - 1];
        const nextPast = hist.past.slice(0, -1);
        const nextFuture = [createSnapshot(current), ...hist.future].slice(0, MAX_HISTORY);

        const restoredProject: ProjectDocument = {
          ...current,
          name: previous.name,
          diagrams: previous.diagrams,
          activeDiagramId: previous.activeDiagramId,
          globalStyle: previous.globalStyle,
          printSettings: previous.printSettings,
          dirty: true,
        };

        const nextProjects = [...state.projects];
        nextProjects[idx] = restoredProject;

        const selectedStillExists = nodeExistsInDiagrams(
          restoredProject.diagrams,
          state.selectedNodeId
        );
        const diagramStillExists = restoredProject.diagrams.some(
          (d) => d.id === state.selectedDiagramId
        );

        return {
          projects: nextProjects,
          historyByProject: {
            ...state.historyByProject,
            [current.id]: { past: nextPast, future: nextFuture },
          },
          selectedDiagramId: diagramStillExists
            ? state.selectedDiagramId
            : restoredProject.activeDiagramId,
          selectedNodeId: selectedStillExists ? state.selectedNodeId : null,
          editingNodeId: selectedStillExists ? state.editingNodeId : null,
        };
      });
    },

    redo: () => {
      set((state) => {
        const idx = state.projects.findIndex((p) => p.id === state.activeProjectId);
        if (idx === -1) return state;

        const current = state.projects[idx];
        const hist = state.historyByProject[current.id];
        if (!hist || hist.future.length === 0) return state;

        const nextSnapshot = hist.future[0];
        const nextFuture = hist.future.slice(1);
        const nextPast = [...hist.past, createSnapshot(current)].slice(-MAX_HISTORY);

        const restoredProject: ProjectDocument = {
          ...current,
          name: nextSnapshot.name,
          diagrams: nextSnapshot.diagrams,
          activeDiagramId: nextSnapshot.activeDiagramId,
          globalStyle: nextSnapshot.globalStyle,
          printSettings: nextSnapshot.printSettings,
          dirty: true,
        };

        const nextProjects = [...state.projects];
        nextProjects[idx] = restoredProject;

        const selectedStillExists = nodeExistsInDiagrams(
          restoredProject.diagrams,
          state.selectedNodeId
        );
        const diagramStillExists = restoredProject.diagrams.some(
          (d) => d.id === state.selectedDiagramId
        );

        return {
          projects: nextProjects,
          historyByProject: {
            ...state.historyByProject,
            [current.id]: { past: nextPast, future: nextFuture },
          },
          selectedDiagramId: diagramStillExists
            ? state.selectedDiagramId
            : restoredProject.activeDiagramId,
          selectedNodeId: selectedStillExists ? state.selectedNodeId : null,
          editingNodeId: selectedStillExists ? state.editingNodeId : null,
        };
      });
    },
  };
});
