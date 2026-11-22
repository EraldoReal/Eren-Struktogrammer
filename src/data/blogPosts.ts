import type { StruktogrammDocument } from '../model/types';

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  codeBlock?: {
    language: string;
    code: string;
  };
  callout?: string;
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface BlogFaqItem {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  date: string;
  readTimeMin: number;
  category: 'guide' | 'comparison' | 'exam';
  categoryDe: string;
  categoryEn: string;
  keywordsDe: string[];
  keywordsEn: string[];
  titleDe: string;
  titleEn: string;
  metaTitleDe: string;
  metaTitleEn: string;
  metaDescriptionDe: string;
  metaDescriptionEn: string;
  excerptDe: string;
  excerptEn: string;
  sectionsDe: BlogSection[];
  sectionsEn: BlogSection[];
  faqDe?: BlogFaqItem[];
  faqEn?: BlogFaqItem[];
  exampleDiagram?: StruktogrammDocument;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'struktogramm-erstellen-anleitung',
    date: '2026-11-22',
    readTimeMin: 7,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm erstellen', 'DIN 66261 Anleitung', 'Nassi-Shneiderman-Diagramm Beispiel'],
    keywordsEn: ['create structogram', 'DIN 66261 tutorial', 'Nassi-Shneiderman diagram example'],
    titleDe: 'Struktogramm erstellen: Schritt-für-Schritt-Anleitung mit Beispielen (DIN 66261)',
    titleEn: 'How to Create a Structogram: Step-by-Step Guide with Examples (DIN 66261)',
    metaTitleDe: 'Struktogramm erstellen – Ausführliche Anleitung & Beispiele (DIN 66261)',
    metaTitleEn: 'How to Create a Structogram – Complete Guide & Examples (DIN 66261)',
    metaDescriptionDe:
      'Ausführliche Anleitung: So erstellst du ein korrektes Struktogramm nach DIN 66261 – vom EVA-Prinzip über Variablen bis zu Verzweigungen, Schleifen und Notenrechner-Beispiel.',
    metaDescriptionEn:
      'Complete guide on creating DIN 66261 Nassi-Shneiderman structograms: Input-Process-Output, variables, branches, loops, and a live grade-checker example.',
    excerptDe:
      'Wie plant man einen Algorithmus sauber als Struktogramm? Diese ausführliche Anleitung zeigt dir alle Regeln nach DIN 66261 anhand eines Notenrechner-Beispiels.',
    excerptEn:
      'How do you plan an algorithm cleanly as a structogram? This detailed guide covers every DIN 66261 rule using a live grade-checker example.',
    exampleDiagram: {
      id: 'blog-ex-noten',
      name: 'notenRechner(punkte)',
      x: 40,
      y: 40,
      width: 440,
      zIndex: 1,
      nodes: [
        { id: 'n1', type: 'sequence', text: 'Deklaration: note als Text' },
        { id: 'n2', type: 'sequence', text: 'Einlesen: punkte' },
        {
          id: 'n3',
          type: 'if',
          text: 'punkte >= 50',
          trueLabel: 'wahr',
          falseLabel: 'falsch',
          thenBranch: [{ id: 'n4', type: 'sequence', text: 'note = "Bestanden"' }],
          elseBranch: [{ id: 'n5', type: 'sequence', text: 'note = "Nicht bestanden"' }],
        },
        { id: 'n6', type: 'sequence', text: 'Ausgabe: note' },
      ],
    },
    sectionsDe: [
      {
        heading: '1. Was ist ein Struktogramm nach DIN 66261?',
        paragraphs: [
          'Ein Struktogramm (offiziell Nassi-Shneiderman-Diagramm nach der deutschen Norm DIN 66261) ist eine grafische Darstellung für Algorithmen und Programmabläufe. Im Gegensatz zu Flussdiagrammen verzichtet es komplett auf Pfeile und Verbindungslinien.',
          'Stattdessen besteht jedes Struktogramm aus rechteckigen Blöcken, die nahtlos ineinander verschachtelt werden. Die Leserichtung ist immer streng von oben nach unten. Genau deshalb können unstrukturierte Sprünge (GOTO / „Spaghetti-Code“) in einem Struktogramm gar nicht erst gezeichnet werden.',
        ],
        callout:
          'Merksatz für Klausuren: Ein Struktogramm hat keinen „Start“- und keinen „Ende“-Kreis wie ein PAP – der Rahmen selbst bildet Anfang und Ende des Algorithmus.',
      },
      {
        heading: '2. Die 7 Bausteine im Überblick',
        paragraphs: [
          'Die DIN 66261 kommt mit genau sieben Grundelementen aus, die sich beliebig tief verschachteln lassen:',
        ],
        bullets: [
          'Sequenz (Anweisung): Ein einfaches Rechteck für Zuweisungen, Deklarationen, Eingaben oder Ausgaben.',
          'Unterprogramm: Ein Rechteck mit doppelten senkrechten Seitenlinien für Funktions- oder Methodenaufrufe.',
          'Verzweigung (If / Else): Ein Kopfbalken mit diagonalen Dreieckslinien für „wahr“ (links) und „falsch“ (rechts).',
          'Fallunterscheidung (Switch / Case): Mehrfachverzweigung für mehrere feste Werte derselben Variable plus „sonst“-Zweig.',
          'Kopfgesteuerte Schleife (While): Bedingung steht im L-förmigen Balken oben – prüft vor dem ersten Durchlauf.',
          'Fußgesteuerte Schleife (Do-While): Bedingung steht unten – läuft immer mindestens einmal durch.',
          'Zählschleife (For): Läuft mit Startwert, Endwert und Schrittweite über eine feste Anzahl an Wiederholungen.',
        ],
      },
      {
        heading: '3. In 4 Schritten zum eigenen Struktogramm (EVA-Prinzip)',
        paragraphs: [
          'Wenn du vor einer Aufgabe im Informatik-Unterricht oder in der IHK-Prüfung sitzt, zerlege das Problem immer nach dem EVA-Prinzip (Eingabe – Verarbeitung – Ausgabe):',
        ],
        bullets: [
          'Schritt 1 – Eingabe & Variablen festlegen: Welche Werte kommen von außen? Schreibe oben „Deklaration: ...“ und „Einlesen: ...“.',
          'Schritt 2 – Bedingungen prüfen: Muss sich der Ablauf je nach Wert aufteilen? Wähle eine Verzweigung oder Fallunterscheidung.',
          'Schritt 3 – Wiederholungen erkennen: Muss ein Block mehrfach laufen (z. B. Liste durchsuchen, Summe bilden)? Wähle die passende Schleife.',
          'Schritt 4 – Ausgabe formulieren: Ganz unten steht „Ausgabe: ...“ oder „Rückgabe: ...“ als Abschluss des Algorithmus.',
        ],
      },
      {
        heading: '4. Praxis-Beispiel: Notenrechner',
        paragraphs: [
          'Das folgende Beispiel prüft anhand einer eingegebenen Punktzahl, ob eine Klausur bestanden wurde. Ab 50 Punkten wird „Bestanden“ ausgegeben, darunter „Nicht bestanden“. Klicke unten auf „Beispiel im Editor öffnen“, um das Diagramm sofort anzupassen oder als SVG/PNG herunterzuladen.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: '1. What Is a DIN 66261 Structogram?',
        paragraphs: [
          'A structogram (Nassi-Shneiderman diagram, standardized as DIN 66261) represents algorithms using nested rectangular blocks instead of arrows. Control flow always moves strictly from top to bottom.',
          'Because unstructured jumps cannot be drawn, structograms naturally enforce clean, structured programming and are widely used in computer science courses and vocational exams.',
        ],
        callout:
          'Exam tip: Unlike flowcharts, structograms do not use separate Start/End ovals — the outer frame itself marks the start and end of the algorithm.',
      },
      {
        heading: '2. The 7 Core Building Blocks',
        paragraphs: ['DIN 66261 defines seven universal building blocks:'],
        bullets: [
          'Sequence: A plain rectangle for assignments, variable declarations, input, or output.',
          'Subroutine: A rectangle with double vertical side bars representing a function or procedure call.',
          'Branch (If / Else): Diagonal header split into true (left) and false (right) columns.',
          'Switch-Case: Multi-way branch for testing one expression against multiple discrete values.',
          'While Loop (head-controlled): Condition on top; checks before every iteration (0+ runs).',
          'Do-While Loop (tail-controlled): Condition at bottom; always executes at least once (1+ runs).',
          'For Loop (counting): Iterates across a known counter range with start, end, and step.',
        ],
      },
      {
        heading: '3. Four-Step Method (Input–Process–Output)',
        paragraphs: [
          'Break down every programming task into Input, Processing, and Output: declare and read inputs at the top, add branches and loops in the middle, and place the output or return value at the bottom.',
        ],
      },
    ],
    faqDe: [
      {
        q: 'Braucht ein Struktogramm einen Start- und Ende-Block?',
        a: 'Nein. Im Gegensatz zum Programmablaufplan (PAP) gibt es in DIN 66261 keinen Start- oder Stopp-Kreis. Der Name des Algorithmus steht über dem Kasten.',
      },
      {
        q: 'Darf ich Code oder deutschen Text ins Struktogramm schreiben?',
        a: 'Ein Struktogramm ist sprachunabhängig. Nutze klare, einheitliche Anweisungen wie „summe = summe + x“ oder „Ausgabe: ergebnis“ statt Java-/Python-spezifischer Syntax.',
      },
    ],
    faqEn: [
      {
        q: 'Do structograms need Start and End ovals?',
        a: 'No. Unlike flowcharts, DIN 66261 structograms do not use Start/End ovals — the algorithm name sits at the top of the frame.',
      },
    ],
  },
  {
    slug: 'struktogramm-schleifen-erklaert',
    date: '2026-11-22',
    readTimeMin: 7,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm Schleife', 'kopfgesteuerte Schleife', 'fußgesteuerte Schleife', 'Zählschleife Struktogramm'],
    keywordsEn: ['structogram loop', 'while loop DIN 66261', 'do-while structogram', 'for loop structogram'],
    titleDe: 'Struktogramm-Schleifen erklärt: Kopfgesteuert, Fußgesteuert & Zählschleife',
    titleEn: 'Structogram Loops Explained: While, Do-While & For Loops',
    metaTitleDe: 'Schleifen im Struktogramm: Kopf-, Fuß- & Zählschleife (DIN 66261)',
    metaTitleEn: 'Loops in Structograms: While, Do-While & For Explained (DIN 66261)',
    metaDescriptionDe:
      'Alle 3 Schleifentypen im Struktogramm einfach erklärt: Wann nimmt man While, Do-While oder For? Mit Vergleichstabelle, typischen Prüfungsfallen und Fakultäts-Beispiel.',
    metaDescriptionEn:
      'Understand all three DIN 66261 loop types: head-controlled (while), tail-controlled (do-while), and counting (for) loops with comparison table and live example.',
    excerptDe:
      'Kopfgesteuert, fußgesteuert oder Zählschleife? Hier erfährst du die genauen Unterschiede nach DIN 66261 und vermeidest typische Prüfungsfehler.',
    excerptEn:
      'While, do-while, or for loop? Learn the exact DIN 66261 differences, minimum iteration counts, and common exam pitfalls.',
    exampleDiagram: {
      id: 'blog-ex-loops',
      name: 'fakultaetBerechnen(n)',
      x: 40,
      y: 40,
      width: 440,
      zIndex: 1,
      nodes: [
        { id: 'l1', type: 'sequence', text: 'ergebnis = 1' },
        {
          id: 'l2',
          type: 'for',
          text: 'i = 1 bis n, Schrittweite 1',
          body: [{ id: 'l3', type: 'sequence', text: 'ergebnis = ergebnis * i' }],
        },
        { id: 'l4', type: 'sequence', text: 'Ausgabe: ergebnis' },
      ],
    },
    sectionsDe: [
      {
        heading: '1. Die drei Schleifentypen im direkten Vergleich',
        paragraphs: [
          'Immer wenn sich Anweisungen wiederholen sollen, brauchst du eine Schleife. In DIN 66261 gibt es dafür genau drei Darstellungsformen, die sich am Prüfzeitpunkt der Bedingung unterscheiden:',
        ],
        table: {
          headers: ['Schleifentyp', 'Prüfzeitpunkt', 'Mindest-Durchläufe', 'Typisches Beispiel'],
          rows: [
            ['Kopfgesteuerte Schleife (while)', 'Vor jedem Durchlauf (oben)', '0-mal (kann übersprungen werden)', 'Liste durchsuchen bis Element gefunden'],
            ['Fußgesteuerte Schleife (do-while)', 'Nach jedem Durchlauf (unten)', '1-mal (läuft immer mindestens 1x)', 'Passwort abfragen bis Eingabe korrekt'],
            ['Zählschleife (for)', 'Automatisch über Zählvariable', '0-mal (falls Start > Ende) oder N-mal', 'Array von Index 0 bis N-1 durchlaufen'],
          ],
        },
      },
      {
        heading: '2. Kopfgesteuerte vs. fußgesteuerte Schleife – die häufigste Falle',
        paragraphs: [
          'In Prüfungen wird fast immer getestet, ob du den Unterschied zwischen „solange“ (Wiederholungsbedingung) und „bis“ (Abbruchbedingung) sauber formulierst.',
          'Schreibe in der Schule oder IHK-Klausur bei kopf- und fußgesteuerten Schleifen immer eindeutig dazu, ob die Bedingung als Laufbedingung („solange x < 10“) gemeint ist – so gibt es beim Korrigieren keine Missverständnisse.',
        ],
        callout:
          'Wichtig bei Endlosschleifen: Vergiss nie, innerhalb des Schleifenrumpfs die Variable zu verändern, die in der Schleifenbedingung geprüft wird (z. B. i = i + 1)!',
      },
      {
        heading: '3. Wann die Zählschleife ideal ist',
        paragraphs: [
          'Sobald du vor dem Start der Schleife weißt, wie oft sie laufen soll (z. B. von 1 bis n, oder für jedes Element eines Arrays), ist die Zählschleife die sauberste Wahl. Im Live-Beispiel unten siehst du die Fakultätsberechnung n! mit einer Zählschleife von 1 bis n.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: '1. Comparing the Three Loop Types',
        paragraphs: [
          'DIN 66261 provides three loop blocks depending on when the condition is evaluated and whether the number of iterations is known in advance:',
        ],
        table: {
          headers: ['Loop Type', 'Check Timing', 'Min Runs', 'Best Used For'],
          rows: [
            ['While Loop (head-controlled)', 'Before each iteration', '0', 'Unknown count (e.g., search until found)'],
            ['Do-While Loop (tail-controlled)', 'After each iteration', '1', 'Input validation (must run at least once)'],
            ['For Loop (counting)', 'Counter-controlled', '0 or N', 'Known iteration count or array traversal'],
          ],
        },
      },
      {
        heading: '2. Avoiding Infinite Loops',
        paragraphs: [
          'Always ensure that at least one variable checked in the loop condition is updated inside the loop body, otherwise the algorithm will never terminate.',
        ],
      },
    ],
    faqDe: [
      {
        q: 'Wann muss ich unbedingt eine fußgesteuerte Schleife nehmen?',
        a: 'Immer dann, wenn der Körper mindestens einmal ausgeführt werden muss, bevor eine Prüfung überhaupt Sinn ergibt – klassisch bei Benutzereingaben („Bitte Passwort eingeben“).',
      },
    ],
  },
  {
    slug: 'struktogramm-verzweigung-switch-case',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm Verzweigung', 'Fallunterscheidung Struktogramm', 'If Else DIN 66261', 'Switch Case'],
    keywordsEn: ['structogram branch', 'if else DIN 66261', 'switch case structogram'],
    titleDe: 'Verzweigung (If/Else) & Fallunterscheidung (Switch-Case) im Struktogramm',
    titleEn: 'Branches (If/Else) & Switch-Case in Structograms',
    metaTitleDe: 'Verzweigung & Fallunterscheidung im Struktogramm (DIN 66261)',
    metaTitleEn: 'If/Else Branch & Switch-Case in DIN 66261 Structograms',
    metaDescriptionDe:
      'Einfache Verzweigung (If), zweiseitige Verzweigung (If/Else) und Mehrfach-Fallunterscheidung (Switch/Case) im Struktogramm sauber zeichnen.',
    metaDescriptionEn:
      'Learn how to draw single-sided If, binary If/Else, and multi-way Switch-Case blocks cleanly in DIN 66261 structograms.',
    excerptDe:
      'Wann reicht eine einfache Verzweigung, wann verschachtelt man If/Else und wann ist eine Fallunterscheidung viel lesbarer? Mit direktem Tarif-Beispiel.',
    excerptEn:
      'When to use a binary If/Else branch vs. a multi-way Switch-Case block? Includes a live pricing-tier example.',
    exampleDiagram: {
      id: 'blog-ex-switch',
      name: 'tarifAuswahl(tarif)',
      x: 40,
      y: 40,
      width: 480,
      zIndex: 1,
      nodes: [
        {
          id: 'sw1',
          type: 'switch',
          text: 'tarif',
          hasDefault: true,
          cases: [
            {
              id: 'c1',
              label: '"S"',
              body: [{ id: 's1', type: 'sequence', text: 'preis = 9.99' }],
            },
            {
              id: 'c2',
              label: '"M"',
              body: [{ id: 's2', type: 'sequence', text: 'preis = 14.99' }],
            },
          ],
          defaultLabel: 'sonst',
          defaultBranch: [{ id: 's3', type: 'sequence', text: 'preis = 24.99' }],
        },
        { id: 's4', type: 'sequence', text: 'Ausgabe: preis' },
      ],
    },
    sectionsDe: [
      {
        heading: '1. Einseitige und zweiseitige Verzweigung (If / Else)',
        paragraphs: [
          'Bei einer Verzweigung steht die Bedingung mittig im oberen Dreieck. Links folgt der „wahr“-Zweig (Ja), rechts der „falsch“-Zweig (Nein).',
          'Gibt es im „falsch“-Zweig nichts zu tun (einseitige Verzweigung, reines If ohne Else), bleibt die rechte Spalte einfach leer – oder wird mit einem kurzen Strich gekennzeichnet.',
        ],
      },
      {
        heading: '2. Mehrfach-Fallunterscheidung (Switch / Case)',
        paragraphs: [
          'Prüfst du dieselbe Variable auf drei oder mehr feste Werte (z. B. Wochentag 1..7, Schulnote 1..6 oder Tarif „S“, „M“, „L“), solltest du niemals vier If-Else-Blöcke ineinander schachteln. Das Struktogramm wird dadurch unnötig schmal und schwer lesbar.',
          'Die Fallunterscheidung legt alle Fälle sauber nebeneinander. Vergiss am Ende rechts nicht den „sonst“-Zweig (Default) für unerwartete Eingaben.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: '1. Binary Branch (If / Else)',
        paragraphs: [
          'A binary branch places the boolean condition inside the top triangle, with the true path on the left and the false path on the right. If there is no Else behavior, the false branch remains empty.',
        ],
      },
      {
        heading: '2. Multi-Way Switch-Case',
        paragraphs: [
          'Whenever one expression is checked against three or more discrete values, a Switch-Case block keeps columns balanced and easy to read. Always include a “default” (otherwise) column for unexpected inputs.',
        ],
      },
    ],
  },
  {
    slug: 'besser-als-nassi-online-editoren',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'comparison',
    categoryDe: 'Vergleich',
    categoryEn: 'Comparison',
    keywordsDe: ['Nassi Online Editor', 'Struktogramm Online Editor Vergleich', 'bester Struktogramm Editor'],
    keywordsEn: ['Nassi Shneiderman online editor', 'best structogram editor', 'online structogram tool'],
    titleDe: 'Warum Eren Struktogrammer besser ist als klassische Nassi Online-Editoren',
    titleEn: 'Why Eren Struktogrammer Is Better Than Classic Nassi Online Editors',
    metaTitleDe: 'Warum Eren Struktogrammer besser ist als Nassi Online-Editoren',
    metaTitleEn: 'Why Eren Struktogrammer Beats Classic Online Nassi Editors',
    metaDescriptionDe:
      'Ausführlicher Vergleich mit herkömmlichen Nassi-Shneiderman-Online-Editoren: 2D-Arbeitsfläche, Multi-Tab-Projekte, SVG/PNG-Export, 1-Klick-Screenshot, Abitur-Operatoren & 24h-Link-Teilen.',
    metaDescriptionEn:
      'Detailed comparison against classic online Nassi-Shneiderman editors: 2D multi-diagram canvas, SVG/PNG export, 1-click screenshot, native desktop apps, and 24h encrypted sharing.',
    excerptDe:
      'Viele Online-Editoren für Nassi-Shneiderman-Diagramme sind veraltet, langsam oder auf ein einziges Diagramm begrenzt. Hier siehst du den konkreten Vergleich.',
    excerptEn:
      'Many online Nassi-Shneiderman editors are slow or limited to one diagram. See how Eren Struktogrammer solves those limitations.',
    sectionsDe: [
      {
        heading: '1. Das Problem vieler Nassi-Online-Editoren',
        paragraphs: [
          'Wer nach „Struktogramm online erstellen“ sucht, landet oft auf kleinen Einzel-Tools: Man kann nur ein einziges Diagramm gleichzeitig öffnen, Unterprogramme müssen in getrennten Browser-Tabs gezeichnet werden, beim Export bekommt man unscharfe PNGs – oder man wird von Werbung und Cookie-Bannern erschlagen.',
        ],
      },
      {
        heading: '2. Direkter Funktions-Vergleich',
        paragraphs: [
          'Eren Struktogrammer wurde gezielt als schnelles, modernes Werkzeug für Unterricht, Abitur und Ausbildung entwickelt:',
        ],
        table: {
          headers: ['Kriterium', 'Typische Nassi Online-Editoren', 'Eren Struktogrammer'],
          rows: [
            ['Arbeitsfläche', 'Meist nur 1 Diagramm', '2D-Arbeitsfläche für beliebig viele Diagramme + Projekt-Tabs'],
            ['Export-Qualität', 'Oft nur einfaches PNG', 'Kristallklares Vektor-SVG, PNG (1x/2x/3x), PDF & 1-Klick-Screenshot'],
            ['Abitur-Operatoren', 'Fehlen komplett', 'Integrierte BW-Operatorenliste v2.2 + eigene Operatoren'],
            ['Dateikompatibilität', 'Meist nur eigenes JSON', '.stgp, .stgr, Structorizer (.nsd), XML & JSON'],
            ['Offline-Nutzung', 'Nur im Browser', 'Native Desktop-Apps für Windows, macOS (Universal) & Linux'],
            ['Teilen im Unterricht', 'Export → Mail/Chat', 'Ende-zu-Ende-verschlüsselter 24h-Link direkt unter Datei'],
            ['Datenschutz & Kosten', 'Werbung / Tracker / Limits', '100 % kostenlos, Open Source, ohne Konto, ohne Cookies'],
          ],
        },
      },
      {
        heading: '3. Schneller arbeiten durch Tastenkürzel & Live-Layout',
        paragraphs: [
          'Statt für jedes Element zehnmal durch Menüs zu klicken, unterstützt Eren Struktogrammer direktes Inline-Bearbeiten per Doppelklick, Einfügen per Werkzeugleiste oder Tastenkürzel, Undo/Redo sowie automatische Spaltenbreiten-Anpassung.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: '1. Limitations of Typical Online Nassi Editors',
        paragraphs: [
          'Most web-based structogram tools restrict you to a single diagram at a time, export blurry raster images, and offer no offline desktop support.',
        ],
      },
      {
        heading: '2. Feature-by-Feature Comparison',
        paragraphs: ['See how Eren Struktogrammer compares across everyday classroom needs:'],
        table: {
          headers: ['Feature', 'Classic Online Editors', 'Eren Struktogrammer'],
          rows: [
            ['Workspace', 'Single diagram only', 'Unlimited 2D canvas + multi-project tabs'],
            ['Exports', 'Basic PNG only', 'Vector SVG, PNG (1x/2x/3x), PDF & 1-click clipboard screenshot'],
            ['Desktop Support', 'Browser-only', 'Native Windows, macOS (Universal) & Linux apps'],
            ['File Compatibility', 'Proprietary only', '.stgp, .stgr, Structorizer (.nsd), XML & JSON'],
            ['Classroom Sharing', 'Manual file uploads', 'End-to-end encrypted 24h share links'],
          ],
        },
      },
    ],
  },
  {
    slug: 'vergleich-eren-struktogrammer-vs-hus',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'comparison',
    categoryDe: 'Vergleich',
    categoryEn: 'Comparison',
    keywordsDe: ['HuS Struktogrammer Alternative', 'HuS Struktogrammer Vergleich', 'HuS Struktogrammer macOS ohne Java'],
    keywordsEn: ['HuS Struktogrammer alternative', 'HuS Struktogrammer comparison', 'structogram without Java'],
    titleDe: 'Eren Struktogrammer vs. klassischer HuS Struktogrammer: Der komplette Vergleich',
    titleEn: 'Eren Struktogrammer vs. Classic HuS Struktogrammer: Complete Comparison',
    metaTitleDe: 'Eren Struktogrammer vs. HuS Struktogrammer – Vergleich & Umstieg',
    metaTitleEn: 'Eren Struktogrammer vs. Classic HuS Struktogrammer Comparison',
    metaDescriptionDe:
      'Warum Eren Struktogrammer die beste Alternative zum klassischen HuS Struktogrammer ist: ohne Java, nativ auf Apple Silicon & Windows, Dark Mode und 100 % kompatibel zu .stgr/.stgp.',
    metaDescriptionEn:
      'Compare classic HuS Struktogrammer with Eren Struktogrammer: zero Java required, native macOS Apple Silicon & Windows support, Dark Mode, and .stgp/.stgr file compatibility.',
    excerptDe:
      'Der klassische HuS Struktogrammer braucht Java und macht auf modernen Macs und iPads Probleme. Wir vergleichen beide Programme Punkt für Punkt.',
    excerptEn:
      'Classic HuS Struktogrammer relies on Java and struggles on modern Macs and tablets. Here is a complete side-by-side comparison.',
    sectionsDe: [
      {
        heading: '1. Warum viele Schulen vom klassischen HuS umsteigen',
        paragraphs: [
          'Der klassische HuS Struktogrammer war jahrelang der Standard im deutschen Informatik-Unterricht. Doch die Technik dahinter (Java Swing / ältere Laufzeitumgebungen) sorgt heute immer häufiger für Frust: Auf Schul-iPads oder Chromebooks läuft Java gar nicht, auf modernen Windows-Rechnern oder macOS Apple Silicon (M1–M4) wirkt die Oberfläche unscharf und veraltet.',
        ],
      },
      {
        heading: '2. Die Vergleichstabelle',
        paragraphs: ['Hier siehst du alle Unterschiede auf einen Blick:'],
        table: {
          headers: ['Kriterium', 'Klassischer HuS Struktogrammer', 'Eren Struktogrammer'],
          rows: [
            ['Java-Installation nötig?', 'Ja (JRE erforderlich)', 'Nein – 100 % ohne Java'],
            ['Browser-Version (iPad / Chromebook)', 'Nicht verfügbar', 'Sofort unter strukto.best-tools.app'],
            ['macOS (Apple Silicon M1–M4)', 'Eingeschränkt / veraltet', 'Natives Universal-Bundle (ARM + Intel)'],
            ['Dateiformate', '.stgp / .stgr', '.stgp / .stgr + Structorizer (.nsd) + XML/JSON'],
            ['UI & Barrierefreiheit', 'Feste Schriftgröße, kein Dark Mode', 'Dark/Light/System + stufenloser UI-Zoom'],
            ['Auto-Updater & 24h-Sharing', 'Nein', 'Signierter In-App-Updater & 24h-Link-Teilen'],
          ],
        },
      },
      {
        heading: '3. Alte .stgr- und .stgp-Dateien weiterverwenden',
        paragraphs: [
          'Der Umstieg kostet null Einarbeitung: Bestehende Arbeitsblätter, Projekte (.stgp) und Einzeldiagramme (.stgr) aus dem alten HuS Struktogrammer lassen sich direkt über Datei → Öffnen oder per Drag & Drop weiterbearbeiten.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: '1. Why Schools Are Switching from Classic HuS',
        paragraphs: [
          'Classic HuS Struktogrammer requires Java, cannot run on iPads or Chromebooks, and struggles with HiDPI scaling on modern macOS and Windows hardware.',
        ],
        table: {
          headers: ['Criteria', 'Classic HuS', 'Eren Struktogrammer'],
          rows: [
            ['Java required?', 'Yes', 'No'],
            ['Runs in browser?', 'No', 'Yes (strukto.best-tools.app)'],
            ['File formats', '.stgp / .stgr', '.stgp / .stgr + .nsd + XML/JSON'],
            ['Dark Mode & Zoom', 'No', 'Yes'],
          ],
        },
      },
    ],
  },
  {
    slug: 'struktogramm-vs-programmablaufplan-pap',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Struktogramm vs PAP', 'Programmablaufplan Unterschied', 'DIN 66261 vs DIN 66001'],
    keywordsEn: ['structogram vs flowchart', 'DIN 66261 vs DIN 66001'],
    titleDe: 'Struktogramm vs. Programmablaufplan (PAP / Flussdiagramm): Wann nutzt man was?',
    titleEn: 'Structogram vs. Flowchart (PAP): Which One Should You Use?',
    metaTitleDe: 'Struktogramm vs. Programmablaufplan (PAP) – Unterschiede & IHK-Tipps',
    metaTitleEn: 'Structogram (DIN 66261) vs. Flowchart – Key Differences',
    metaDescriptionDe:
      'Struktogramm (DIN 66261) oder Programmablaufplan (DIN 66001)? Alle Unterschiede, Vor- und Nachteile für Informatik-Unterricht und IHK-Abschlussprüfungen.',
    metaDescriptionEn:
      'Compare Nassi-Shneiderman structograms (DIN 66261) and flowcharts (DIN 66001) for school exams and software design.',
    excerptDe:
      'Beide Diagrammarten stellen Algorithmen dar – folgen aber völlig unterschiedlichen Regeln. Hier erfährst du, wann welches Diagramm besser passt.',
    excerptEn:
      'Both diagram types describe algorithms, yet follow very different rules. Learn when to use a structogram vs. a flowchart.',
    sectionsDe: [
      {
        heading: 'DIN 66261 vs. DIN 66001 im Überblick',
        paragraphs: [
          'In der Ausbildung zum Fachinformatiker (IHK) und im Informatik-Unterricht begegnen dir sowohl Struktogramme (DIN 66261) als auch Programmablaufpläne (DIN 66001). Während der PAP mit Rauten und Pfeilen arbeitet, erzwingt das Struktogramm saubere Blockstrukturen.',
        ],
        table: {
          headers: ['Merkmal', 'Struktogramm (DIN 66261)', 'Programmablaufplan / PAP (DIN 66001)'],
          rows: [
            ['Optik', 'Verschachtelte Rechtecke', 'Symbole (Oval, Rechteck, Raute) + Pfeile'],
            ['Sprünge (GOTO)', 'Unmöglich (strukturierte Blöcke)', 'Möglich (Pfeile können überall hin zeigen)'],
            ['Leserichtung', 'Immer von oben nach unten', 'Entlang der Pfeile'],
            ['Platzverbrauch', 'Sehr kompakt, passt gut auf A4', 'Wächst bei vielen Verzweigungen stark'],
            ['Prüfungs-Tipp', 'Ideal für Schleifen & Unterprogramme', 'Gut für grobe Prozessketten'],
          ],
        },
      },
    ],
    sectionsEn: [
      {
        heading: 'DIN 66261 vs. Flowcharts',
        paragraphs: [
          'Flowcharts connect shapes with arrows, allowing arbitrary jumps. Structograms enforce structured programming via nested boxes read top-to-bottom, making complex logic compact and printable.',
        ],
      },
    ],
  },
  {
    slug: 'informatik-abitur-struktogramme-tipps',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Struktogramm Informatik Abitur', 'IHK Struktogramm Tipps', 'Operatorenliste Struktogramm'],
    keywordsEn: ['structogram exam tips', 'computer science exam algorithm diagram'],
    titleDe: 'Struktogramme im Informatik-Abitur & in der Fachinformatiker-Prüfung meistern',
    titleEn: 'Mastering Structograms in Computer Science Exams',
    metaTitleDe: 'Struktogramme im Informatik-Abitur & IHK-Prüfung – Checkliste & Beispiel',
    metaTitleEn: 'Structograms in Computer Science Exams – Checklist & Example',
    metaDescriptionDe:
      'Die wichtigsten Regeln, Operatoren und typische Klausur-Algorithmen für das Informatik-Abitur und die IHK-Prüfung – inklusive Beispiel zur linearen Suche.',
    metaDescriptionEn:
      'Essential rules, operator conventions, and classic search algorithms for computer science school and vocational exams.',
    excerptDe:
      'Welche Operatoren werden im Abitur erwartet und wie vermeidest du unnötige Punktabzüge? Mit kompletter Checkliste und Such-Beispiel.',
    excerptEn:
      'Avoid common exam deductions with clean notation, clear loop bounds, and our linear-search example.',
    exampleDiagram: {
      id: 'blog-ex-search',
      name: 'lineareSuche(liste, ziel)',
      x: 40,
      y: 40,
      width: 460,
      zIndex: 1,
      nodes: [
        { id: 'f1', type: 'sequence', text: 'gefunden = falsch' },
        {
          id: 'f2',
          type: 'for',
          text: 'i = 0 bis laenge(liste) - 1',
          body: [
            {
              id: 'f3',
              type: 'if',
              text: 'liste[i] == ziel',
              trueLabel: 'wahr',
              falseLabel: 'falsch',
              thenBranch: [{ id: 'f4', type: 'sequence', text: 'gefunden = wahr' }],
              elseBranch: [],
            },
          ],
        },
        { id: 'f5', type: 'sequence', text: 'Rückgabe: gefunden' },
      ],
    },
    sectionsDe: [
      {
        heading: 'Checkliste für volle Punktzahl',
        paragraphs: [
          'In schriftlichen Prüfungen zählt neben der reinen Idee vor allem eine widerspruchsfreie, normgerechte Notation:',
        ],
        bullets: [
          'Einheitliche Operatoren nutzen (z. B. gemäß Operatorenliste Baden-Württemberg v2.2: Deklaration, Initialisierung, = vs. ==).',
          'Initialisierung vor der Schleife nie vergessen (z. B. summe = 0, gefunden = falsch).',
          'Array-Grenzen exakt angeben (0 bis laenge - 1 bzw. 1 bis n, nicht beides mischen).',
          'Große Aufgaben in Unterprogramme auslagern, statt 20 verschachtelte Kästen in ein Diagramm zu pressen.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Checklist for Full Marks',
        paragraphs: ['Exam graders focus on precision and consistency:'],
        bullets: [
          'Keep assignment (= or ←) and comparison (==) operators consistent.',
          'Always initialize accumulators and flags before loops.',
          'Check array index bounds carefully (0 to length - 1).',
          'Split complex tasks into clean subroutines.',
        ],
      },
    ],
  },
  {
    slug: 'unterprogramme-und-arrays-im-struktogramm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Unterprogramm Struktogramm', 'Array Struktogramm Beispiel', 'Maximum Suche Struktogramm'],
    keywordsEn: ['subroutine structogram', 'array traversal Nassi Shneiderman'],
    titleDe: 'Unterprogramme, Parameter & Arrays sauber im Struktogramm darstellen',
    titleEn: 'Subroutines, Parameters & Arrays in Structograms',
    metaTitleDe: 'Unterprogramme & Arrays im Struktogramm (DIN 66261) mit Beispiel',
    metaTitleEn: 'Subroutines & Arrays in DIN 66261 Structograms',
    metaDescriptionDe:
      'So stellst du Unterprogramm-Aufrufe, Parameterlisten und Array-Durchläufe (Maximum-Suche) übersichtlich als Struktogramm nach DIN 66261 dar.',
    metaDescriptionEn:
      'How to model subroutine calls, parameter lists, and array traversals cleanly in DIN 66261 structograms.',
    excerptDe:
      'Große Algorithmen gehören in Unterprogramme aufgeteilt. Mit Beispiel zur Maximum-Suche in einem Array.',
    excerptEn:
      'Modularize large algorithms with subroutines and learn how to traverse arrays cleanly using a find-maximum example.',
    exampleDiagram: {
      id: 'blog-ex-max',
      name: 'findeMaximum(zahlen)',
      x: 40,
      y: 40,
      width: 460,
      zIndex: 1,
      nodes: [
        { id: 'm1', type: 'sequence', text: 'max = zahlen[0]' },
        {
          id: 'm2',
          type: 'for',
          text: 'i = 1 bis laenge(zahlen) - 1',
          body: [
            {
              id: 'm3',
              type: 'if',
              text: 'zahlen[i] > max',
              trueLabel: 'wahr',
              falseLabel: 'falsch',
              thenBranch: [{ id: 'm4', type: 'sequence', text: 'max = zahlen[i]' }],
              elseBranch: [],
            },
          ],
        },
        { id: 'm5', type: 'sequence', text: 'Rückgabe: max' },
      ],
    },
    sectionsDe: [
      {
        heading: 'Modularisierung auf der 2D-Arbeitsfläche',
        paragraphs: [
          'Das Unterprogramm-Symbol erkennst du in DIN 66261 an den doppelten senkrechten Balken links und rechts. Es zeigt an: Hier wird eine ausgelagerte Funktion aufgerufen.',
          'In Eren Struktogrammer kannst du Hauptprogramm und alle Unterprogramme einfach nebeneinander auf derselben 2D-Arbeitsfläche platzieren und als ein Projekt speichern.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Modularizing on a 2D Canvas',
        paragraphs: [
          'A subroutine block has double vertical side bars. In Eren Struktogrammer, you can place your main program and every helper function side by side on the same 2D workspace.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-in-python-java-umwandeln',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm in Python umwandeln', 'Struktogramm in Java übersetzen', 'Struktogramm zu Code'],
    keywordsEn: ['convert structogram to Python', 'structogram to Java code'],
    titleDe: 'Struktogramm in Python, Java & Pseudocode übersetzen (mit Code-Beispielen)',
    titleEn: 'Translating Structograms into Python, Java & Pseudocode',
    metaTitleDe: 'Struktogramm in Python & Java übersetzen – Schritt für Schritt',
    metaTitleEn: 'How to Translate a Structogram into Python or Java Code',
    metaDescriptionDe:
      'So übersetzt du jedes Struktogramm (Sequenz, Verzweigung, Schleifen) fehlerfrei Zeile für Zeile in Python oder Java – mit direktem Code-Vergleich.',
    metaDescriptionEn:
      'Translate any DIN 66261 structogram line-by-line into clean Python or Java code with side-by-side examples.',
    excerptDe:
      'Von den Blöcken zum laufenden Programm: Wir zeigen an einem konkreten Beispiel, wie aus jedem DIN-66261-Element sauberer Python- und Java-Code wird.',
    excerptEn:
      'From nested blocks to working code: learn the exact mapping from DIN 66261 elements to Python and Java.',
    sectionsDe: [
      {
        heading: '1. Die Übersetzungs-Regel: Von außen nach innen, von oben nach unten',
        paragraphs: [
          'Das Schöne am Struktogramm ist, dass die Einrückung im Code exakt der Verschachtelung der Kästen entspricht. Jeder Kasten wird einfach von oben nach unten abgearbeitet:',
        ],
        table: {
          headers: ['Struktogramm-Element', 'Python-Äquivalent', 'Java-Äquivalent'],
          rows: [
            ['Sequenz', 'normale Anweisung', 'Anweisung mit ;'],
            ['Verzweigung (If/Else)', 'if bedingung: ... else: ...', 'if (bedingung) { ... } else { ... }'],
            ['Kopfgesteuerte Schleife', 'while bedingung:', 'while (bedingung) { ... }'],
            ['Fußgesteuerte Schleife', 'while True: ... if not bed: break', 'do { ... } while (bedingung);'],
            ['Zählschleife', 'for i in range(start, ende + 1):', 'for (int i = start; i <= ende; i++) { ... }'],
          ],
        },
      },
      {
        heading: '2. Beispiel: Gerade Zahlen von 1 bis n summieren',
        paragraphs: ['Hier siehst du, wie derselbe Algorithmus in Python aussieht:'],
        codeBlock: {
          language: 'python',
          code: `def summe_gerade(n):
    summe = 0
    for i in range(1, n + 1):
        if i % 2 == 0:
            summe = summe + i
    return summe`,
        },
      },
    ],
    sectionsEn: [
      {
        heading: '1. Top-to-Bottom, Outer-to-Inner Mapping',
        paragraphs: [
          'Every nested box in a structogram maps 1:1 to an indented block in Python or a curly-brace block in Java.',
        ],
        codeBlock: {
          language: 'python',
          code: `def sum_even(n):
    total = 0
    for i in range(1, n + 1):
        if i % 2 == 0:
            total += i
    return total`,
        },
      },
    ],
  },
  {
    slug: 'sortieralgorithmen-bubblesort-selectionsort-struktogramm',
    date: '2026-11-22',
    readTimeMin: 7,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Bubblesort Struktogramm', 'Sortieralgorithmus Struktogramm', 'Selectionsort DIN 66261'],
    keywordsEn: ['Bubble Sort structogram', 'sorting algorithm Nassi Shneiderman'],
    titleDe: 'Sortieralgorithmen im Struktogramm: Bubblesort Schritt für Schritt',
    titleEn: 'Sorting Algorithms in Structograms: Bubble Sort Step by Step',
    metaTitleDe: 'Bubblesort als Struktogramm (DIN 66261) – Erklärung & Live-Beispiel',
    metaTitleEn: 'Bubble Sort Structogram (DIN 66261) – Step-by-Step & Live Example',
    metaDescriptionDe:
      'Bubblesort perfekt als Struktogramm verstehen: Verschachtelte Zählschleifen, Nachbarvergleich und Dreieckstausch mit Live-Diagramm zum Öffnen.',
    metaDescriptionEn:
      'Understand Bubble Sort as a DIN 66261 structogram: nested loops, adjacent comparison, and temp-variable swap with a live diagram.',
    excerptDe:
      'Sortieralgorithmen sind der Klassiker im Informatik-Abitur. Hier siehst du Bubblesort mit zwei verschachtelten Schleifen und Dreieckstausch als fertiges Struktogramm.',
    excerptEn:
      'Sorting algorithms are a staple of computer science exams. Explore Bubble Sort with nested loops and a swap step.',
    exampleDiagram: {
      id: 'blog-ex-bubblesort',
      name: 'bubbleSort(arr)',
      x: 40,
      y: 40,
      width: 500,
      zIndex: 1,
      nodes: [
        {
          id: 'b1',
          type: 'for',
          text: 'i = 0 bis laenge(arr) - 2',
          body: [
            {
              id: 'b2',
              type: 'for',
              text: 'j = 0 bis laenge(arr) - 2 - i',
              body: [
                {
                  id: 'b3',
                  type: 'if',
                  text: 'arr[j] > arr[j + 1]',
                  trueLabel: 'wahr',
                  falseLabel: 'falsch',
                  thenBranch: [
                    { id: 'b4', type: 'sequence', text: 'temp = arr[j]' },
                    { id: 'b5', type: 'sequence', text: 'arr[j] = arr[j + 1]' },
                    { id: 'b6', type: 'sequence', text: 'arr[j + 1] = temp' },
                  ],
                  elseBranch: [],
                },
              ],
            },
          ],
        },
      ],
    },
    sectionsDe: [
      {
        heading: '1. So funktioniert Bubblesort',
        paragraphs: [
          'Bubblesort vergleicht benachbarte Elemente im Array. Ist das linke Element größer als das rechte, werden beide über eine Hilfsvariable „temp“ (Dreieckstausch) vertauscht.',
          'Nach jedem äußeren Durchlauf steht das größte verbleibende Element bereits ganz hinten – deshalb läuft die innere Schleife jeweils um i kürzer.',
        ],
      },
      {
        heading: '2. Der Dreieckstausch als typische Prüfungsfrage',
        paragraphs: [
          'Achte beim Tauschen zweier Array-Werte immer auf die drei Zeilen mit „temp“. Schreibt man direkt arr[j] = arr[j+1], geht der ursprüngliche Wert von arr[j] verloren!',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: '1. How Bubble Sort Works',
        paragraphs: [
          'Bubble Sort repeatedly steps through the array, compares adjacent elements, and swaps them using a temporary variable if they are in the wrong order.',
        ],
      },
    ],
  },
  {
    slug: 'rekursion-im-struktogramm-erklaert',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Rekursion Struktogramm', 'rekursives Unterprogramm DIN 66261', 'Fakultät Rekursion Struktogramm'],
    keywordsEn: ['recursion structogram', 'recursive subroutine DIN 66261'],
    titleDe: 'Rekursion im Struktogramm darstellen: Abbruchbedingung & Selbstaufruf',
    titleEn: 'Representing Recursion in Structograms: Base Case & Recursive Call',
    metaTitleDe: 'Rekursion im Struktogramm (DIN 66261) – Fakultät-Beispiel',
    metaTitleEn: 'Recursion in DIN 66261 Structograms – Factorial Example',
    metaDescriptionDe:
      'Wie zeichnet man eine rekursive Funktion im Struktogramm? Alles über Basisfall (Abbruchbedingung) und Unterprogramm-Selbstaufruf am Beispiel der Fakultät.',
    metaDescriptionEn:
      'Learn how to model recursive functions in a DIN 66261 structogram using base cases and subroutine self-calls.',
    excerptDe:
      'Kann ein Struktogramm Rekursion darstellen? Ja – über das Unterprogramm-Symbol und eine saubere Verzweigung für den Basisfall.',
    excerptEn:
      'Can a structogram show recursion? Yes — using a branch for the base case and a subroutine block for the recursive call.',
    exampleDiagram: {
      id: 'blog-ex-rekursion',
      name: 'fakRekursiv(n)',
      x: 40,
      y: 40,
      width: 480,
      zIndex: 1,
      nodes: [
        {
          id: 'r1',
          type: 'if',
          text: 'n <= 1',
          trueLabel: 'wahr',
          falseLabel: 'falsch',
          thenBranch: [{ id: 'r2', type: 'sequence', text: 'Rückgabe: 1' }],
          elseBranch: [
            { id: 'r3', type: 'subroutine', text: 'teil = fakRekursiv(n - 1)' },
            { id: 'r4', type: 'sequence', text: 'Rückgabe: n * teil' },
          ],
        },
      ],
    },
    sectionsDe: [
      {
        heading: 'Rekursion = Basisfall + Selbstaufruf im Unterprogramm',
        paragraphs: [
          'Jede rekursive Funktion braucht zwingend zwei Teile: eine Abbruchbedingung (Basisfall, z. B. n <= 1), die sofort einen Wert zurückgibt, und den rekursiven Schritt, in dem sich die Funktion selbst mit einem kleineren Problem aufruft.',
          'Im Struktogramm wird der Selbstaufruf einfach als Unterprogramm-Kasten (doppelte Seitenlinien) im „falsch“-Zweig notiert.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Base Case + Recursive Call',
        paragraphs: [
          'Every recursive algorithm needs a base case that terminates recursion and a recursive step calling itself on a smaller input using the subroutine block.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-exportieren-svg-png-pdf-word',
    date: '2026-11-22',
    readTimeMin: 4,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm in Word einfügen', 'Struktogramm SVG PNG PDF Export', 'Struktogramm Screenshot'],
    keywordsEn: ['export structogram SVG PNG PDF', 'insert structogram in Word PowerPoint'],
    titleDe: 'Struktogramm perfekt in Word, PowerPoint, LaTeX & PDF einfügen (SVG vs. PNG)',
    titleEn: 'Inserting Structograms into Word, PowerPoint, LaTeX & PDF (SVG vs. PNG)',
    metaTitleDe: 'Struktogramm in Word, PowerPoint & LaTeX einfügen (SVG, PNG, PDF)',
    metaTitleEn: 'Best Way to Export Structograms for Word, Slides & LaTeX',
    metaDescriptionDe:
      'Welches Exportformat für welchen Zweck? Wann SVG, wann hochauflösendes PNG (2x/3x) und wie der 1-Klick-Screenshot in Eren Struktogrammer funktioniert.',
    metaDescriptionEn:
      'Choose the right export format: crisp vector SVG, high-DPI PNG (2x/3x), PDF print, or 1-click clipboard screenshot.',
    excerptDe:
      'Nie wieder pixelige Struktogramme in Abgaben oder Präsentationen: Welches Format (SVG, PNG 3x, PDF oder 1-Klick-Screenshot) wann optimal ist.',
    excerptEn:
      'Never paste blurry structograms into documents again: learn when to pick SVG, high-DPI PNG, PDF, or 1-click screenshot.',
    sectionsDe: [
      {
        heading: 'Welches Format für welches Dokument?',
        paragraphs: ['Je nachdem, wo dein Struktogramm landen soll, lohnt sich ein anderes Format:'],
        table: {
          headers: ['Ziel-Dokument', 'Empfohlenes Format', 'Warum?'],
          rows: [
            ['Microsoft Word / LibreOffice', 'SVG oder PNG (3x)', 'SVG skaliert unendlich scharf; PNG 3x funktioniert auch in älteren Office-Versionen'],
            ['PowerPoint / Keynote / Google Docs', '1-Klick-Screenshot oder PNG 2x', 'Direkt per Strg+V einfügen ohne Datei speichern zu müssen'],
            ['LaTeX / Wissenschaftliche Arbeit', 'SVG → PDF oder SVG direkt', 'Gestochen scharfe Vektorlinien im Druck'],
            ['Direkte Abgabe / Druck', 'Datei → Drucken / PDF', 'Sauberes Seitenlayout inkl. Hoch-/Querformat'],
          ],
        },
      },
    ],
    sectionsEn: [
      {
        heading: 'Choosing the Best Export Format',
        paragraphs: [
          'Use vector SVG for infinite print sharpness in Word or LaTeX, 2x/3x PNG for slides, or the 1-click clipboard screenshot to paste straight into documents.',
        ],
      },
    ],
  },
  {
    slug: 'structorizer-nsd-dateien-konvertieren-oeffnen',
    date: '2026-11-22',
    readTimeMin: 4,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Structorizer nsd öffnen', 'stgr online öffnen', 'nsd Datei konvertieren'],
    keywordsEn: ['open nsd file online', 'Structorizer file browser', 'stgr stgp online'],
    titleDe: 'Structorizer (.nsd) & HuS (.stgr / .stgp) Dateien direkt im Browser öffnen',
    titleEn: 'Open Structorizer (.nsd) & HuS (.stgr / .stgp) Files Directly in Your Browser',
    metaTitleDe: '.nsd (Structorizer) & .stgr/.stgp Dateien online öffnen und bearbeiten',
    metaTitleEn: 'Open .nsd and .stgr/.stgp Structogram Files Online',
    metaDescriptionDe:
      'So öffnest und bearbeitest du bestehende Structorizer-Dateien (.nsd) sowie HuS-Struktogrammer-Projekte (.stgp, .stgr) ohne Installation direkt im Browser.',
    metaDescriptionEn:
      'Import and edit existing Structorizer (.nsd) and HuS Struktogrammer (.stgp, .stgr) files right in your browser or desktop app.',
    excerptDe:
      'Du hast noch alte .nsd-Dateien aus Structorizer oder .stgr/.stgp-Dateien aus der Schule? So öffnest du sie in Sekunden ohne Java.',
    excerptEn:
      'Have existing .nsd files from Structorizer or .stgr/.stgp files from school? Open and edit them in seconds without Java.',
    sectionsDe: [
      {
        heading: 'Unterstützte Formate beim Öffnen & Speichern',
        paragraphs: [
          'Eren Struktogrammer unterstützt alle gängigen Struktogramm-Dateiformate direkt über „Datei → Öffnen“ oder per Drag & Drop auf die Arbeitsfläche:',
        ],
        bullets: [
          '.stgp (Projektdatei): Speichert mehrere Diagramme mitsamt Positionen auf der 2D-Arbeitsfläche, globalem Stil und Druckeinstellungen.',
          '.stgr (Einzeldiagramm): Klassisches Einzel-Struktogramm (kompatibel zum HuS Struktogrammer).',
          '.nsd / .xml (Structorizer): Importiert bestehende Structorizer-Diagramme inklusive Schleifen, Verzweigungen und Switch-Case-Blöcken.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Supported File Formats',
        paragraphs: [
          'Open .stgp project files, .stgr single diagrams, and Structorizer .nsd / .xml files directly via File → Open or drag-and-drop.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-typische-fehler-vermeiden',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Struktogramm Fehler vermeiden', 'häufige Fehler Struktogramm', 'DIN 66261 Regeln'],
    keywordsEn: ['common structogram mistakes', 'DIN 66261 rules'],
    titleDe: 'Die 7 häufigsten Fehler bei Struktogrammen in Schule & Ausbildung vermeiden',
    titleEn: '7 Common Structogram Mistakes in School & Exams (and How to Avoid Them)',
    metaTitleDe: 'Die 7 häufigsten Struktogramm-Fehler in Schule & IHK-Prüfung',
    metaTitleEn: '7 Common Structogram Mistakes to Avoid in Exams',
    metaDescriptionDe:
      'Vermeide typische Punktabzüge bei Struktogrammen: Start/Stopp-Kästen, Pfeile, fehlende Zähler-Updates, vertauschte Schleifentypen und unklare Zuweisungen.',
    metaDescriptionEn:
      'Avoid the most frequent structogram mistakes: arrows, Start/End boxes, missing loop updates, and inconsistent operators.',
    excerptDe:
      'Diese 7 Flüchtigkeitsfehler kosten in Informatik-Klausuren regelmäßig Punkte — mit unserer Checkliste passieren sie dir nie wieder.',
    excerptEn:
      'These 7 common mistakes cost marks in computer science exams — learn how to spot and fix them quickly.',
    sectionsDe: [
      {
        heading: 'Diese 7 Fehler kosten am häufigsten Punkte',
        paragraphs: ['Prüfe dein Struktogramm vor der Abgabe kurz gegen diese sieben Punkte:'],
        bullets: [
          '1. Pfeile gezeichnet: Struktogramme haben niemals Pfeile – das gehört in den PAP.',
          '2. Start/Ende-Kasten gemalt: Der äußere Rahmen ist bereits Anfang und Ende.',
          '3. Endlosschleife gebaut: In der while-Schleife vergessen, die Zählvariable zu erhöhen.',
          '4. Kopf- und fußgesteuerte Schleife verwechselt: Bei Benutzereingaben, die mind. 1x laufen müssen, gehört die Bedingung nach unten.',
          '5. = und == vermischt: Zuweisung und Vergleich müssen klar unterscheidbar sein.',
          '6. Zähler-Bereich falsch: „0 bis laenge“ statt „0 bis laenge - 1“ führt zum Index-Überlauf.',
          '7. Kein „sonst“-Zweig bei Switch-Case: Unerwartete Werte sollten sauber abgefangen werden.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'The 7 Mistakes to Watch Out For',
        paragraphs: ['Double-check your diagram against these seven points before submitting:'],
        bullets: [
          '1. Drawing arrows (structograms never use arrows).',
          '2. Adding Start/End ovals.',
          '3. Forgetting to update the loop variable inside a while loop.',
          '4. Using a while loop instead of do-while when at least one execution is required.',
          '5. Mixing assignment and equality operators.',
          '6. Off-by-one array bounds.',
          '7. Missing a default branch in Switch-Case.',
        ],
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
