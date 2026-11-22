import type { BlogPost } from './blogPosts';

export const BLOG_POSTS_PART_2: BlogPost[] = [
  {
    slug: 'binaere-suche-struktogramm-erklaert',
    date: '2026-11-22',
    readTimeMin: 7,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['binäre Suche Struktogramm', 'Binary Search DIN 66261', 'Halbierungsverfahren Struktogramm'],
    keywordsEn: ['binary search structogram', 'binary search Nassi Shneiderman'],
    titleDe: 'Binäre Suche im Struktogramm: Halbierungsverfahren Schritt für Schritt (O(log n))',
    titleEn: 'Binary Search in Structograms: Divide-and-Conquer Step by Step',
    metaTitleDe: 'Binäre Suche als Struktogramm (DIN 66261) – Erklärung & Live-Beispiel',
    metaTitleEn: 'Binary Search Structogram (DIN 66261) – Tutorial & Live Example',
    metaDescriptionDe:
      'Binäre Suche (Binary Search) als Struktogramm nach DIN 66261: Voraussetzung, Grenzen links/rechts/mitte, Laufzeit O(log n) und Live-Beispiel zum Öffnen.',
    metaDescriptionEn:
      'Learn Binary Search in a DIN 66261 structogram: sorted array requirement, left/right/mid pointers, O(log n) complexity, and live diagram.',
    excerptDe:
      'Warum ist die binäre Suche tausendmal schneller als die lineare Suche? Mit komplettem Struktogramm für links, rechts und mitte.',
    excerptEn:
      'Why is binary search orders of magnitude faster than linear search? Includes a complete structogram with left, right, and mid pointers.',
    exampleDiagram: {
      id: 'blog-ex-binsearch',
      name: 'binaereSuche(arr, ziel)',
      x: 40,
      y: 40,
      width: 500,
      zIndex: 1,
      nodes: [
        { id: 'bs1', type: 'sequence', text: 'links = 0; rechts = laenge(arr) - 1; pos = -1' },
        {
          id: 'bs2',
          type: 'while',
          text: 'links <= rechts UND pos == -1',
          body: [
            { id: 'bs3', type: 'sequence', text: 'mitte = (links + rechts) DIV 2' },
            {
              id: 'bs4',
              type: 'if',
              text: 'arr[mitte] == ziel',
              trueLabel: 'wahr',
              falseLabel: 'falsch',
              thenBranch: [{ id: 'bs5', type: 'sequence', text: 'pos = mitte' }],
              elseBranch: [
                {
                  id: 'bs6',
                  type: 'if',
                  text: 'arr[mitte] < ziel',
                  trueLabel: 'wahr',
                  falseLabel: 'falsch',
                  thenBranch: [{ id: 'bs7', type: 'sequence', text: 'links = mitte + 1' }],
                  elseBranch: [{ id: 'bs8', type: 'sequence', text: 'rechts = mitte - 1' }],
                },
              ],
            },
          ],
        },
        { id: 'bs9', type: 'sequence', text: 'Rückgabe: pos' },
      ],
    },
    sectionsDe: [
      {
        heading: '1. Voraussetzung: Das Array muss sortiert sein',
        paragraphs: [
          'Die binäre Suche funktioniert ausschließlich auf bereits sortierten Listen. Statt jedes Element einzeln anzusehen, prüft der Algorithmus immer genau das mittlere Element und halbiert damit in jedem Schritt den Suchbereich.',
          'Bei 1.000.000 Einträgen braucht die lineare Suche im schlimmsten Fall 1.000.000 Vergleiche – die binäre Suche höchstens 20!',
        ],
        callout:
          'Klausur-Merksatz: Bei ganzzahliger Division immer „DIV 2“ oder „ganzzahlig((links + rechts) / 2)“ notieren, damit kein Komma-Index entsteht.',
      },
      {
        heading: '2. Ablauf im Struktogramm',
        paragraphs: [
          'Solange links <= rechts gilt und das Element noch nicht gefunden wurde (pos == -1), berechnen wir die Mitte. Ist arr[mitte] kleiner als das Ziel, muss das Ziel rechts liegen (links = mitte + 1), sonst links (rechts = mitte - 1).',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: '1. Sorted Array Requirement',
        paragraphs: [
          'Binary search halves the remaining search space on every step by comparing the target with the middle element, achieving O(log n) runtime.',
        ],
      },
    ],
    faqDe: [
      {
        q: 'Warum steht dort links = mitte + 1 statt links = mitte?',
        a: 'Da arr[mitte] bereits geprüft wurde und nicht das Ziel ist, kann die Mitte ausgeschlossen werden. Sonst droht bei zwei Elementen eine Endlosschleife.',
      },
    ],
  },
  {
    slug: 'selectionsort-als-struktogramm',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Selectionsort Struktogramm', 'Sortieren durch Auswählen DIN 66261'],
    keywordsEn: ['Selection Sort structogram', 'Selection Sort Nassi Shneiderman'],
    titleDe: 'Selectionsort (Sortieren durch Auswählen) als Struktogramm erklärt',
    titleEn: 'Selection Sort in Structograms Explained Step by Step',
    metaTitleDe: 'Selectionsort als Struktogramm (DIN 66261) – Anleitung & Beispiel',
    metaTitleEn: 'Selection Sort Structogram (DIN 66261) – Guide & Live Example',
    metaDescriptionDe:
      'Selectionsort im Struktogramm verstehen: Kleinstes Element im Restarray suchen, Index merken (minIdx) und am Ende einmal tauschen.',
    metaDescriptionEn:
      'Learn Selection Sort as a DIN 66261 structogram: track minIdx across the unsorted tail and perform one swap per outer pass.',
    excerptDe:
      'Im Gegensatz zu Bubblesort tauscht Selectionsort pro Durchlauf höchstens einmal. Hier ist das vollständige Struktogramm.',
    excerptEn:
      'Unlike Bubble Sort, Selection Sort swaps at most once per outer pass. Explore the complete structogram.',
    exampleDiagram: {
      id: 'blog-ex-selectionsort',
      name: 'selectionSort(arr)',
      x: 40,
      y: 40,
      width: 500,
      zIndex: 1,
      nodes: [
        {
          id: 'ss1',
          type: 'for',
          text: 'i = 0 bis laenge(arr) - 2',
          body: [
            { id: 'ss2', type: 'sequence', text: 'minIdx = i' },
            {
              id: 'ss3',
              type: 'for',
              text: 'j = i + 1 bis laenge(arr) - 1',
              body: [
                {
                  id: 'ss4',
                  type: 'if',
                  text: 'arr[j] < arr[minIdx]',
                  trueLabel: 'wahr',
                  falseLabel: 'falsch',
                  thenBranch: [{ id: 'ss5', type: 'sequence', text: 'minIdx = j' }],
                  elseBranch: [],
                },
              ],
            },
            { id: 'ss6', type: 'sequence', text: 'tausche arr[i] und arr[minIdx]' },
          ],
        },
      ],
    },
    sectionsDe: [
      {
        heading: 'So arbeitet Selectionsort',
        paragraphs: [
          'Der Algorithmus teilt das Array gedanklich in einen sortierten linken Teil (0..i-1) und einen unsortierten rechten Teil (i..n-1). In jedem Schritt sucht die innere Schleife den Index des kleinsten Elements im rechten Teil (minIdx) und tauscht es an Position i.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'How Selection Sort Works',
        paragraphs: [
          'Selection Sort repeatedly finds the minimum element index in the unsorted suffix and swaps it into position i.',
        ],
      },
    ],
  },
  {
    slug: 'insertionsort-als-struktogramm',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Insertionsort Struktogramm', 'Sortieren durch Einfügen DIN 66261'],
    keywordsEn: ['Insertion Sort structogram', 'Insertion Sort Nassi Shneiderman'],
    titleDe: 'Insertionsort (Sortieren durch Einfügen) im Struktogramm erklärt',
    titleEn: 'Insertion Sort in Structograms: Step-by-Step Guide',
    metaTitleDe: 'Insertionsort als Struktogramm (DIN 66261) – Live-Diagramm',
    metaTitleEn: 'Insertion Sort Structogram (DIN 66261) – Live Diagram',
    metaDescriptionDe:
      'Insertionsort wie beim Kartenspielen: Aktuelles Element merken, größere Werte nach rechts verschieben und an der richtigen Stelle einfügen.',
    metaDescriptionEn:
      'Insertion Sort explained like sorting playing cards, complete with a DIN 66261 structogram.',
    excerptDe:
      'Wie beim Sortieren von Spielkarten: Warum Insertionsort auf fast sortierten Daten extrem schnell ist (O(n) im Best Case).',
    excerptEn:
      'Just like sorting playing cards in your hand: why Insertion Sort hits O(n) on nearly sorted arrays.',
    exampleDiagram: {
      id: 'blog-ex-insertionsort',
      name: 'insertionSort(arr)',
      x: 40,
      y: 40,
      width: 500,
      zIndex: 1,
      nodes: [
        {
          id: 'is1',
          type: 'for',
          text: 'i = 1 bis laenge(arr) - 1',
          body: [
            { id: 'is2', type: 'sequence', text: 'schluessel = arr[i]; j = i - 1' },
            {
              id: 'is3',
              type: 'while',
              text: 'j >= 0 UND arr[j] > schluessel',
              body: [
                { id: 'is4', type: 'sequence', text: 'arr[j + 1] = arr[j]' },
                { id: 'is5', type: 'sequence', text: 'j = j - 1' },
              ],
            },
            { id: 'is6', type: 'sequence', text: 'arr[j + 1] = schluessel' },
          ],
        },
      ],
    },
    sectionsDe: [
      {
        heading: 'Das Kartenspiel-Prinzip',
        paragraphs: [
          'Du nimmst ab Index 1 jedes Element („schluessel“) heraus, schiebst alle größeren Elemente links davon um eine Position nach rechts und setzt den Schlüssel in die entstandene Lücke.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'The Playing-Card Analogy',
        paragraphs: [
          'Pick each element starting at index 1, shift larger sorted elements one slot to the right, and insert the key into the open position.',
        ],
      },
    ],
  },
  {
    slug: 'ggt-euklidischer-algorithmus-struktogramm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['ggT Struktogramm', 'Euklidischer Algorithmus Struktogramm', 'Modulo ggT'],
    keywordsEn: ['GCD Euclidean algorithm structogram', 'greatest common divisor Nassi Shneiderman'],
    titleDe: 'Euklidischer Algorithmus (ggT berechnen) als Struktogramm (DIN 66261)',
    titleEn: 'Euclidean Algorithm (GCD) as a DIN 66261 Structogram',
    metaTitleDe: 'ggT mit Euklidischem Algorithmus im Struktogramm – Live-Beispiel',
    metaTitleEn: 'Euclidean GCD Algorithm Structogram – Step-by-Step',
    metaDescriptionDe:
      'Den größten gemeinsamen Teiler (ggT) zweier Zahlen mit dem Euklidischen Algorithmus (Modulo-Variante) als Struktogramm berechnen.',
    metaDescriptionEn:
      'Compute the greatest common divisor (GCD) using Euclid’s modulo algorithm in a clean structogram.',
    excerptDe:
      'Einer der ältesten und beliebtesten Algorithmen im Informatik-Unterricht: ggT zweier Zahlen mit Modulo in einer kopfgesteuerten Schleife.',
    excerptEn:
      'A classic computer science exercise: computing the GCD of two integers with a single while loop and modulo.',
    exampleDiagram: {
      id: 'blog-ex-ggt',
      name: 'berechneGGT(a, b)',
      x: 40,
      y: 40,
      width: 440,
      zIndex: 1,
      nodes: [
        {
          id: 'g1',
          type: 'while',
          text: 'b != 0',
          body: [
            { id: 'g2', type: 'sequence', text: 'rest = a MOD b' },
            { id: 'g3', type: 'sequence', text: 'a = b' },
            { id: 'g4', type: 'sequence', text: 'b = rest' },
          ],
        },
        { id: 'g5', type: 'sequence', text: 'Rückgabe: a' },
      ],
    },
    sectionsDe: [
      {
        heading: 'Modulo-Variante vs. Subtraktions-Variante',
        paragraphs: [
          'Bei der klassischen Subtraktions-Variante zieht man immer die kleinere von der größeren Zahl ab, bis beide gleich sind. Deutlich schneller ist die Modulo-Variante: Solange b nicht 0 ist, ersetzt man a durch b und b durch den Divisionsrest (a MOD b).',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Modulo Form of Euclid’s Algorithm',
        paragraphs: [
          'While b is non-zero, compute rest = a MOD b, set a = b, and set b = rest. Once b reaches 0, a holds the GCD.',
        ],
      },
    ],
  },
  {
    slug: 'primzahl-pruefung-struktogramm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Primzahl Struktogramm', 'Primzahltest DIN 66261'],
    keywordsEn: ['prime number check structogram', 'primality test Nassi Shneiderman'],
    titleDe: 'Primzahltest im Struktogramm: Prüfen ob eine Zahl prim ist',
    titleEn: 'Prime Number Check in a Structogram (DIN 66261)',
    metaTitleDe: 'Primzahl-Prüfung als Struktogramm – Erklärung & Live-Beispiel',
    metaTitleEn: 'Prime Number Check Structogram – Live Example',
    metaDescriptionDe:
      'So prüfst du im Struktogramm, ob eine Zahl n eine Primzahl ist: Sonderfälle < 2 abfangen und Teiler bis √n testen.',
    metaDescriptionEn:
      'Check if an integer is prime in a structogram by handling edge cases < 2 and testing divisors up to sqrt(n).',
    excerptDe:
      'Warum man beim Primzahltest nur bis zur Wurzel von n prüfen muss und wie das Struktogramm dazu aussieht.',
    excerptEn:
      'Why testing divisors only up to sqrt(n) suffices and how to model the primality test cleanly.',
    exampleDiagram: {
      id: 'blog-ex-prim',
      name: 'istPrimzahl(n)',
      x: 40,
      y: 40,
      width: 480,
      zIndex: 1,
      nodes: [
        {
          id: 'p1',
          type: 'if',
          text: 'n < 2',
          trueLabel: 'wahr',
          falseLabel: 'falsch',
          thenBranch: [{ id: 'p2', type: 'sequence', text: 'istPrim = falsch' }],
          elseBranch: [
            { id: 'p3', type: 'sequence', text: 'istPrim = wahr; teiler = 2' },
            {
              id: 'p4',
              type: 'while',
              text: 'teiler * teiler <= n UND istPrim',
              body: [
                {
                  id: 'p5',
                  type: 'if',
                  text: 'n MOD teiler == 0',
                  trueLabel: 'wahr',
                  falseLabel: 'falsch',
                  thenBranch: [{ id: 'p6', type: 'sequence', text: 'istPrim = falsch' }],
                  elseBranch: [{ id: 'p7', type: 'sequence', text: 'teiler = teiler + 1' }],
                },
              ],
            },
          ],
        },
        { id: 'p8', type: 'sequence', text: 'Rückgabe: istPrim' },
      ],
    },
    sectionsDe: [
      {
        heading: 'Trick: teiler * teiler <= n statt Wurzelziehen',
        paragraphs: [
          'Wenn n einen Teiler größer als √n hat, existiert automatisch ein Partnerteiler kleiner als √n. Mit der Bedingung „teiler * teiler <= n“ sparst du dir sogar die Quadratwurzel-Funktion und bleibst komplett bei ganzen Zahlen.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Using teiler * teiler <= n',
        paragraphs: [
          'Testing divisors while d * d <= n avoids floating-point square roots while keeping the check O(sqrt(n)).',
        ],
      },
    ],
  },
  {
    slug: 'fibonacci-folge-iterativ-rekursiv-struktogramm',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['Fibonacci Struktogramm', 'Fibonacci iterativ vs rekursiv'],
    keywordsEn: ['Fibonacci structogram', 'iterative Fibonacci Nassi Shneiderman'],
    titleDe: 'Fibonacci-Folge im Struktogramm: Iterativ (schnell) vs. Rekursiv',
    titleEn: 'Fibonacci Sequence in Structograms: Iterative vs. Recursive',
    metaTitleDe: 'Fibonacci-Zahlen als Struktogramm – Iterative Lösung & Laufzeit',
    metaTitleEn: 'Fibonacci Structogram – Iterative & Recursive Comparison',
    metaDescriptionDe:
      'Fibonacci-Zahlen im Struktogramm berechnen: Warum die iterative Schleife in O(n) der naiven Rekursion in O(2^n) haushoch überlegen ist.',
    metaDescriptionEn:
      'Compute Fibonacci numbers cleanly in O(n) using an iterative loop structogram vs. naive recursion.',
    excerptDe:
      'Während die rekursive Fibonacci-Funktion bei n=45 einfriert, rechnet die iterative Struktogramm-Schleife in Millisekunden.',
    excerptEn:
      'While naive recursive Fibonacci stalls around n=45, an iterative structogram computes it in milliseconds.',
    exampleDiagram: {
      id: 'blog-ex-fib',
      name: 'fibonacci(n)',
      x: 40,
      y: 40,
      width: 460,
      zIndex: 1,
      nodes: [
        {
          id: 'fb1',
          type: 'if',
          text: 'n <= 1',
          trueLabel: 'wahr',
          falseLabel: 'falsch',
          thenBranch: [{ id: 'fb2', type: 'sequence', text: 'Rückgabe: n' }],
          elseBranch: [
            { id: 'fb3', type: 'sequence', text: 'a = 0; b = 1' },
            {
              id: 'fb4',
              type: 'for',
              text: 'i = 2 bis n',
              body: [
                { id: 'fb5', type: 'sequence', text: 'naechste = a + b; a = b; b = naechste' },
              ],
            },
            { id: 'fb6', type: 'sequence', text: 'Rückgabe: b' },
          ],
        },
      ],
    },
    sectionsDe: [
      {
        heading: 'Zwei Variablen reichen völlig',
        paragraphs: [
          'Für die iterative Berechnung merkst du dir immer nur die letzten beiden Fibonacci-Zahlen a und b und schiebst sie in einer Zählschleife von 2 bis n weiter. Das braucht nur O(n) Zeit und konstanten Speicher O(1).',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Two Variables Are All You Need',
        paragraphs: [
          'Tracking just the previous two Fibonacci values (a and b) in a for loop yields linear O(n) time and O(1) space.',
        ],
      },
    ],
  },
  {
    slug: 'schaltjahr-berechnung-struktogramm',
    date: '2026-11-22',
    readTimeMin: 4,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Schaltjahr Struktogramm', 'Schaltjahr Berechnung DIN 66261'],
    keywordsEn: ['leap year structogram', 'leap year condition Nassi Shneiderman'],
    titleDe: 'Schaltjahr-Berechnung (4 / 100 / 400) als Struktogramm darstellen',
    titleEn: 'Leap Year Calculation (4 / 100 / 400) as a Structogram',
    metaTitleDe: 'Schaltjahr als Struktogramm (DIN 66261) – Live-Beispiel',
    metaTitleEn: 'Leap Year Structogram (DIN 66261) – Live Example',
    metaDescriptionDe:
      'Die Schaltjahr-Regel (teilbar durch 4, nicht durch 100, außer durch 400) sauber mit verschachtelten Verzweigungen im Struktogramm zeichnen.',
    metaDescriptionEn:
      'Model the Gregorian leap year rule cleanly with nested branches in DIN 66261.',
    excerptDe:
      'Eine der beliebtesten Einstiegsaufgaben für verschachtelte Verzweigungen: Wann ist ein Jahr ein Schaltjahr?',
    excerptEn:
      'A classic introductory exercise for nested branches: determining whether a year is a leap year.',
    exampleDiagram: {
      id: 'blog-ex-leap',
      name: 'istSchaltjahr(jahr)',
      x: 40,
      y: 40,
      width: 500,
      zIndex: 1,
      nodes: [
        {
          id: 'ly1',
          type: 'if',
          text: '(jahr MOD 4 == 0 UND jahr MOD 100 != 0) ODER (jahr MOD 400 == 0)',
          trueLabel: 'wahr',
          falseLabel: 'falsch',
          thenBranch: [{ id: 'ly2', type: 'sequence', text: 'Ausgabe: "Schaltjahr"' }],
          elseBranch: [{ id: 'ly3', type: 'sequence', text: 'Ausgabe: "Kein Schaltjahr"' }],
        },
      ],
    },
    sectionsDe: [
      {
        heading: 'Die gregorianische Regel kurz gefasst',
        paragraphs: [
          'Ein Jahr ist ein Schaltjahr, wenn es durch 400 teilbar ist ODER wenn es durch 4, aber nicht durch 100 teilbar ist. So ist 2000 ein Schaltjahr, 1900 jedoch nicht.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'The Gregorian Leap Year Rule',
        paragraphs: [
          'A year is a leap year if it is divisible by 400, or divisible by 4 and not by 100.',
        ],
      },
    ],
  },
  {
    slug: 'durchschnitt-summe-minmax-array-struktogramm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Summe Durchschnitt Array Struktogramm', 'Mittelwert Struktogramm'],
    keywordsEn: ['array average sum structogram'],
    titleDe: 'Summe, Durchschnitt & Minimum/Maximum eines Arrays im Struktogramm',
    titleEn: 'Sum, Average & Min/Max of an Array in a Structogram',
    metaTitleDe: 'Summe & Durchschnitt berechnen als Struktogramm (DIN 66261)',
    metaTitleEn: 'Array Sum & Average Structogram (DIN 66261)',
    metaDescriptionDe:
      'So berechnest du Summe und arithmetisches Mittel (Durchschnitt) eines Zahlen-Arrays sauber mit einer Zählschleife im Struktogramm.',
    metaDescriptionEn:
      'Compute the sum and arithmetic mean of an array using a single counting loop structogram.',
    excerptDe:
      'Summen-Akkumulator vor der Schleife auf 0 setzen, Werte addieren und nach der Schleife durch die Anzahl teilen.',
    excerptEn:
      'Initialize the sum accumulator to 0 before the loop, add each item, and divide by length afterward.',
    exampleDiagram: {
      id: 'blog-ex-avg',
      name: 'durchschnitt(werte)',
      x: 40,
      y: 40,
      width: 460,
      zIndex: 1,
      nodes: [
        { id: 'av1', type: 'sequence', text: 'summe = 0' },
        {
          id: 'av2',
          type: 'for',
          text: 'i = 0 bis laenge(werte) - 1',
          body: [{ id: 'av3', type: 'sequence', text: 'summe = summe + werte[i]' }],
        },
        { id: 'av4', type: 'sequence', text: 'mittel = summe / laenge(werte)' },
        { id: 'av5', type: 'sequence', text: 'Rückgabe: mittel' },
      ],
    },
    sectionsDe: [
      {
        heading: 'Wichtig: Division erst NACH der Schleife',
        paragraphs: [
          'Ein häufiger Anfängerfehler ist es, schon innerhalb der Schleife zu teilen. Erst nachdem alle Werte aufsummiert sind, wird einmal durch laenge(werte) geteilt (und ggf. vorher geprüft, ob das Array nicht leer ist!).',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Divide After the Loop Finishes',
        paragraphs: [
          'Accumulate the total inside the loop and perform the division once after the loop completes.',
        ],
      },
    ],
  },
  {
    slug: 'zweidimensionale-arrays-matrizen-struktogramm',
    date: '2026-11-22',
    readTimeMin: 6,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['2D Array Struktogramm', 'Matrix Struktogramm verschachtelte Schleife'],
    keywordsEn: ['2D array matrix structogram', 'nested loop matrix'],
    titleDe: '2D-Arrays & Matrizen mit verschachtelten Schleifen im Struktogramm',
    titleEn: '2D Arrays & Matrices with Nested Loops in Structograms',
    metaTitleDe: '2D-Array & Matrix im Struktogramm durchlaufen (DIN 66261)',
    metaTitleEn: 'Traversing 2D Arrays & Matrices in Structograms',
    metaDescriptionDe:
      'Zeilen und Spalten eines zweidimensionalen Arrays (Matrix, Sitzplan, Spielfeld) im Struktogramm sauber durchlaufen und auswerten.',
    metaDescriptionEn:
      'Traverse rows and columns of a 2D matrix cleanly using nested For loops in DIN 66261.',
    excerptDe:
      'Äußere Schleife für die Zeilen, innere Schleife für die Spalten: So durchläufst du Matrizen und Spielfelder im Struktogramm.',
    excerptEn:
      'Outer loop for rows, inner loop for columns: traversing grids and matrices in DIN 66261.',
    sectionsDe: [
      {
        heading: 'Zeilen-vor-Spalten-Prinzip',
        paragraphs: [
          'Bei einem zweidimensionalen Array matrix[zeile][spalte] läuft die äußere Zählschleife über alle Zeilen (z = 0 bis zeilen - 1) und die innere Zählschleife über alle Spalten (s = 0 bis spalten - 1).',
          'Typische Klausuraufgaben sind Zeilensummen, das Zählen freier Plätze in einem Kinosaal oder die Prüfung auf Gewinner bei Tic-Tac-Toe.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Row-Major Traversal',
        paragraphs: [
          'Use an outer counting loop for row index r and an inner counting loop for column index c to inspect matrix[r][c].',
        ],
      },
    ],
  },
  {
    slug: 'zeichenketten-strings-palindrome-struktogramm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Palindrom Struktogramm', 'String Verarbeitung Struktogramm'],
    keywordsEn: ['palindrome check structogram', 'string processing DIN 66261'],
    titleDe: 'Strings & Palindrom-Prüfung (Zwei-Zeiger-Technik) im Struktogramm',
    titleEn: 'Strings & Palindrome Check (Two-Pointer Technique) in Structograms',
    metaTitleDe: 'Palindrom-Prüfung als Struktogramm – Zwei-Zeiger-Algorithmus',
    metaTitleEn: 'Palindrome Check Structogram – Two-Pointer Algorithm',
    metaDescriptionDe:
      'Wort vorwärts und rückwärts prüfen: So setzt du die Zwei-Zeiger-Methode (links/rechts) für Strings im Struktogramm um.',
    metaDescriptionEn:
      'Verify palindromes efficiently with left/right pointers in a DIN 66261 structogram.',
    excerptDe:
      'Ob „ANNA“ oder „RENTNER“: Mit zwei Zeigern von außen nach innen prüfst du Strings in einem einzigen Durchgang.',
    excerptEn:
      'Check palindromes cleanly in a single pass by moving left and right pointers toward the center.',
    exampleDiagram: {
      id: 'blog-ex-palindrom',
      name: 'istPalindrom(wort)',
      x: 40,
      y: 40,
      width: 480,
      zIndex: 1,
      nodes: [
        { id: 'pl1', type: 'sequence', text: 'l = 0; r = laenge(wort) - 1; ok = wahr' },
        {
          id: 'pl2',
          type: 'while',
          text: 'l < r UND ok',
          body: [
            {
              id: 'pl3',
              type: 'if',
              text: 'wort[l] != wort[r]',
              trueLabel: 'wahr',
              falseLabel: 'falsch',
              thenBranch: [{ id: 'pl4', type: 'sequence', text: 'ok = falsch' }],
              elseBranch: [{ id: 'pl5', type: 'sequence', text: 'l = l + 1; r = r - 1' }],
            },
          ],
        },
        { id: 'pl6', type: 'sequence', text: 'Rückgabe: ok' },
      ],
    },
    sectionsDe: [
      {
        heading: 'Elegant und speichersparend ohne String-Umkehrung',
        paragraphs: [
          'Statt das ganze Wort erst mühsam umzudrehen, vergleichst du mit l = 0 und r = laenge - 1 direkt den ersten und letzten Buchstaben und rückst bei Gleichheit nach innen.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Two Pointers Without Extra Memory',
        paragraphs: [
          'Compare characters from both ends toward the middle and exit early as soon as a mismatch occurs.',
        ],
      },
    ],
  },
  {
    slug: 'geldautomat-pin-pruefung-struktogramm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Geldautomat Struktogramm', 'PIN Prüfung 3 Versuche Struktogramm'],
    keywordsEn: ['ATM PIN verification structogram', '3 attempts loop DIN 66261'],
    titleDe: 'Unterrichts-Klassiker: Geldautomat & PIN-Prüfung mit max. 3 Versuchen',
    titleEn: 'Classroom Classic: ATM PIN Verification with 3 Attempts',
    metaTitleDe: 'PIN-Prüfung (max. 3 Versuche) als Struktogramm – Live-Beispiel',
    metaTitleEn: 'ATM PIN Check (Max 3 Attempts) Structogram – Live Example',
    metaDescriptionDe:
      'Perfektes Beispiel für eine fußgesteuerte Schleife (do-while) mit Abbruchbedingung: PIN-Eingabe am Geldautomaten mit maximal 3 Fehlversuchen.',
    metaDescriptionEn:
      'Classic do-while loop exercise: ATM PIN check allowing up to 3 attempts before locking the card.',
    excerptDe:
      'Maximal 3 Versuche, sonst Karte einziehen: Das perfekte Übungsbeispiel für Schleifen + Zähler + Verzweigung.',
    excerptEn:
      'At most 3 attempts before card lock: a great combined exercise for do-while loops, counters, and branches.',
    exampleDiagram: {
      id: 'blog-ex-pin',
      name: 'pinPruefen(korrektePin)',
      x: 40,
      y: 40,
      width: 480,
      zIndex: 1,
      nodes: [
        { id: 'pn1', type: 'sequence', text: 'versuche = 0; zugang = falsch' },
        {
          id: 'pn2',
          type: 'doWhile',
          text: 'NICHT zugang UND versuche < 3',
          body: [
            { id: 'pn3', type: 'sequence', text: 'Einlesen: eingabe' },
            { id: 'pn4', type: 'sequence', text: 'versuche = versuche + 1' },
            {
              id: 'pn5',
              type: 'if',
              text: 'eingabe == korrektePin',
              trueLabel: 'wahr',
              falseLabel: 'falsch',
              thenBranch: [{ id: 'pn6', type: 'sequence', text: 'zugang = wahr' }],
              elseBranch: [{ id: 'pn7', type: 'sequence', text: 'Ausgabe: "Falsche PIN"' }],
            },
          ],
        },
        {
          id: 'pn8',
          type: 'if',
          text: 'zugang',
          trueLabel: 'wahr',
          falseLabel: 'falsch',
          thenBranch: [{ id: 'pn9', type: 'sequence', text: 'Ausgabe: "Willkommen"' }],
          elseBranch: [{ id: 'pn10', type: 'sequence', text: 'Ausgabe: "Karte gesperrt"' }],
        },
      ],
    },
    sectionsDe: [
      {
        heading: 'Warum hier eine fußgesteuerte Schleife perfekt passt',
        paragraphs: [
          'Der Benutzer muss auf jeden Fall mindestens einmal seine PIN eingeben. Deshalb startet die do-while-Schleife sofort mit der Eingabe und prüft anschließend, ob entweder die PIN stimmt oder bereits 3 Versuche verbraucht wurden.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Why Do-While Fits Naturally Here',
        paragraphs: [
          'The user always enters at least one PIN attempt, making a tail-controlled loop the cleanest representation.',
        ],
      },
    ],
  },
  {
    slug: 'taschenrechner-menue-struktogramm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'guide',
    categoryDe: 'Anleitung & Beispiele',
    categoryEn: 'Guide & Examples',
    keywordsDe: ['Taschenrechner Struktogramm', 'Menü Switch Case Struktogramm'],
    keywordsEn: ['calculator menu structogram', 'switch case loop'],
    titleDe: 'Konsolen-Taschenrechner & Auswahlmenü mit Switch-Case im Struktogramm',
    titleEn: 'Console Calculator & Menu Loop with Switch-Case in Structograms',
    metaTitleDe: 'Taschenrechner-Menü als Struktogramm (Switch-Case + Schleife)',
    metaTitleEn: 'Calculator Menu Structogram (Switch-Case + Loop)',
    metaDescriptionDe:
      'Kombination aus Menü-Schleife, Switch-Case und Fehlerbehandlung (Division durch 0) sauber im Struktogramm modelliert.',
    metaDescriptionEn:
      'Combine a menu loop, Switch-Case dispatch, and zero-division check cleanly in DIN 66261.',
    excerptDe:
      'Wie modelliert man interaktive Programme mit Wiederauswahl und Division-durch-Null-Schutz? Ein komplettes Praxisbeispiel.',
    excerptEn:
      'How to model interactive menu loops with operation dispatch and zero-division guards.',
    sectionsDe: [
      {
        heading: 'Aufbau eines interaktiven Menüs',
        paragraphs: [
          'Fast jedes Konsolen-Übungsprojekt kombiniert eine do-while-Schleife („Solange Auswahl != Beenden“) mit einer Switch-Case-Fallunterscheidung im Inneren. Vergiss bei der Division nie die innere Verzweigung auf „b == 0“!',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'Interactive Menu Architecture',
        paragraphs: [
          'Combine an outer do-while loop until the exit option is selected with an inner Switch-Case block and a zero-division guard.',
        ],
      },
    ],
  },
  {
    slug: 'verschachtelte-schleifen-verstehen-struktogramm',
    date: '2026-11-22',
    readTimeMin: 5,
    category: 'exam',
    categoryDe: 'Prüfung & Theorie',
    categoryEn: 'Exams & Theory',
    keywordsDe: ['verschachtelte Schleifen Struktogramm', 'Einmaleins Struktogramm'],
    keywordsEn: ['nested loops structogram', 'multiplication table algorithm'],
    titleDe: 'Verschachtelte Schleifen verstehen: Einmaleins-Tabelle & Durchlaufanzahl',
    titleEn: 'Understanding Nested Loops: Multiplication Table & Iteration Count',
    metaTitleDe: 'Verschachtelte Schleifen im Struktogramm verstehen (DIN 66261)',
    metaTitleEn: 'Nested Loops in Structograms Explained',
    metaDescriptionDe:
      'Wie viele Durchläufe hat eine verschachtelte Schleife? Anschaulich erklärt an der 1x1-Tabelle und Sternchen-Dreiecken im Struktogramm.',
    metaDescriptionEn:
      'Calculate total iterations and read nested counting loops cleanly with multiplication-table examples.',
    excerptDe:
      'Für jeden einzelnen Schritt der äußeren Schleife läuft die innere Schleife komplett durch — so behältst du immer den Überblick.',
    excerptEn:
      'For every single outer iteration, the inner loop runs to completion — master nested loops for exams.',
    sectionsDe: [
      {
        heading: 'Die goldene Regel bei verschachtelten Schleifen',
        paragraphs: [
          'Läuft die äußere Schleife n-mal und die innere Schleife m-mal, wird der innerste Block insgesamt n × m-mal ausgeführt. Darauf basiert auch die quadratische Laufzeit O(n²) bei einfachen Sortierverfahren.',
        ],
      },
    ],
    sectionsEn: [
      {
        heading: 'The Golden Rule of Nested Loops',
        paragraphs: [
          'If an outer loop runs n times and an inner loop runs m times, the inner body executes n × m times.',
        ],
      },
    ],
  },
];
