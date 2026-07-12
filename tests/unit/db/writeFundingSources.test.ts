import { describe, it, expect, vi } from 'vitest';
import FundingSource from '#models/FundingSource.js';

const { existingFundingSource } = vi.hoisted(() => ({
  existingFundingSource: {
    fundingSourceId: 'fs1',
    fundingSourceName: 'Federal Grant',
    fundingSourceCode: 'FG-100',
  } as FundingSource,
}));

vi.mock('#db/adapter/writeTab.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('#db/fundingSource/readFundingSources.js', () => ({
  default: vi.fn().mockResolvedValue([existingFundingSource]),
}));

import writeFundingSources from '#db/fundingSource/writeFundingSources.js';
import writeTab from '#db/adapter/writeTab.js';

describe('writeFundingSources', () => {
  it('writes the updated funding source in place of the matching existing record', async () => {
    await writeFundingSources('config-1', { ...existingFundingSource, fundingSourceName: 'Renamed Grant' });

    expect(writeTab).toHaveBeenCalledWith('config-1', 'FundingSources', [
      { FundingSourceId: 'fs1', FundingSourceName: 'Renamed Grant', FundingSourceCode: 'FG-100' },
    ]);
  });

  it('throws NotFoundError when the fundingSourceId does not match any existing funding source', async () => {
    await expect(
      writeFundingSources('config-1', {
        fundingSourceId: 'unknown',
        fundingSourceName: 'X',
      }),
    ).rejects.toThrow('Funding source not found: unknown');
  });
});
