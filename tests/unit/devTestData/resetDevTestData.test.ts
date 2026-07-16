import { describe, it, expect, vi } from 'vitest';

vi.mock('#devTestData/deleteDevTestData.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#devTestData/createDevTestDataRoot.js', () => ({ default: vi.fn().mockResolvedValue('root-folder-1') }));
vi.mock('#devTestData/scenarios/createFreshClientScenario.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import resetDevTestData from '#devTestData/resetDevTestData.js';
import deleteDevTestData from '#devTestData/deleteDevTestData.js';
import createDevTestDataRoot from '#devTestData/createDevTestDataRoot.js';
import createFreshClientScenario from '#devTestData/scenarios/createFreshClientScenario.js';

describe('resetDevTestData', () => {
  it('deletes existing test data, recreates the root folder, and creates fresh client data', async () => {
    await resetDevTestData();

    expect(deleteDevTestData).toHaveBeenCalled();
    expect(createDevTestDataRoot).toHaveBeenCalled();
    expect(createFreshClientScenario).toHaveBeenCalledWith('root-folder-1');
  });
});
