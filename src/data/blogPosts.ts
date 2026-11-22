import type { StruktogrammDocument } from '../model/types';

export interface BlogSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface BlogPost {
  slug: string;
  date: string;
  readTimeMin: number;
  category: 'guide' | 'comparison' | 'exam';
  categoryDe: string;
  categoryEn: string;
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
  exampleDiagram?: StruktogrammDocument;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'struktogramm-erstellen-anleitung',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    titleDe: 'Struktogramm erstellen: Schritt-für-Schritt-Anleitung mit Beispielen',
    titleEn: 'How to Create a Structogram: Step-by-Step Guide with Examples',
    metaTitleDe: 'Struktogramm erstellen – Schritt-für-Schritt-Anleitung (DIN 66261)',
    metaTitleEn: 'How to Create a Structogram – Step-by-Step Guide (DIN 66261)',
    metaDescriptionDe:
      'Lerne, wie man ein Struktogramm nach DIN 66261 Schritt für Schritt erstellt: von der Eingabe über Verzweigung bis zur Ausgabe – mit interaktivem Beispiel.',
    metaDescriptionEn:
      'Learn how to create a DIN 66261 Nassi-Shneiderman structogram step by step: from input and branching to output, with an interactive example.',
    excerptDe:
      'Wie plant man einen Algorithmus sauber als Struktogramm? Diese Anleitung zeigt dir den genauen Ablauf anhand eines Notenrechner-Beispiels nach DIN 66261.',
    excerptEn:
      'How do you plan an algorithm cleanly as a structogram? This step-by-step guide walks through a complete grade calculator example in DIN 66261.',
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
          thenBranch: [
            { id: 'n4', type: 'sequence', text: 'note = "Bestanden"' },
          ],
          elseBranch: [
            { id: 'n5', type: 'sequence', text: 'note = "Nicht bestanden"' },
          ],
        },
        { id: 'n6', type: 'sequence', text: 'Ausgabe: note' },
      ],
    },
    sectionsDe: [
      {
        heading: '1. Was ist ein Struktogramm eigentlich?',
        paragraphs: [
          'Ein Struktogramm (auch Nassi-Shneiderman-Diagramm nach DIN 66261) stellt den Ablauf eines Algorithmus grafisch als verschachtelte Blöcke dar. Anders als beim Flussdiagramm gibt es keine Pfeile – die Ausführungsreihenfolge läuft immer streng von oben nach unten.',
          'Dadurch sind unübersichtliche Sprünge („Spaghetti-Code“) von vornherein ausgeschlossen. Jede Kontrollstruktur ist ein eigener Kasten, der andere Kästen umschließt.',
        ],
      },
      {
        heading: '2. In 4 Schritten zum fertigen Struktogramm',
        paragraphs: [
          'Am einfachsten gehst du nach dem EVA-Prinzip (Eingabe – Verarbeitung – Ausgabe) vor:',
        ],
        bullets: [
          'Schritt 1 (Variablen & Eingabe): Welche Werte braucht das Programm? Lege sie mit „Deklaration“ und „Einlesen“ als Sequenz ganz oben an.',
          'Schritt 2 (Entscheidungen): Gibt es Bedingungen wie „punkte >= 50“? Nutze dafür eine Verzweigung (Ja/Nein) oder eine Fallunterscheidung (Switch-Case).',
          'Schritt 3 (Wiederholungen): Muss etwas mehrfach passieren? Wähle je nach Situation Kopf-, Fuß- oder Zählschleife.',
          'Schritt 4 (Ausgabe): Zeige das Ergebnis am Ende über eine Sequenz („Ausgabe: ...“) an.',
        ],
      },
      {
        heading: '3. Praxis-Beispiel: Notenrechner',
        paragraphs: [
          'Im Beispiel unten liest das Programm eine Punktzahl ein, prüft mit einer Verzweigung ob mindestens 50 Punkte erreicht wurden und gibt anschließend „Bestanden“ oder „Nicht bestanden“ aus. Du kannst das Beispiel direkt in den Editor laden und weiterbearbeiten.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: '1. What Is a Structogram?',
        paragraphs: [
          'A structogram (Nassi-Shneiderman diagram, DIN 66261) visualizes an algorithm using nested rectangular blocks. Unlike flowcharts, there are no arrows — control flow always runs strictly from top to bottom.',
          'This prevents unstructured jumps (“spaghetti code”) by design. Every control structure is a self-contained box.',
        ],
      },
      {
        heading: '2. Four Steps to a Clean Structogram',
        paragraphs: ['Follow the classic Input–Process–Output pattern:'],
        bullets: [
          'Step 1 (Declare & Read): Define required variables and inputs as sequences at the top.',
          'Step 2 (Decisions): Model conditions with an If/Else branch or a Switch-Case block.',
          'Step 3 (Loops): Repeat steps cleanly using While, Do-While, or For loops.',
          'Step 4 (Output): Display or return the final result at the bottom.',
        ],
      },
      {
        heading: '3. Practical Example: Grade Checker',
        paragraphs: [
          'Below you can see a complete grade-checking diagram. Click “Open Example in Editor” to load and modify it immediately.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-schleifen-erklaert',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    titleDe: 'Struktogramm-Schleifen erklärt: Kopfgesteuert, Fußgesteuert & Zählschleife',
    titleEn: 'Structogram Loops Explained: While, Do-While & For Loops',
    metaTitleDe: 'Schleifen im Struktogramm (DIN 66261): Kopf-, Fuß- & Zählschleife',
    metaTitleEn: 'Loops in Structograms (DIN 66261): While, Do-While & For Explained',
    metaDescriptionDe:
      'Wann nutzt man im Struktogramm eine kopfgesteuerte Schleife, wann eine fußgesteuerte und wann eine Zählschleife? Alle 3 Schleifentypen mit Beispielen.',
    metaDescriptionEn:
      'When should you use a while, do-while, or for loop in a structogram? Clear DIN 66261 comparison with a factorial calculation example.',
    excerptDe:
      'Kopfgesteuert, fußgesteuert oder Zählschleife? Wir erklären die Unterschiede nach DIN 66261 und zeigen, welche Schleife in welcher Aufgabe die richtige ist.',
    excerptEn:
      'While, do-while, or for loop? Learn the exact DIN 66261 differences and when to pick each loop type in exams and projects.',
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
          body: [
            { id: 'l3', type: 'sequence', text: 'ergebnis = ergebnis * i' },
          ],
        },
        { id: 'l4', type: 'sequence', text: 'Ausgabe: ergebnis' },
      ],
    },
    sectionsDe: [
      {
        heading: 'Die drei Schleifenarten nach DIN 66261',
        paragraphs: [
          'In der Schule und Ausbildung begegnen dir genau drei Schleifentypen. Der Unterschied liegt darin, wann die Bedingung geprüft wird und ob die Anzahl der Durchläufe vorher bekannt ist:',
        ],
        table: {
          headers: ['Schleifentyp', 'Prüfzeitpunkt', 'Mindest-Durchläufe', 'Typischer Einsatz'],
          rows: [
            ['Kopfgesteuerte Schleife (while)', 'Vor jedem Durchlauf', '0-mal', 'Unbekannte Anzahl, z. B. Datei bis Ende lesen'],
            ['Fußgesteuerte Schleife (do-while)', 'Nach jedem Durchlauf', '1-mal', 'Eingabevalidierung (mind. 1x fragen)'],
            ['Zählschleife (for)', 'Automatisch über Zähler', '0-mal oder N-mal', 'Bekannte Anzahl, z. B. Array durchlaufen'],
          ],
        },
      },
      {
        heading: 'Häufige Prüfungsfalle: Kopf vs. Fuß',
        paragraphs: [
          'Bei der kopfgesteuerten Schleife steht die Bedingung oben im Balken – ist sie von Anfang an falsch, wird der Schleifenrumpf gar nicht ausgeführt.',
          'Bei der fußgesteuerten Schleife steht die Bedingung unten – der Rumpf läuft also immer mindestens einmal, bevor geprüft wird, ob wiederholt werden soll.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'The Three Loop Types in DIN 66261',
        paragraphs: [
          'Depending on when the condition is checked and whether the iteration count is known beforehand, you choose between three loop structures:',
        ],
        table: {
          headers: ['Loop Type', 'Condition Check', 'Min Iterations', 'Typical Use Case'],
          rows: [
            ['While Loop (head-controlled)', 'Before each iteration', '0 times', 'Unknown length (e.g. reading until EOF)'],
            ['Do-While Loop (tail-controlled)', 'After each iteration', '1 time', 'User input validation (ask at least once)'],
            ['For Loop (counting loop)', 'Counter-based', '0 or N times', 'Known count or array traversal'],
          ],
        },
      },
      {
        heading: 'Common Exam Pitfall',
        paragraphs: [
          'Remember: a head-controlled (while) loop can execute zero times if its condition is initially false, whereas a tail-controlled (do-while) loop always executes its body at least once.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-verzweigung-switch-case',
    date: '2026-11-22',
    readTimeMin: 4,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    titleDe: 'Verzweigung (If/Else) & Fallunterscheidung (Switch-Case) im Struktogramm',
    titleEn: 'Branches (If/Else) & Switch-Case in Structograms',
    metaTitleDe: 'Verzweigung & Fallunterscheidung im Struktogramm erklärt',
    metaTitleEn: 'If/Else Branch & Switch-Case in DIN 66261 Structograms',
    metaDescriptionDe:
      'So zeichnest du einfache Verzweigungen (If/Else) und Mehrfach-Fallunterscheidungen (Switch-Case) korrekt nach DIN 66261 – inklusive Beispiel.',
    metaDescriptionEn:
      'Learn how to draw binary If/Else branches and multi-way Switch-Case blocks cleanly in DIN 66261 structograms.',
    excerptDe:
      'Wann reicht eine einfache Verzweigung und wann ist eine Fallunterscheidung viel übersichtlicher? Mit direktem Rabatt-Beispiel zum Nachbauen.',
    excerptEn:
      'When should you use a binary If/Else branch vs. a multi-way Switch-Case block? Includes a discount tier example.',
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
        heading: 'Einfache Verzweigung (If / Else)',
        paragraphs: [
          'Eine Verzweigung teilt den Ablauf über ein Dreieck-Symbol im Kopf in zwei Spalten: „wahr“ (links) und „falsch“ (rechts). Bleibt ein Zweig leer (reines „If“ ohne „Else“), kennzeichnet man ihn in DIN 66261 meist leer oder mit einem Strich.',
        ],
      },
      {
        heading: 'Fallunterscheidung (Switch / Case)',
        paragraphs: [
          'Wenn eine einzelne Variable auf mehrere feste Werte geprüft wird (z. B. Wochentag 1–7, Menüpunkt A/B/C oder Tarif S/M/L), ist die Fallunterscheidung deutlich sauberer als drei verschachtelte If-Else-Blöcke. Im Eren Struktogrammer kannst du beliebig viele Fälle plus einen „sonst“-Zweig (Default) anlegen.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Binary Branch (If / Else)',
        paragraphs: [
          'A binary branch splits execution via diagonal header lines into “true” (left) and “false” (right). If there is no Else action, the false column stays empty.',
        ],
      },
      {
        heading: 'Multi-Way Switch-Case',
        paragraphs: [
          'Whenever one expression is checked against multiple fixed values (like menu choices or tier codes), a Switch-Case block is far cleaner than deeply nested If/Else statements.',
        ],
      },
    ],
  },
  {
    slug: 'besser-als-nassi-online-editoren',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'comparison',
    categoryDe: 'Vergleich',
    categoryEn: 'Comparison',
    titleDe: 'Warum Eren Struktogrammer besser ist als klassische Nassi Online-Editoren',
    titleEn: 'Why Eren Struktogrammer Is Better Than Classic Nassi Online Editors',
    metaTitleDe: 'Warum Eren Struktogrammer besser ist als Nassi Online-Editoren',
    metaTitleEn: 'Why Eren Struktogrammer Beats Classic Online Nassi Editors',
    metaDescriptionDe:
      'Vergleich mit typischen Online-Nassi-Editoren: 2D-Arbeitsfläche, mehrere Diagramme pro Projekt, 1-Klick-Screenshot, Abitur-Operatoren, Desktop-Apps und 24h-Link-Teilen.',
    metaDescriptionEn:
      'See how Eren Struktogrammer compares to basic online Nassi-Shneiderman editors: multi-diagram 2D canvas, 1-click screenshot, native desktop apps, and encrypted 24h sharing.',
    excerptDe:
      'Viele Online-Editoren für Nassi-Shneiderman-Diagramme sind langsam, überladen oder auf ein einziges Diagramm beschränkt. Hier sind die konkreten Vorteile im Überblick.',
    excerptEn:
      'Many online Nassi-Shneiderman editors feel clunky or restrict you to a single diagram. Here is why Eren Struktogrammer is built differently.',
    sectionsDe: [
      {
        heading: 'Wo klassische Online-Nassi-Editoren nerven',
        paragraphs: [
          'Wer im Unterricht schnell ein Struktogramm zeichnen will, kennt die typischen Schwächen vieler Online-Tools: Man kann nur ein einziges Diagramm bearbeiten, die Bedienung per Klick-Menüs ist hakelig, beim Export fehlen scharfe SVGs oder der Dark Mode blendet nicht ab.',
        ],
        table: {
          headers: ['Funktion', 'Typische Nassi Online-Editoren', 'Eren Struktogrammer'],
          rows: [
            ['Mehrere Diagramme gleichzeitig', 'Meist nur 1 Diagramm', 'Unbegrenzte 2D-Arbeitsfläche + Projekt-Tabs'],
            ['Export & Zwischenablage', 'Oft nur unscharfes PNG', 'Vektor-SVG, PNG (1x/2x/3x), PDF & 1-Klick-Screenshot'],
            ['Abitur-Operatoren', 'Nicht vorhanden', 'Integrierte BW-Abitur-Operatorenliste v2.2 + eigene'],
            ['Desktop-App (Offline)', 'Nur Webseite', 'Native Apps für Windows, macOS & Linux'],
            ['Teilen im Unterricht', 'Datei umständlich mailen', 'Ende-zu-Ende-verschlüsselter 24h-Link in 1 Klick'],
            ['Datenschutz & Werbung', 'Oft Werbung / Tracker', '100 % lokal, kostenlos, Open Source, ohne Konto'],
          ],
        },
      },
      {
        heading: 'Gebaut für echten Unterricht & Abitur-Tempo',
        paragraphs: [
          'Eren Struktogrammer verbindet die Direktheit moderner Web-Tools mit der Genauigkeit der deutschen DIN 66261-Norm. Tastenkürzel, Undo/Redo, Live-Breitenanpassung und der Import bestehender .stgr/.nsd-Dateien sparen in Klausuren und Übungen enorm viel Zeit.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Where Basic Online Nassi Editors Fall Short',
        paragraphs: [
          'Many web-based structogram editors only support a single diagram, lack crisp vector exports, or require tedious clicking. Eren Struktogrammer was designed from scratch to solve all of these pain points.',
        ],
        table: {
          headers: ['Feature', 'Basic Online Editors', 'Eren Struktogrammer'],
          rows: [
            ['Multi-Diagram Workspace', 'Usually 1 diagram only', '2D canvas + multi-project tabs'],
            ['Export & Clipboard', 'Often blurry PNG only', 'Crisp SVG, PNG (1x/2x/3x), PDF & 1-click screenshot'],
            ['Desktop Apps', 'Browser-only', 'Native Windows, macOS & Linux apps'],
            ['Quick Classroom Sharing', 'Manual file uploads', 'End-to-end encrypted 24h share links'],
            ['Privacy & Cost', 'Ads or logins', 'Free, open source, local-first, no login'],
          ],
        },
      },
    ],
  },
  {
    slug: 'vergleich-eren-struktogrammer-vs-hus',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'comparison',
    categoryDe: 'Vergleich',
    categoryEn: 'Comparison',
    titleDe: 'Eren Struktogrammer vs. klassischer HuS Struktogrammer: Der direkte Vergleich',
    titleEn: 'Eren Struktogrammer vs. Classic HuS Struktogrammer: Direct Comparison',
    metaTitleDe: 'Eren Struktogrammer vs. HuS Struktogrammer – Vergleich & Migration',
    metaTitleEn: 'Eren Struktogrammer vs. Classic HuS Struktogrammer Comparison',
    metaDescriptionDe:
      'Direkter Vergleich zwischen dem klassischen HuS Struktogrammer und Eren Struktogrammer: Java-Freiheit, macOS-Support, Dateikompatibilität (.stgp/.stgr) und neue Features.',
    metaDescriptionEn:
      'Compare classic HuS Struktogrammer with Eren Struktogrammer: no Java required, native macOS & Windows support, file compatibility (.stgp/.stgr), and modern UX.',
    excerptDe:
      'Lohnt sich der Umstieg vom klassischen HuS Struktogrammer? Wir vergleichen Bedienung, Systemvoraussetzungen, Dateiformate und Exportfunktionen Punkt für Punkt.',
    excerptEn:
      'Should you switch from classic HuS Struktogrammer? Here is a point-by-point comparison of usability, platform support, and file compatibility.',
    sectionsDe: [
      {
        heading: 'Warum viele Schulen eine Alternative zu HuS suchen',
        paragraphs: [
          'Der klassische HuS Struktogrammer hat die DIN-66261-Darstellung in deutschen Schulen geprägt – setzt aber auf Java, hat Probleme auf modernen macOS-Systemen (Apple Silicon), HiDPI-Bildschirmen und Schul-iPads bzw. Chromebooks.',
        ],
        table: {
          headers: ['Kriterium', 'Klassischer HuS Struktogrammer', 'Eren Struktogrammer'],
          rows: [
            ['Java erforderlich?', 'Ja (JRE nötig)', 'Nein – läuft direkt im Browser & nativ'],
            ['macOS (M1–M4) & Linux', 'Problematisch / veraltet', 'Natives Universal-Bundle (Apple Silicon + Intel)'],
            ['Browser-Nutzung (iPad / Chromebook)', 'Nicht möglich', 'Sofort unter strukto.best-tools.app'],
            ['Dateiformate', '.stgp / .stgr', '.stgp / .stgr + Structorizer (.nsd) + XML/JSON'],
            ['Dark Mode & UI-Skalierung', 'Nein', 'Ja (System / Hell / Dunkel + stufenloser Zoom)'],
            ['24h-Link-Teilen', 'Nein', 'Ja (E2E-verschlüsselt direkt unter Datei)'],
          ],
        },
      },
      {
        heading: 'Nahtloser Umstieg ohne Dateiverlust',
        paragraphs: [
          'Du kannst bestehende Projekte (.stgp) und Diagramme (.stgr) direkt weiter öffnen und bearbeiten. So muss keine Lehrkraft vorhandene Unterrichtsmaterialien neu erstellen.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Why Schools Are Looking for a Modern HuS Alternative',
        paragraphs: [
          'Classic HuS Struktogrammer set the standard in German schools, but relies on Java and struggles on modern macOS machines, HiDPI screens, and Chromebooks/iPads.',
        ],
        table: {
          headers: ['Criteria', 'Classic HuS Struktogrammer', 'Eren Struktogrammer'],
          rows: [
            ['Java required?', 'Yes', 'No – zero Java dependencies'],
            ['macOS (Apple Silicon) & Linux', 'Outdated / fragile', 'Native Universal macOS & Linux builds'],
            ['Browser support', 'No', 'Runs anywhere at strukto.best-tools.app'],
            ['File formats', '.stgp / .stgr', '.stgp / .stgr + Structorizer (.nsd) + XML/JSON'],
            ['Dark Mode & 24h Share Links', 'No', 'Yes'],
          ],
        },
      },
    ],
  },
  {
    slug: 'struktogramm-vs-programmablaufplan-pap',
    date: '2026-11-22',
    readTimeMin: 4,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    titleDe: 'Struktogramm vs. Programmablaufplan (PAP / Flussdiagramm): Wann nutzt man was?',
    titleEn: 'Structogram vs. Flowchart (PAP): Which One Should You Use?',
    metaTitleDe: 'Struktogramm vs. Programmablaufplan (PAP) – Unterschiede & Normen',
    metaTitleEn: 'Structogram (DIN 66261) vs. Flowchart – Key Differences',
    metaDescriptionDe:
      'Struktogramm (DIN 66261) oder Programmablaufplan (DIN 66001)? Alle Unterschiede, Vor- und Nachteile für Informatik-Unterricht und IHK-Prüfungen.',
    metaDescriptionEn:
      'Structogram (Nassi-Shneiderman) or flowchart? Compare both diagram types and learn which one is preferred in exams and software planning.',
    excerptDe:
      'Beide Diagrammarten stellen Algorithmen dar – aber mit völlig unterschiedlichen Regeln. Hier siehst du, wann Struktogramm und wann PAP besser passt.',
    excerptEn:
      'Both diagram types model algorithms, yet follow very different rules. Learn when to use a structogram vs. a flowchart.',
    sectionsDe: [
      {
        heading: 'Der direkte Vergleich: DIN 66261 vs. DIN 66001',
        paragraphs: [
          'In IHK-Prüfungen (Fachinformatiker) und im Informatik-Unterricht werden häufig beide Darstellungen abgefragt. Während der Programmablaufplan (PAP) mit Pfeilen und Rauten arbeitet, erzwingt das Struktogramm strukturierte Programmierung ohne Sprünge.',
        ],
        table: {
          headers: ['Merkmal', 'Struktogramm (DIN 66261)', 'Programmablaufplan / PAP (DIN 66001)'],
          rows: [
            ['Darstellung', 'Verschachtelte Rechtecke (Blöcke)', 'Symbole (Rauten, Rechtecke) mit Pfeilen'],
            ['Sprünge (GOTO)', 'Technisch unmöglich', 'Möglich (kann unübersichtlich werden)'],
            ['Leserichtung', 'Immer von oben nach unten', 'Folgt den Pfeilen (auch kreuz und quer)'],
            ['Platzbedarf', 'Kompakt & gut druckbar', 'Wird bei großen Algorithmen schnell breit'],
            ['Einsatz', 'Strukturierte Algorithmen, Schule, IHK', 'Grobe Prozessabläufe, Hardware-nahe Logik'],
          ],
        },
      },
    ],
    sectionsEn: [
      {
        heading: 'DIN 66261 vs. Flowcharts',
        paragraphs: [
          'Flowcharts use arrows and diamonds, allowing arbitrary jumps. Structograms enforce structured programming through nested rectangles read strictly top to bottom, keeping complex algorithms compact and clean.',
        ],
        table: {
          headers: ['Aspect', 'Structogram (DIN 66261)', 'Flowchart'],
          rows: [
            ['Layout', 'Nested rectangular blocks', 'Shapes connected by arrows'],
            ['Arbitrary jumps', 'Prevented by design', 'Allowed'],
            ['Readability at scale', 'Compact and structured', 'Can become tangled'],
          ],
        },
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
    titleDe: 'Struktogramme im Informatik-Abitur & in der Fachinformatiker-Prüfung meistern',
    titleEn: 'Mastering Structograms in Computer Science Exams',
    metaTitleDe: 'Struktogramme im Informatik-Abitur & IHK-Prüfung – Tipps & Beispiel',
    metaTitleEn: 'Structograms in Computer Science Exams – Tips & Search Example',
    metaDescriptionDe:
      'Die wichtigsten Regeln, Operatoren und typische Klausur-Algorithmen (z. B. lineare/binäre Suche, Sortieren) für Informatik-Abitur und IHK-Abschlussprüfung.',
    metaDescriptionEn:
      'Key rules, standard operators, and classic exam algorithms (such as linear/binary search) for computer science exams.',
    excerptDe:
      'Welche Operatoren werden im Abitur erwartet und wie vermeidest du typische Punktabzüge bei Schleifen und Verzweigungen? Plus Beispiel zur binären Suche.',
    excerptEn:
      'Avoid common exam mistakes with loops, conditions, and standard notation. Includes a ready-to-open binary search example.',
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
        heading: 'Checkliste für volle Punktzahl in der Prüfung',
        paragraphs: [
          'In schriftlichen Prüfungen zählt neben der Logik vor allem die saubere formale Darstellung:',
        ],
        bullets: [
          'Einheitliche Zuweisung: Nutze durchgängig entweder „=“ oder „←“ (im Abitur Baden-Württemberg laut Operatorenliste v2.2 definiert).',
          'Klare Abbruchbedingungen: Schreibe bei Schleifen exakt hin, wann wiederholt wird (z. B. „solange i < n“).',
          'Unterprogramme auslagern: Lange Aufgaben in sinnvolle Teilfunktionen zerlegen statt einen riesigen Kasten zu zeichnen.',
          'Variablen sauber benennen: Sprechende Namen wie „summe“, „zaehler“ oder „gefunden“ statt „x1, x2“.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Checklist for Full Exam Marks',
        paragraphs: ['Beyond correct logic, graders look for clean, consistent notation:'],
        bullets: [
          'Consistent assignment operator throughout the entire diagram.',
          'Unambiguous loop conditions and array bounds.',
          'Modular subroutines for reusable sub-tasks.',
          'Descriptive variable names instead of single letters.',
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
    titleDe: 'Unterprogramme, Parameter & Arrays sauber im Struktogramm darstellen',
    titleEn: 'Subroutines, Parameters & Arrays in Structograms',
    metaTitleDe: 'Unterprogramme & Arrays im Struktogramm (DIN 66261) mit Beispiel',
    metaTitleEn: 'Subroutines & Arrays in DIN 66261 Structograms',
    metaDescriptionDe:
      'So stellst du Unterprogramm-Aufrufe, Parameterlisten und Array-Durchläufe (z. B. Maximum-Suche) übersichtlich als Struktogramm dar.',
    metaDescriptionEn:
      'Learn how to model subroutine calls, parameter lists, and array traversals (such as finding the maximum) cleanly in structograms.',
    excerptDe:
      'Große Programme gehören in Unterprogramme aufgeteilt. Wir zeigen, wie Hauptprogramm und Unterprogramm auf der 2D-Arbeitsfläche zusammenspielen.',
    excerptEn:
      'Large algorithms belong in modular subroutines. See how main programs and helper functions work together on the 2D canvas.',
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
        heading: 'Modularisierung mit dem Unterprogramm-Symbol',
        paragraphs: [
          'Das Unterprogramm-Element erkennst du in DIN 66261 an den beiden doppelten senkrechten Linien links und rechts im Kasten. Es signalisiert: Hier wird eine ausgelagerte Funktion aufgerufen (z. B. „sortiereListe(daten)“).',
          'In Eren Struktogrammer kannst du Hauptprogramm und alle Unterprogramme nebeneinander auf derselben 2D-Arbeitsfläche platzieren und mit einem einzigen Projekt-Link oder als .stgp-Datei teilen.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Modularizing with Subroutines',
        paragraphs: [
          'In DIN 66261, the subroutine block features double vertical bars on both sides, marking a call to a helper function. In Eren Struktogrammer, you can place the main program and all subroutines side by side on the 2D canvas.',
        ],
      },
    ],
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
