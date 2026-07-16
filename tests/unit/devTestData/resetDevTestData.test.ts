import { describe, it, expect, vi } from 'vitest';

vi.mock('#services/devTestData/deleteDevTestData.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#services/devTestData/createDevTestDataRoot.js', () => ({ default: vi.fn().mockResolvedValue('root-folder-1') }));

import resetDevTestData from '#services/devTestData/resetDevTestData.js';
import deleteDevTestData from '#services/devTestData/deleteDevTestData.js';
import createDevTestDataRoot from '#services/devTestData/createDevTestDataRoot.js';

describe('resetDevTestData', () => {
  it('deletes existing test data and recreates the root folder', async () => {
    await resetDevTestData();

    expect(deleteDevTestData).toHaveBeenCalled();
    expect(createDevTestDataRoot).toHaveBeenCalled();
  });
});
