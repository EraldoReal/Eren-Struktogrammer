export interface OperatorEntry {
  id: string;
  category:
    | 'variables'
    | 'io'
    | 'subroutine'
    | 'control'
    | 'arrays';
  title: string;
  syntax: string;
  example: string;
  description: string;
}

export const OPERATOR_CATEGORIES: { id: OperatorEntry['category']; label: string }[] = [
  { id: 'variables', label: 'Variablen & Zuweisung' },
  { id: 'io', label: 'Ein- & Ausgabe' },
  { id: 'subroutine', label: 'Unterprogramm & Rückgabe' },
  { id: 'control', label: 'Bedingungen & Schleifen' },
  { id: 'arrays', label: 'Arrays' },
];

export const OPERATORS_LIST: OperatorEntry[] = [
  // Variablen & Zuweisung
  {
    id: 'decl',
    category: 'variables',
    title: 'Deklaration',
    syntax: 'Deklaration: variable als datentyp',
    example: 'Deklaration: alter als Ganzzahl',
    description: 'Deklaration einer Variablen (optionale Angabe des Datentyps).',
  },
  {
    id: 'init',
    category: 'variables',
    title: 'Initialisierung',
    syntax: 'Initialisierung: variable = wert',
    example: 'Initialisierung: guthaben = 10',
    description: 'Initialisierung einer Variablen mit einem Ausgangswert oder Berechnungsergebnis.',
  },
  {
    id: 'decl-init',
    category: 'variables',
    title: 'Deklaration und Initialisierung',
    syntax: 'Deklaration und Initialisierung: variable als datentyp = wert',
    example: 'Deklaration und Initialisierung: anzahl als Ganzzahl = 0',
    description: 'Kombination aus Deklaration und Initialisierung.',
  },
  {
    id: 'assign',
    category: 'variables',
    title: 'Zuweisung',
    syntax: 'Zuweisung: element = wert',
    example: 'Zuweisung: qm = laenge * breite',
    description: 'Zuweisung eines Wertes oder Berechnungsergebnisses an eine Variable/ein Element.',
  },

  // Ein- & Ausgabe
  {
    id: 'read',
    category: 'io',
    title: 'Einlesen',
    syntax: 'Einlesen: variable als datentyp',
    example: 'Deklaration und Einlesen: betrag als Dezimalzahl',
    description: 'Einlesen einer Eingabe (auch in Kombination mit Deklaration möglich).',
  },
  {
    id: 'output',
    category: 'io',
    title: 'Ausgabe',
    syntax: 'Ausgabe: inhalt',
    example: 'Ausgabe: "Die Fläche beträgt " + qm + " Quadratmeter."',
    description: 'Ausgabe einer Variablen, eines Arrays, eines Textes oder einer Kombination.',
  },
  {
    id: 'output-nl',
    category: 'io',
    title: 'Zeilenweise Ausgabe',
    syntax: 'Ausgabe: inhalt + Zeilenumbruch',
    example: 'Ausgabe: "Hallo!" + Zeilenumbruch',
    description: 'Ausgabe mit anschließendem Zeilenumbruch.',
  },

  // Unterprogramm & Rückgabe
  {
    id: 'return',
    category: 'subroutine',
    title: 'Rückgabe',
    syntax: 'Rückgabe: wert',
    example: 'Rückgabe: strecke',
    description: 'Anweisung zur Rückgabe eines Wertes innerhalb einer Funktion/Methode/Prozedur.',
  },
  {
    id: 'call',
    category: 'subroutine',
    title: 'Aufruf (Unterprogramm)',
    syntax: 'Aufruf: methode(parameter)',
    example: 'Aufruf: einzahlen(betrag)',
    description: 'Aufruf einer Funktion, Methode, Prozedur oder eines Unterprogramms.',
  },

  // Bedingungen & Schleifen
  {
    id: 'if-cond',
    category: 'control',
    title: 'Bedingung (Wenn … dann)',
    syntax: 'bedingung1 AND bedingung2',
    example: 'alter > 18 AND geschlecht == "w"',
    description: 'Vergleichsoperatoren: ==, !=, <, <=, >, >= | Logik: AND, OR, NOT',
  },
  {
    id: 'while',
    category: 'control',
    title: 'Kopfgesteuerte Schleife (while)',
    syntax: 'Wiederhole solange bedingung',
    example: 'Wiederhole solange inhalt > 10',
    description: 'Schleife mit vorausgehender Bedingungsprüfung.',
  },
  {
    id: 'for-while',
    category: 'control',
    title: 'Zählschleife (Variante 1)',
    syntax: 'Wiederhole von startwert solange bedingung, Schrittweite schrittweite',
    example: 'Wiederhole von i = 0 solange i < 5, Schrittweite 1',
    description: 'Zählergesteuerte Schleife (for-Schleife), alternative Darstellung 1.',
  },
  {
    id: 'for-count',
    category: 'control',
    title: 'Zählschleife (Variante 2)',
    syntax: 'Zähle zählvariable von startwert bis endwert, Schrittweite schrittweite',
    example: 'Zähle i von 0 bis 4, Schrittweite 1',
    description: 'Zählergesteuerte Schleife (for-Schleife), alternative Darstellung 2.',
  },

  // Arrays
  {
    id: 'array-init',
    category: 'arrays',
    title: 'Array Deklaration & Initialisierung',
    syntax: 'Deklaration und Initialisierung: array als Array = [Element1, Element2]',
    example: 'Deklaration und Initialisierung: personen = ["Sven", "Tina", "Anja"]',
    description: 'Initialisierung eines Arrays mit Werten (oder leer: zahlen als Array = [ ]).',
  },
  {
    id: 'array-empty',
    category: 'arrays',
    title: 'Leeres Array deklarieren',
    syntax: 'Deklaration und Initialisierung: array als Array = [ ]',
    example: 'Deklaration und Initialisierung: zahlen als Array = [ ]',
    description: 'Deklaration und Initialisierung eines leeren Arrays.',
  },
  {
    id: 'array-assign',
    category: 'arrays',
    title: 'Array-Zuweisung / Anhängen',
    syntax: 'Zuweisung: array[feldindex] = wert',
    example: 'Zuweisung: personen[2] = "Kay"',
    description: 'Zuweisung an ein Arrayelement per Index (oder Anhängen an neuen Index).',
  },
  {
    id: 'array-length',
    category: 'arrays',
    title: 'Anzahl der Elemente eines Arrays',
    syntax: 'Deklaration und Initialisierung: laenge = Anzahl der Elemente des Arrays array',
    example: 'Deklaration und Initialisierung: laenge = Anzahl der Elemente des Arrays personen',
    description: 'Zuweisung der Anzahl der Arrayelemente an eine Variable.',
  },
  {
    id: 'array-output',
    category: 'arrays',
    title: 'Ausgabe Array / Arrayelement',
    syntax: 'Ausgabe: array[feldindex]',
    example: 'Ausgabe: personen[i]',
    description: 'Ausgabe eines einzelnen Arrayelements oder des gesamten Arrays (Ausgabe: zahlen).',
  },
];
