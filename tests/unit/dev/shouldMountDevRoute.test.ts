import { describe, expect, it } from 'vitest';
import shouldMountDevRoute from '#routes/v1/dev/shouldMountDevRoute.js';

describe('shouldMountDevRoute', () => {
  it('mounts dev routes only in development and QA', () => {
    expect(shouldMountDevRoute('development')).toBe(true);
    expect(shouldMountDevRoute('qa')).toBe(true);
    expect(shouldMountDevRoute('production')).toBe(false);
    expect(shouldMountDevRoute('staging')).toBe(false);
    expect(shouldMountDevRoute(undefined)).toBe(false);
  });
});
