import { describe, it, expect, vi } from 'vitest';

vi.mock('#db/adapter/readTab.js', () => ({
  default: vi.fn().mockResolvedValue([
    { ActivityId: 'a1', ActivityName: 'Job Coaching' },
    { ActivityId: 'a2', ActivityName: 'Driving' },
  ]),
}));
vi.mock('#db/adapter/deleteRow.js', () => ({ default: vi.fn().mockResolvedValue(undefined) }));

import deleteActivityRow from '#db/activity/deleteActivityRow.js';
import deleteRow from '#db/adapter/deleteRow.js';

describe('deleteActivityRow', () => {
  it('deletes the sheet row matching the given activityId, accounting for the header row', async () => {
    await deleteActivityRow('config-1', 'a2');

    // a2 is the second data row (index 1) -> sheet row 3 (1 header row + 1-based index)
    expect(deleteRow).toHaveBeenCalledWith('config-1', 'Activities', 3);
  });

  it('throws NotFoundError when the activityId does not match any row', async () => {
    await expect(deleteActivityRow('config-1', 'unknown')).rejects.toThrow('Activity not found: unknown');
  });
});
