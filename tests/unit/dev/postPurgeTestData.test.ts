import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { purgeResult } = vi.hoisted(() => ({
  purgeResult: {
    driveFolder: { name: 'UI_TEST_DATA', action: 'trashed' },
    clients: { clientCodePrefix: 'UI_TEST_', action: 'removed', removedCount: 2 },
  },
}));

vi.mock('#devTestData/purgeDevTestData.js', () => ({ default: vi.fn().mockResolvedValue(purgeResult) }));

import purgeDevTestData from '#devTestData/purgeDevTestData.js';
import { postPurgeTestData } from '#routes/v1/dev/postPurgeTestData.js';

describe('POST /dev/test-data/purge', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDevToolKey = process.env.DEV_TOOL_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = originalNodeEnv;
    process.env.DEV_TOOL_KEY = originalDevToolKey;
  });

  it('purges dev test data without auth outside QA', async () => {
    process.env.NODE_ENV = 'development';
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await postPurgeTestData({ header: vi.fn() } as unknown as Request, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(purgeResult);
    expect(purgeDevTestData).toHaveBeenCalled();
  });

  it('requires the dev tool key in QA', async () => {
    process.env.NODE_ENV = 'qa';
    process.env.DEV_TOOL_KEY = 'qa-key';
    const req = { header: vi.fn().mockReturnValue('wrong-key') } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await postPurgeTestData(req, res);

    expect(req.header).toHaveBeenCalledWith('x-dev-tool-key');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(purgeDevTestData).not.toHaveBeenCalled();
  });

  it('accepts the dev tool key in QA', async () => {
    process.env.NODE_ENV = 'qa';
    process.env.DEV_TOOL_KEY = 'qa-key';
    const req = { header: vi.fn().mockReturnValue('qa-key') } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await postPurgeTestData(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(purgeResult);
    expect(purgeDevTestData).toHaveBeenCalled();
  });
});
