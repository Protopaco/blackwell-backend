import { describe, it, expect } from 'vitest';
import buildSheetValues from '#services/payrollReport/buildSheetValues.js';

describe('buildSheetValues', () => {
  it('puts the header row first', () => {
    const values = buildSheetValues([{ A: 1, B: 2 }], ['A', 'B']);
    expect(values[0]).toEqual(['A', 'B']);
  });

  it('orders row values by the given header order, not object key order', () => {
    const values = buildSheetValues([{ B: 2, A: 1 }], ['A', 'B']);
    expect(values[1]).toEqual([1, 2]);
  });

  it('falls back to an empty string for a field missing from the row', () => {
    const values = buildSheetValues([{ A: 1 }], ['A', 'B']);
    expect(values[1]).toEqual([1, '']);
  });

  it('drops fields on the row that are not in the headers list', () => {
    const values = buildSheetValues([{ A: 1, B: 2, C: 3 }], ['A', 'B']);
    expect(values[1]).toEqual([1, 2]);
  });

  it('returns just the header row for an empty rows array', () => {
    const values = buildSheetValues([], ['A', 'B']);
    expect(values).toEqual([['A', 'B']]);
  });

  it('handles multiple rows', () => {
    const values = buildSheetValues(
      [{ A: 1, B: 2 }, { A: 3, B: 4 }],
      ['A', 'B'],
    );
    expect(values).toEqual([['A', 'B'], [1, 2], [3, 4]]);
  });
});
