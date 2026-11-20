import type {
  AppSettings,
  DiagramNode,
  DiagramStyle,
  NodeType,
  PrintSettings,
  ProjectDocument,
  StruktogrammDocument,
  SwitchCase,
} from './types';

/**
 * Generates a unique identifier using crypto.randomUUID when available,
 * with a fallback for environments without it.
 */
export function generateId(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  const randomPart = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `${randomPart()}-${randomPart().slice(0, 4)}-4${randomPart().slice(1, 4)}-${randomPart().slice(0, 4)}-${randomPart()}${randomPart().slice(0, 4)}`;
}

/**
 * Creates the default visual style for a diagram (DIN 66261).
 */
export function createDefaultStyle(): DiagramStyle {
  return {
    backgroundColor: '#ffffff',
    textColor: '#111827',
    borderColor: '#1f2937',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 14,
    lineWidth: 1.5,
    paddingX: 12,
    paddingY: 8,
  };
}

/**
 * Creates default print / page export settings.
 */
export function createDefaultPrintSettings(): PrintSettings {
  return {
    pageFormat: 'A4',
    orientation: 'portrait',
    marginMm: 15,
    scaleToFit: true,
    headerText: '',
    footerText: '',
    showPageNumbers: true,
  };
}

/**
 * Creates default application settings.
 */
export function createDefaultAppSettings(): AppSettings {
  return {
    language: 'de',
    theme: 'light',
    uiScale: 1,
    defaultTrueLabel: 'Wahr',
    defaultFalseLabel: 'Falsch',
    defaultSwitchCases: 2,
    defaultStyle: createDefaultStyle(),
    showInsertionHints: true,
    recentFiles: [],
    customOperators: [],
  };
}

/**
 * Creates a new DiagramNode of the given type with sensible defaults.
 */
export function createNode(type: NodeType, settings?: Partial<AppSettings>): DiagramNode {
  const id = generateId();

  switch (type) {
    case 'sequence':
      return {
        id,
        type: 'sequence',
        text: 'Anweisung',
      };
    case 'subroutine':
      return {
        id,
        type: 'subroutine',
        text: 'Unterprogramm()',
      };
    case 'if':
      return {
        id,
        type: 'if',
        text: 'Bedingung',
        trueLabel: settings?.defaultTrueLabel ?? 'Wahr',
        falseLabel: settings?.defaultFalseLabel ?? 'Falsch',
        thenBranch: [],
        elseBranch: [],
      };
    case 'switch': {
      const caseCount = Math.max(1, settings?.defaultSwitchCases ?? 2);
      const cases: SwitchCase[] = Array.from({ length: caseCount }, (_, index) => ({
        id: generateId(),
        label: `Fall ${index + 1}`,
        body: [],
      }));
      return {
        id,
        type: 'switch',
        text: 'Auswahl',
        cases,
        hasDefault: true,
        defaultLabel: 'Sonst',
        defaultBranch: [],
      };
    }
    case 'while':
      return {
        id,
        type: 'while',
        text: 'Solange Bedingung',
        body: [],
      };
    case 'doWhile':
      return {
        id,
        type: 'doWhile',
        text: 'Solange Bedingung',
        body: [],
      };
    case 'for':
      return {
        id,
        type: 'for',
        text: 'Für i = 1 bis n',
        body: [],
      };
  }
}

/**
 * Creates a new empty StruktogrammDocument.
 */
export function createStruktogramm(name = 'Neues Struktogramm'): StruktogrammDocument {
  return {
    id: generateId(),
    name,
    parameterList: '',
    nodes: [],
    x: 40,
    y: 40,
    zIndex: 1,
    minimized: false,
    dirty: false,
  };
}

/**
 * Creates a new ProjectDocument containing one initial diagram.
 */
export function createProject(name = 'Unbenanntes Projekt'): ProjectDocument {
  const initialDiagram = createStruktogramm('Hauptprogramm');
  return {
    id: generateId(),
    name,
    diagrams: [initialDiagram],
    activeDiagramId: initialDiagram.id,
    zoom: 1,
    panX: 0,
    panY: 0,
    globalStyle: createDefaultStyle(),
    printSettings: createDefaultPrintSettings(),
    dirty: false,
  };
}
