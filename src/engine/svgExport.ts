import type { DiagramStyle, StruktogrammDocument } from '../model/types';
import {
  layoutDiagram,
  type LayoutNode,
  type LayoutTextBlock,
} from './layout';

export interface SvgExportOptions {
  transparent?: boolean;
  padding?: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function renderTextBlock(block: LayoutTextBlock): string {
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

  const fontWeight = block.fontWeight ?? 'normal';
  const fontStyle = block.fontStyle ?? 'normal';

  const tspans = block.lines
    .map((line, idx) => {
      const cy = Number((startY + idx * lineH).toFixed(2));
      const content = line.length > 0 ? escapeXml(line) : '&#160;';
      return `<tspan x="${textX.toFixed(2)}" y="${cy}">${content}</tspan>`;
    })
    .join('');

  return `<text x="${textX.toFixed(2)}" y="${startY.toFixed(2)}" text-anchor="${anchor}" dominant-baseline="central" font-family="${escapeXml(block.fontFamily)}" font-size="${block.fontSize}" font-weight="${fontWeight}" font-style="${fontStyle}" fill="${escapeXml(block.color)}">${tspans}</text>`;
}

function renderNode(node: LayoutNode): string {
  const parts: string[] = [];
  const { style } = node;
  const stroke = escapeXml(style.borderColor);
  const fill = escapeXml(style.backgroundColor);
  const sw = style.lineWidth;

  if (node.lFramePath) {
    // Loop container (while, for, doWhile): clean L-shaped / inverted-L-shaped frame
    if (node.bodyRect) {
      parts.push(
        `<rect x="${node.bodyRect.x.toFixed(2)}" y="${node.bodyRect.y.toFixed(2)}" width="${node.bodyRect.width.toFixed(2)}" height="${node.bodyRect.height.toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`,
      );
    }
    parts.push(
      `<path d="${node.lFramePath}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="miter" />`,
    );
  } else {
    parts.push(
      `<rect x="${node.x.toFixed(2)}" y="${node.y.toFixed(2)}" width="${node.width.toFixed(2)}" height="${node.height.toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`,
    );
  }

  // Render child branches first (so structural lines sit cleanly on top)
  for (const branch of node.branches) {
    if (branch.isEmpty && branch.emptyBox) {
      const eb = branch.emptyBox;
      parts.push(
        `<rect x="${eb.x.toFixed(2)}" y="${eb.y.toFixed(2)}" width="${eb.width.toFixed(2)}" height="${eb.height.toFixed(2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" />`,
      );
    } else {
      for (const child of branch.nodes) {
        parts.push(renderNode(child));
      }
    }
  }

  // Render DIN 66261 structural lines
  for (const line of node.lines) {
    const lsw = line.strokeWidth ?? sw;
    const dash = line.dashed ? ' stroke-dasharray="4 3"' : '';
    parts.push(
      `<line x1="${line.x1.toFixed(2)}" y1="${line.y1.toFixed(2)}" x2="${line.x2.toFixed(2)}" y2="${line.y2.toFixed(2)}" stroke="${stroke}" stroke-width="${lsw}"${dash} />`,
    );
  }

  // Render text blocks
  for (const tb of node.textBlocks) {
    parts.push(renderTextBlock(tb));
  }

  return `<g data-node-id="${escapeXml(node.id)}" data-node-type="${node.type}">${parts.join('')}</g>`;
}

/**
 * Renders a StruktogrammDocument to a standalone, XML-valid SVG string
 * matching the exact 1:1 DIN 66261 geometry from layoutDiagram().
 */
export function renderDiagramToSvgString(
  doc: StruktogrammDocument,
  globalStyle: DiagramStyle,
  options: SvgExportOptions = {},
): string {
  const padding = options.padding ?? 16;
  const transparent = options.transparent ?? false;
  const layout = layoutDiagram(doc, globalStyle);

  const svgWidth = layout.width + padding * 2;
  const svgHeight = layout.height + padding * 2;
  const { style, header } = layout;

  const canvasBg = transparent
    ? ''
    : `<rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="#ffffff" />`;

  const headerSvg = [
    `<rect x="${header.x.toFixed(2)}" y="${header.y.toFixed(2)}" width="${header.width.toFixed(2)}" height="${header.height.toFixed(2)}" fill="${escapeXml(style.backgroundColor)}" stroke="${escapeXml(style.borderColor)}" stroke-width="${style.lineWidth}" />`,
    renderTextBlock(header.textBlock),
  ].join('');

  let bodySvg = '';
  if (layout.nodes.length === 0) {
    const eb = layout.emptyBranches[0];
    if (eb) {
      bodySvg = `<rect x="${eb.x.toFixed(2)}" y="${eb.y.toFixed(2)}" width="${eb.width.toFixed(2)}" height="${eb.height.toFixed(2)}" fill="${escapeXml(style.backgroundColor)}" stroke="${escapeXml(style.borderColor)}" stroke-width="${style.lineWidth}" />`;
    }
  } else {
    bodySvg = layout.nodes.map((n) => renderNode(n)).join('');
  }

  // Outer crisp frame around the whole diagram
  const outerFrame = `<rect x="0" y="0" width="${layout.width.toFixed(2)}" height="${layout.height.toFixed(2)}" fill="none" stroke="${escapeXml(style.borderColor)}" stroke-width="${style.lineWidth}" />`;

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`,
    `<defs><style>text { font-family: ${escapeXml(style.fontFamily)}; user-select: none; }</style></defs>`,
    canvasBg,
    `<g transform="translate(${padding}, ${padding})">`,
    headerSvg,
    bodySvg,
    outerFrame,
    `</g>`,
    `</svg>`,
  ].join('');
}
