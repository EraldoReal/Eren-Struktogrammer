export type Language = 'de' | 'en';

export interface Translations {
  app: {
    title: string;
    subtitle: string;
    untitledProject: string;
    untitledDiagram: string;
    mainProgram: string;
  };
  menu: {
    file: string;
    edit: string;
    diagram: string;
    view: string;
    settings: string;
    help: string;
    newProject: string;
    openProject: string;
    saveProject: string;
    saveProjectAs: string;
    closeProject: string;
    openDiagram: string;
    importNsd: string;
    saveDiagram: string;
    saveDiagramAs: string;
    exportSvg: string;
    exportPng: string;
    print: string;
    recentFiles: string;
    noRecentFiles: string;
    createShareLink: string;
    openShareLink: string;
    undo: string;
    redo: string;
    cut: string;
    copy: string;
    paste: string;
    duplicate: string;
    delete: string;
    moveUp: string;
    moveDown: string;
    editText: string;
    newDiagram: string;
    renameDiagram: string;
    minimizeDiagram: string;
    restoreDiagram: string;
    arrangeGrid: string;
    removeDiagram: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    toggleInsertionHints: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    language: string;
    appSettings: string;
    projectStyle: string;
    printSettings: string;
    shortcuts: string;
    about: string;
  };
  tools: {
    select: string;
    selectHint: string;
    sequence: string;
    subroutine: string;
    if: string;
    switch: string;
    while: string;
    doWhile: string;
    for: string;
    sequenceDesc: string;
    subroutineDesc: string;
    ifDesc: string;
    switchDesc: string;
    whileDesc: string;
    doWhileDesc: string;
    forDesc: string;
    insertModeHint: string;
    cancelInsert: string;
  };
  contextMenu: {
    editText: string;
    editLabels: string;
    nodeStyle: string;
    resetNodeStyle: string;
    cut: string;
    copy: string;
    pasteHere: string;
    duplicate: string;
    moveUp: string;
    moveDown: string;
    delete: string;
    addSwitchCase: string;
    removeSwitchCase: string;
    toggleSwitchDefault: string;
    bringToFront: string;
    renameDiagram: string;
    minimize: string;
    restore: string;
    saveDiagram: string;
    exportSvg: string;
    exportPng: string;
    deleteDiagram: string;
    newDiagram: string;
    arrangeGrid: string;
    resetView: string;
  };
  dialogs: {
    ok: string;
    cancel: string;
    save: string;
    close: string;
    apply: string;
    reset: string;
    settingsTitle: string;
    generalTab: string;
    styleTab: string;
    printTab: string;
    languageLabel: string;
    themeLabel: string;
    defaultTrueLabel: string;
    defaultFalseLabel: string;
    defaultSwitchCasesLabel: string;
    showInsertionHintsLabel: string;
    backgroundColor: string;
    textColor: string;
    borderColor: string;
    fontFamily: string;
    fontSize: string;
    lineWidth: string;
    paddingX: string;
    paddingY: string;
    pageFormat: string;
    orientation: string;
    portrait: string;
    landscape: string;
    marginMm: string;
    scaleToFit: string;
    headerText: string;
    footerText: string;
    showPageNumbers: string;
    exportPngTitle: string;
    scaleFactor: string;
    transparentBackground: string;
    diagramPropsTitle: string;
    diagramName: string;
    parameterList: string;
    ifLabelsTitle: string;
    trueBranchLabel: string;
    falseBranchLabel: string;
    nodeStyleTitle: string;
    shortcutsTitle: string;
    aboutTitle: string;
    aboutDescription: string;
    legacyFormatErrorTitle: string;
    legacyFormatErrorBody: string;
  };
  placeholders: {
    emptyDiagram: string;
    emptyBranch: string;
    insertHere: string;
    diagramName: string;
    parameterList: string;
    nodeText: string;
    search: string;
    headerText: string;
    footerText: string;
  };
  shortcuts: {
    undo: string;
    redo: string;
    cut: string;
    copy: string;
    paste: string;
    duplicate: string;
    deleteNode: string;
    moveUp: string;
    moveDown: string;
    editText: string;
    cancelTool: string;
    newProject: string;
    openProject: string;
    saveProject: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    print: string;
  };
  status: {
    zoom: string;
    diagrams: string;
    unsaved: string;
    saved: string;
    activeTool: string;
    ready: string;
  };
}

const de: Translations = {
  app: {
    title: 'Eren Struktogrammer',
    subtitle: 'Moderner Struktogramm-Editor nach DIN 66261',
    untitledProject: 'Unbenanntes Projekt',
    untitledDiagram: 'Neues Struktogramm',
    mainProgram: 'Hauptprogramm',
  },
  menu: {
    file: 'Datei',
    edit: 'Bearbeiten',
    diagram: 'Struktogramm',
    view: 'Ansicht',
    settings: 'Einstellungen',
    help: 'Hilfe',
    newProject: 'Neues Projekt (neuer Tab)',
    openProject: 'Projekt öffnen… (.stgp)',
    saveProject: 'Projekt speichern',
    saveProjectAs: 'Projekt speichern unter…',
    closeProject: 'Projekt-Tab schließen',
    openDiagram: 'Struktogramm laden… (.stgr, .nsd)',
    importNsd: 'Structorizer (.nsd) importieren…',
    saveDiagram: 'Aktives Struktogramm speichern',
    saveDiagramAs: 'Aktives Struktogramm speichern unter…',
    exportSvg: 'Als SVG exportieren…',
    exportPng: 'Als PNG exportieren…',
    print: 'Drucken / PDF…',
    recentFiles: 'Zuletzt verwendet',
    noRecentFiles: 'Keine zuletzt verwendeten Dateien',
    createShareLink: 'Link erstellen (24h)…',
    openShareLink: 'Link öffnen…',
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    cut: 'Ausschneiden',
    copy: 'Kopieren',
    paste: 'Einfügen',
    duplicate: 'Duplizieren',
    delete: 'Löschen',
    moveUp: 'Nach oben verschieben',
    moveDown: 'Nach unten verschieben',
    editText: 'Text bearbeiten',
    newDiagram: 'Neues Struktogramm hinzufügen',
    renameDiagram: 'Struktogramm umbenennen…',
    minimizeDiagram: 'Minimieren',
    restoreDiagram: 'Wiederherstellen',
    arrangeGrid: 'Struktogramme im Raster anordnen',
    removeDiagram: 'Struktogramm schließen',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    resetView: 'Ansicht zurücksetzen',
    toggleInsertionHints: 'Einfügehilfen anzeigen',
    theme: 'Erscheinungsbild',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    themeSystem: 'System',
    language: 'Sprache',
    appSettings: 'Programmeinstellungen…',
    projectStyle: 'Darstellung & Stil…',
    printSettings: 'Seiteneinrichtung & Druck…',
    shortcuts: 'Tastenkürzel…',
    about: 'Über Eren Struktogrammer…',
  },
  tools: {
    select: 'Auswahl',
    selectHint: 'Elemente auswählen, verschieben und bearbeiten',
    sequence: 'Sequenz',
    subroutine: 'Unterprogramm',
    if: 'Verzweigung',
    switch: 'Fallunterscheidung',
    while: 'Kopfgesteuerte Schleife',
    doWhile: 'Fußgesteuerte Schleife',
    for: 'Zählschleife',
    sequenceDesc: 'Einfache Anweisung oder Anweisungsfolge',
    subroutineDesc: 'Aufruf eines Unterprogramms / einer Funktion',
    ifDesc: 'Bedingte Verzweigung (Wahr / Falsch)',
    switchDesc: 'Mehrfachauswahl (Switch / Case)',
    whileDesc: 'Abweisende Schleife (Kopfgesteuert)',
    doWhileDesc: 'Nichtabweisende Schleife (Fußgesteuert)',
    forDesc: 'Zählschleife mit Laufvariable',
    insertModeHint: 'Klicken Sie auf eine Einfügezone im Struktogramm (Esc zum Abbrechen)',
    cancelInsert: 'Einfügemodus beenden',
  },
  contextMenu: {
    editText: 'Text bearbeiten',
    editLabels: 'Zweigbeschriftung ändern…',
    nodeStyle: 'Element-Farben anpassen…',
    resetNodeStyle: 'Element-Stil zurücksetzen',
    cut: 'Ausschneiden',
    copy: 'Kopieren',
    pasteHere: 'Hier einfügen',
    duplicate: 'Duplizieren',
    moveUp: 'Nach oben',
    moveDown: 'Nach unten',
    delete: 'Löschen',
    addSwitchCase: 'Fall hinzufügen',
    removeSwitchCase: 'Fall entfernen',
    toggleSwitchDefault: 'Sonst-Zweig umschalten',
    bringToFront: 'In den Vordergrund',
    renameDiagram: 'Umbenennen / Parameter…',
    minimize: 'Minimieren',
    restore: 'Wiederherstellen',
    saveDiagram: 'Struktogramm speichern…',
    exportSvg: 'Als SVG exportieren…',
    exportPng: 'Als PNG exportieren…',
    deleteDiagram: 'Struktogramm entfernen',
    newDiagram: 'Neues Struktogramm hier erstellen',
    arrangeGrid: 'Im Raster anordnen',
    resetView: 'Ansicht zurücksetzen',
  },
  dialogs: {
    ok: 'OK',
    cancel: 'Abbrechen',
    save: 'Speichern',
    close: 'Schließen',
    apply: 'Anwenden',
    reset: 'Zurücksetzen',
    settingsTitle: 'Einstellungen',
    generalTab: 'Allgemein',
    styleTab: 'Darstellung',
    printTab: 'Drucken',
    languageLabel: 'Sprache',
    themeLabel: 'Farbschema',
    defaultTrueLabel: 'Standard-Beschriftung (Wahr)',
    defaultFalseLabel: 'Standard-Beschriftung (Falsch)',
    defaultSwitchCasesLabel: 'Standard-Anzahl Fälle',
    showInsertionHintsLabel: 'Einfügezonen beim Überfahren hervorheben',
    backgroundColor: 'Hintergrundfarbe',
    textColor: 'Textfarbe',
    borderColor: 'Rahmenfarbe',
    fontFamily: 'Schriftart',
    fontSize: 'Schriftgröße (px)',
    lineWidth: 'Linienstärke (px)',
    paddingX: 'Innenabstand horizontal (px)',
    paddingY: 'Innenabstand vertikal (px)',
    pageFormat: 'Papierformat',
    orientation: 'Ausrichtung',
    portrait: 'Hochformat',
    landscape: 'Querformat',
    marginMm: 'Seitenrand (mm)',
    scaleToFit: 'Auf Seitenbreite skalieren',
    headerText: 'Kopfzeile',
    footerText: 'Fußzeile',
    showPageNumbers: 'Seitenzahlen anzeigen',
    exportPngTitle: 'Als PNG exportieren',
    scaleFactor: 'Auflösung / Skalierung',
    transparentBackground: 'Transparenter Hintergrund',
    diagramPropsTitle: 'Struktogramm-Eigenschaften',
    diagramName: 'Name / Bezeichner',
    parameterList: 'Parameterliste',
    ifLabelsTitle: 'Verzweigungsbeschriftung',
    trueBranchLabel: 'Wahr-Zweig',
    falseBranchLabel: 'Falsch-Zweig',
    nodeStyleTitle: 'Element-Stil',
    shortcutsTitle: 'Tastenkürzel',
    aboutTitle: 'Über Eren Struktogrammer',
    aboutDescription:
      'Plattformübergreifender Editor für Nassi-Shneiderman-Diagramme (Struktogramme) nach DIN 66261 mit freier 2D-Arbeitsfläche, Multi-Projekt-Tabs und SVG/PNG/NSD-Export.',
    legacyFormatErrorTitle: 'Altes Java-Binärformat nicht unterstützt',
    legacyFormatErrorBody:
      'Diese Datei verwendet das veraltete Java-Serialisierungsformat (AC ED 00 05). Bitte exportieren Sie das Diagramm im alten Struktogrammer als XML/NSD oder JSON.',
  },
  placeholders: {
    emptyDiagram: 'Struktogramm ist leer – wählen Sie ein Element aus der Werkzeugleiste',
    emptyBranch: 'Leer',
    insertHere: 'Hier einfügen',
    diagramName: 'z. B. Hauptprogramm',
    parameterList: 'z. B. n: integer, feld: array',
    nodeText: 'Anweisung eingeben…',
    search: 'Suchen…',
    headerText: 'Optionale Kopfzeile…',
    footerText: 'Optionale Fußzeile…',
  },
  shortcuts: {
    undo: 'Rückgängig',
    redo: 'Wiederholen',
    cut: 'Ausschneiden',
    copy: 'Kopieren',
    paste: 'Einfügen',
    duplicate: 'Duplizieren',
    deleteNode: 'Element löschen',
    moveUp: 'Element nach oben',
    moveDown: 'Element nach unten',
    editText: 'Text bearbeiten',
    cancelTool: 'Werkzeug / Bearbeitung abbrechen',
    newProject: 'Neues Projekt',
    openProject: 'Projekt öffnen',
    saveProject: 'Projekt speichern',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    resetView: 'Zoom zurücksetzen',
    print: 'Drucken',
  },
  status: {
    zoom: 'Zoom',
    diagrams: 'Struktogramme',
    unsaved: 'Ungespeichert',
    saved: 'Gespeichert',
    activeTool: 'Werkzeug',
    ready: 'Bereit',
  },
};

const en: Translations = {
  app: {
    title: 'Eren Struktogrammer',
    subtitle: 'Modern Nassi-Shneiderman Diagram Editor (DIN 66261)',
    untitledProject: 'Untitled Project',
    untitledDiagram: 'New Structogram',
    mainProgram: 'Main Program',
  },
  menu: {
    file: 'File',
    edit: 'Edit',
    diagram: 'Diagram',
    view: 'View',
    settings: 'Settings',
    help: 'Help',
    newProject: 'New Project (New Tab)',
    openProject: 'Open Project… (.stgp)',
    saveProject: 'Save Project',
    saveProjectAs: 'Save Project As…',
    closeProject: 'Close Project Tab',
    openDiagram: 'Load Diagram… (.stgr, .nsd)',
    importNsd: 'Import Structorizer (.nsd)…',
    saveDiagram: 'Save Active Diagram',
    saveDiagramAs: 'Save Active Diagram As…',
    exportSvg: 'Export as SVG…',
    exportPng: 'Export as PNG…',
    print: 'Print / PDF…',
    recentFiles: 'Recent Files',
    noRecentFiles: 'No recent files',
    createShareLink: 'Create Share Link (24h)…',
    openShareLink: 'Open Share Link…',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    duplicate: 'Duplicate',
    delete: 'Delete',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    editText: 'Edit Text',
    newDiagram: 'Add New Diagram',
    renameDiagram: 'Rename Diagram…',
    minimizeDiagram: 'Minimize',
    restoreDiagram: 'Restore',
    arrangeGrid: 'Arrange Diagrams in Grid',
    removeDiagram: 'Remove Diagram',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    resetView: 'Reset View',
    toggleInsertionHints: 'Show Insertion Hints',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    language: 'Language',
    appSettings: 'Application Settings…',
    projectStyle: 'Appearance & Style…',
    printSettings: 'Page Setup & Print…',
    shortcuts: 'Keyboard Shortcuts…',
    about: 'About Eren Struktogrammer…',
  },
  tools: {
    select: 'Select',
    selectHint: 'Select, move, and edit elements',
    sequence: 'Sequence',
    subroutine: 'Subroutine',
    if: 'Branch (If / Else)',
    switch: 'Switch / Case',
    while: 'While Loop',
    doWhile: 'Do-While Loop',
    for: 'For Loop',
    sequenceDesc: 'Simple statement or sequence of instructions',
    subroutineDesc: 'Call to a subroutine or function',
    ifDesc: 'Conditional branch (True / False)',
    switchDesc: 'Multi-way selection (Switch / Case)',
    whileDesc: 'Pre-test loop (While)',
    doWhileDesc: 'Post-test loop (Do-While)',
    forDesc: 'Counting loop (For)',
    insertModeHint: 'Click an insertion zone in the diagram (Esc to cancel)',
    cancelInsert: 'Exit insert mode',
  },
  contextMenu: {
    editText: 'Edit Text',
    editLabels: 'Edit Branch Labels…',
    nodeStyle: 'Customize Element Colors…',
    resetNodeStyle: 'Reset Element Style',
    cut: 'Cut',
    copy: 'Copy',
    pasteHere: 'Paste Here',
    duplicate: 'Duplicate',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    delete: 'Delete',
    addSwitchCase: 'Add Case',
    removeSwitchCase: 'Remove Case',
    toggleSwitchDefault: 'Toggle Default Branch',
    bringToFront: 'Bring to Front',
    renameDiagram: 'Rename / Parameters…',
    minimize: 'Minimize',
    restore: 'Restore',
    saveDiagram: 'Save Diagram…',
    exportSvg: 'Export as SVG…',
    exportPng: 'Export as PNG…',
    deleteDiagram: 'Remove Diagram',
    newDiagram: 'Create New Diagram Here',
    arrangeGrid: 'Arrange in Grid',
    resetView: 'Reset View',
  },
  dialogs: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    close: 'Close',
    apply: 'Apply',
    reset: 'Reset',
    settingsTitle: 'Settings',
    generalTab: 'General',
    styleTab: 'Appearance',
    printTab: 'Print',
    languageLabel: 'Language',
    themeLabel: 'Theme',
    defaultTrueLabel: 'Default True Label',
    defaultFalseLabel: 'Default False Label',
    defaultSwitchCasesLabel: 'Default Switch Cases',
    showInsertionHintsLabel: 'Highlight insertion zones on hover',
    backgroundColor: 'Background Color',
    textColor: 'Text Color',
    borderColor: 'Border Color',
    fontFamily: 'Font Family',
    fontSize: 'Font Size (px)',
    lineWidth: 'Line Width (px)',
    paddingX: 'Horizontal Padding (px)',
    paddingY: 'Vertical Padding (px)',
    pageFormat: 'Page Format',
    orientation: 'Orientation',
    portrait: 'Portrait',
    landscape: 'Landscape',
    marginMm: 'Margin (mm)',
    scaleToFit: 'Scale to fit page width',
    headerText: 'Header Text',
    footerText: 'Footer Text',
    showPageNumbers: 'Show page numbers',
    exportPngTitle: 'Export as PNG',
    scaleFactor: 'Resolution / Scale',
    transparentBackground: 'Transparent Background',
    diagramPropsTitle: 'Diagram Properties',
    diagramName: 'Name / Identifier',
    parameterList: 'Parameter List',
    ifLabelsTitle: 'Branch Labels',
    trueBranchLabel: 'True Branch',
    falseBranchLabel: 'False Branch',
    nodeStyleTitle: 'Element Style',
    shortcutsTitle: 'Keyboard Shortcuts',
    aboutTitle: 'About Eren Struktogrammer',
    aboutDescription:
      'Cross-platform editor for Nassi-Shneiderman diagrams (DIN 66261) with a free 2D canvas, multi-project tabs, and SVG/PNG/NSD export.',
    legacyFormatErrorTitle: 'Legacy Java Binary Format Not Supported',
    legacyFormatErrorBody:
      'This file uses the legacy Java serialization format (AC ED 00 05). Please export the diagram as XML/NSD or JSON first.',
  },
  placeholders: {
    emptyDiagram: 'Diagram is empty – pick an element from the toolbar',
    emptyBranch: 'Empty',
    insertHere: 'Insert here',
    diagramName: 'e.g. MainProgram',
    parameterList: 'e.g. n: integer, items: array',
    nodeText: 'Enter instruction…',
    search: 'Search…',
    headerText: 'Optional header…',
    footerText: 'Optional footer…',
  },
  shortcuts: {
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    duplicate: 'Duplicate',
    deleteNode: 'Delete element',
    moveUp: 'Move element up',
    moveDown: 'Move element down',
    editText: 'Edit text',
    cancelTool: 'Cancel tool / editing',
    newProject: 'New project',
    openProject: 'Open project',
    saveProject: 'Save project',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetView: 'Reset zoom',
    print: 'Print',
  },
  status: {
    zoom: 'Zoom',
    diagrams: 'Diagrams',
    unsaved: 'Unsaved',
    saved: 'Saved',
    activeTool: 'Tool',
    ready: 'Ready',
  },
};

export const translations: Record<Language, Translations> = {
  de,
  en,
};

export function getTranslations(language: Language): Translations {
  return translations[language] ?? translations.de;
}
