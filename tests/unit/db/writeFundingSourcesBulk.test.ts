import { describe, it, expect, vi } from 'vitest';
import FundingSource from '#models/FundingSource.js';

vi.mock('#db/adapter/writeValues.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import writeFundingSourcesBulk from '#db/fundingSource/writeFundingSourcesBulk.js';
import writeValues from '#db/adapter/writeValues.js';

const fundingSource: FundingSource = {
  fundingSourceId: 'fs1',
  fundingSourceName: 'Federal Grant',
  fundingSourceCode: 'FG-100',
};

describe('writeFundingSourcesBulk', () => {
  it('writes a header row plus one row per funding source', async () => {
    await writeFundingSourcesBulk('report-1', [fundingSource]);

    expect(writeValues).toHaveBeenCalledWith('report-1', 'FundingSources', [
      ['FundingSourceId', 'FundingSourceName', 'FundingSourceCode'],
      ['fs1', 'Federal Grant', 'FG-100'],
    ]);
  });

  it('still writes just the header row when there are no funding sources', async () => {
    await writeFundingSourcesBulk('report-1', []);

    expect(writeValues).toHaveBeenCalledWith('report-1', 'FundingSources', [
      ['FundingSourceId', 'FundingSourceName', 'FundingSourceCode'],
    ]);
  });
});
