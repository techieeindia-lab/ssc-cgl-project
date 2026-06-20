// src/data/studyContent.ts
// Static study content for the Study Hub: flashcards, one-liners, e-book
// chapters, and mind-map nodes — all keyed by (section, topic tag).
//
// To extend: add entries under each section. Tags MUST match the
// `tags` field used in quiz questions (see src/constants/examConfig.js → QUIZ_TOPICS).

export type Flashcard = { front: string; back: string };
export type OneLiner = { q: string; a: string };
export type EbookChapter = {
  title: string;
  readTime: string; // human-friendly
  content: string;
};
export type MindMapNode = {
  id: string;
  label: string;
  children?: MindMapNode[];
};

// ──────────────────────────────────────────────
// FLASHCARDS
// ──────────────────────────────────────────────
export const FLASHCARDS: Record<string, Record<string, Flashcard[]>> = {
  QA: {
    'percentage': [
      { front: 'What is the formula for percentage change?',
        back: '% Change = ((New − Old) / Old) × 100' },
      { front: 'If 20% of x = 30, what is x?',
        back: 'x = (30 × 100) / 20 = 150' },
      { front: 'Successive % increase of 10% and 20%?',
        back: 'Net = 10 + 20 + (10×20)/100 = 32%' },
    ],
    'profit-loss': [
      { front: 'SP = ?', back: 'SP = CP × (1 + Profit%/100)' },
      { front: 'Discount formula?',
        back: 'SP = MP × (1 − Discount%/100)' },
    ],
    'speed-distance': [
      { front: 'Average speed formula?',
        back: 'Avg Speed = Total Distance / Total Time' },
      { front: 'If speed doubles, time?',
        back: 'Time becomes 1/2 (inverse proportion)' },
    ],
    'time-work': [
      { front: 'A can do work in 10 days, B in 20. Together?',
        back: '1/10 + 1/20 = 3/20 → 20/3 ≈ 6.67 days' },
    ],
  },
  GIR: {
    'analogy': [
      { front: 'Doctor : Hospital :: Teacher : ?',
        back: 'School' },
    ],
    'series': [
      { front: 'Find next: 2, 6, 12, 20, 30, ?',
        back: 'Differences are 4, 6, 8, 10, 12 → next = 42' },
    ],
    'blood-relations': [
      { front: "A is B's father's son. A is B's?",
        back: 'Brother (or A = B himself)' },
    ],
  },
  GA: {
    'history': [
      { front: 'When was the Quit India Movement launched?',
        back: '8 August 1942' },
      { front: 'First President of India?',
        back: 'Dr. Rajendra Prasad' },
    ],
    'polity': [
      { front: 'How many fundamental rights are in the Indian Constitution?',
        back: 'Originally 7, now 6 (Right to Property removed)' },
    ],
    'geography': [
      { front: 'Longest river of India?',
        back: 'Ganga (2525 km)' },
    ],
  },
  EN: {
    'vocabulary': [
      { front: 'Synonym of "Abundant"?',
        back: 'Plentiful, copious, ample' },
    ],
    'idioms-phrases': [
      { front: '"A blessing in disguise" means?',
        back: 'Something that seems bad at first but turns out good.' },
    ],
    'error-spotting': [
      { front: 'Subject-verb agreement rule?',
        back: 'Singular subject takes singular verb.' },
    ],
  },
};

// ──────────────────────────────────────────────
// ONE-LINERS (quick fact recall)
// ──────────────────────────────────────────────
export const ONE_LINERS: Record<string, Record<string, OneLiner[]>> = {
  QA: {
    'number-system': [
      { q: 'LCM of 12, 15, 20?', a: '60' },
      { q: 'HCF of 36, 48?', a: '12' },
      { q: 'Sum of first 100 natural numbers?', a: '5050' },
    ],
    'percentage': [
      { q: 'Convert 3/4 to %', a: '75%' },
      { q: 'If x increases by 25%, the new value is?', a: '1.25x' },
    ],
    'ratio-proportion': [
      { q: 'Ratio 3:5 in 80 parts?', a: '30 and 50' },
    ],
  },
  GIR: {
    'analogy': [
      { q: 'Pen : Writer :: Scalpel : ?', a: 'Surgeon' },
    ],
    'coding-decoding': [
      { q: 'If APPLE = 50, BALL = ?', a: 'Depends on letter-value rule (A=1, B=2 …)' },
    ],
  },
  GA: {
    'history': [
      { q: 'Capital of the Mughal Empire in 1526?', a: 'Agra (Babur founded it)' },
    ],
    'economy': [
      { q: 'RBI was established in?', a: '1 April 1935' },
    ],
  },
  EN: {
    'fill-blanks': [
      { q: 'He is good ___ mathematics.', a: 'at' },
    ],
    'vocabulary': [
      { q: 'Antonym of "Obsolete"?', a: 'Modern, current' },
    ],
  },
};

// ──────────────────────────────────────────────
// E-BOOK CHAPTERS (markdown-ish)
// ──────────────────────────────────────────────
export const EBOOK_CHAPTERS: Record<string, Record<string, EbookChapter[]>> = {
  QA: {
    'percentage': [
      {
        title: 'Percentage Basics',
        readTime: '4 min',
        content: `Percentage means "per hundred". To convert a fraction to %, multiply by 100.\n\nFormula: x% = x / 100.\n\nThree key operations:\n• Find % of a number: (x/100) × N\n• Express one number as % of another: (A / B) × 100\n• % change: ((New − Old) / Old) × 100`,
      },
      {
        title: 'Successive Percentage',
        readTime: '5 min',
        content: `When a value changes by x% then y%, the net change is:\n\nNet = x + y + (xy / 100)\n\nThis works for both increase (+) and decrease (−). For a 20% increase followed by 20% decrease, you do NOT return to the original — you lose 4%.`,
      },
    ],
    'speed-distance': [
      {
        title: 'Speed, Distance, Time',
        readTime: '6 min',
        content: `The fundamental relation: Distance = Speed × Time.\n\nUnit conversions to remember:\n• 1 km/h = 5/18 m/s\n• 1 m/s = 18/5 km/h\n\nAverage speed ≠ average of two speeds. For equal distances, average speed = (2 × s₁ × s₂) / (s₁ + s₂).`,
      },
    ],
  },
  GIR: {
    'analogy': [
      {
        title: 'Solving Analogies',
        readTime: '3 min',
        content: `Analogies test the relationship between two words. Common relations: tool:user, cause:effect, part:whole, function:object.\n\nIdentify the relation in the first pair, then find the same relation in the answer choices.`,
      },
    ],
    'series': [
      {
        title: 'Number Series Patterns',
        readTime: '5 min',
        content: `Look for patterns in:\n• Differences (constant, increasing, alternating)\n• Ratios\n• Squares, cubes, primes\n• Two interleaved series\n\nTip: Try differences first — most SSC series are based on linear or quadratic progressions.`,
      },
    ],
  },
  GA: {
    'history': [
      {
        title: 'Indian National Movement — Key Dates',
        readTime: '7 min',
        content: `1857 — First War of Independence\n1885 — Indian National Congress founded\n1906 — Muslim League\n1919 — Jallianwala Bagh\n1930 — Civil Disobedience (Dandi March)\n1942 — Quit India Movement\n1947 — Independence\n\nRemember the Acts: 1919 (Montagu-Chelmsford), 1935 (Government of India Act — most detailed).`,
      },
    ],
    'polity': [
      {
        title: 'Fundamental Rights at a Glance',
        readTime: '5 min',
        content: `Article 14–18: Right to Equality\nArticle 19–22: Right to Freedom\nArticle 23–24: Right against Exploitation\nArticle 25–28: Right to Freedom of Religion\nArticle 29–30: Cultural & Educational Rights\nArticle 32: Right to Constitutional Remedies (Dr. Ambedkar called it the heart & soul of the Constitution).`,
      },
    ],
  },
  EN: {
    'vocabulary': [
      {
        title: 'Common SSC Vocabulary',
        readTime: '6 min',
        content: `Ephemeral — lasting a very short time\nCogent — clear, logical, convincing\nAlacrity — brisk and cheerful readiness\nMagnanimous — generous, forgiving\nPernicious — harmful, destructive\nSycophant — a person who acts obsequiously\nEquivocate — use ambiguous language\nVenerable — accorded great respect\n`,
      },
    ],
    'idioms-phrases': [
      {
        title: 'Top 15 Idioms Asked in SSC',
        readTime: '5 min',
        content: `1. A blessing in disguise — good that seemed bad\n2. A bolt from the blue — sudden surprise\n3. A storm in a teacup — big fuss over small issue\n4. Back to square one — start over\n5. Burn the midnight oil — work late\n6. By and large — on the whole\n7. Cut corners — do shoddy work\n8. In hot water — in trouble\n9. Once in a blue moon — very rarely\n10. Through thick and thin — in all circumstances\n`,
      },
    ],
  },
};

// ──────────────────────────────────────────────
// MIND-MAPS (hierarchical)
// ──────────────────────────────────────────────
export const MINDMAPS: Record<string, Record<string, MindMapNode>> = {
  QA: {
    'percentage': {
      id: 'pct',
      label: 'Percentage',
      children: [
        { id: 'pct-basics', label: 'Basics', children: [
          { id: 'pct-def', label: 'Definition (per 100)' },
          { id: 'pct-conv', label: 'F↔% Conversions' },
        ]},
        { id: 'pct-formulas', label: 'Formulas', children: [
          { id: 'pct-find', label: 'Find x% of N' },
          { id: 'pct-express', label: 'A as % of B' },
          { id: 'pct-change', label: '% Change' },
        ]},
        { id: 'pct-successive', label: 'Successive %', children: [
          { id: 'pct-succ-formula', label: 'x + y + xy/100' },
          { id: 'pct-succ-reverse', label: 'Reverse calculation' },
        ]},
      ],
    },
    'speed-distance': {
      id: 'sd',
      label: 'Speed · Distance · Time',
      children: [
        { id: 'sd-base', label: 'D = S × T' },
        { id: 'sd-conv', label: 'km/h ↔ m/s', children: [
          { id: 'sd-c1', label: '× 5/18' },
          { id: 'sd-c2', label: '× 18/5' },
        ]},
        { id: 'sd-avg', label: 'Average Speed', children: [
          { id: 'sd-avg-eq', label: 'Equal distances → 2ab/(a+b)' },
          { id: 'sd-avg-time', label: 'Equal times → (a+b)/2' },
        ]},
      ],
    },
  },
  GIR: {
    'analogy': {
      id: 'an',
      label: 'Analogy',
      children: [
        { id: 'an-1', label: 'Word : Meaning' },
        { id: 'an-2', label: 'Tool : Worker' },
        { id: 'an-3', label: 'Cause : Effect' },
        { id: 'an-4', label: 'Part : Whole' },
        { id: 'an-5', label: 'Opposite pairs' },
      ],
    },
    'series': {
      id: 'sr',
      label: 'Number Series',
      children: [
        { id: 'sr-diff', label: 'Constant difference' },
        { id: 'sr-incr', label: 'Increasing difference' },
        { id: 'sr-alt', label: 'Alternating' },
        { id: 'sr-sq', label: 'Squares / Cubes' },
        { id: 'sr-mix', label: 'Two interleaved' },
      ],
    },
  },
  GA: {
    'history': {
      id: 'hi',
      label: 'Indian History',
      children: [
        { id: 'hi-ancient', label: 'Ancient', children: [
          { id: 'hi-ancient-1', label: 'Indus Valley' },
          { id: 'hi-ancient-2', label: 'Vedic Age' },
          { id: 'hi-ancient-3', label: 'Mauryas & Guptas' },
        ]},
        { id: 'hi-medieval', label: 'Medieval', children: [
          { id: 'hi-med-1', label: 'Delhi Sultanate' },
          { id: 'hi-med-2', label: 'Mughals' },
        ]},
        { id: 'hi-modern', label: 'Modern', children: [
          { id: 'hi-mod-1', label: 'British Rule' },
          { id: 'hi-mod-2', label: 'Freedom Struggle' },
        ]},
      ],
    },
  },
  EN: {
    'vocabulary': {
      id: 'vo',
      label: 'Vocabulary',
      children: [
        { id: 'vo-syn', label: 'Synonyms' },
        { id: 'vo-ant', label: 'Antonyms' },
        { id: 'vo-idiom', label: 'Idioms & Phrases' },
        { id: 'vo-one', label: 'One-word Substitution' },
        { id: 'vo-spell', label: 'Spellings' },
      ],
    },
  },
};

// Helper to safely read content; returns [] / {} when missing.
export const getFlashcards = (section: string, tag: string): Flashcard[] =>
  FLASHCARDS[section]?.[tag] ?? [];
export const getOneLiners = (section: string, tag: string): OneLiner[] =>
  ONE_LINERS[section]?.[tag] ?? [];
export const getEbookChapters = (section: string, tag: string): EbookChapter[] =>
  EBOOK_CHAPTERS[section]?.[tag] ?? [];
export const getMindmap = (section: string, tag: string): MindMapNode | null =>
  MINDMAPS[section]?.[tag] ?? null;