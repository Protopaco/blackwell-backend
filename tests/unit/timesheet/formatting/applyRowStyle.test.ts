import { describe, it, expect } from 'vitest';
import applyRowStyle from '#services/timesheet/formatting/applyRowStyle.js';
import { type RowStyle, dailyTotalRow, dayOfWeekRow, identityRow } from '#services/timesheet/formatting/rowStyles.js';

const minimalStyle: RowStyle = { fill: dayOfWeekRow.fill };

describe('applyRowStyle', () => {
  it('builds a single fillRow request for a style with no labelFill, border, or holidayFill', () => {
    const requests = applyRowStyle(1, minimalStyle, 2, 0, 9) as any[];
    expect(requests).toHaveLength(1);
    expect(requests[0]).toHaveProperty('repeatCell');
  });

  it('adds a labelFill request when the style defines one', () => {
    const requests = applyRowStyle(1, dailyTotalRow, 5, 0, 9) as any[];
    const repeatCellRequests = requests.filter((request) => 'repeatCell' in request);
    // base fill + label fill = 2 repeatCell requests (border adds an updateBorders request too)
    expect(repeatCellRequests).toHaveLength(2);
    expect(repeatCellRequests[1].repeatCell.range.startColumnIndex).toBe(0);
    expect(repeatCellRequests[1].repeatCell.range.endColumnIndex).toBe(1);
    expect(repeatCellRequests[1].repeatCell.cell.userEnteredFormat.horizontalAlignment).toBe('LEFT');
  });

  it('adds an updateBorders request when the style defines a border', () => {
    const requests = applyRowStyle(1, identityRow, 1, 0, 1) as any[];
    const borderRequests = requests.filter((request) => 'updateBorders' in request);
    expect(borderRequests).toHaveLength(1);
  });

  it('adds one holiday fill request per holiday column when the style defines holidayFill', () => {
    const requests = applyRowStyle(1, dayOfWeekRow, 2, 0, 9, [3, 6]) as any[];
    const repeatCellRequests = requests.filter((request) => 'repeatCell' in request);
    // base fill + 2 holiday overrides = 3 repeatCell requests
    expect(repeatCellRequests).toHaveLength(3);
    expect(repeatCellRequests[1].repeatCell.range.startColumnIndex).toBe(3);
    expect(repeatCellRequests[2].repeatCell.range.startColumnIndex).toBe(6);
  });

  it('adds no holiday fill requests when no holiday columns are passed', () => {
    const requests = applyRowStyle(1, dayOfWeekRow, 2, 0, 9) as any[];
    const repeatCellRequests = requests.filter((request) => 'repeatCell' in request);
    expect(repeatCellRequests).toHaveLength(1);
  });
});
