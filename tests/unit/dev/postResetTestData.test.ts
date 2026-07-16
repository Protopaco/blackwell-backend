import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#devTestData/resetDevTestData.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import resetDevTestData from '#devTestData/resetDevTestData.js';
import { postResetTestData } from '#routes/v1/dev/postResetTestData.js';

describe('POST /dev/testData/reset', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resets dev test data and returns a simple success message', async () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await postResetTestData({} as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Test data reset' });
    expect(resetDevTestData).toHaveBeenCalled();
  });
});
