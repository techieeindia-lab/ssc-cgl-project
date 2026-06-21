// src/constants/subjectGroups.ts
// ── 3-level hierarchy: SubjectGroup → Topic → Chapter
// Replaces the flat QA/GIR/GA/EN section model for Study Hub.

export type Chapter = {
  id: string;
  label: string;
  /** Quiz route params — tapping chapter opens quiz with these */
  quizParams: { section: string; tag: string };
};

export type Topic = {
  id: string;
  label: string;
  icon: string;
  chapters: Chapter[];
};

export type SubjectGroup = {
  id: string;
  name: string;
  icon: string;
  color: string;
  topics: Topic[];
};

// ─── Subject Groups ───────────────────────────────────────────

export const SUBJECT_GROUPS: SubjectGroup[] = [
  // ── GENERAL KNOWLEDGE ──────────────────────────────────────
  {
    id: 'GK',
    name: 'General Knowledge',
    icon: '📚',
    color: '#27AE60',
    topics: [
      {
        id: 'history', label: 'History', icon: '🏛️',
        chapters: [
          { id: 'ancient', label: 'Ancient India', quizParams: { section: 'GA', tag: 'history' } },
          { id: 'medieval', label: 'Medieval India', quizParams: { section: 'GA', tag: 'history' } },
          { id: 'modern', label: 'Modern India', quizParams: { section: 'GA', tag: 'history' } },
          { id: 'freedom-movement', label: 'Freedom Movement', quizParams: { section: 'GA', tag: 'history' } },
        ],
      },
      {
        id: 'geography', label: 'Geography', icon: '🌍',
        chapters: [
          { id: 'indian-geo', label: 'Indian Geography', quizParams: { section: 'GA', tag: 'geography' } },
          { id: 'world-geo', label: 'World Geography', quizParams: { section: 'GA', tag: 'geography' } },
          { id: 'climate', label: 'Climate & Weather', quizParams: { section: 'GA', tag: 'geography' } },
          { id: 'resources', label: 'Natural Resources', quizParams: { section: 'GA', tag: 'geography' } },
        ],
      },
      {
        id: 'polity', label: 'Polity & Constitution', icon: '⚖️',
        chapters: [
          { id: 'constitution', label: 'Constitution Basics', quizParams: { section: 'GA', tag: 'polity' } },
          { id: 'fundamental-rights', label: 'Fundamental Rights', quizParams: { section: 'GA', tag: 'polity' } },
          { id: 'parliament', label: 'Parliament & President', quizParams: { section: 'GA', tag: 'polity' } },
          { id: 'amendments', label: 'Key Amendments', quizParams: { section: 'GA', tag: 'polity' } },
        ],
      },
      {
        id: 'economy', label: 'Economy', icon: '💹',
        chapters: [
          { id: 'indian-economy', label: 'Indian Economy Basics', quizParams: { section: 'GA', tag: 'economy' } },
          { id: 'budget', label: 'Budget & Planning', quizParams: { section: 'GA', tag: 'economy' } },
          { id: 'banking', label: 'Banking & Finance', quizParams: { section: 'GA', tag: 'economy' } },
          { id: 'schemes', label: 'Govt. Schemes', quizParams: { section: 'GA', tag: 'economy' } },
        ],
      },
      {
        id: 'current-affairs', label: 'Current Affairs', icon: '📰',
        chapters: [
          { id: 'this-week', label: 'This Week', quizParams: { section: 'GA', tag: 'current-affairs' } },
          { id: 'this-month', label: 'This Month', quizParams: { section: 'GA', tag: 'current-affairs' } },
          { id: 'important-events', label: 'Important Events', quizParams: { section: 'GA', tag: 'current-affairs' } },
        ],
      },
      {
        id: 'sports', label: 'Sports', icon: '⚽',
        chapters: [
          { id: 'cricket', label: 'Cricket', quizParams: { section: 'GA', tag: 'sports' } },
          { id: 'football-oly', label: 'Football & Olympics', quizParams: { section: 'GA', tag: 'sports' } },
          { id: 'other-sports', label: 'Other Sports', quizParams: { section: 'GA', tag: 'sports' } },
        ],
      },
      {
        id: 'awards', label: 'Awards & Honours', icon: '🏆',
        chapters: [
          { id: 'national-awards', label: 'National Awards', quizParams: { section: 'GA', tag: 'awards' } },
          { id: 'international-awards', label: 'International Awards', quizParams: { section: 'GA', tag: 'awards' } },
        ],
      },
    ],
  },

  // ── GENERAL SCIENCE ────────────────────────────────────────
  {
    id: 'GS',
    name: 'General Science',
    icon: '🔬',
    color: '#9B59B6',
    topics: [
      {
        id: 'physics', label: 'Physics', icon: '⚛️',
        chapters: [
          { id: 'units', label: 'Units & Measurements', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'motion', label: 'Motion & Laws', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'energy', label: 'Energy & Work', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'light', label: 'Light & Optics', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'electricity', label: 'Electricity', quizParams: { section: 'GA', tag: 'science' } },
        ],
      },
      {
        id: 'chemistry', label: 'Chemistry', icon: '🧪',
        chapters: [
          { id: 'elements', label: 'Elements & Compounds', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'reactions', label: 'Chemical Reactions', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'acids-bases', label: 'Acids & Bases', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'everyday-chem', label: 'Everyday Chemistry', quizParams: { section: 'GA', tag: 'science' } },
        ],
      },
      {
        id: 'biology', label: 'Biology', icon: '🧬',
        chapters: [
          { id: 'cells', label: 'Cell Biology', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'human-body', label: 'Human Body', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'diseases', label: 'Diseases & Nutrition', quizParams: { section: 'GA', tag: 'science' } },
          { id: 'environment', label: 'Environment & Ecology', quizParams: { section: 'GA', tag: 'science' } },
        ],
      },
    ],
  },

  // ── ENGLISH ────────────────────────────────────────────────
  {
    id: 'EN',
    name: 'English',
    icon: '📝',
    color: '#F39C12',
    topics: [
      {
        id: 'vocabulary', label: 'Vocabulary', icon: '📖',
        chapters: [
          { id: 'synonyms', label: 'Synonyms', quizParams: { section: 'EN', tag: 'vocabulary' } },
          { id: 'antonyms', label: 'Antonyms', quizParams: { section: 'EN', tag: 'vocabulary' } },
          { id: 'one-word', label: 'One Word Substitution', quizParams: { section: 'EN', tag: 'one-word-substitution' } },
          { id: 'spelling', label: 'Spelling', quizParams: { section: 'EN', tag: 'vocabulary' } },
        ],
      },
      {
        id: 'grammar', label: 'Grammar', icon: '📐',
        chapters: [
          { id: 'error-spotting', label: 'Error Spotting', quizParams: { section: 'EN', tag: 'error-spotting' } },
          { id: 'fill-blanks', label: 'Fill in the Blanks', quizParams: { section: 'EN', tag: 'fill-blanks' } },
          { id: 'sentence-improve', label: 'Sentence Improvement', quizParams: { section: 'EN', tag: 'sentence-improvement' } },
          { id: 'articles', label: 'Articles & Prepositions', quizParams: { section: 'EN', tag: 'fill-blanks' } },
        ],
      },
      {
        id: 'reading', label: 'Reading Comprehension', icon: '📚',
        chapters: [
          { id: 'passages', label: 'Passage Reading', quizParams: { section: 'EN', tag: 'reading-comprehension' } },
          { id: 'inference', label: 'Inference & Tone', quizParams: { section: 'EN', tag: 'reading-comprehension' } },
        ],
      },
      {
        id: 'idioms', label: 'Idioms & Phrases', icon: '💬',
        chapters: [
          { id: 'common-idioms', label: 'Common Idioms', quizParams: { section: 'EN', tag: 'idioms-phrases' } },
          { id: 'phrases', label: 'Important Phrases', quizParams: { section: 'EN', tag: 'idioms-phrases' } },
        ],
      },
    ],
  },

  // ── MISCELLANEOUS (Quant + Reasoning) ──────────────────────
  {
    id: 'MISC',
    name: 'Miscellaneous',
    icon: '🧩',
    color: '#E74C3C',
    topics: [
      // Quantitative Aptitude
      {
        id: 'percentage', label: 'Percentage', icon: '💯',
        chapters: [
          { id: 'basics', label: 'Basics & Formulas', quizParams: { section: 'QA', tag: 'percentage' } },
          { id: 'applications', label: 'Applications', quizParams: { section: 'QA', tag: 'percentage' } },
          { id: 'shortcuts', label: 'Short Tricks', quizParams: { section: 'QA', tag: 'percentage' } },
        ],
      },
      {
        id: 'profit-loss', label: 'Profit & Loss', icon: '💰',
        chapters: [
          { id: 'pl-formulas', label: 'Formulas', quizParams: { section: 'QA', tag: 'profit-loss' } },
          { id: 'pl-word-problems', label: 'Word Problems', quizParams: { section: 'QA', tag: 'profit-loss' } },
          { id: 'pl-advanced', label: 'Advanced Problems', quizParams: { section: 'QA', tag: 'profit-loss' } },
        ],
      },
      {
        id: 'time-work', label: 'Time & Work', icon: '⏰',
        chapters: [
          { id: 'tw-basics', label: 'Basics', quizParams: { section: 'QA', tag: 'time-work' } },
          { id: 'tw-pipes', label: 'Pipes & Cisterns', quizParams: { section: 'QA', tag: 'time-work' } },
          { id: 'tw-advanced', label: 'Advanced Problems', quizParams: { section: 'QA', tag: 'time-work' } },
        ],
      },
      {
        id: 'speed-distance', label: 'Speed, Distance & Time', icon: '🚄',
        chapters: [
          { id: 'sd-basics', label: 'Basics', quizParams: { section: 'QA', tag: 'speed-distance' } },
          { id: 'sd-trains', label: 'Trains', quizParams: { section: 'QA', tag: 'speed-distance' } },
          { id: 'sd-boats', label: 'Boats & Streams', quizParams: { section: 'QA', tag: 'speed-distance' } },
        ],
      },
      {
        id: 'ratio-proportion', label: 'Ratio & Proportion', icon: '⚖️',
        chapters: [
          { id: 'rp-basics', label: 'Basics', quizParams: { section: 'QA', tag: 'ratio-proportion' } },
          { id: 'rp-mixtures', label: 'Mixtures & Alligations', quizParams: { section: 'QA', tag: 'ratio-proportion' } },
        ],
      },
      {
        id: 'algebra', label: 'Algebra', icon: '🔢',
        chapters: [
          { id: 'alg-basics', label: 'Basics & Identities', quizParams: { section: 'QA', tag: 'algebra' } },
          { id: 'alg-equations', label: 'Linear Equations', quizParams: { section: 'QA', tag: 'algebra' } },
        ],
      },
      {
        id: 'geometry', label: 'Geometry', icon: '📐',
        chapters: [
          { id: 'geo-lines', label: 'Lines & Angles', quizParams: { section: 'QA', tag: 'geometry' } },
          { id: 'geo-triangles', label: 'Triangles', quizParams: { section: 'QA', tag: 'geometry' } },
          { id: 'geo-circles', label: 'Circles', quizParams: { section: 'QA', tag: 'geometry' } },
          { id: 'geo-mensuration', label: 'Mensuration', quizParams: { section: 'QA', tag: 'geometry' } },
        ],
      },
      {
        id: 'number-system', label: 'Number System', icon: '🔢',
        chapters: [
          { id: 'ns-basics', label: 'Types & Properties', quizParams: { section: 'QA', tag: 'number-system' } },
          { id: 'ns-hcf-lcm', label: 'HCF & LCM', quizParams: { section: 'QA', tag: 'number-system' } },
          { id: 'ns-squares', label: 'Squares & Roots', quizParams: { section: 'QA', tag: 'number-system' } },
        ],
      },
      // Reasoning
      {
        id: 'analogy', label: 'Analogy', icon: '🔗',
        chapters: [
          { id: 'ana-word', label: 'Word Analogy', quizParams: { section: 'GIR', tag: 'analogy' } },
          { id: 'ana-number', label: 'Number Analogy', quizParams: { section: 'GIR', tag: 'analogy' } },
        ],
      },
      {
        id: 'series', label: 'Series', icon: '📊',
        chapters: [
          { id: 'ser-number', label: 'Number Series', quizParams: { section: 'GIR', tag: 'series' } },
          { id: 'ser-alpha', label: 'Alphabet Series', quizParams: { section: 'GIR', tag: 'series' } },
        ],
      },
      {
        id: 'coding-decoding', label: 'Coding-Decoding', icon: '🔐',
        chapters: [
          { id: 'cd-letter', label: 'Letter Coding', quizParams: { section: 'GIR', tag: 'coding-decoding' } },
          { id: 'cd-number', label: 'Number Coding', quizParams: { section: 'GIR', tag: 'coding-decoding' } },
        ],
      },
      {
        id: 'blood-relations', label: 'Blood Relations', icon: '👨‍👩‍👧‍👦',
        chapters: [
          { id: 'br-direct', label: 'Direct Relations', quizParams: { section: 'GIR', tag: 'blood-relations' } },
          { id: 'br-coded', label: 'Coded Relations', quizParams: { section: 'GIR', tag: 'blood-relations' } },
        ],
      },
      {
        id: 'direction-sense', label: 'Direction Sense', icon: '🧭',
        chapters: [
          { id: 'ds-basic', label: 'Basic Directions', quizParams: { section: 'GIR', tag: 'direction-sense' } },
          { id: 'ds-shadow', label: 'Shadow Problems', quizParams: { section: 'GIR', tag: 'direction-sense' } },
        ],
      },
      {
        id: 'syllogism', label: 'Syllogism', icon: '🔀',
        chapters: [
          { id: 'syl-two', label: 'Two Statement', quizParams: { section: 'GIR', tag: 'syllogism' } },
          { id: 'syl-three', label: 'Three Statement', quizParams: { section: 'GIR', tag: 'syllogism' } },
        ],
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────

/** Get a subject group by its ID */
export const getGroupById = (id: string) =>
  SUBJECT_GROUPS.find((g) => g.id === id);

/** Get a topic within a group */
export const getTopicById = (groupId: string, topicId: string) =>
  getGroupById(groupId)?.topics.find((t) => t.id === topicId);

/** Total chapters across a group */
export const totalChapters = (group: SubjectGroup) =>
  group.topics.reduce((sum, t) => sum + t.chapters.length, 0);

/** Total topics across a group */
export const totalTopics = (group: SubjectGroup) => group.topics.length;
