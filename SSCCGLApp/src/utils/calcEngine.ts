// src/utils/calcEngine.ts
// Tiny safe expression evaluator.
// Supports: + - × ÷ * / % ( ) ^ √  and unary minus.
// Returns { value, error } so the UI can show partial input without crashing.

const isDigit = (c: string) => c >= '0' && c <= '9';

export type CalcResult = { value: number; error: string | null };

export const evaluate = (raw: string): CalcResult => {
  // Normalize display strings → tokenizable chars.
  // Replace ×, ÷, √, π, e and strip whitespace.
  let s = raw
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, '(Math.PI)')
    .replace(/\be\b/g, '(Math.E)')
    .replace(/√\(/g, 'sqrt(')
    .replace(/\s+/g, '');

  // Insert implicit multiplication: "2(3)" → "2*(3)", "(2)3" → "(2)*3", "2π" → "2*π"
  s = s
    .replace(/(\d|\))\(/g, '$1*(')
    .replace(/\)(\d|\()/g, ')*$1');

  // Convert ^ to **
  s = s.replace(/\^/g, '**');

  // Replace % with /100
  s = s.replace(/(?<=[\d\)])%/g, '/100');

  if (s === '') return { value: 0, error: null };

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('sqrt', 'return ' + s);
    const result = fn(Math.sqrt);
    if (typeof result !== 'number' || !isFinite(result)) {
      return { value: 0, error: 'Math error' };
    }
    // Trim floating point noise
    const rounded = Math.round(result * 1e10) / 1e10;
    return { value: rounded, error: null };
  } catch (e: any) {
    return { value: 0, error: 'Incomplete expression' };
  }
};