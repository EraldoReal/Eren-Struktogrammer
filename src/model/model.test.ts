import { describe, expect, it } from 'vitest';
import {
  createDefaultAppSettings,
  createDefaultPrintSettings,
  createDefaultStyle,
  createNode,
  createProject,
  createStruktogramm,
} from './defaults';
import {
  addSwitchCase,
  cloneNodeWithNewIds,
  findNodeById,
  insertNodeAt,
  moveNodeDown,
  moveNodeUp,
  removeNodeById,
  removeSwitchCase,
  toggleSwitchDefault,
  updateNodeById,
} from './operations';
import {
  DIAGRAM_MAGIC,
  DIAGRAM_SCHEMA,
  exportToNsdXml,
  LegacyFormatError,
  parseProject,
  parseStruktogramm,
  PROJECT_MAGIC,
  PROJECT_SCHEMA,
  serializeProject,
  serializeStruktogramm,
} from './serializer';
import type {
  DiagramNode,
  IfNode,
  NodeType,
  SequenceNode,
  SwitchNode,
  WhileNode,
} from './types';

describe('defaults', () => {
  it('creates default style, print settings, and app settings', () => {
    const style = createDefaultStyle();
    expect(style.backgroundColor).toBe('#ffffff');
    expect(style.fontSize).toBeGreaterThan(0);

    const print = createDefaultPrintSettings();
    expect(print.pageFormat).toBe('A4');
    expect(print.orientation).toBe('portrait');

    const app = createDefaultAppSettings();
    expect(app.language).toBe('de');
    expect(app.defaultSwitchCases).toBe(2);
    expect(app.defaultStyle).toEqual(style);
  });

  it('creates nodes for all 7 NodeTypes with unique IDs', () => {
    const types: NodeType[] = [
      'sequence',
      'subroutine',
      'if',
      'switch',
      'while',
      'doWhile',
      'for',
    ];
    const nodes = types.map((t) => createNode(t));
    const ids = new Set(nodes.map((n) => n.id));
    expect(ids.size).toBe(types.length);

    const ifNode = createNode('if', {
      defaultTrueLabel: 'Ja',
      defaultFalseLabel: 'Nein',
    }) as IfNode;
    expect(ifNode.trueLabel).toBe('Ja');
    expect(ifNode.falseLabel).toBe('Nein');
    expect(ifNode.thenBranch).toEqual([]);
    expect(ifNode.elseBranch).toEqual([]);

    const switchNode = createNode('switch', { defaultSwitchCases: 3 }) as SwitchNode;
    expect(switchNode.cases).toHaveLength(3);
    expect(switchNode.hasDefault).toBe(true);
    expect(new Set(switchNode.cases.map((c) => c.id)).size).toBe(3);
  });

  it('creates StruktogrammDocument and ProjectDocument', () => {
    const doc = createStruktogramm('Sortieren');
    expect(doc.name).toBe('Sortieren');
    expect(doc.nodes).toEqual([]);
    expect(doc.id).toBeTruthy();

    const project = createProject('Mein Projekt');
    expect(project.name).toBe('Mein Projekt');
    expect(project.diagrams).toHaveLength(1);
    expect(project.activeDiagramId).toBe(project.diagrams[0].id);
    expect(project.zoom).toBe(1);
  });
});

describe('operations', () => {
  it('inserts, finds, updates, and removes nodes immutably', () => {
    const seq1 = createNode('sequence') as SequenceNode;
    seq1.text = 'x := 1';
    const ifNode = createNode('if') as IfNode;
    const whileNode = createNode('while') as WhileNode;
    const seqInThen = createNode('sequence') as SequenceNode;
    seqInThen.text = 'y := 2';
    const seqInWhile = createNode('sequence') as SequenceNode;
    seqInWhile.text = 'z := 3';

    let tree: DiagramNode[] = [];
    tree = insertNodeAt(tree, { parentId: null, index: 0 }, seq1);
    tree = insertNodeAt(tree, { parentId: null, index: 1 }, ifNode);
    tree = insertNodeAt(tree, { parentId: ifNode.id, branchKey: 'then', index: 0 }, seqInThen);
    tree = insertNodeAt(tree, { parentId: ifNode.id, branchKey: 'else', index: 0 }, whileNode);
    tree = insertNodeAt(tree, { parentId: whileNode.id, branchKey: 'body', index: 0 }, seqInWhile);

    expect(findNodeById(tree, seqInWhile.id)).toEqual(seqInWhile);
    expect(findNodeById(tree, 'non-existent')).toBeNull();

    const updatedTree = updateNodeById(tree, seqInWhile.id, (n) => ({
      ...n,
      text: 'z := 99',
    }));
    expect((findNodeById(updatedTree, seqInWhile.id) as SequenceNode).text).toBe('z := 99');
    // Original tree remains unchanged
    expect((findNodeById(tree, seqInWhile.id) as SequenceNode).text).toBe('z := 3');

    const { nodes: afterRemove, removed } = removeNodeById(updatedTree, seqInThen.id);
    expect(removed?.id).toBe(seqInThen.id);
    expect(findNodeById(afterRemove, seqInThen.id)).toBeNull();

    const notFoundRemove = removeNodeById(afterRemove, 'missing-id');
    expect(notFoundRemove.removed).toBeNull();
    expect(notFoundRemove.nodes).toHaveLength(2);
  });

  it('inserts into switch cases and default branch', () => {
    const sw = createNode('switch') as SwitchNode;
    const caseId = sw.cases[0].id;
    const s1 = createNode('sequence');
    const s2 = createNode('sequence');

    let tree: DiagramNode[] = [sw];
    tree = insertNodeAt(tree, { parentId: sw.id, branchKey: caseId, index: 0 }, s1);
    tree = insertNodeAt(tree, { parentId: sw.id, branchKey: 'default', index: 0 }, s2);

    const foundSw = findNodeById(tree, sw.id) as SwitchNode;
    expect(foundSw.cases[0].body).toEqual([s1]);
    expect(foundSw.defaultBranch).toEqual([s2]);
  });

  it('moves nodes up and down at root and nested levels', () => {
    const a = createNode('sequence');
    const b = createNode('sequence');
    const c = createNode('sequence');
    const loop = createNode('for');

    let tree: DiagramNode[] = [loop];
    tree = insertNodeAt(tree, { parentId: loop.id, branchKey: 'body', index: 0 }, a);
    tree = insertNodeAt(tree, { parentId: loop.id, branchKey: 'body', index: 1 }, b);
    tree = insertNodeAt(tree, { parentId: loop.id, branchKey: 'body', index: 2 }, c);

    // Move b up -> [b, a, c]
    tree = moveNodeUp(tree, b.id);
    let body = (tree[0] as WhileNode).body;
    expect(body.map((n) => n.id)).toEqual([b.id, a.id, c.id]);

    // Move b up again (already at index 0) -> no-op
    tree = moveNodeUp(tree, b.id);
    body = (tree[0] as WhileNode).body;
    expect(body.map((n) => n.id)).toEqual([b.id, a.id, c.id]);

    // Move b down -> [a, b, c]
    tree = moveNodeDown(tree, b.id);
    body = (tree[0] as WhileNode).body;
    expect(body.map((n) => n.id)).toEqual([a.id, b.id, c.id]);

    // Move c down (already last) -> no-op
    tree = moveNodeDown(tree, c.id);
    body = (tree[0] as WhileNode).body;
    expect(body.map((n) => n.id)).toEqual([a.id, b.id, c.id]);
  });

  it('clones nodes deeply with fresh IDs including switch cases', () => {
    const sw = createNode('switch') as SwitchNode;
    const child = createNode('sequence');
    sw.cases[0].body.push(child);
    const defaultChild = createNode('subroutine');
    sw.defaultBranch.push(defaultChild);

    const cloned = cloneNodeWithNewIds(sw);
    expect(cloned.id).not.toBe(sw.id);
    expect(cloned.cases[0].id).not.toBe(sw.cases[0].id);
    expect(cloned.cases[0].body[0].id).not.toBe(child.id);
    expect(cloned.defaultBranch[0].id).not.toBe(defaultChild.id);
    expect(cloned.cases[0].body[0].text).toBe(child.text);
  });

  it('supports switch case operations (add, remove, toggle default)', () => {
    let sw = createNode('switch') as SwitchNode;
    expect(sw.cases).toHaveLength(2);

    sw = addSwitchCase(sw, 'Fall X');
    expect(sw.cases).toHaveLength(3);
    expect(sw.cases[2].label).toBe('Fall X');

    const idToRemove = sw.cases[1].id;
    sw = removeSwitchCase(sw, idToRemove);
    expect(sw.cases).toHaveLength(2);
    expect(sw.cases.some((c) => c.id === idToRemove)).toBe(false);

    expect(sw.hasDefault).toBe(true);
    sw = toggleSwitchDefault(sw);
    expect(sw.hasDefault).toBe(false);
  });
});

describe('serializer', () => {
  it('serializes and parses StruktogrammDocument as JSON with schema/magic headers', () => {
    const doc = createStruktogramm('TestDiagramm');
    const seq = createNode('sequence');
    seq.text = 'a := 42';
    doc.nodes.push(seq);

    const json = serializeStruktogramm(doc);
    const parsedEnvelope = JSON.parse(json);
    expect(parsedEnvelope.$schema).toBe(DIAGRAM_SCHEMA);
    expect(parsedEnvelope.magic).toBe(DIAGRAM_MAGIC);

    const roundTripped = parseStruktogramm(json);
    expect(roundTripped.id).toBe(doc.id);
    expect(roundTripped.name).toBe('TestDiagramm');
    expect(roundTripped.nodes).toHaveLength(1);
    expect(roundTripped.nodes[0].text).toBe('a := 42');

    // Also supports Uint8Array input
    const bytes = new TextEncoder().encode(json);
    const fromBytes = parseStruktogramm(bytes);
    expect(fromBytes.id).toBe(doc.id);
  });

  it('serializes and parses ProjectDocument', () => {
    const project = createProject('Projekt Alpha');
    const json = serializeProject(project);
    const parsedEnvelope = JSON.parse(json);
    expect(parsedEnvelope.$schema).toBe(PROJECT_SCHEMA);
    expect(parsedEnvelope.magic).toBe(PROJECT_MAGIC);

    const roundTripped = parseProject(json);
    expect(roundTripped.id).toBe(project.id);
    expect(roundTripped.name).toBe('Projekt Alpha');
    expect(roundTripped.diagrams).toHaveLength(1);
    expect(roundTripped.activeDiagramId).toBe(project.activeDiagramId);
  });

  it('exports to Structorizer NSD XML and imports back with all node types', () => {
    const doc = createStruktogramm('NSD Test & "Quotes"');
    const seq = createNode('sequence');
    seq.text = 'x < 10 & y > 0';
    const sub = createNode('subroutine');
    sub.text = 'print(x)';
    const ifNode = createNode('if') as IfNode;
    ifNode.text = 'x == 1';
    ifNode.thenBranch.push(createNode('sequence'));
    ifNode.elseBranch.push(createNode('subroutine'));
    const sw = createNode('switch') as SwitchNode;
    sw.text = 'wahl';
    sw.cases[0].label = '1';
    sw.cases[0].body.push(createNode('sequence'));
    sw.defaultBranch.push(createNode('sequence'));
    const wh = createNode('while') as WhileNode;
    wh.body.push(createNode('sequence'));
    const dw = createNode('doWhile') as WhileNode;
    dw.body.push(createNode('sequence'));
    const fr = createNode('for') as WhileNode;
    fr.body.push(createNode('sequence'));

    doc.nodes.push(seq, sub, ifNode, sw, wh, dw, fr);

    const xml = exportToNsdXml(doc);
    expect(xml.startsWith('<?xml')).toBe(true);
    expect(xml).toContain('<root ');

    const imported = parseStruktogramm(xml);
    expect(imported.name).toBe('NSD Test & "Quotes"');
    expect(imported.nodes).toHaveLength(7);
    expect(imported.nodes.map((n) => n.type)).toEqual([
      'sequence',
      'subroutine',
      'if',
      'switch',
      'while',
      'doWhile',
      'for',
    ]);
    expect(imported.nodes[0].text).toBe('x < 10 & y > 0');
    expect((imported.nodes[2] as IfNode).thenBranch).toHaveLength(1);
    expect((imported.nodes[2] as IfNode).elseBranch).toHaveLength(1);
    expect((imported.nodes[3] as SwitchNode).cases).toHaveLength(2);
    expect((imported.nodes[3] as SwitchNode).hasDefault).toBe(true);
    expect((imported.nodes[3] as SwitchNode).defaultBranch).toHaveLength(1);
  });

  it('imports external Structorizer .nsd XML with quoted attributes and % no-default', () => {
    const nsdXml = `<?xml version="1.0" encoding="UTF-8"?>
<root text="&#34;ExternalNSD&#34;" type="program">
  <children>
    <instruction text="&#34;a := 1&#34;" />
    <case text="&#34;mode&#34;&#10;&#34;A&#34;&#10;&#34;B&#34;&#10;&#34;%&#34;">
      <qCase><instruction text="&#34;doA()&#34;" /></qCase>
      <qCase><call text="&#34;doB()&#34;" /></qCase>
      <qCase></qCase>
    </case>
  </children>
</root>`;

    const doc = parseStruktogramm(nsdXml);
    expect(doc.name).toBe('ExternalNSD');
    expect(doc.nodes).toHaveLength(2);
    expect(doc.nodes[0].text).toBe('a := 1');
    const sw = doc.nodes[1] as SwitchNode;
    expect(sw.type).toBe('switch');
    expect(sw.text).toBe('mode');
    expect(sw.cases.map((c) => c.label)).toEqual(['A', 'B']);
    expect(sw.hasDefault).toBe(false);
  });

  it('detects legacy Java serialized binary AC ED 00 05 and throws LegacyFormatError', () => {
    const legacyBytes = new Uint8Array([0xac, 0xed, 0x00, 0x05, 0x73, 0x72]);
    expect(() => parseStruktogramm(legacyBytes)).toThrow(LegacyFormatError);
    expect(() => parseStruktogramm(legacyBytes)).toThrow(/AC ED 00 05/);
    expect(() => parseProject(legacyBytes)).toThrow(LegacyFormatError);
  });

  it('throws descriptive errors on invalid JSON or XML', () => {
    expect(() => parseStruktogramm('')).toThrow();
    expect(() => parseStruktogramm('{not valid json')).toThrow(/Invalid JSON/);
    expect(() => parseStruktogramm('<unknown></unknown>')).toThrow(/Unsupported XML root tag/);
    expect(() => parseProject('{}')).toThrow(/missing "diagrams"/);
  });
});
