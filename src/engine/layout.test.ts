import { describe, expect, it } from 'vitest';
import type { DiagramStyle, StruktogrammDocument } from '../model/types';
import {
  DEFAULT_DIAGRAM_WIDTH,
  EMPTY_BRANCH_HEIGHT,
  LOOP_INDENT,
  SUBROUTINE_INSET,
  layoutDiagram,
  measureTextWidth,
  wrapText,
} from './layout';
import { renderDiagramToSvgString } from './svgExport';

const baseStyle: DiagramStyle = {
  backgroundColor: '#ffffff',
  textColor: '#111827',
  borderColor: '#111827',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 13,
  lineWidth: 1.5,
  paddingX: 10,
  paddingY: 8,
};

function makeDoc(
  nodes: StruktogrammDocument['nodes'],
  overrides: Partial<StruktogrammDocument> = {},
): StruktogrammDocument {
  return {
    id: 'diag-1',
    name: 'TestAlgo',
    parameterList: 'n: int',
    nodes,
    x: 0,
    y: 0,
    zIndex: 1,
    ...overrides,
  };
}

describe('layoutDiagram', () => {
  it('lays out an empty diagram with header, parameterList, empty placeholder, and root insertion zone', () => {
    const doc = makeDoc([]);
    const result = layoutDiagram(doc, baseStyle);

    expect(result.diagramId).toBe('diag-1');
    expect(result.width).toBe(DEFAULT_DIAGRAM_WIDTH);
    expect(result.header.title).toBe('TestAlgo(n: int)');
    expect(result.header.y).toBe(0);
    expect(result.header.height).toBeGreaterThanOrEqual(30);

    expect(result.nodes).toHaveLength(0);
    expect(result.emptyBranches).toHaveLength(1);
    expect(result.emptyBranches[0].parentId).toBeNull();
    expect(result.emptyBranches[0].height).toBeGreaterThanOrEqual(EMPTY_BRANCH_HEIGHT);

    expect(result.insertionZones).toHaveLength(1);
    expect(result.insertionZones[0].target).toEqual({
      diagramId: 'diag-1',
      parentId: null,
      branchKey: undefined,
      index: 0,
    });
  });

  it('lays out sequence and subroutine nodes with double side lines on subroutine', () => {
    const doc = makeDoc([
      { id: 's1', type: 'sequence', text: 'x := 1' },
      { id: 'sub1', type: 'subroutine', text: 'sortiere(liste)' },
    ]);

    const result = layoutDiagram(doc, baseStyle);
    expect(result.nodes).toHaveLength(2);

    const [seq, sub] = result.nodes;
    expect(seq.y).toBe(result.header.height);
    expect(seq.lines).toHaveLength(0);

    expect(sub.y).toBe(seq.y + seq.height);
    expect(sub.lines).toHaveLength(2);
    expect(sub.lines[0]).toEqual({
      x1: sub.x + SUBROUTINE_INSET,
      y1: sub.y,
      x2: sub.x + SUBROUTINE_INSET,
      y2: sub.y + sub.height,
    });
    expect(sub.lines[1]).toEqual({
      x1: sub.x + sub.width - SUBROUTINE_INSET,
      y1: sub.y,
      x2: sub.x + sub.width - SUBROUTINE_INSET,
      y2: sub.y + sub.height,
    });

    // Root insertion zones: before s1 (0), between s1 & sub1 (1), after sub1 (2)
    expect(result.insertionZones).toHaveLength(3);
    expect(result.insertionZones.map((z) => z.target.index)).toEqual([0, 1, 2]);
  });

  it('lays out if node with diagonals, labels, and equal-height branches', () => {
    const doc = makeDoc([
      {
        id: 'if1',
        type: 'if',
        text: 'x > 0',
        trueLabel: 'wahr',
        falseLabel: 'falsch',
        thenBranch: [
          { id: 't1', type: 'sequence', text: 'a := 1' },
          { id: 't2', type: 'sequence', text: 'b := 2' },
        ],
        elseBranch: [],
      },
    ]);

    const result = layoutDiagram(doc, baseStyle);
    const ifNode = result.nodes[0];
    expect(ifNode.branches).toHaveLength(2);

    const [thenCol, elseCol] = ifNode.branches;
    expect(thenCol.height).toBe(elseCol.height);
    expect(thenCol.isEmpty).toBe(false);
    expect(elseCol.isEmpty).toBe(true);
    expect(elseCol.emptyBox?.height).toBe(thenCol.height);

    // 4 lines: left diagonal, right diagonal, header bottom, vertical branch divider
    expect(ifNode.lines).toHaveLength(4);
    const splitX = elseCol.x;
    const branchY = ifNode.y + ifNode.headerRect!.height;
    expect(ifNode.lines[0]).toEqual({ x1: ifNode.x, y1: ifNode.y, x2: splitX, y2: branchY });
    expect(ifNode.lines[1]).toEqual({
      x1: ifNode.x + ifNode.width,
      y1: ifNode.y,
      x2: splitX,
      y2: branchY,
    });

    // Text blocks: condition, trueLabel, falseLabel
    expect(ifNode.textBlocks).toHaveLength(3);
    expect(ifNode.textBlocks[1].lines).toEqual(['wahr']);
    expect(ifNode.textBlocks[2].lines).toEqual(['falsch']);
  });

  it('lays out switch node with N cases + default and stretches all columns to max height', () => {
    const doc = makeDoc([
      {
        id: 'sw1',
        type: 'switch',
        text: 'monat',
        cases: [
          { id: 'c1', label: '1', body: [{ id: 'c1-1', type: 'sequence', text: 'Januar' }] },
          {
            id: 'c2',
            label: '2',
            body: [
              { id: 'c2-1', type: 'sequence', text: 'Februar' },
              { id: 'c2-2', type: 'sequence', text: '28/29 Tage' },
            ],
          },
        ],
        hasDefault: true,
        defaultLabel: 'sonst',
        defaultBranch: [],
      },
    ]);

    const result = layoutDiagram(doc, baseStyle);
    const sw = result.nodes[0];
    expect(sw.branches).toHaveLength(3);

    const heights = sw.branches.map((b) => b.height);
    expect(heights[0]).toBe(heights[1]);
    expect(heights[1]).toBe(heights[2]);
    expect(sw.branches[2].isEmpty).toBe(true);
    expect(sw.branches[2].emptyBox?.height).toBe(heights[1]);

    // Sum of column widths equals switch width
    const totalColWidth = sw.branches.reduce((acc, b) => acc + b.width, 0);
    expect(totalColWidth).toBeCloseTo(sw.width, 5);
  });

  it('lays out while, doWhile, and for loops with L-shaped / inverted-L-shaped frames', () => {
    const doc = makeDoc([
      {
        id: 'w1',
        type: 'while',
        text: 'i < 10',
        body: [{ id: 'w-b1', type: 'sequence', text: 'i := i + 1' }],
      },
      {
        id: 'dw1',
        type: 'doWhile',
        text: 'solange x != 0',
        body: [],
      },
      {
        id: 'f1',
        type: 'for',
        text: 'i := 1 bis 10',
        body: [{ id: 'f-b1', type: 'sequence', text: 'sum := sum + i' }],
      },
    ]);

    const result = layoutDiagram(doc, baseStyle);
    const [wNode, dwNode, fNode] = result.nodes;

    // while: header above body, body indented by LOOP_INDENT
    expect(wNode.lFramePath).toBeTruthy();
    expect(wNode.headerRect).toBeDefined();
    expect(wNode.bodyRect!.x).toBe(wNode.x + LOOP_INDENT);
    expect(wNode.bodyRect!.y).toBe(wNode.y + wNode.headerRect!.height);

    // doWhile: body above footer, body indented by LOOP_INDENT
    expect(dwNode.lFramePath).toBeTruthy();
    expect(dwNode.footerRect).toBeDefined();
    expect(dwNode.bodyRect!.x).toBe(dwNode.x + LOOP_INDENT);
    expect(dwNode.bodyRect!.y).toBe(dwNode.y);
    expect(dwNode.footerRect!.y).toBe(dwNode.y + dwNode.bodyRect!.height);
    expect(dwNode.branches[0].isEmpty).toBe(true);

    // for: distinct bold header text & top accent line
    expect(fNode.lFramePath).toBeTruthy();
    expect(fNode.textBlocks[0].fontWeight).toBe('bold');
    expect(fNode.lines.length).toBeGreaterThanOrEqual(1);
  });

  it('computes all insertion zones and flatNodes for nested structures', () => {
    const doc = makeDoc([
      {
        id: 'w1',
        type: 'while',
        text: 'running',
        body: [
          {
            id: 'if1',
            type: 'if',
            text: 'ok',
            trueLabel: 'T',
            falseLabel: 'F',
            thenBranch: [{ id: 'seq1', type: 'sequence', text: 'step' }],
            elseBranch: [],
          },
        ],
      },
    ]);

    const result = layoutDiagram(doc, baseStyle);
    expect(result.flatNodes.map((n) => n.id)).toEqual(['w1', 'if1', 'seq1']);

    // Empty elseBranch should be in emptyBranches
    expect(result.emptyBranches).toHaveLength(1);
    expect(result.emptyBranches[0].parentId).toBe('if1');
    expect(result.emptyBranches[0].branchKey).toBe('else');

    // Insertion zones:
    // root: 0, 1 (2)
    // w1.body: 0, 1 (2)
    // if1.then: 0, 1 (2)
    // if1.else: 0 (1)
    expect(result.insertionZones).toHaveLength(7);
  });

  it('wraps long text deterministically', () => {
    const lines = wrapText(
      'Dies ist eine sehr lange Anweisung die umgebrochen werden muss',
      120,
      13,
      'Inter, sans-serif',
    );
    expect(lines.length).toBeGreaterThan(1);
    expect(measureTextWidth('abc', 13, 'monospace')).toBeCloseTo(3 * 13 * 0.6, 5);
  });
});

describe('renderDiagramToSvgString', () => {
  it('produces valid standalone XML SVG with escaped text and DIN 66261 elements', () => {
    const doc = makeDoc([
      { id: 's1', type: 'sequence', text: 'a < b & c > d' },
      { id: 'sub1', type: 'subroutine', text: 'helper()' },
      {
        id: 'if1',
        type: 'if',
        text: 'a < b',
        trueLabel: 'ja',
        falseLabel: 'nein',
        thenBranch: [],
        elseBranch: [{ id: 's2', type: 'sequence', text: 'x := 1' }],
      },
      {
        id: 'w1',
        type: 'while',
        text: 'x > 0',
        body: [{ id: 's3', type: 'sequence', text: 'x := x - 1' }],
      },
    ]);

    const svgOpaque = renderDiagramToSvgString(doc, baseStyle, {
      transparent: false,
      padding: 20,
    });

    expect(svgOpaque.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(svgOpaque).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svgOpaque).toContain('a &lt; b &amp; c &gt; d');
    expect(svgOpaque).toContain('fill="#ffffff"');
    expect(svgOpaque).toContain('<line ');
    expect(svgOpaque).toContain('<path ');
    expect(svgOpaque).toContain('transform="translate(20, 20)"');

    const svgTransparent = renderDiagramToSvgString(doc, baseStyle, {
      transparent: true,
      padding: 0,
    });
    expect(svgTransparent).toContain('transform="translate(0, 0)"');
    expect(svgTransparent).not.toContain('x="0" y="0" width="' + (layoutDiagram(doc, baseStyle).width) + '" height="' + (layoutDiagram(doc, baseStyle).height) + '" fill="#ffffff"');
  });
});

describe('switch header labels', () => {
  it('keeps case labels clear of the header diagonal', async () => {
    const { createNode: mkNode, createProject: mkProject, createStruktogramm: mkDoc } = await import('../model/defaults');
    const { layoutDiagram: lay, measureTextWidth: measure } = await import('./layout');
    const proj = mkProject('t');
    const sw = mkNode('switch') as import('../model/types').SwitchNode;
    sw.cases = [
      { id: 'a', label: 'Fall 1', body: [] },
      { id: 'b', label: 'Fall 2', body: [] },
    ];
    sw.hasDefault = true;
    const layout = lay({ ...mkDoc('d'), nodes: [sw] }, proj.globalStyle);
    const ln = layout.nodes[0];
    const diag = ln.lines[0]; // left diagonal: (x, y) -> (lastColX, branchY)
    const xAt = (yy: number) => diag.x1 + ((yy - diag.y1) / (diag.y2 - diag.y1)) * (diag.x2 - diag.x1);
    for (const tb of ln.textBlocks.slice(1, -1)) {
      const lineH = Math.ceil(tb.fontSize * 1.35);
      const textTop = tb.y + tb.height - tb.lines.length * lineH;
      const w = measure(tb.lines[0], tb.fontSize, tb.fontFamily);
      const right = tb.align === 'center' ? tb.x + tb.width / 2 + w / 2 : tb.x + w;
      expect(right).toBeLessThanOrEqual(xAt(textTop) + 0.5);
    }
  });
});
