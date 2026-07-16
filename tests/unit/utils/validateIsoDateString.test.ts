import { describe, it, expect } from 'vitest';
import validateIsoDateString from '#utils/validateIsoDateString.js';

describe('validateIsoDateString', () => {
  it('allows valid YYYY-MM-DD dates', () => {
    expect(() => validateIsoDateString('2026-09-07')).not.toThrow();
  });

  it('rejects dates that do not use the exact YYYY-MM-DD format', () => {
    expect(() => validateIsoDateString('2026-9-7', 'holidayDate')).toThrow(
      'holidayDate must be a valid YYYY-MM-DD date',
    );
    expect(() => validateIsoDateString('09/07/2026', 'holidayDate')).toThrow(
      'holidayDate must be a valid YYYY-MM-DD date',
    );
  });

  it('rejects impossible calendar dates', () => {
    expect(() => validateIsoDateString('2026-02-30', 'holidayDate')).toThrow(
      'holidayDate must be a valid YYYY-MM-DD date',
    );
  });

  it('uses date as the default field name', () => {
    expect(() => validateIsoDateString('not-a-date')).toThrow(
      'date must be a valid YYYY-MM-DD date',
    );
  });
});
