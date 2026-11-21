import {
  createDefaultPrintSettings,
  createDefaultStyle,
  generateId,
} from './defaults';
import type {
  DiagramNode,
  DoWhileNode,
  ForNode,
  IfNode,
  NodeStyle,
  ProjectDocument,
  SequenceNode,
  StruktogrammDocument,
  SubroutineNode,
  SwitchCase,
  SwitchNode,
  WhileNode,
} from './types';

export const DIAGRAM_SCHEMA = 'hus-struktogrammer/diagram/v1';
export const PROJECT_SCHEMA = 'hus-struktogrammer/project/v1';
export const DIAGRAM_MAGIC = 'STGR';
export const PROJECT_MAGIC = 'STPR';

export class LegacyFormatError extends Error {
  constructor(message = 'Legacy Java serialized binary format (AC ED 00 05) is not supported. Please export the diagram as XML/NSD or JSON.') {
    super(message);
    this.name = 'LegacyFormatError';
  }
}

interface SerializedDiagramEnvelope {
  $schema: string;
  magic: string;
  version: number;
  document: StruktogrammDocument;
}

interface SerializedProjectEnvelope {
  $schema: string;
  magic: string;
  version: number;
  project: ProjectDocument;
}

function isLegacyJavaBinary(raw: string | Uint8Array): boolean {
  if (raw instanceof Uint8Array) {
    return (
      raw.length >= 4 &&
      raw[0] === 0xac &&
      raw[1] === 0xed &&
      raw[2] === 0x00 &&
      raw[3] === 0x05
    );
  }
  if (raw.length >= 4) {
    if (
      raw.charCodeAt(0) === 0xac &&
      raw.charCodeAt(1) === 0xed &&
      raw.charCodeAt(2) === 0x00 &&
      raw.charCodeAt(3) === 0x05
    ) {
      return true;
    }
    // UTF-8 decoded 0xAC 0xED produces replacement characters U+FFFD U+FFFD followed by 0x00 0x05
    if (
      raw.charCodeAt(0) === 0xfffd &&
      raw.charCodeAt(1) === 0xfffd &&
      raw.charCodeAt(2) === 0x00 &&
      raw.charCodeAt(3) === 0x05
    ) {
      return true;
    }
  }
  return false;
}

function decodeInput(raw: string | Uint8Array): string {
  if (isLegacyJavaBinary(raw)) {
    throw new LegacyFormatError();
  }
  if (typeof raw === 'string') {
    return raw;
  }
  return new TextDecoder('utf-8').decode(raw);
}

function sanitizeDocumentForSave(doc: StruktogrammDocument): StruktogrammDocument {
  const { dirty: _dirty, ...rest } = doc;
  return {
    ...rest,
    dirty: false,
  };
}

/**
 * Serializes a StruktogrammDocument to JSON with schema and magic headers.
 */
export function serializeStruktogramm(doc: StruktogrammDocument): string {
  const envelope: SerializedDiagramEnvelope = {
    $schema: DIAGRAM_SCHEMA,
    magic: DIAGRAM_MAGIC,
    version: 1,
    document: sanitizeDocumentForSave(doc),
  };
  return JSON.stringify(envelope, null, 2);
}

/**
 * Serializes a ProjectDocument to JSON with schema and magic headers.
 */
export function serializeProject(project: ProjectDocument): string {
  const { dirty: _dirty, ...rest } = project;
  const envelope: SerializedProjectEnvelope = {
    $schema: PROJECT_SCHEMA,
    magic: PROJECT_MAGIC,
    version: 1,
    project: {
      ...rest,
      diagrams: project.diagrams.map(sanitizeDocumentForSave),
      dirty: false,
    },
  };
  return JSON.stringify(envelope, null, 2);
}

/**
 * Recursively validates raw nodes: unknown/invalid entries are dropped, missing
 * ids/text/labels get defaults and missing branch arrays become [].
 */
function normalizeNodes(raw: unknown): DiagramNode[] {
  if (!Array.isArray(raw)) return [];
  const out: DiagramNode[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const n = item as Record<string, unknown>;
    const base = {
      id: typeof n.id === 'string' && n.id.length > 0 ? n.id : generateId(),
      text: typeof n.text === 'string' ? n.text : '',
      ...(n.style && typeof n.style === 'object' ? { style: n.style as NodeStyle } : {}),
    };
    const str = (v: unknown, d: string) => (typeof v === 'string' ? v : d);
    switch (n.type) {
      case 'sequence':
      case 'subroutine':
        out.push({ ...base, type: n.type });
        break;
      case 'if':
        out.push({
          ...base,
          type: 'if',
          trueLabel: str(n.trueLabel, 'Ja'),
          falseLabel: str(n.falseLabel, 'Nein'),
          thenBranch: normalizeNodes(n.thenBranch),
          elseBranch: normalizeNodes(n.elseBranch),
        });
        break;
      case 'switch': {
        const cases: SwitchCase[] = Array.isArray(n.cases)
          ? n.cases
              .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
              .map((c, i) => ({
                id: typeof c.id === 'string' && c.id.length > 0 ? c.id : generateId(),
                label: str(c.label, `Fall ${i + 1}`),
                body: normalizeNodes(c.body),
              }))
          : [];
        out.push({
          ...base,
          type: 'switch',
          cases,
          hasDefault: typeof n.hasDefault === 'boolean' ? n.hasDefault : true,
          defaultLabel: str(n.defaultLabel, 'Sonst'),
          defaultBranch: normalizeNodes(n.defaultBranch),
        });
        break;
      }
      case 'while':
      case 'doWhile':
      case 'for':
        out.push({ ...base, type: n.type, body: normalizeNodes(n.body) });
        break;
      default:
        break;
    }
  }
  return out;
}

function normalizeDocument(raw: Partial<StruktogrammDocument>): StruktogrammDocument {
  if (!Array.isArray(raw.nodes)) {
    throw new Error('Invalid StruktogrammDocument: missing "nodes" array.');
  }
  return {
    id: typeof raw.id === 'string' && raw.id.length > 0 ? raw.id : generateId(),
    name: typeof raw.name === 'string' ? raw.name : 'Unbenannt',
    parameterList: typeof raw.parameterList === 'string' ? raw.parameterList : '',
    nodes: normalizeNodes(raw.nodes),
    ...(raw.style ? { style: raw.style } : {}),
    x: typeof raw.x === 'number' ? raw.x : 40,
    y: typeof raw.y === 'number' ? raw.y : 40,
    ...(typeof raw.width === 'number' ? { width: raw.width } : {}),
    zIndex: typeof raw.zIndex === 'number' ? raw.zIndex : 1,
    minimized: typeof raw.minimized === 'boolean' ? raw.minimized : false,
    ...(typeof raw.filePath === 'string' ? { filePath: raw.filePath } : {}),
    dirty: false,
  };
}

/**
 * Parses a StruktogrammDocument from JSON (.stgr), Structorizer XML (.nsd),
 * or detects legacy Java binary (AC ED 00 05) and throws LegacyFormatError.
 */
export function parseStruktogramm(raw: string | Uint8Array): StruktogrammDocument {
  const text = decodeInput(raw).trim();
  if (!text) {
    throw new Error('Empty input cannot be parsed as StruktogrammDocument.');
  }

  if (text.startsWith('<')) {
    return parseNsdXml(text);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON in StruktogrammDocument: ${(err as Error).message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid StruktogrammDocument: expected JSON object.');
  }

  const record = parsed as Record<string, unknown>;
  const docCandidate =
    record.document && typeof record.document === 'object'
      ? (record.document as Partial<StruktogrammDocument>)
      : (record as Partial<StruktogrammDocument>);

  return normalizeDocument(docCandidate);
}

/**
 * Parses a ProjectDocument from JSON (.stpr).
 */
export function parseProject(raw: string | Uint8Array): ProjectDocument {
  const text = decodeInput(raw).trim();
  if (!text) {
    throw new Error('Empty input cannot be parsed as ProjectDocument.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(`Invalid JSON in ProjectDocument: ${(err as Error).message}`);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid ProjectDocument: expected JSON object.');
  }

  const record = parsed as Record<string, unknown>;
  const projCandidate =
    record.project && typeof record.project === 'object'
      ? (record.project as Partial<ProjectDocument>)
      : (record as Partial<ProjectDocument>);

  if (!Array.isArray(projCandidate.diagrams)) {
    throw new Error('Invalid ProjectDocument: missing "diagrams" array.');
  }

  const seenIds = new Set<string>();
  const diagrams = projCandidate.diagrams.map((d) => {
    const doc = normalizeDocument(d);
    if (seenIds.has(doc.id)) doc.id = generateId();
    seenIds.add(doc.id);
    return doc;
  });
  const activeDiagramId =
    typeof projCandidate.activeDiagramId === 'string' &&
    diagrams.some((d) => d.id === projCandidate.activeDiagramId)
      ? projCandidate.activeDiagramId
      : diagrams[0]?.id ?? null;

  return {
    id:
      typeof projCandidate.id === 'string' && projCandidate.id.length > 0
        ? projCandidate.id
        : generateId(),
    name: typeof projCandidate.name === 'string' ? projCandidate.name : 'Unbenanntes Projekt',
    diagrams,
    activeDiagramId,
    zoom: typeof projCandidate.zoom === 'number' ? projCandidate.zoom : 1,
    panX: typeof projCandidate.panX === 'number' ? projCandidate.panX : 0,
    panY: typeof projCandidate.panY === 'number' ? projCandidate.panY : 0,
    globalStyle: {
      ...createDefaultStyle(),
      ...(projCandidate.globalStyle ?? {}),
    },
    printSettings: {
      ...createDefaultPrintSettings(),
      ...(projCandidate.printSettings ?? {}),
    },
    ...(typeof projCandidate.filePath === 'string' ? { filePath: projCandidate.filePath } : {}),
    dirty: false,
  };
}

// ---------------------------------------------------------------------------
// Minimal Pure-TS XML Parser & NSD Importer / Exporter (Node & Browser safe)
// ---------------------------------------------------------------------------

interface XmlElement {
  tag: string;
  attrs: Record<string, string>;
  children: XmlElement[];
}

function decodeXmlEntities(value: string): string {
  return value.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot|apos);/g, (_match, entity) => {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      case 'apos':
        return "'";
      default:
        if (entity.startsWith('#')) {
          const code = entity.startsWith('#x')
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10);
          // Out-of-range / surrogate code points would make fromCodePoint throw.
          if (!Number.isFinite(code) || code < 0 || code > 0x10ffff || (code >= 0xd800 && code <= 0xdfff)) {
            return '\ufffd';
          }
          return String.fromCodePoint(code);
        }
        return _match;
    }
  });
}

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\r?\n/g, '&#10;');
}

function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(attrString)) !== null) {
    const key = match[1];
    const rawVal = match[2] !== undefined ? match[2] : match[3] ?? '';
    attrs[key] = decodeXmlEntities(rawVal);
  }
  return attrs;
}

function parseXml(xml: string): XmlElement {
  // Strip XML declarations, DOCTYPE, and comments
  const cleaned = xml
    .replace(/<\?[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const stack: XmlElement[] = [];
  let root: XmlElement | null = null;

  const tagRegex = /<\s*(\/?)\s*([a-zA-Z_:][\w:.-]*)((?:\s+[^<>]*?)?)\s*(\/?)\s*>/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(cleaned)) !== null) {
    const isClosing = match[1] === '/';
    const tag = match[2];
    const attrPart = match[3] ?? '';
    const isSelfClosing = match[4] === '/';

    if (isClosing) {
      // Close the nearest matching open element; a stray closing tag is ignored.
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
      continue;
    }

    const element: XmlElement = {
      tag,
      attrs: parseAttributes(attrPart),
      children: [],
    };

    if (stack.length > 0) {
      stack[stack.length - 1].children.push(element);
    } else if (!root) {
      root = element;
    }

    if (!isSelfClosing) {
      stack.push(element);
    }
  }

  if (!root) {
    throw new Error('Invalid XML: no root element found.');
  }
  return root;
}

function stripOuterQuotes(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function findChild(el: XmlElement, tagName: string): XmlElement | undefined {
  return el.children.find((c) => c.tag.toLowerCase() === tagName.toLowerCase());
}

function parseNsdChildren(elements: XmlElement[]): DiagramNode[] {
  const nodes: DiagramNode[] = [];

  for (const el of elements) {
    const tag = el.tag.toLowerCase();
    const rawText = el.attrs.text ?? '';
    const text = stripOuterQuotes(rawText);

    switch (tag) {
      case 'instruction': {
        const node: SequenceNode = {
          id: generateId(),
          type: 'sequence',
          text: text || 'Anweisung',
        };
        nodes.push(node);
        break;
      }
      case 'call':
      case 'subroutine': {
        const node: SubroutineNode = {
          id: generateId(),
          type: 'subroutine',
          text: text || 'Unterprogramm()',
        };
        nodes.push(node);
        break;
      }
      case 'alternative':
      case 'if': {
        const qTrue = findChild(el, 'qTrue');
        const qFalse = findChild(el, 'qFalse');
        const node: IfNode = {
          id: generateId(),
          type: 'if',
          text: text || 'Bedingung',
          trueLabel: el.attrs.trueLabel ?? 'Wahr',
          falseLabel: el.attrs.falseLabel ?? 'Falsch',
          thenBranch: qTrue ? parseNsdChildren(qTrue.children) : [],
          elseBranch: qFalse ? parseNsdChildren(qFalse.children) : [],
        };
        nodes.push(node);
        break;
      }
      case 'case':
      case 'switch': {
        const lines = rawText.split(/\r?\n/).map(stripOuterQuotes);
        // Our own export stores the switch text separately (multi-line safe).
        const ownExport = el.attrs.switchText !== undefined;
        const switchText = ownExport ? el.attrs.switchText || 'Auswahl' : lines[0] || 'Auswahl';
        const qCases = el.children.filter((c) => c.tag.toLowerCase() === 'qCase'.toLowerCase());
        const qDefault = findChild(el, 'qDefault');

        // Structorizer stores case labels in lines[1..n] of `text` attribute,
        // where the last label may be "%" if there is no default branch.
        const cases: SwitchCase[] = [];
        let hasDefault = false;
        let defaultLabel = el.attrs.defaultLabel ?? 'Sonst';
        let defaultBranch: DiagramNode[] = [];

        if (qDefault) {
          // Explicit qDefault format
          qCases.forEach((qc, idx) => {
            cases.push({
              id: generateId(),
              label: qc.attrs.label ?? lines[idx + 1] ?? `Fall ${idx + 1}`,
              body: parseNsdChildren(qc.children),
            });
          });
          hasDefault = el.attrs.hasDefault !== 'false';
          defaultBranch = parseNsdChildren(qDefault.children);
        } else if (ownExport && qCases.length > 0) {
          // Own format: labelled qCases are the cases, the unlabelled one is the default.
          qCases
            .filter((qc) => qc.attrs.label !== undefined)
            .forEach((qc, idx) => {
              cases.push({
                id: generateId(),
                label: qc.attrs.label ?? `Fall ${idx + 1}`,
                body: parseNsdChildren(qc.children),
              });
            });
          hasDefault = el.attrs.hasDefault !== 'false';
          const defaultEl = qCases.find((qc) => qc.attrs.label === undefined);
          if (hasDefault && defaultEl) {
            defaultBranch = parseNsdChildren(defaultEl.children);
          }
        } else if (qCases.length > 0) {
          // Standard Structorizer format: last qCase corresponds to default unless its label is "%"
          const lastIdx = qCases.length - 1;
          const lastLabel = lines[lastIdx + 1];
          const treatLastAsDefault =
            el.attrs.hasDefault !== 'false' && lastLabel !== undefined && lastLabel !== '%';

          const caseCount = treatLastAsDefault ? qCases.length - 1 : qCases.length;
          for (let i = 0; i < caseCount; i++) {
            const qc = qCases[i];
            const label = qc.attrs.label ?? lines[i + 1];
            if (label === '%' && i === lastIdx) {
              continue;
            }
            cases.push({
              id: generateId(),
              label: label && label !== '%' ? label : `Fall ${i + 1}`,
              body: parseNsdChildren(qc.children),
            });
          }

          if (treatLastAsDefault) {
            hasDefault = true;
            defaultLabel = lastLabel || 'Sonst';
            defaultBranch = parseNsdChildren(qCases[lastIdx].children);
          }
        }

        const node: SwitchNode = {
          id: generateId(),
          type: 'switch',
          text: switchText,
          cases,
          hasDefault,
          defaultLabel,
          defaultBranch,
        };
        nodes.push(node);
        break;
      }
      case 'while':
      case 'forever': {
        const qWhile = findChild(el, 'qWhile') ?? findChild(el, 'qForever');
        const node: WhileNode = {
          id: generateId(),
          type: 'while',
          text: text || (tag === 'forever' ? 'Endlosschleife' : 'Solange Bedingung'),
          body: qWhile ? parseNsdChildren(qWhile.children) : [],
        };
        nodes.push(node);
        break;
      }
      case 'repeat':
      case 'dowhile': {
        const qRepeat = findChild(el, 'qRepeat');
        const node: DoWhileNode = {
          id: generateId(),
          type: 'doWhile',
          text: text || 'Solange Bedingung',
          body: qRepeat ? parseNsdChildren(qRepeat.children) : [],
        };
        nodes.push(node);
        break;
      }
      case 'for': {
        const qFor = findChild(el, 'qFor');
        const node: ForNode = {
          id: generateId(),
          type: 'for',
          text: text || 'Für i = 1 bis n',
          body: qFor ? parseNsdChildren(qFor.children) : [],
        };
        nodes.push(node);
        break;
      }
      default: {
        // Keep unsupported Structorizer elements (try, parallel, jump, ...) visible
        // instead of silently dropping them.
        const node: SequenceNode = {
          id: generateId(),
          type: 'sequence',
          text: text ? `[${el.tag}] ${text}` : `[Nicht unterstützt: ${el.tag}]`,
        };
        nodes.push(node);
        break;
      }
    }
  }

  return nodes;
}

function parseNsdXml(xml: string): StruktogrammDocument {
  const root = parseXml(xml);
  const tag = root.tag.toLowerCase();
  if (tag !== 'root' && tag !== 'struktogramm') {
    throw new Error(`Unsupported XML root tag "<${root.tag}>". Expected <root> (Structorizer NSD).`);
  }

  const name = stripOuterQuotes(root.attrs.text ?? root.attrs.name ?? 'Importiertes Struktogramm');
  const childrenEl = findChild(root, 'children');
  const childElements = childrenEl ? childrenEl.children : root.children;
  const nodes = parseNsdChildren(childElements);

  return {
    id: generateId(),
    name: name || 'Importiertes Struktogramm',
    parameterList: root.attrs.parameterList ?? '',
    nodes,
    x: 40,
    y: 40,
    zIndex: 1,
    minimized: false,
    dirty: false,
  };
}

function indent(level: number): string {
  return '  '.repeat(level);
}

function serializeNsdNodes(nodes: readonly DiagramNode[], level: number): string {
  return nodes
    .map((node) => {
      const pad = indent(level);
      switch (node.type) {
        case 'sequence':
          return `${pad}<instruction text="${escapeXmlAttr(node.text)}" comment="" color="ffffff" rotated="0" disabled="0" />`;
        case 'subroutine':
          return `${pad}<call text="${escapeXmlAttr(node.text)}" comment="" color="ffffff" disabled="0" />`;
        case 'if': {
          const thenXml = serializeNsdNodes(node.thenBranch, level + 2);
          const elseXml = serializeNsdNodes(node.elseBranch, level + 2);
          return [
            `${pad}<alternative text="${escapeXmlAttr(node.text)}" trueLabel="${escapeXmlAttr(node.trueLabel)}" falseLabel="${escapeXmlAttr(node.falseLabel)}" comment="" color="ffffff" disabled="0">`,
            `${indent(level + 1)}<qTrue>${thenXml ? `\n${thenXml}\n${indent(level + 1)}` : ''}</qTrue>`,
            `${indent(level + 1)}<qFalse>${elseXml ? `\n${elseXml}\n${indent(level + 1)}` : ''}</qFalse>`,
            `${pad}</alternative>`,
          ].join('\n');
        }
        case 'switch': {
          const oneLine = (v: string) => v.replace(/\r?\n/g, ' ');
          const caseLines = [
            oneLine(node.text),
            ...node.cases.map((c) => oneLine(c.label)),
            node.hasDefault ? oneLine(node.defaultLabel) : '%',
          ].join('\n');
          const caseBlocks = node.cases.map((c) => {
            const bodyXml = serializeNsdNodes(c.body, level + 2);
            return `${indent(level + 1)}<qCase label="${escapeXmlAttr(c.label)}">${bodyXml ? `\n${bodyXml}\n${indent(level + 1)}` : ''}</qCase>`;
          });
          const defaultBodyXml = serializeNsdNodes(node.defaultBranch, level + 2);
          caseBlocks.push(
            `${indent(level + 1)}<qCase>${defaultBodyXml ? `\n${defaultBodyXml}\n${indent(level + 1)}` : ''}</qCase>`
          );
          return [
            `${pad}<case text="${escapeXmlAttr(caseLines)}" switchText="${escapeXmlAttr(node.text)}" defaultLabel="${escapeXmlAttr(node.defaultLabel)}" hasDefault="${String(node.hasDefault)}" comment="" color="ffffff" disabled="0">`,
            ...caseBlocks,
            `${pad}</case>`,
          ].join('\n');
        }
        case 'while': {
          const bodyXml = serializeNsdNodes(node.body, level + 2);
          return [
            `${pad}<while text="${escapeXmlAttr(node.text)}" comment="" color="ffffff" disabled="0">`,
            `${indent(level + 1)}<qWhile>${bodyXml ? `\n${bodyXml}\n${indent(level + 1)}` : ''}</qWhile>`,
            `${pad}</while>`,
          ].join('\n');
        }
        case 'doWhile': {
          const bodyXml = serializeNsdNodes(node.body, level + 2);
          return [
            `${pad}<repeat text="${escapeXmlAttr(node.text)}" comment="" color="ffffff" disabled="0">`,
            `${indent(level + 1)}<qRepeat>${bodyXml ? `\n${bodyXml}\n${indent(level + 1)}` : ''}</qRepeat>`,
            `${pad}</repeat>`,
          ].join('\n');
        }
        case 'for': {
          const bodyXml = serializeNsdNodes(node.body, level + 2);
          return [
            `${pad}<for text="${escapeXmlAttr(node.text)}" comment="" color="ffffff" disabled="0">`,
            `${indent(level + 1)}<qFor>${bodyXml ? `\n${bodyXml}\n${indent(level + 1)}` : ''}</qFor>`,
            `${pad}</for>`,
          ].join('\n');
        }
      }
    })
    .join('\n');
}

/**
 * Exports a StruktogrammDocument to Structorizer-compatible .nsd XML.
 */
export function exportToNsdXml(doc: StruktogrammDocument): string {
  const childrenXml = serializeNsdNodes(doc.nodes, 2);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<root text="${escapeXmlAttr(doc.name)}" parameterList="${escapeXmlAttr(doc.parameterList ?? '')}" type="program" style="nice">`,
    `  <children>${childrenXml ? `\n${childrenXml}\n  ` : ''}</children>`,
    '</root>',
  ].join('\n');
}
