import type { BlogPost } from './blogPosts';

export const BLOG_POSTS_PART_3: BlogPost[] = [
  {
    slug: 'struktogramm-in-c-cpp-csharp-uebersetzen',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm in C# übersetzen', 'Struktogramm in C++ umwandeln', 'Struktogramm zu C'],
    keywordsEn: ['structogram to C#', 'convert structogram to C++'],
    titleDe: 'Struktogramm in C, C++ & C# übersetzen: Syntax-Tabelle & Beispiele',
    titleEn: 'Translating Structograms into C, C++ & C#',
    metaTitleDe: 'Struktogramm in C, C++ & C# übersetzen – Anleitung',
    metaTitleEn: 'How to Convert a Structogram to C, C++ & C#',
    metaDescriptionDe:
      'Direkte Übersetzungstabelle von DIN 66261 Struktogrammen nach C, C++ und C# – ideal für Berufsschulen, Studium und technische Informatik.',
    metaDescriptionEn:
      'Step-by-step mapping from DIN 66261 blocks to C, C++, and C# syntax.',
    excerptDe:
      'In vielen Berufsschulen und Hochschulen wird mit C# oder C++ programmiert. Hier ist die genaue Übersetzungstabelle für alle 7 DIN-Elemente.',
    excerptEn:
      'Many vocational schools and universities teach C# or C++. Here is the exact mapping for all 7 DIN 66261 elements.',
    sectionsDe: [
      {
        heading: 'Von DIN 66261 zu C# / C++',
        paragraphs: [
          'Da C, C++ und C# dieselbe geschweifte Klammer-Syntax teilen, überträgt sich jedes Struktogramm nahezu 1:1. Achte besonders auf den Unterschied zwischen „=“ (Zuweisung) und „==“ (Vergleich) sowie das „break;“ in Switch-Blöcken!',
        ],
        codeBlock: {
          language: 'csharp',
          code: `int SummeBisN(int n) {
    int summe = 0;
    for (int i = 1; i <= n; i++) {
        summe += i;
    }
    return summe;
}`,
        },
      },
    ],
    sectionsEn: [
      {
        heading: 'Direct C# / C++ Mapping',
        paragraphs: [
          'Remember to distinguish = (assignment) from == (equality) and include break statements inside C-family switch blocks.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-in-javascript-typescript-umwandeln',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm JavaScript', 'Struktogramm TypeScript', 'Algorithmus in JS'],
    keywordsEn: ['structogram to JavaScript', 'structogram to TypeScript'],
    titleDe: 'Struktogramm in JavaScript & TypeScript umwandeln (für Web-Projekte)',
    titleEn: 'Converting Structograms to JavaScript & TypeScript',
    metaTitleDe: 'Struktogramm in JavaScript & TypeScript übersetzen',
    metaTitleEn: 'Translate Structograms to JavaScript & TypeScript',
    metaDescriptionDe:
      'So überträgst du Struktogramme sauber in modernes JavaScript / TypeScript mit let, const, strict equality (===) und for-Schleifen.',
    metaDescriptionEn:
      'Map DIN 66261 structogram elements cleanly into modern JavaScript and TypeScript.',
    excerptDe:
      'Von der Schulaufgabe zur Web-App: So werden Sequenzen, Verzweigungen und Schleifen zu sauberem TypeScript.',
    excerptEn:
      'Turn classroom structograms into modern TypeScript using const/let and strict equality.',
    sectionsDe: [
      {
        heading: 'Besonderheiten bei JavaScript & TypeScript',
        paragraphs: [
          'Nutze im JS/TS-Code statt „==“ immer das typsichere „===“ und für Variablen „const“ bzw. „let“. Eine Zählschleife von 0 bis arr.length - 1 entspricht direkt for (let i = 0; i < arr.length; i++).',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Modern JS/TS Tips',
        paragraphs: [
          'Prefer strict equality (===) and const/let declarations when translating structogram conditions and variables.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-in-php-uebersetzen',
    date: '2026-11-22',
    readTimeMin: 4,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm PHP', 'PHP Berufsschule Struktogramm'],
    keywordsEn: ['structogram to PHP'],
    titleDe: 'Struktogramm in PHP übersetzen (für Fachinformatiker & Web-Ausbildung)',
    titleEn: 'Translating Structograms into PHP',
    metaTitleDe: 'Struktogramm in PHP übersetzen – Beispiele für Berufsschule',
    metaTitleEn: 'Convert DIN 66261 Structograms to PHP',
    metaDescriptionDe:
      'Kurzleitfaden für die Fachinformatiker-Ausbildung: So übersetzt du ein Struktogramm mit $-Variablen, count() und foreach/for sauber nach PHP.',
    metaDescriptionEn:
      'Quick guide for converting DIN 66261 structograms into PHP using $-variables and count().',
    excerptDe:
      'Für Berufsschulklassen mit Fokus auf Webentwicklung: Alle Kontrollstrukturen im schnellen PHP-Mapping.',
    excerptEn:
      'A concise mapping reference for translating DIN 66261 structograms into PHP.',
    sectionsDe: [
      {
        heading: 'PHP-Umsetzung im Überblick',
        paragraphs: [
          'Denke daran, allen Variablen im PHP-Code ein $-Zeichen voranzustellen und Array-Längen mit count($liste) statt laenge(liste) abzufragen.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'PHP Mapping',
        paragraphs: [
          'Prefix variables with $ and use count($list) for array lengths when translating structograms to PHP.',
        ],
      },
    ],
  },
  {
    slug: 'ihk-fachinformatiker-ap1-ap2-struktogramm',
    date: '2026-11-22',
    readTimeMin: 7,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['IHK AP1 Struktogramm', 'IHK AP2 Fachinformatiker Anwendungsentwicklung Struktogramm'],
    keywordsEn: ['German IHK IT exam structogram', 'vocational IT exam algorithm'],
    titleDe: 'IHK-Abschlussprüfung Fachinformatiker (AP1 & AP2): Struktogramme sicher lösen',
    titleEn: 'Vocational IT Exams (IHK AP1 & AP2): Solving Structogram Tasks Safely',
    metaTitleDe: 'IHK Fachinformatiker AP1 & AP2 – Struktogramme sicher meistern',
    metaTitleEn: 'IHK AP1 & AP2 Structogram Exam Guide',
    metaDescriptionDe:
      'Worauf IHK-Prüfer in AP1 und AP2 (FIAE / FISI) bei Struktogramm-Aufgaben besonders achten: Pseudocode-Nähe, Schleifenköpfe, Rückgabewerte und Zeitmanagement.',
    metaDescriptionEn:
      'What examiners check in vocational IT structogram tasks: clear conditions, proper return values, and loop boundaries.',
    excerptDe:
      'In fast jeder AP1- oder AP2-Prüfung gibt es eine Algorithmus-Aufgabe. So holst du dir zuverlässig die vollen Punkte.',
    excerptEn:
      'Algorithm questions appear in almost every vocational IT exam. Follow these proven strategies for full marks.',
    sectionsDe: [
      {
        heading: 'Was IHK-Prüfer sehen wollen',
        paragraphs: [
          'Prüfer korrigieren hunderte Klausuren. Je klarer dein Struktogramm strukturiert ist, desto leichter gibt es volle Punktzahl:',
        ],
        bullets: [
          'Halte dich strikt an die gegebenen Methodennamen und Parameter aus der Aufgabenstellung.',
          'Schreibe Initialisierungen (z. B. gesamt = 0) sichtbar in den ersten Kasten.',
          'Vermeide kryptische Abkürzungen – eine lesbare Anweisung wie „preis = preis * 0.9“ ist immer besser als unleserlicher Code.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'What Graders Look For',
        paragraphs: [
          'Stick to the exact parameter names given in the prompt, initialize accumulators visibly at the top, and keep statements readable.',
        ],
      },
    ],
  },
  {
    slug: 'informatik-abi-baden-wuerttemberg-operatoren',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Operatorenliste Informatik Abitur BW', 'Baden-Württemberg Struktogramm Abitur'],
    keywordsEn: ['Baden-Wuerttemberg Abitur structogram operators'],
    titleDe: 'Informatik-Abitur Baden-Württemberg: Operatorenliste v2.2 richtig anwenden',
    titleEn: 'Computer Science Abitur (BW): Applying Operator List v2.2 Correctly',
    metaTitleDe: 'BW Informatik-Abitur: Struktogramm Operatorenliste v2.2 erklärt',
    metaTitleEn: 'BW Abitur Computer Science Operator List v2.2 Guide',
    metaDescriptionDe:
      'Alle wichtigen Regeln der Operatorenliste für das Informatik-Abitur Baden-Württemberg (v2.2) – und wie die integrierte Seitenleiste in Eren Struktogrammer dabei hilft.',
    metaDescriptionEn:
      'Learn how to apply the official BW Abitur operator list v2.2 directly inside Eren Struktogrammer.',
    excerptDe:
      'Deklaration, Initialisierung, Unterprogramm-Aufruf und Arrays genau nach der offiziellen Abitur-Operatorenliste v2.2.',
    excerptEn:
      'Follow official Abitur operator conventions effortlessly using the built-in Operators sidebar.',
    sectionsDe: [
      {
        heading: 'Die integrierte Operatoren-Seitenleiste nutzen',
        paragraphs: [
          'In Eren Struktogrammer findest du rechts die aufklappbare Operatorenliste (v2.2). Mit einem Klick auf „+“ fügst du die exakt formatierten Vorlagen für Deklarationen, Schleifen, Arrays oder eigene Operatoren direkt als Knoten in dein Struktogramm ein.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Using the Built-In Operators Sidebar',
        paragraphs: [
          'Open the Operators sidebar inside the editor to insert properly formatted declarations, loops, and custom templates in one click.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-fuer-lehrkraefte-arbeitsblaetter',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm Arbeitsblatt erstellen', 'Struktogramm für Lehrer', 'Informatik Unterricht Material'],
    keywordsEn: ['structogram worksheets teachers', 'computer science teaching diagrams'],
    titleDe: 'Struktogramme für Lehrkräfte: Arbeitsblätter, Vorlagen & 24h-Links im Unterricht',
    titleEn: 'Structograms for Teachers: Worksheets, Templates & 24h Classroom Links',
    metaTitleDe: 'Struktogramme für Lehrkräfte – Arbeitsblätter & 24h-Sharing',
    metaTitleEn: 'Teaching Structograms: Worksheets & 24h Classroom Links',
    metaDescriptionDe:
      'Tipps für Informatik-Lehrkräfte: Scharfe SVGs für Arbeitsblätter exportieren, mehrere Varianten auf der 2D-Fläche vergleichen und Aufgaben per 24h-Link teilen.',
    metaDescriptionEn:
      'How computer science teachers create crisp worksheet SVGs and distribute starter diagrams via 24h encrypted links.',
    excerptDe:
      'So bereitest du Arbeitsblätter mit gestochen scharfen Struktogrammen vor und teilst Starter-Vorlagen per 1-Klick-Link in Moodle oder IServ.',
    excerptEn:
      'Prepare crisp vector worksheets and distribute starter templates in one click via encrypted 24h links.',
    sectionsDe: [
      {
        heading: 'Workflow für den Unterricht',
        paragraphs: [
          '1. Aufgabe als Vorlage im Editor anlegen (z. B. mit Lücken zum Ausfüllen). 2. Über „Datei → Link erstellen (24h)…“ den Kurzlink kopieren und ins digitale Klassenzimmer (Moodle, IServ, Teams) posten. 3. Musterlösung als SVG/PNG in 1 Klick in die Zwischenablage kopieren und ins Arbeitsblatt einfügen.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Fast Classroom Workflow',
        paragraphs: [
          'Create a starter diagram, click File → Create Share Link (24h)…, and paste the link straight into Moodle or Teams.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-ipad-chromebook-ohne-installation',
    date: '2026-11-22',
    readTimeMin: 4,
    category: 'comparison',
    categoryDe: 'Vergleich',
    categoryEn: 'Comparison',
    keywordsDe: ['Struktogramm iPad', 'Struktogramm Chromebook', 'Struktogramm ohne Installation'],
    keywordsEn: ['structogram iPad Chromebook', 'structogram no install'],
    titleDe: 'Struktogramme auf dem Schul-iPad, Tablet & Chromebook ohne Installation',
    titleEn: 'Drawing Structograms on iPad, Tablets & Chromebooks Without Installation',
    metaTitleDe: 'Struktogramm-Editor für iPad & Chromebook (ohne Java / App)',
    metaTitleEn: 'Structogram Editor for iPad & Chromebook (No Installation)',
    metaDescriptionDe:
      'Viele Schulen arbeiten mit iPads oder Chromebooks – klassische Java-Struktogrammer laufen dort nicht. So nutzt du Eren Struktogrammer direkt in Safari & Chrome.',
    metaDescriptionEn:
      'Run DIN 66261 structograms smoothly on school iPads and Chromebooks right in Safari or Chrome.',
    excerptDe:
      'Kein App Store, kein Java, keine IT-Freigabe nötig: Warum Browser-Struktogramme auf Tablet-Klassen unverzichtbar sind.',
    excerptEn:
      'No App Store or Java required: why browser-based structograms work seamlessly in tablet classrooms.',
    sectionsDe: [
      {
        heading: 'Läuft auf jedem Schulgerät',
        paragraphs: [
          'Öffne einfach https://strukto.best-tools.app/app im Safari- oder Chrome-Browser. Alle Daten bleiben im lokalen Gerätespeicher und können jederzeit als .stgp- oder .stgr-Datei gesichert werden.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Works on Any School Device',
        paragraphs: [
          'Open https://strukto.best-tools.app/app in Safari or Chrome — zero installation required.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-vs-pseudocode-vergleich',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Struktogramm vs Pseudocode', 'Pseudocode Unterschied Struktogramm'],
    keywordsEn: ['structogram vs pseudocode'],
    titleDe: 'Struktogramm vs. Pseudocode: Vor- und Nachteile für Planung & Klausuren',
    titleEn: 'Structogram vs. Pseudocode: Pros & Cons for Planning and Exams',
    metaTitleDe: 'Struktogramm vs. Pseudocode – Wann nutzt man was?',
    metaTitleEn: 'Structogram vs. Pseudocode Comparison',
    metaDescriptionDe:
      'Wann ist ein Struktogramm übersichtlicher als Pseudocode und wann lohnt sich Text? Alle Vor- und Nachteile für Unterricht und Software-Entwurf.',
    metaDescriptionEn:
      'Compare visual DIN 66261 structograms with text-based pseudocode for teaching and algorithm design.',
    excerptDe:
      'Visuelle Blöcke gegen strukturierten Text: Beide Methoden verfolgen dasselbe Ziel, haben aber unterschiedliche Stärken.',
    excerptEn:
      'Visual blocks vs. structured text: understand where each notation shines.',
    sectionsDe: [
      {
        heading: 'Visualisierung schlägt Einrückungsfehler',
        paragraphs: [
          'Beim handschriftlichen Pseudocode in Klausuren verrutschen schnell Einrückungen oder „end if“-Zeilen fehlen. Im Struktogramm zeigen die Kasten-Grenzen sofort eindeutig, welcher Block zu welcher Schleife oder Verzweigung gehört.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Clear Visual Scope',
        paragraphs: [
          'Nested boxes make block boundaries unmistakable compared to handwritten indentation in pseudocode.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-vs-uml-aktivitaetsdiagramm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Struktogramm vs Aktivitätsdiagramm', 'UML Aktivitätsdiagramm Unterschied'],
    keywordsEn: ['structogram vs UML activity diagram'],
    titleDe: 'Struktogramm vs. UML-Aktivitätsdiagramm: Unterschiede & Einsatzgebiete',
    titleEn: 'Structogram vs. UML Activity Diagram: Differences & Use Cases',
    metaTitleDe: 'Struktogramm vs. UML-Aktivitätsdiagramm im Vergleich',
    metaTitleEn: 'Structogram vs. UML Activity Diagram Comparison',
    metaDescriptionDe:
      'Während UML-Aktivitätsdiagramme auch Parallelität (Fork/Join) und Akteure modellieren, fokussiert sich das Struktogramm auf einzelne Methoden und Algorithmen.',
    metaDescriptionEn:
      'Understand when to use a DIN 66261 structogram (single algorithm) vs. a UML activity diagram (parallel workflows).',
    excerptDe:
      'Wann zeichnet man in der Softwaretechnik ein Aktivitätsdiagramm und wann ein klassisches Struktogramm?',
    excerptEn:
      'Learn when software engineering calls for a UML activity diagram vs. a DIN 66261 structogram.',
    sectionsDe: [
      {
        heading: 'Algorithmus-Detail vs. System-Ablauf',
        paragraphs: [
          'Das UML-Aktivitätsdiagramm eignet sich hervorragend für Geschäftsprozesse mit parallelen Abläufen (Synchronisationsbalken) und Swimlanes. Sobald es um die präzise Logik innerhalb einer Funktion (Schleifen, Indizes, Bedingungen) geht, ist das Struktogramm deutlich kompakter.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Algorithm Detail vs. Workflow',
        paragraphs: [
          'Use UML activity diagrams for parallel multi-actor workflows, and structograms for detailed single-method control flow.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-datenbank-schleifen-sql-erm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['ERM Editor SQL Trainer Struktogrammer', 'Best-Tools Suite Informatik'],
    keywordsEn: ['ERM Editor SQL Trainer Structogrammer', 'Best-Tools Suite'],
    titleDe: 'Vom ER-Modell & SQL zum Algorithmus im Struktogramm (Best-Tools Suite)',
    titleEn: 'From ERM & SQL to Algorithms in Structograms (Best-Tools Suite)',
    metaTitleDe: 'ERM, SQL & Struktogramme verbinden – Best-Tools Informatik Suite',
    metaTitleEn: 'Connecting ERM, SQL & Structograms in the Best-Tools Suite',
    metaDescriptionDe:
      'Wie Datenmodellierung (erm.best-tools.app), Datenbankabfragen (sql.best-tools.app) und Programmlogik (strukto.best-tools.app) im Informatik-Projekt zusammenwirken.',
    metaDescriptionEn:
      'See how ER modeling, SQL queries, and DIN 66261 algorithm design fit together in one free educational suite.',
    excerptDe:
      'Datenbank entwerfen im ERM-Editor, Abfragen testen im SQL-Trainer und Auswertungs-Logik planen im Struktogrammer.',
    excerptEn:
      'Model data in the ERM Editor, test queries in the SQL Trainer, and design processing logic in the Structogrammer.',
    sectionsDe: [
      {
        heading: 'Alle drei Säulen der Schul-Informatik',
        paragraphs: [
          '1. Datenstruktur planen mit dem ERM-Editor (erm.best-tools.app). 2. Tabellen und JOIN-Abfragen üben im SQL-Trainer (sql.best-tools.app). 3. Die Verarbeitungslogik der Anwendung sauber als Struktogramm entwerfen mit Eren Struktogrammer (strukto.best-tools.app).',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Three Core Pillars of Computer Science',
        paragraphs: [
          'Combine data modeling (erm.best-tools.app), SQL practice (sql.best-tools.app), and algorithm design (strukto.best-tools.app).',
        ],
      },
    ],
  },
  {
    slug: 'zeitkomplexitaet-big-o-im-struktogramm-erkennen',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Big O Notation Struktogramm', 'Laufzeitkomplexität am Struktogramm ablesen'],
    keywordsEn: ['Big O complexity structogram', 'time complexity Nassi Shneiderman'],
    titleDe: 'Laufzeit & Big-O-Notation (O(1), O(n), O(n²)) direkt am Struktogramm ablesen',
    titleEn: 'Reading Time Complexity & Big-O (O(1), O(n), O(n²)) Directly from Structograms',
    metaTitleDe: 'Big-O-Notation am Struktogramm erkennen – O(1), O(n), O(log n), O(n²)',
    metaTitleEn: 'How to Determine Big-O Complexity from a Structogram',
    metaDescriptionDe:
      'Mit einem Blick auf die Verschachtelungstiefe der Schleifen die Laufzeitkomplexität bestimmen: O(1), O(log n), O(n) und O(n²) anschaulich erklärt.',
    metaDescriptionEn:
      'Estimate algorithm time complexity by inspecting loop nesting depth in DIN 66261 structograms.',
    excerptDe:
      'Keine Schleife = O(1), eine Schleife = O(n), zwei verschachtelte Schleifen = O(n²): So liest du die Effizienz direkt an der Zeichnung ab.',
    excerptEn:
      'No loop = O(1), single loop = O(n), two nested loops = O(n²): read complexity straight from the blocks.',
    sectionsDe: [
      {
        heading: 'Faustregeln für das Abitur & Studium',
        paragraphs: [
          'Weil Struktogramme jede Schleife visuell einrahmen, siehst du die Laufzeitklasse sofort an der Schachtelungstiefe:',
        ],
        table: {
          headers: ['Struktur im Diagramm', 'Typische Komplexität', 'Beispiel'],
          rows: [
            ['Nur Sequenzen & Verzweigungen', 'O(1) – konstant', 'Schaltjahr prüfen, Zugriff auf arr[0]'],
            ['Halbierung pro Schritt', 'O(log n) – logarithmisch', 'Binäre Suche'],
            ['Eine einfache Schleife über n', 'O(n) – linear', 'Lineare Suche, Summe, Maximum'],
            ['Zwei verschachtelte Schleifen über n', 'O(n²) – quadratisch', 'Bubblesort, Selectionsort, 2D-Matrix'],
          ],
        },
      },
    ],
    sectionsEn: [
      {
        heading: 'Quick Complexity Rules',
        paragraphs: [
          'Loop nesting depth in a structogram directly reveals O(1), O(n), and O(n²) complexity classes.',
        ],
      },
    ],
  },
  {
    slug: 'tracertabelle-schreibtischtest-struktogramm',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Schreibtischtest Struktogramm', 'Tracetabelle Struktogramm erstellen'],
    keywordsEn: ['trace table structogram', 'desk check Nassi Shneiderman'],
    titleDe: 'Schreibtischtest & Tracetabelle: So prüfst du dein Struktogramm auf Logikfehler',
    titleEn: 'Trace Tables & Desk Checks: Verifying Structograms Step by Step',
    metaTitleDe: 'Tracetabelle (Schreibtischtest) für Struktogramme richtig ausfüllen',
    metaTitleEn: 'How to Fill Out a Trace Table for a Structogram',
    metaDescriptionDe:
      'In Prüfungen musst du oft gegebene Struktogramme per Tracetabelle (Schreibtischtest) durchspielen. So gehst du systematisch vor, ohne dich zu verzählen.',
    metaDescriptionEn:
      'Step-by-step method for completing trace tables accurately during computer science exams.',
    excerptDe:
      'Jede Variable bekommt eine eigene Spalte, jede Wertänderung eine neue Zeile: So findest du Off-by-One-Fehler bevor der Prüfer sie sieht.',
    excerptEn:
      'One column per variable, one row per state change: catch off-by-one errors before grading.',
    sectionsDe: [
      {
        heading: 'Schritt-für-Schritt-Anleitung für die Tracetabelle',
        paragraphs: [
          '1. Lege für jede Variable (auch Zähler i und Hilfsvariablen wie temp) plus eine Spalte „Bedingung / Ausgabe“ eine eigene Spalte an. 2. Gehe Block für Block exakt von oben nach unten durch. 3. Trage jede Veränderung sofort ein und streiche alte Werte gedanklich nicht vorzeitig durch.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Step-by-Step Desk Check',
        paragraphs: [
          'Create one column per variable and trace top-to-bottom, recording every assignment and loop check.',
        ],
      },
    ],
  },
  {
    slug: 'struktogramm-barrierefrei-drucken-dark-mode',
    date: '2026-11-22',
    readTimeMin: 4,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Struktogramm drucken A4', 'Struktogramm Dark Mode', 'Struktogramm Design'],
    keywordsEn: ['print structogram A4 PDF', 'structogram Dark Mode'],
    titleDe: 'Struktogramme lesbar gestalten: Schriftgröße, Farben, Dark Mode & A4-Druck',
    titleEn: 'Designing Readable Structograms: Typography, Colors, Dark Mode & A4 Print',
    metaTitleDe: 'Struktogramme optimal gestalten & auf A4 drucken',
    metaTitleEn: 'Formatting & Printing DIN 66261 Structograms Cleanly',
    metaDescriptionDe:
      'Tipps für perfekt lesbare Struktogramme im Beamer-Unterricht und auf Papier: Dark Mode am Bildschirm, heller Kontrastdruck und UI-Zoom.',
    metaDescriptionEn:
      'Tips for high-contrast classroom projection and crisp A4 PDF printing.',
    excerptDe:
      'Im dunklen Hörsaal per Dark Mode arbeiten, aber sauber in Schwarz-Weiß auf A4 drucken — so stellst du Eren Struktogrammer optimal ein.',
    excerptEn:
      'Work comfortably in Dark Mode on screen while printing crisp high-contrast black-and-white diagrams on A4.',
    sectionsDe: [
      {
        heading: 'Bildschirm vs. Papier',
        paragraphs: [
          'In den Einstellungen von Eren Struktogrammer kannst du Schriftart, Schriftgröße, Linienbreite, Farben und den UI-Zoom für Beamer/HiDPI frei anpassen. Der Druck-Dialog skaliert jedes Diagramm automatisch sauber auf Hoch- oder Querformat A4.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Screen Comfort vs. Print Clarity',
        paragraphs: [
          'Customize fonts, stroke widths, and UI scaling for projectors, and use Print / PDF for automatic A4 page fitting.',
        ],
      },
    ],
  },
];
