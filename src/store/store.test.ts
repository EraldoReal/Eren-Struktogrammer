import { beforeEach, describe, expect, it } from 'vitest';
import { createProject, createStruktogramm } from '../model/defaults';
import { findNodeById } from '../model/operations';
import { serializeProject, serializeStruktogramm } from '../model/serializer';
import type { IfNode, SwitchNode } from '../model/types';
import { useEditorStore } from './editorStore';
import { getTranslations } from './i18n';

function resetStore() {
  const fresh = createProject('Testprojekt');
  useEditorStore.setState({
    projects: [fresh],
    activeProjectId: fresh.id,
    historyByProject: { [fresh.id]: { past: [], future: [] } },
    activeInsertTool: null,
    selectedNodeId: null,
    selectedDiagramId: fresh.activeDiagramId,
    editingNodeId: null,
    clipboardNode: null,
    lastError: null,
  });
}

describe('i18n', () => {
  it('provides German HuS Struktogrammer terminology and English translations', () => {
    const de = getTranslations('de');
    const en = getTranslations('en');

    expect(de.tools.sequence).toBe('Sequenz');
    expect(de.tools.subroutine).toBe('Unterprogramm');
    expect(de.tools.if).toBe('Verzweigung');
    expect(de.tools.switch).toBe('Fallunterscheidung');
    expect(de.tools.while).toBe('Kopfgesteuerte Schleife');
    expect(de.tools.doWhile).toBe('Fußgesteuerte Schleife');
    expect(de.tools.for).toBe('Zählschleife');

    expect(en.tools.sequence).toBe('Sequence');
    expect(en.tools.while).toBe('While Loop');
    expect(en.tools.doWhile).toBe('Do-While Loop');
    expect(en.tools.for).toBe('For Loop');
  });
});

describe('editorStore - multi-project tabs', () => {
  beforeEach(resetStore);

  it('creates, switches, and closes project tabs, keeping at least one project', () => {
    const store = useEditorStore.getState();
    const firstId = store.activeProjectId;

    const secondId = store.newProject('Projekt B');
    expect(useEditorStore.getState().projects).toHaveLength(2);
    expect(useEditorStore.getState().activeProjectId).toBe(secondId);

    useEditorStore.getState().setActiveProject(firstId);
    expect(useEditorStore.getState().activeProjectId).toBe(firstId);

    useEditorStore.getState().closeProject(firstId);
    expect(useEditorStore.getState().projects).toHaveLength(1);
    expect(useEditorStore.getState().activeProjectId).toBe(secondId);

    // Closing the last project creates a fresh fallback project
    useEditorStore.getState().closeProject(secondId);
    expect(useEditorStore.getState().projects).toHaveLength(1);
    expect(useEditorStore.getState().activeProjectId).not.toBe(secondId);
  });

  it('opens a serialized project into a new tab', () => {
    const external = createProject('Externes Projekt');
    const json = serializeProject(external);

    const opened = useEditorStore.getState().openProjectFromContent(json, '/tmp/extern.stgp');
    expect(opened.name).toBe('extern');
    expect(useEditorStore.getState().projects).toHaveLength(2);
    expect(useEditorStore.getState().activeProjectId).toBe(opened.id);
    expect(useEditorStore.getState().appSettings.recentFiles).toContain('/tmp/extern.stgp');
  });
});

describe('editorStore - 2D canvas diagrams & z-order', () => {
  beforeEach(resetStore);

  it('adds, focuses (zIndex), moves, resizes, renames, minimizes, and arranges diagrams', () => {
    const initialDiagId = useEditorStore.getState().getActiveProject().diagrams[0].id;
    const secondDiagId = useEditorStore.getState().addDiagram('Hilfsfunktion', 300, 120);

    let project = useEditorStore.getState().getActiveProject();
    expect(project.diagrams).toHaveLength(2);

    const firstDiag = project.diagrams.find((d) => d.id === initialDiagId)!;
    const secondDiag = project.diagrams.find((d) => d.id === secondDiagId)!;
    expect(secondDiag.zIndex).toBeGreaterThan(firstDiag.zIndex);

    // Focus first diagram -> brings its zIndex to front
    useEditorStore.getState().focusDiagram(initialDiagId);
    project = useEditorStore.getState().getActiveProject();
    const focusedFirst = project.diagrams.find((d) => d.id === initialDiagId)!;
    expect(focusedFirst.zIndex).toBeGreaterThan(secondDiag.zIndex);
    expect(project.activeDiagramId).toBe(initialDiagId);

    // Move & resize & rename & minimize
    useEditorStore.getState().moveDiagram(initialDiagId, 180, 240);
    useEditorStore.getState().resizeDiagram(initialDiagId, 520);
    useEditorStore.getState().renameDiagram(initialDiagId, 'Berechne', 'n: integer');
    useEditorStore.getState().toggleMinimizeDiagram(initialDiagId);

    project = useEditorStore.getState().getActiveProject();
    const updated = project.diagrams.find((d) => d.id === initialDiagId)!;
    expect(updated.x).toBe(180);
    expect(updated.y).toBe(240);
    expect(updated.width).toBe(520);
    expect(updated.name).toBe('Berechne');
    expect(updated.parameterList).toBe('n: integer');
    expect(updated.minimized).toBe(true);

    // Arrange grid
    useEditorStore.getState().arrangeDiagramsGrid(2);
    project = useEditorStore.getState().getActiveProject();
    expect(project.diagrams[0].x).toBe(40);
    expect(project.diagrams[1].x).toBeGreaterThan(project.diagrams[0].x);

    // Remove diagram
    useEditorStore.getState().removeDiagram(secondDiagId);
    expect(useEditorStore.getState().getActiveProject().diagrams).toHaveLength(1);
  });

  it('opens a serialized diagram onto the active project 2D canvas', () => {
    const extDiag = createStruktogramm('Importiert');
    const raw = serializeStruktogramm(extDiag);

    const doc = useEditorStore.getState().openDiagramFromContent(raw, '/tmp/imp.stgr');
    expect(doc.name).toBe('Importiert');
    expect(useEditorStore.getState().getActiveProject().diagrams).toHaveLength(2);
  });
});

describe('editorStore - node mutations & switch/if operations', () => {
  beforeEach(resetStore);

  it('inserts, edits, styles, reorders, duplicates, and deletes nodes', () => {
    const diagId = useEditorStore.getState().getActiveProject().diagrams[0].id;

    const seq1Id = useEditorStore.getState().insertNode(
      { diagramId: diagId, parentId: null, index: 0 },
      'sequence'
    );
    const seq2Id = useEditorStore.getState().insertNode(
      { diagramId: diagId, parentId: null, index: 1 },
      'sequence'
    );

    useEditorStore.getState().updateNodeText(diagId, seq1Id, 'x := 1');
    useEditorStore.getState().updateNodeText(diagId, seq2Id, 'y := 2');
    useEditorStore.getState().updateNodeStyle(diagId, seq1Id, { backgroundColor: '#fef08a' });

    // Move seq2 up
    useEditorStore.getState().moveNodeUp(diagId, seq2Id);
    let nodes = useEditorStore.getState().getActiveProject().diagrams[0].nodes;
    expect(nodes[0].id).toBe(seq2Id);
    expect(nodes[1].id).toBe(seq1Id);
    expect(nodes[1].style?.backgroundColor).toBe('#fef08a');

    // Move seq2 down
    useEditorStore.getState().moveNodeDown(diagId, seq2Id);
    nodes = useEditorStore.getState().getActiveProject().diagrams[0].nodes;
    expect(nodes[0].id).toBe(seq1Id);

    // Duplicate seq1 right after seq1
    const dupId = useEditorStore.getState().duplicateNode(diagId, seq1Id);
    expect(dupId).toBeTruthy();
    nodes = useEditorStore.getState().getActiveProject().diagrams[0].nodes;
    expect(nodes).toHaveLength(3);
    expect(nodes[1].id).toBe(dupId);
    expect(nodes[1].text).toBe('x := 1');

    // Delete duplicated node
    useEditorStore.getState().deleteNode(diagId, dupId!);
    nodes = useEditorStore.getState().getActiveProject().diagrams[0].nodes;
    expect(nodes).toHaveLength(2);
  });

  it('updates IfNode labels and SwitchNode cases/default', () => {
    const diagId = useEditorStore.getState().getActiveProject().diagrams[0].id;

    const ifId = useEditorStore.getState().insertNode(
      { diagramId: diagId, parentId: null, index: 0 },
      'if'
    );
    useEditorStore.getState().updateIfLabels(diagId, ifId, 'Ja', 'Nein');

    const switchId = useEditorStore.getState().insertNode(
      { diagramId: diagId, parentId: null, index: 1 },
      'switch'
    );
    useEditorStore.getState().addSwitchCase(diagId, switchId, 'Fall 3');
    useEditorStore.getState().toggleSwitchDefault(diagId, switchId);

    const diag = useEditorStore.getState().getActiveProject().diagrams[0];
    const ifNode = findNodeById(diag.nodes, ifId) as IfNode;
    expect(ifNode.trueLabel).toBe('Ja');
    expect(ifNode.falseLabel).toBe('Nein');

    const switchNode = findNodeById(diag.nodes, switchId) as SwitchNode;
    expect(switchNode.cases).toHaveLength(3);
    expect(switchNode.cases[2].label).toBe('Fall 3');
    expect(switchNode.hasDefault).toBe(false);

    const caseToRemove = switchNode.cases[0].id;
    useEditorStore.getState().removeSwitchCase(diagId, switchId, caseToRemove);
    const updatedSwitch = findNodeById(
      useEditorStore.getState().getActiveProject().diagrams[0].nodes,
      switchId
    ) as SwitchNode;
    expect(updatedSwitch.cases).toHaveLength(2);
  });
});

describe('editorStore - undo/redo & copy/cut/paste', () => {
  beforeEach(resetStore);

  it('undoes and redoes mutations independently per project', () => {
    const projAId = useEditorStore.getState().activeProjectId;
    const diagAId = useEditorStore.getState().getActiveProject().diagrams[0].id;

    const nodeAId = useEditorStore.getState().insertNode(
      { diagramId: diagAId, parentId: null, index: 0 },
      'sequence'
    );
    useEditorStore.getState().updateNodeText(diagAId, nodeAId, 'Step 1');
    expect(useEditorStore.getState().canUndo()).toBe(true);

    // Switch to Project B and verify its undo stack is empty
    const projBId = useEditorStore.getState().newProject('Projekt B');
    expect(useEditorStore.getState().canUndo()).toBe(false);

    // Switch back to Project A and undo twice
    useEditorStore.getState().setActiveProject(projAId);
    expect(useEditorStore.getState().canUndo()).toBe(true);

    useEditorStore.getState().undo();
    let diagA = useEditorStore.getState().getActiveProject().diagrams[0];
    expect(diagA.nodes[0].text).toBe('Anweisung');
    expect(useEditorStore.getState().canRedo()).toBe(true);

    useEditorStore.getState().undo();
    diagA = useEditorStore.getState().getActiveProject().diagrams[0];
    expect(diagA.nodes).toHaveLength(0);

    // Redo both
    useEditorStore.getState().redo();
    useEditorStore.getState().redo();
    diagA = useEditorStore.getState().getActiveProject().diagrams[0];
    expect(diagA.nodes).toHaveLength(1);
    expect(diagA.nodes[0].text).toBe('Step 1');

    // Clean up Project B reference check
    expect(projBId).not.toBe(projAId);
  });

  it('copies, cuts, and pastes nodes with fresh unique IDs', () => {
    const diagId = useEditorStore.getState().getActiveProject().diagrams[0].id;
    const ifId = useEditorStore.getState().insertNode(
      { diagramId: diagId, parentId: null, index: 0 },
      'if'
    );
    const childId = useEditorStore.getState().insertNode(
      { diagramId: diagId, parentId: ifId, branchKey: 'then', index: 0 },
      'sequence'
    );
    useEditorStore.getState().updateNodeText(diagId, childId, 'inside then');

    // Copy IfNode and paste twice
    useEditorStore.getState().copyNode(diagId, ifId);
    const pasted1Id = useEditorStore.getState().pasteNode({
      diagramId: diagId,
      parentId: null,
      index: 1,
    });
    const pasted2Id = useEditorStore.getState().pasteNode({
      diagramId: diagId,
      parentId: null,
      index: 2,
    });

    expect(pasted1Id).toBeTruthy();
    expect(pasted2Id).toBeTruthy();
    expect(pasted1Id).not.toBe(ifId);
    expect(pasted1Id).not.toBe(pasted2Id);

    const nodesAfterPaste = useEditorStore.getState().getActiveProject().diagrams[0].nodes;
    expect(nodesAfterPaste).toHaveLength(3);
    const pastedIf = nodesAfterPaste[1] as IfNode;
    expect(pastedIf.thenBranch[0].text).toBe('inside then');
    expect(pastedIf.thenBranch[0].id).not.toBe(childId);

    // Cut original IfNode
    useEditorStore.getState().cutNode(diagId, ifId);
    expect(useEditorStore.getState().getActiveProject().diagrams[0].nodes).toHaveLength(2);
    expect(useEditorStore.getState().clipboardNode?.type).toBe('if');
  });
});

describe('editorStore - canvas view & settings', () => {
  beforeEach(resetStore);

  it('updates zoom, pan, resetView, and project/app settings', () => {
    useEditorStore.getState().setZoom(10); // clamped to 2.5
    expect(useEditorStore.getState().getActiveProject().zoom).toBe(2.5);

    useEditorStore.getState().setPan(120, -80);
    expect(useEditorStore.getState().getActiveProject().panX).toBe(120);
    expect(useEditorStore.getState().getActiveProject().panY).toBe(-80);

    useEditorStore.getState().resetView();
    expect(useEditorStore.getState().getActiveProject().zoom).toBe(1);
    expect(useEditorStore.getState().getActiveProject().panX).toBe(0);

    useEditorStore.getState().updateAppSettings({ language: 'en', theme: 'dark' });
    expect(useEditorStore.getState().appSettings.language).toBe('en');
    expect(useEditorStore.getState().appSettings.theme).toBe('dark');

    useEditorStore.getState().updateProjectStyle({ fontSize: 16 });
    expect(useEditorStore.getState().getActiveProject().globalStyle.fontSize).toBe(16);

    useEditorStore.getState().updatePrintSettings({ orientation: 'landscape' });
    expect(useEditorStore.getState().getActiveProject().printSettings.orientation).toBe(
      'landscape'
    );
  });

  it('tracks and clears recentFiles', () => {
    const proj = createProject('Recent Test');
    const json = serializeProject(proj);
    useEditorStore.getState().openProjectFromContent(json, '/tmp/recent-test.stgp');
    expect(useEditorStore.getState().appSettings.recentFiles).toContain('/tmp/recent-test.stgp');

    useEditorStore.getState().clearRecentFiles();
    expect(useEditorStore.getState().appSettings.recentFiles).toHaveLength(0);
  });

  it('persists customOperators in appSettings', () => {
    useEditorStore.getState().updateAppSettings({
      customOperators: [
        { id: 'c1', title: 'Modulo', syntax: 'rest = a MOD b', description: 'Divisionsrest' },
      ],
    });
    expect(useEditorStore.getState().appSettings.customOperators).toHaveLength(1);
    expect(useEditorStore.getState().appSettings.customOperators?.[0]?.title).toBe('Modulo');
  });
});
