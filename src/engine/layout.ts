import type {
  DiagramNode,
  DiagramStyle,
  DoWhileNode,
  ForNode,
  IfNode,
  InsertionTarget,
  NodeStyle,
  NodeType,
  StruktogrammDocument,
  SubroutineNode,
  SwitchNode,
  WhileNode,
} from '../model/types';

export const DEFAULT_DIAGRAM_WIDTH = 440;
export const EMPTY_BRANCH_HEIGHT = 28;
export const SUBROUTINE_INSET = 8;
export const LOOP_INDENT = 24;
export const MIN_NODE_WIDTH = 80;
export const MIN_BRANCH_WIDTH = 72;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeWidth?: number;
  dashed?: boolean;
}

export interface LayoutTextBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  lines: string[];
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
}

export interface EmptyBranchBox {
  x: number;
  y: number;
  width: number;
  height: number;
  diagramId: string;
  parentId: string | null;
  branchKey?: string;
  target: InsertionTarget;
}

export interface InsertionZone {
  x: number;
  y: number;
  width: number;
  target: InsertionTarget;
}

export interface LayoutBranchColumn {
  key: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  nodes: LayoutNode[];
  isEmpty: boolean;
  emptyBox?: EmptyBranchBox;
}

export interface LayoutNode {
  id: string;
  type: NodeType;
  node: DiagramNode;
  x: number;
  y: number;
  width: number;
  height: number;
  style: DiagramStyle;
  headerRect?: Rect;
  footerRect?: Rect;
  bodyRect?: Rect;
  lFramePath?: string;
  lines: LayoutLine[];
  textBlocks: LayoutTextBlock[];
  branches: LayoutBranchColumn[];
}

export interface LayoutHeader {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  textBlock: LayoutTextBlock;
  style: DiagramStyle;
}

export interface LayoutResult {
  diagramId: string;
  width: number;
  height: number;
  style: DiagramStyle;
  header: LayoutHeader;
  bodyRect: Rect;
  nodes: LayoutNode[];
  flatNodes: LayoutNode[];
  emptyBranches: EmptyBranchBox[];
  insertionZones: InsertionZone[];
}

const LINE_HEIGHT_FACTOR = 1.35;

function isMonospaceFont(fontFamily: string): boolean {
  const lower = fontFamily.toLowerCase();
  return (
    lower.includes('mono') ||
    lower.includes('consolas') ||
    lower.includes('courier') ||
    lower.includes('fira code') ||
    lower.includes('jetbrains')
  );
}

/**
 * Deterministic, DOM-free text width estimator so layout runs identically in
 * Node (tests, headless export) and Browser (React SVG).
 */
export function measureTextWidth(
  text: string,
  fontSize: number,
  fontFamily = 'sans-serif',
): number {
  if (!text) return 0;
  if (isMonospaceFont(fontFamily)) {
    return text.length * fontSize * 0.6;
  }

  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ') {
      width += fontSize * 0.28;
    } else if ('ijlI1.,;:\'"|!()[]{}'.includes(ch)) {
      width += fontSize * 0.32;
    } else if ('mwMW@%#&'.includes(ch)) {
      width += fontSize * 0.85;
    } else if (ch >= 'A' && ch <= 'Z') {
      width += fontSize * 0.66;
    } else {
      width += fontSize * 0.54;
    }
  }
  return width;
}

export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily = 'sans-serif',
): string[] {
  const effectiveMax = Math.max(fontSize * 1.5, maxWidth);
  const paragraphs = text.split(/\r?\n/);
  const lines: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trimEnd();
    if (trimmed.length === 0) {
      lines.push('');
      continue;
    }

    const words = trimmed.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (!currentLine) {
        if (measureTextWidth(word, fontSize, fontFamily) <= effectiveMax) {
          currentLine = word;
        } else {
          // Break a single overly-long token
          let chunk = '';
          for (const ch of word) {
            const candidate = chunk + ch;
            if (
              chunk.length > 0 &&
              measureTextWidth(candidate, fontSize, fontFamily) > effectiveMax
            ) {
              lines.push(chunk);
              chunk = ch;
            } else {
              chunk = candidate;
            }
          }
          currentLine = chunk;
        }
      } else {
        const candidate = `${currentLine} ${word}`;
        if (measureTextWidth(candidate, fontSize, fontFamily) <= effectiveMax) {
          currentLine = candidate;
        } else {
          lines.push(currentLine);
          if (measureTextWidth(word, fontSize, fontFamily) <= effectiveMax) {
            currentLine = word;
          } else {
            let chunk = '';
            for (const ch of word) {
              const next = chunk + ch;
              if (
                chunk.length > 0 &&
                measureTextWidth(next, fontSize, fontFamily) > effectiveMax
              ) {
                lines.push(chunk);
                chunk = ch;
              } else {
                chunk = next;
              }
            }
            currentLine = chunk;
          }
        }
      }
    }

    if (currentLine.length > 0 || paragraphs.length === 1) {
      lines.push(currentLine);
    }
  }

  return lines.length > 0 ? lines : [''];
}

export function resolveDiagramStyle(
  globalStyle: DiagramStyle,
  docStyle?: Partial<DiagramStyle>,
): DiagramStyle {
  if (!docStyle) return { ...globalStyle };
  return {
    backgroundColor: docStyle.backgroundColor ?? globalStyle.backgroundColor,
    textColor: docStyle.textColor ?? globalStyle.textColor,
    borderColor: docStyle.borderColor ?? globalStyle.borderColor,
    fontFamily: docStyle.fontFamily ?? globalStyle.fontFamily,
    fontSize: docStyle.fontSize ?? globalStyle.fontSize,
    lineWidth: docStyle.lineWidth ?? globalStyle.lineWidth,
    paddingX: docStyle.paddingX ?? globalStyle.paddingX,
    paddingY: docStyle.paddingY ?? globalStyle.paddingY,
  };
}

export function resolveNodeStyle(
  diagramStyle: DiagramStyle,
  nodeStyle?: NodeStyle,
): DiagramStyle {
  if (!nodeStyle) return diagramStyle;
  return {
    ...diagramStyle,
    backgroundColor: nodeStyle.backgroundColor ?? diagramStyle.backgroundColor,
    textColor: nodeStyle.textColor ?? diagramStyle.textColor,
    borderColor: nodeStyle.borderColor ?? diagramStyle.borderColor,
    fontFamily: nodeStyle.fontFamily ?? diagramStyle.fontFamily,
    fontSize: nodeStyle.fontSize ?? diagramStyle.fontSize,
  };
}

function getLineHeight(fontSize: number): number {
  return Math.ceil(fontSize * LINE_HEIGHT_FACTOR);
}

function getMinTextWidth(text: string, fontSize: number, fontFamily: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return fontSize * 2;
  let longest = 0;
  for (const w of words) {
    longest = Math.max(longest, measureTextWidth(w, fontSize, fontFamily));
  }
  return Math.min(longest, fontSize * 14);
}

function computeBranchMinWidth(nodes: DiagramNode[], diagramStyle: DiagramStyle): number {
  if (nodes.length === 0) return MIN_BRANCH_WIDTH;
  let maxW = MIN_BRANCH_WIDTH;
  for (const node of nodes) {
    maxW = Math.max(maxW, computeNodeMinWidth(node, diagramStyle));
  }
  return maxW;
}

function computeNodeMinWidth(node: DiagramNode, diagramStyle: DiagramStyle): number {
  const style = resolveNodeStyle(diagramStyle, node.style);
  const padX = style.paddingX * 2;
  const textMin = getMinTextWidth(node.text, style.fontSize, style.fontFamily);

  switch (node.type) {
    case 'sequence':
      return Math.max(MIN_NODE_WIDTH, textMin + padX);

    case 'subroutine':
      return Math.max(MIN_NODE_WIDTH + SUBROUTINE_INSET * 2, textMin + padX + SUBROUTINE_INSET * 2);

    case 'if': {
      const thenMin = computeBranchMinWidth(node.thenBranch, diagramStyle);
      const elseMin = computeBranchMinWidth(node.elseBranch, diagramStyle);
      const labelFontSize = Math.max(10, style.fontSize - 2);
      const labelsMin =
        measureTextWidth(node.trueLabel, labelFontSize, style.fontFamily) +
        measureTextWidth(node.falseLabel, labelFontSize, style.fontFamily) +
        padX * 2;
      return Math.max(thenMin + elseMin, textMin + padX, labelsMin, MIN_BRANCH_WIDTH * 2);
    }

    case 'switch': {
      const cols = getSwitchColumns(node);
      let sumColMin = 0;
      const labelFontSize = Math.max(10, style.fontSize - 1);
      for (const col of cols) {
        const bodyMin = computeBranchMinWidth(col.body, diagramStyle);
        const labelMin = measureTextWidth(col.label, labelFontSize, style.fontFamily) + padX;
        sumColMin += Math.max(MIN_BRANCH_WIDTH, bodyMin, labelMin);
      }
      return Math.max(sumColMin, textMin + padX, MIN_NODE_WIDTH);
    }

    case 'while':
    case 'doWhile':
    case 'for': {
      const bodyMin = computeBranchMinWidth(node.body, diagramStyle);
      return Math.max(LOOP_INDENT + bodyMin, textMin + padX, MIN_NODE_WIDTH);
    }
  }
}

interface SwitchColumnSpec {
  key: string;
  label: string;
  body: DiagramNode[];
}

function getSwitchColumns(node: SwitchNode): SwitchColumnSpec[] {
  const cols: SwitchColumnSpec[] = node.cases.map((c) => ({
    key: c.id,
    label: c.label,
    body: c.body,
  }));
  if (node.hasDefault) {
    cols.push({
      key: 'default',
      label: node.defaultLabel || 'default',
      body: node.defaultBranch,
    });
  }
  if (cols.length === 0) {
    cols.push({
      key: 'empty',
      label: '',
      body: [],
    });
  }
  return cols;
}

function distributeColumnWidths(totalWidth: number, minWidths: number[]): number[] {
  const n = minWidths.length;
  if (n === 0) return [];
  const equalWidth = totalWidth / n;

  // If every column fits comfortably in equalWidth, use equal widths
  if (minWidths.every((mw) => mw <= equalWidth)) {
    const widths = new Array<number>(n).fill(equalWidth);
    // Adjust last column for floating-point exactness
    const sumExceptLast = widths.slice(0, -1).reduce((a, b) => a + b, 0);
    widths[n - 1] = totalWidth - sumExceptLast;
    return widths;
  }

  // Otherwise start from minWidths and distribute remaining space equally
  const sumMin = minWidths.reduce((a, b) => a + b, 0);
  const extra = Math.max(0, totalWidth - sumMin);
  const extraPerCol = extra / n;
  const widths = minWidths.map((mw) => mw + extraPerCol);
  const sumExceptLast = widths.slice(0, -1).reduce((a, b) => a + b, 0);
  widths[n - 1] = totalWidth - sumExceptLast;
  return widths;
}

interface LayoutContext {
  diagramId: string;
  diagramStyle: DiagramStyle;
  flatNodes: LayoutNode[];
  emptyBranches: EmptyBranchBox[];
  insertionZones: InsertionZone[];
}

function layoutNodeList(
  nodes: DiagramNode[],
  x: number,
  y: number,
  width: number,
  parentId: string | null,
  branchKey: string | undefined,
  ctx: LayoutContext,
  minBranchHeight = EMPTY_BRANCH_HEIGHT,
): {
  layoutNodes: LayoutNode[];
  totalHeight: number;
  isEmpty: boolean;
  emptyBox?: EmptyBranchBox;
} {
  if (nodes.length === 0) {
    const height = Math.max(EMPTY_BRANCH_HEIGHT, minBranchHeight);
    const target: InsertionTarget = {
      diagramId: ctx.diagramId,
      parentId,
      branchKey,
      index: 0,
    };
    const emptyBox: EmptyBranchBox = {
      x,
      y,
      width,
      height,
      diagramId: ctx.diagramId,
      parentId,
      branchKey,
      target,
    };
    ctx.emptyBranches.push(emptyBox);
    ctx.insertionZones.push({
      x,
      y: y + height / 2,
      width,
      target,
    });
    return {
      layoutNodes: [],
      totalHeight: height,
      isEmpty: true,
      emptyBox,
    };
  }

  const layoutNodes: LayoutNode[] = [];
  let cursorY = y;

  // Insertion zone above the first node
  ctx.insertionZones.push({
    x,
    y: cursorY,
    width,
    target: {
      diagramId: ctx.diagramId,
      parentId,
      branchKey,
      index: 0,
    },
  });

  for (let i = 0; i < nodes.length; i++) {
    const idx = ctx.flatNodes.length;
    ctx.flatNodes.push(undefined as unknown as LayoutNode);
    const laidOut = layoutSingleNode(nodes[i], x, cursorY, width, ctx);
    ctx.flatNodes[idx] = laidOut;
    layoutNodes.push(laidOut);
    cursorY += laidOut.height;

    // Insertion zone below node i (index i + 1)
    ctx.insertionZones.push({
      x,
      y: cursorY,
      width,
      target: {
        diagramId: ctx.diagramId,
        parentId,
        branchKey,
        index: i + 1,
      },
    });
  }

  return {
    layoutNodes,
    totalHeight: cursorY - y,
    isEmpty: false,
  };
}

function layoutSingleNode(
  node: DiagramNode,
  x: number,
  y: number,
  width: number,
  ctx: LayoutContext,
): LayoutNode {
  const style = resolveNodeStyle(ctx.diagramStyle, node.style);

  switch (node.type) {
    case 'sequence':
      return layoutSequenceNode(node, x, y, width, style);
    case 'subroutine':
      return layoutSubroutineNode(node, x, y, width, style);
    case 'if':
      return layoutIfNode(node, x, y, width, style, ctx);
    case 'switch':
      return layoutSwitchNode(node, x, y, width, style, ctx);
    case 'while':
      return layoutWhileNode(node, x, y, width, style, ctx);
    case 'doWhile':
      return layoutDoWhileNode(node, x, y, width, style, ctx);
    case 'for':
      return layoutForNode(node, x, y, width, style, ctx);
  }
}

function layoutSequenceNode(
  node: DiagramNode,
  x: number,
  y: number,
  width: number,
  style: DiagramStyle,
): LayoutNode {
  const availWidth = Math.max(20, width - style.paddingX * 2);
  const lines = wrapText(node.text, availWidth, style.fontSize, style.fontFamily);
  const lineH = getLineHeight(style.fontSize);
  const height = Math.max(EMPTY_BRANCH_HEIGHT, lines.length * lineH + style.paddingY * 2);

  return {
    id: node.id,
    type: node.type,
    node,
    x,
    y,
    width,
    height,
    style,
    lines: [],
    textBlocks: [
      {
        x: x + style.paddingX,
        y: y + style.paddingY,
        width: availWidth,
        height: height - style.paddingY * 2,
        lines,
        align: 'left',
        verticalAlign: 'middle',
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        color: style.textColor,
      },
    ],
    branches: [],
  };
}

function layoutSubroutineNode(
  node: SubroutineNode,
  x: number,
  y: number,
  width: number,
  style: DiagramStyle,
): LayoutNode {
  const innerX = x + SUBROUTINE_INSET;
  const innerWidth = Math.max(20, width - SUBROUTINE_INSET * 2);
  const availWidth = Math.max(20, innerWidth - style.paddingX * 2);
  const lines = wrapText(node.text, availWidth, style.fontSize, style.fontFamily);
  const lineH = getLineHeight(style.fontSize);
  const height = Math.max(EMPTY_BRANCH_HEIGHT, lines.length * lineH + style.paddingY * 2);

  return {
    id: node.id,
    type: node.type,
    node,
    x,
    y,
    width,
    height,
    style,
    lines: [
      {
        x1: x + SUBROUTINE_INSET,
        y1: y,
        x2: x + SUBROUTINE_INSET,
        y2: y + height,
      },
      {
        x1: x + width - SUBROUTINE_INSET,
        y1: y,
        x2: x + width - SUBROUTINE_INSET,
        y2: y + height,
      },
    ],
    textBlocks: [
      {
        x: innerX + style.paddingX,
        y: y + style.paddingY,
        width: availWidth,
        height: height - style.paddingY * 2,
        lines,
        align: 'center',
        verticalAlign: 'middle',
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        color: style.textColor,
      },
    ],
    branches: [],
  };
}

function layoutIfNode(
  node: IfNode,
  x: number,
  y: number,
  width: number,
  style: DiagramStyle,
  ctx: LayoutContext,
): LayoutNode {
  const thenMinW = computeBranchMinWidth(node.thenBranch, ctx.diagramStyle);
  const elseMinW = computeBranchMinWidth(node.elseBranch, ctx.diagramStyle);
  const [thenWidth, elseWidth] = distributeColumnWidths(width, [thenMinW, elseMinW]);
  const splitX = x + thenWidth;

  const condAvailWidth = Math.max(30, width * 0.65 - style.paddingX * 2);
  const condLines = wrapText(node.text, condAvailWidth, style.fontSize, style.fontFamily);
  const lineH = getLineHeight(style.fontSize);
  const labelFontSize = Math.max(10, style.fontSize - 2);
  const labelRowH = getLineHeight(labelFontSize);

  const headerHeight = Math.max(
    36,
    condLines.length * lineH + labelRowH + style.paddingY * 1.5,
  );

  const branchY = y + headerHeight;
  const thenRes = layoutNodeList(node.thenBranch, x, branchY, thenWidth, node.id, 'then', ctx);
  const elseRes = layoutNodeList(
    node.elseBranch,
    splitX,
    branchY,
    elseWidth,
    node.id,
    'else',
    ctx,
  );

  const branchHeight = Math.max(thenRes.totalHeight, elseRes.totalHeight, EMPTY_BRANCH_HEIGHT);

  // Stretch empty placeholder boxes to equal branchHeight
  if (thenRes.emptyBox) {
    thenRes.emptyBox.height = branchHeight;
  }
  if (elseRes.emptyBox) {
    elseRes.emptyBox.height = branchHeight;
  }

  const totalHeight = headerHeight + branchHeight;

  const lines: LayoutLine[] = [
    // Left diagonal from top-left to split point at bottom of header
    { x1: x, y1: y, x2: splitX, y2: branchY },
    // Right diagonal from top-right to split point at bottom of header
    { x1: x + width, y1: y, x2: splitX, y2: branchY },
    // Horizontal divider below header
    { x1: x, y1: branchY, x2: x + width, y2: branchY },
    // Vertical divider between then and else branches
    { x1: splitX, y1: branchY, x2: splitX, y2: y + totalHeight },
  ];

  const textBlocks: LayoutTextBlock[] = [
    {
      x: x + width * 0.175,
      y: y + style.paddingY * 0.6,
      width: width * 0.65,
      height: condLines.length * lineH,
      lines: condLines,
      align: 'center',
      verticalAlign: 'top',
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      color: style.textColor,
    },
    {
      x: x + style.paddingX,
      y: branchY - labelRowH - 2,
      width: Math.max(20, thenWidth - style.paddingX * 2),
      height: labelRowH,
      lines: [node.trueLabel],
      align: 'left',
      verticalAlign: 'bottom',
      fontSize: labelFontSize,
      fontFamily: style.fontFamily,
      color: style.textColor,
    },
    {
      x: splitX + style.paddingX,
      y: branchY - labelRowH - 2,
      width: Math.max(20, elseWidth - style.paddingX * 2),
      height: labelRowH,
      lines: [node.falseLabel],
      align: 'right',
      verticalAlign: 'bottom',
      fontSize: labelFontSize,
      fontFamily: style.fontFamily,
      color: style.textColor,
    },
  ];

  return {
    id: node.id,
    type: node.type,
    node,
    x,
    y,
    width,
    height: totalHeight,
    style,
    headerRect: { x, y, width, height: headerHeight },
    lines,
    textBlocks,
    branches: [
      {
        key: 'then',
        label: node.trueLabel,
        x,
        y: branchY,
        width: thenWidth,
        height: branchHeight,
        nodes: thenRes.layoutNodes,
        isEmpty: thenRes.isEmpty,
        emptyBox: thenRes.emptyBox,
      },
      {
        key: 'else',
        label: node.falseLabel,
        x: splitX,
        y: branchY,
        width: elseWidth,
        height: branchHeight,
        nodes: elseRes.layoutNodes,
        isEmpty: elseRes.isEmpty,
        emptyBox: elseRes.emptyBox,
      },
    ],
  };
}

function layoutSwitchNode(
  node: SwitchNode,
  x: number,
  y: number,
  width: number,
  style: DiagramStyle,
  ctx: LayoutContext,
): LayoutNode {
  const cols = getSwitchColumns(node);
  const labelFontSize = Math.max(10, style.fontSize - 1);
  const colMinWidths = cols.map((col) => {
    const bodyMin = computeBranchMinWidth(col.body, ctx.diagramStyle);
    const labelMin =
      measureTextWidth(col.label, labelFontSize, style.fontFamily) + style.paddingX * 2;
    return Math.max(MIN_BRANCH_WIDTH, bodyMin, labelMin);
  });

  const colWidths = distributeColumnWidths(width, colMinWidths);
  const exprAvailWidth = Math.max(30, width - style.paddingX * 2);
  const exprLines = wrapText(node.text, exprAvailWidth, style.fontSize, style.fontFamily);
  const lineH = getLineHeight(style.fontSize);
  const labelLineH = getLineHeight(labelFontSize);

  const wrappedColLabels = cols.map((col, idx) =>
    wrapText(col.label, Math.max(20, colWidths[idx] - style.paddingX), labelFontSize, style.fontFamily),
  );
  const maxLabelLines = Math.max(1, ...wrappedColLabels.map((l) => l.length));

  const exprHeight = exprLines.length * lineH + style.paddingY;
  const labelRowHeight = maxLabelLines * labelLineH + style.paddingY;
  const headerHeight = Math.max(40, exprHeight + labelRowHeight);

  const branchY = y + headerHeight;
  const colResults: Array<{
    spec: SwitchColumnSpec;
    colX: number;
    colW: number;
    res: ReturnType<typeof layoutNodeList>;
  }> = [];

  let cursorX = x;
  for (let i = 0; i < cols.length; i++) {
    const colW = colWidths[i];
    const res = layoutNodeList(cols[i].body, cursorX, branchY, colW, node.id, cols[i].key, ctx);
    colResults.push({
      spec: cols[i],
      colX: cursorX,
      colW,
      res,
    });
    cursorX += colW;
  }

  const branchHeight = Math.max(
    EMPTY_BRANCH_HEIGHT,
    ...colResults.map((c) => c.res.totalHeight),
  );

  for (const c of colResults) {
    if (c.res.emptyBox) {
      c.res.emptyBox.height = branchHeight;
    }
  }

  const totalHeight = headerHeight + branchHeight;
  const lines: LayoutLine[] = [];

  // Diagonals in switch header
  if (colResults.length >= 2) {
    const lastColX = colResults[colResults.length - 1].colX;
    lines.push({ x1: x, y1: y, x2: lastColX, y2: branchY });
    lines.push({ x1: x + width, y1: y, x2: lastColX, y2: branchY });

    // Column dividers in header (from diagonal intersection down to branchY) and through branches
    for (let i = 1; i < colResults.length; i++) {
      const divX = colResults[i].colX;
      let headerStartY = branchY;
      if (divX < lastColX && lastColX > x) {
        const t = (divX - x) / (lastColX - x);
        headerStartY = y + t * headerHeight;
      } else if (divX === lastColX) {
        headerStartY = branchY;
      }
      if (headerStartY < branchY) {
        lines.push({ x1: divX, y1: headerStartY, x2: divX, y2: branchY });
      }
      lines.push({ x1: divX, y1: branchY, x2: divX, y2: y + totalHeight });
    }
  } else {
    const midX = x + width / 2;
    lines.push({ x1: x, y1: y, x2: midX, y2: branchY });
    lines.push({ x1: x + width, y1: y, x2: midX, y2: branchY });
  }

  // Horizontal line below switch header
  lines.push({ x1: x, y1: branchY, x2: x + width, y2: branchY });

  const textBlocks: LayoutTextBlock[] = [
    {
      x: x + style.paddingX,
      y: y + style.paddingY * 0.5,
      width: exprAvailWidth,
      height: exprHeight,
      lines: exprLines,
      align: 'center',
      verticalAlign: 'top',
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      color: style.textColor,
    },
  ];

  for (let i = 0; i < colResults.length; i++) {
    const c = colResults[i];
    textBlocks.push({
      x: c.colX + style.paddingX * 0.5,
      y: branchY - labelRowHeight,
      width: Math.max(16, c.colW - style.paddingX),
      height: labelRowHeight,
      lines: wrappedColLabels[i],
      align: 'center',
      verticalAlign: 'bottom',
      fontSize: labelFontSize,
      fontFamily: style.fontFamily,
      color: style.textColor,
    });
  }

  return {
    id: node.id,
    type: node.type,
    node,
    x,
    y,
    width,
    height: totalHeight,
    style,
    headerRect: { x, y, width, height: headerHeight },
    lines,
    textBlocks,
    branches: colResults.map((c) => ({
      key: c.spec.key,
      label: c.spec.label,
      x: c.colX,
      y: branchY,
      width: c.colW,
      height: branchHeight,
      nodes: c.res.layoutNodes,
      isEmpty: c.res.isEmpty,
      emptyBox: c.res.emptyBox,
    })),
  };
}

function layoutWhileNode(
  node: WhileNode,
  x: number,
  y: number,
  width: number,
  style: DiagramStyle,
  ctx: LayoutContext,
): LayoutNode {
  const availWidth = Math.max(20, width - style.paddingX * 2);
  const headerLines = wrapText(node.text, availWidth, style.fontSize, style.fontFamily);
  const lineH = getLineHeight(style.fontSize);
  const headerHeight = Math.max(EMPTY_BRANCH_HEIGHT, headerLines.length * lineH + style.paddingY * 2);

  const bodyX = x + LOOP_INDENT;
  const bodyY = y + headerHeight;
  const bodyWidth = Math.max(20, width - LOOP_INDENT);

  const bodyRes = layoutNodeList(node.body, bodyX, bodyY, bodyWidth, node.id, 'body', ctx);
  const totalHeight = headerHeight + bodyRes.totalHeight;

  const lFramePath = [
    `M ${x} ${y}`,
    `H ${x + width}`,
    `V ${y + headerHeight}`,
    `H ${bodyX}`,
    `V ${y + totalHeight}`,
    `H ${x}`,
    'Z',
  ].join(' ');

  return {
    id: node.id,
    type: node.type,
    node,
    x,
    y,
    width,
    height: totalHeight,
    style,
    headerRect: { x, y, width, height: headerHeight },
    bodyRect: { x: bodyX, y: bodyY, width: bodyWidth, height: bodyRes.totalHeight },
    lFramePath,
    lines: [],
    textBlocks: [
      {
        x: x + style.paddingX,
        y: y + style.paddingY,
        width: availWidth,
        height: headerHeight - style.paddingY * 2,
        lines: headerLines,
        align: 'left',
        verticalAlign: 'middle',
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        color: style.textColor,
      },
    ],
    branches: [
      {
        key: 'body',
        x: bodyX,
        y: bodyY,
        width: bodyWidth,
        height: bodyRes.totalHeight,
        nodes: bodyRes.layoutNodes,
        isEmpty: bodyRes.isEmpty,
        emptyBox: bodyRes.emptyBox,
      },
    ],
  };
}

function layoutForNode(
  node: ForNode,
  x: number,
  y: number,
  width: number,
  style: DiagramStyle,
  ctx: LayoutContext,
): LayoutNode {
  const availWidth = Math.max(20, width - style.paddingX * 2);
  const headerLines = wrapText(node.text, availWidth, style.fontSize, style.fontFamily);
  const lineH = getLineHeight(style.fontSize);
  const headerHeight = Math.max(EMPTY_BRANCH_HEIGHT, headerLines.length * lineH + style.paddingY * 2);

  const bodyX = x + LOOP_INDENT;
  const bodyY = y + headerHeight;
  const bodyWidth = Math.max(20, width - LOOP_INDENT);

  const bodyRes = layoutNodeList(node.body, bodyX, bodyY, bodyWidth, node.id, 'body', ctx);
  const totalHeight = headerHeight + bodyRes.totalHeight;

  const lFramePath = [
    `M ${x} ${y}`,
    `H ${x + width}`,
    `V ${y + headerHeight}`,
    `H ${bodyX}`,
    `V ${y + totalHeight}`,
    `H ${x}`,
    'Z',
  ].join(' ');

  // Distinct FOR loop styling: bold header text + subtle top accent line 3px below top border
  const lines: LayoutLine[] = [
    {
      x1: x,
      y1: y + 3,
      x2: x + width,
      y2: y + 3,
    },
  ];

  return {
    id: node.id,
    type: node.type,
    node,
    x,
    y,
    width,
    height: totalHeight,
    style,
    headerRect: { x, y, width, height: headerHeight },
    bodyRect: { x: bodyX, y: bodyY, width: bodyWidth, height: bodyRes.totalHeight },
    lFramePath,
    lines,
    textBlocks: [
      {
        x: x + style.paddingX,
        y: y + style.paddingY,
        width: availWidth,
        height: headerHeight - style.paddingY * 2,
        lines: headerLines,
        align: 'left',
        verticalAlign: 'middle',
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        color: style.textColor,
        fontWeight: 'bold',
      },
    ],
    branches: [
      {
        key: 'body',
        x: bodyX,
        y: bodyY,
        width: bodyWidth,
        height: bodyRes.totalHeight,
        nodes: bodyRes.layoutNodes,
        isEmpty: bodyRes.isEmpty,
        emptyBox: bodyRes.emptyBox,
      },
    ],
  };
}

function layoutDoWhileNode(
  node: DoWhileNode,
  x: number,
  y: number,
  width: number,
  style: DiagramStyle,
  ctx: LayoutContext,
): LayoutNode {
  const availWidth = Math.max(20, width - style.paddingX * 2);
  const footerLines = wrapText(node.text, availWidth, style.fontSize, style.fontFamily);
  const lineH = getLineHeight(style.fontSize);
  const footerHeight = Math.max(EMPTY_BRANCH_HEIGHT, footerLines.length * lineH + style.paddingY * 2);

  const bodyX = x + LOOP_INDENT;
  const bodyY = y;
  const bodyWidth = Math.max(20, width - LOOP_INDENT);

  const bodyRes = layoutNodeList(node.body, bodyX, bodyY, bodyWidth, node.id, 'body', ctx);
  const footerY = y + bodyRes.totalHeight;
  const totalHeight = bodyRes.totalHeight + footerHeight;

  const lFramePath = [
    `M ${x} ${y}`,
    `H ${bodyX}`,
    `V ${footerY}`,
    `H ${x + width}`,
    `V ${y + totalHeight}`,
    `H ${x}`,
    'Z',
  ].join(' ');

  return {
    id: node.id,
    type: node.type,
    node,
    x,
    y,
    width,
    height: totalHeight,
    style,
    footerRect: { x, y: footerY, width, height: footerHeight },
    bodyRect: { x: bodyX, y: bodyY, width: bodyWidth, height: bodyRes.totalHeight },
    lFramePath,
    lines: [],
    textBlocks: [
      {
        x: x + style.paddingX,
        y: footerY + style.paddingY,
        width: availWidth,
        height: footerHeight - style.paddingY * 2,
        lines: footerLines,
        align: 'left',
        verticalAlign: 'middle',
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        color: style.textColor,
      },
    ],
    branches: [
      {
        key: 'body',
        x: bodyX,
        y: bodyY,
        width: bodyWidth,
        height: bodyRes.totalHeight,
        nodes: bodyRes.layoutNodes,
        isEmpty: bodyRes.isEmpty,
        emptyBox: bodyRes.emptyBox,
      },
    ],
  };
}

export function formatDiagramTitle(doc: StruktogrammDocument): string {
  const name = doc.name?.trim() || 'Struktogramm';
  const params = doc.parameterList?.trim();
  if (params) {
    return `${name}(${params})`;
  }
  return name;
}

/**
 * Pure TypeScript DIN 66261 / HuS-Struktogrammer SVG layout engine.
 * Computes exact bounding boxes, text wrapping, structural lines, empty branch
 * placeholders, and insertion zones for both React SVG and standalone SVG export.
 */
export function layoutDiagram(
  doc: StruktogrammDocument,
  globalStyle: DiagramStyle,
): LayoutResult {
  const diagramStyle = resolveDiagramStyle(globalStyle, doc.style);
  const title = formatDiagramTitle(doc);
  const headerFontSize = diagramStyle.fontSize + 1;

  // Pass 1: compute minimum width required by all nodes and title
  let minBodyWidth = MIN_NODE_WIDTH;
  for (const node of doc.nodes) {
    minBodyWidth = Math.max(minBodyWidth, computeNodeMinWidth(node, diagramStyle));
  }
  const titleMinWidth =
    measureTextWidth(title, headerFontSize, diagramStyle.fontFamily) +
    diagramStyle.paddingX * 2;

  const targetWidth = doc.width ?? DEFAULT_DIAGRAM_WIDTH;
  const totalWidth = Math.max(targetWidth, minBodyWidth, titleMinWidth);

  // Header geometry
  const headerAvailWidth = Math.max(20, totalWidth - diagramStyle.paddingX * 2);
  const headerLines = wrapText(title, headerAvailWidth, headerFontSize, diagramStyle.fontFamily);
  const headerLineH = getLineHeight(headerFontSize);
  const headerHeight = Math.max(30, headerLines.length * headerLineH + diagramStyle.paddingY * 2);

  const header: LayoutHeader = {
    x: 0,
    y: 0,
    width: totalWidth,
    height: headerHeight,
    title,
    textBlock: {
      x: diagramStyle.paddingX,
      y: diagramStyle.paddingY,
      width: headerAvailWidth,
      height: headerHeight - diagramStyle.paddingY * 2,
      lines: headerLines,
      align: 'left',
      verticalAlign: 'middle',
      fontSize: headerFontSize,
      fontFamily: diagramStyle.fontFamily,
      color: diagramStyle.textColor,
      fontWeight: 'bold',
    },
    style: diagramStyle,
  };

  // Pass 2: layout body nodes starting at y = headerHeight
  const ctx: LayoutContext = {
    diagramId: doc.id,
    diagramStyle,
    flatNodes: [],
    emptyBranches: [],
    insertionZones: [],
  };

  const bodyRes = layoutNodeList(
    doc.nodes,
    0,
    headerHeight,
    totalWidth,
    null,
    undefined,
    ctx,
    36,
  );

  const totalHeight = headerHeight + bodyRes.totalHeight;

  return {
    diagramId: doc.id,
    width: totalWidth,
    height: totalHeight,
    style: diagramStyle,
    header,
    bodyRect: {
      x: 0,
      y: headerHeight,
      width: totalWidth,
      height: bodyRes.totalHeight,
    },
    nodes: bodyRes.layoutNodes,
    flatNodes: ctx.flatNodes,
    emptyBranches: ctx.emptyBranches,
    insertionZones: ctx.insertionZones,
  };
}
