import { describe, it, expect, vi } from 'vitest';

vi.mock('#db/adapter/readTab.js', () => ({
  default: vi.fn().mockResolvedValue([
    { FundingSourceId: 'fs1', FundingSourceName: 'Federal Grant', FundingSourceCode: 'FG-100' },
    { FundingSourceId: 'fs2', FundingSourceName: 'State Grant', FundingSourceCode: '' },
  ]),
}));
vi.mock('#db/adapter/deleteRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteFundingSourceRow from '#db/fundingSource/deleteFundingSourceRow.js';
import deleteRow from '#db/adapter/deleteRow.js';

describe('deleteFundingSourceRow', () => {
  it('deletes the sheet row matching the given fundingSourceId, accounting for the header row', async () => {
    await deleteFundingSourceRow('config-1', 'fs2');

    // fs2 is the second data row (index 1) -> sheet row 3 (1 header row + 1-based index)
    expect(deleteRow).toHaveBeenCalledWith('config-1', 'FundingSources', 3);
  });

  it('throws NotFoundError when the fundingSourceId does not match any row', async () => {
    await expect(deleteFundingSourceRow('config-1', 'unknown')).rejects.toThrow(
      'Funding source not found: unknown',
    );
  });
});
