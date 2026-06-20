// src/constants/examConfig.js
// ── FULL REPLACEMENT — adds QUIZ_TOPICS ──

export const SECTIONS = [
  { id: 'QA',  name: 'Quantitative Aptitude',            shortName: 'QA',  questions: 25, duration: 900, color: '#E74C3C', icon: '🔢' },
  { id: 'GIR', name: 'General Intelligence & Reasoning', shortName: 'GIR', questions: 25, duration: 900, color: '#9B59B6', icon: '🧠' },
  { id: 'GA',  name: 'General Awareness',                shortName: 'GA',  questions: 25, duration: 900, color: '#27AE60', icon: '🌍' },
  { id: 'EN',  name: 'English Comprehension',            shortName: 'ENG', questions: 25, duration: 900, color: '#F39C12', icon: '📝' },
];

export const EXAM_CONFIG = {
  totalQuestions: 100,
  totalDuration: 3600,
  marksPerCorrect: 2,
  marksPerWrong: -0.5,
  marksPerSkipped: 0,
};

// Quiz question count options
export const QUIZ_COUNTS = [5, 10, 15, 20];

// Topics per section (should match `tags` field values in Firestore)
export const QUIZ_TOPICS = {
  QA: [
    { tag: 'number-system',    label: 'Number System'    },
    { tag: 'percentage',       label: 'Percentage'       },
    { tag: 'profit-loss',      label: 'Profit & Loss'    },
    { tag: 'ratio-proportion', label: 'Ratio & Proportion'},
    { tag: 'time-work',        label: 'Time & Work'      },
    { tag: 'speed-distance',   label: 'Speed & Distance' },
    { tag: 'algebra',          label: 'Algebra'          },
    { tag: 'geometry',         label: 'Geometry'         },
    { tag: 'trigonometry',     label: 'Trigonometry'     },
    { tag: 'statistics',       label: 'Statistics'       },
  ],
  GIR: [
    { tag: 'analogy',          label: 'Analogy'          },
    { tag: 'series',           label: 'Series'           },
    { tag: 'coding-decoding',  label: 'Coding-Decoding'  },
    { tag: 'blood-relations',  label: 'Blood Relations'  },
    { tag: 'direction-sense',  label: 'Direction Sense'  },
    { tag: 'syllogism',        label: 'Syllogism'        },
    { tag: 'matrix',           label: 'Matrix'           },
    { tag: 'venn-diagram',     label: 'Venn Diagram'     },
  ],
  GA: [
    { tag: 'history',          label: 'History'          },
    { tag: 'geography',        label: 'Geography'        },
    { tag: 'polity',           label: 'Polity'           },
    { tag: 'economy',          label: 'Economy'          },
    { tag: 'science',          label: 'Science'          },
    { tag: 'current-affairs',  label: 'Current Affairs'  },
    { tag: 'sports',           label: 'Sports'           },
    { tag: 'awards',           label: 'Awards'           },
  ],
  EN: [
    { tag: 'reading-comprehension', label: 'Reading Comprehension' },
    { tag: 'fill-blanks',           label: 'Fill in the Blanks'    },
    { tag: 'error-spotting',        label: 'Error Spotting'        },
    { tag: 'vocabulary',            label: 'Vocabulary'            },
    { tag: 'idioms-phrases',        label: 'Idioms & Phrases'      },
    { tag: 'one-word-substitution', label: 'One Word Substitution' },
    { tag: 'sentence-improvement',  label: 'Sentence Improvement'  },
  ],
};