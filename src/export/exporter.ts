import { layoutDiagram } from '../engine/layout.ts';
import { renderDiagramToSvgString } from '../engine/svgExport.ts';
import type { ProjectDocument } from '../model/types.ts';
import type { PlatformAdapter } from '../platform/adapter.ts';

function ensureExtension(filename: string, ext: string): string {
  const normalizedExt = ext.startsWith('.') ? ext : `.${ext}`;
  const trimmed = filename.trim() || 'diagram';
  return trimmed.toLowerCase().endsWith(normalizedExt.toLowerCase())
    ? trimmed
    : `${trimmed}${normalizedExt}`;
}

function loadSvgImage(svgString: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG into Image for PNG export.'));
    };

    img.src = url;
  });
}

function canvasToPngBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('Failed to encode canvas to PNG Blob.'));
        return;
      }
      try {
        const buffer = await blob.arrayBuffer();
        resolve(new Uint8Array(buffer));
      } catch (error) {
        reject(error);
      }
    }, 'image/png');
  });
}

export async function renderSvgToPngBytes(
  svgString: string,
  width: number,
  height: number,
  scale: 1 | 2 | 3,
  transparent: boolean,
): Promise<Uint8Array> {
  const img = await loadSvgImage(svgString);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.ceil(width * scale));
  canvas.height = Math.max(1, Math.ceil(height * scale));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2D canvas context for PNG export.');
  }

  if (!transparent) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvasToPngBytes(canvas);
}

export async function exportSvgFile(
  svgString: string,
  filename: string,
  adapter: PlatformAdapter,
): Promise<string | null> {
  const defaultName = ensureExtension(filename, '.svg');
  return adapter.saveFileDialog(svgString, {
    title: 'Als SVG exportieren',
    defaultName,
    filters: [{ name: 'SVG-Grafik', extensions: ['svg'] }],
    mimeType: 'image/svg+xml;charset=utf-8',
  });
}

export async function exportPngFile(
  svgString: string,
  width: number,
  height: number,
  scale: 1 | 2 | 3,
  transparent: boolean,
  filename: string,
  adapter: PlatformAdapter,
): Promise<string | null> {
  const pngBytes = await renderSvgToPngBytes(
    svgString,
    width,
    height,
    scale,
    transparent,
  );
  const defaultName = ensureExtension(filename, '.png');
  return adapter.exportBinaryFile(pngBytes, {
    title: 'Als PNG exportieren',
    defaultName,
    filters: [{ name: 'PNG-Bild', extensions: ['png'] }],
    mimeType: 'image/png',
  });
}

function stripOuterSvg(svg: string): string {
  const start = svg.indexOf('>');
  const end = svg.lastIndexOf('</svg>');
  if (start === -1 || end === -1) return '';
  return svg.slice(start + 1, end);
}

/**
 * Renders all diagrams in a project (in their 2D layout) into a single
 * scaled PNG and copies it directly to the system clipboard (falling back to
 * PNG download if clipboard image write is unsupported).
 */
export async function exportProjectScreenshotToClipboard(
  project: ProjectDocument,
  adapter: PlatformAdapter,
): Promise<'clipboard' | 'downloaded' | 'empty'> {
  if (project.diagrams.length === 0) return 'empty';

  const padding = 24;
  const items = project.diagrams.map((doc) => {
    const layout = layoutDiagram(doc, project.globalStyle);
    const svg = renderDiagramToSvgString(doc, project.globalStyle, {
      transparent: true,
      padding: 0,
    });
    return {
      doc,
      layout,
      innerSvg: stripOuterSvg(svg),
    };
  });

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const item of items) {
    minX = Math.min(minX, item.doc.x);
    minY = Math.min(minY, item.doc.y);
    maxX = Math.max(maxX, item.doc.x + item.layout.width);
    maxY = Math.max(maxY, item.doc.y + item.layout.height);
  }

  const totalWidth = Math.max(100, Math.ceil(maxX - minX + padding * 2));
  const totalHeight = Math.max(100, Math.ceil(maxY - minY + padding * 2));

  const groups = items
    .map((item) => {
      const tx = item.doc.x - minX + padding;
      const ty = item.doc.y - minY + padding;
      return `<g transform="translate(${tx}, ${ty})">${item.innerSvg}</g>`;
    })
    .join('\n');

  const combinedSvg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">`,
    `<rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#ffffff"/>`,
    groups,
    `</svg>`,
  ].join('\n');

  const pngBytes = await renderSvgToPngBytes(
    combinedSvg,
    totalWidth,
    totalHeight,
    2,
    false,
  );
  const blob = new Blob([new Uint8Array(pngBytes)], { type: 'image/png' });

  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.write === 'function' &&
    typeof ClipboardItem !== 'undefined'
  ) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return 'clipboard';
    } catch {
      // Fallback to file download if browser denies clipboard write
    }
  }

  await adapter.exportBinaryFile(pngBytes, {
    title: 'Gesamt-Screenshot speichern',
    defaultName: `${project.name || 'struktogramme'}-screenshot.png`,
    filters: [{ name: 'PNG-Bild', extensions: ['png'] }],
    mimeType: 'image/png',
  });
  return 'downloaded';
}
