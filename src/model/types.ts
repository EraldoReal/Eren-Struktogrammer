export type NodeType =
  | 'sequence'
  | 'subroutine'
  | 'if'
  | 'switch'
  | 'while'
  | 'doWhile'
  | 'for';

export interface NodeStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: number;
}

export interface BaseNode {
  id: string;
  type: NodeType;
  text: string;
  style?: NodeStyle;
}

export interface SequenceNode extends BaseNode {
  type: 'sequence';
}

export interface SubroutineNode extends BaseNode {
  type: 'subroutine';
}

export interface IfNode extends BaseNode {
  type: 'if';
  trueLabel: string;
  falseLabel: string;
  thenBranch: DiagramNode[];
  elseBranch: DiagramNode[];
}

export interface SwitchCase {
  id: string;
  label: string;
  body: DiagramNode[];
}

export interface SwitchNode extends BaseNode {
  type: 'switch';
  cases: SwitchCase[];
  hasDefault: boolean;
  defaultLabel: string;
  defaultBranch: DiagramNode[];
}

export interface WhileNode extends BaseNode {
  type: 'while';
  body: DiagramNode[];
}

export interface DoWhileNode extends BaseNode {
  type: 'doWhile';
  body: DiagramNode[];
}

export interface ForNode extends BaseNode {
  type: 'for';
  body: DiagramNode[];
}

export type DiagramNode =
  | SequenceNode
  | SubroutineNode
  | IfNode
  | SwitchNode
  | WhileNode
  | DoWhileNode
  | ForNode;

export interface DiagramStyle {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  fontSize: number;
  lineWidth: number;
  paddingX: number;
  paddingY: number;
}

export interface StruktogrammDocument {
  id: string;
  name: string;
  parameterList?: string;
  nodes: DiagramNode[];
  style?: Partial<DiagramStyle>;
  // 2D-Fensterposition auf der freien Arbeitsfläche
  x: number;
  y: number;
  width?: number;
  zIndex: number;
  minimized?: boolean;
  filePath?: string;
  dirty?: boolean;
}

export interface PrintSettings {
  pageFormat: 'A4' | 'A3' | 'Letter';
  orientation: 'portrait' | 'landscape';
  marginMm: number;
  scaleToFit: boolean;
  headerText: string;
  footerText: string;
  showPageNumbers: boolean;
}

export interface ProjectDocument {
  id: string;
  name: string;
  diagrams: StruktogrammDocument[];
  activeDiagramId: string | null;
  zoom: number;
  panX: number;
  panY: number;
  globalStyle: DiagramStyle;
  printSettings: PrintSettings;
  filePath?: string;
  dirty?: boolean;
}

export interface CustomOperatorEntry {
  id: string;
  title: string;
  syntax: string;
  description?: string;
}

export interface AppSettings {
  language: 'de' | 'en';
  theme: 'light' | 'dark' | 'system';
  uiScale?: number;
  defaultTrueLabel: string;
  defaultFalseLabel: string;
  defaultSwitchCases: number;
  defaultStyle: DiagramStyle;
  showInsertionHints: boolean;
  recentFiles: string[];
  customOperators?: CustomOperatorEntry[];
}

export interface InsertionTarget {
  diagramId: string;
  parentId: string | null; // null = root nodes array
  branchKey?: 'then' | 'else' | 'body' | 'default' | string; // string = caseId
  index: number;
}
