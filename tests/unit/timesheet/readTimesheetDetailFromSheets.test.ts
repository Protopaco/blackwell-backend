import { describe, it, expect, beforeEach, vi } from 'vitest';
import TimesheetManifest from '#models/TimesheetManifest.js';
import { TabNotFoundError } from '#utils/errors.js';

const { readTabValuesBatchMock } = vi.hoisted(() => ({
  readTabValuesBatchMock: vi.fn(),
}));

vi.mock('#db/adapter/readTabValuesBatch.js', () => ({ default: readTabValuesBatchMock }));

import readTimesheetDetailFromSheets from '#services/timesheet/readTimesheetDetailFromSheets.js';

const manifest: TimesheetManifest = {
  payPeriodId: 'pp-1',
  employeeId: 'e-1',
  generatedAt: '2026-07-01T00:00:00Z',
  tabName: 'tab-1',
  weeks: [],
  employeeSignatureCell: { row: 5, column: 2 },
  supervisorSignatureCell: { row: 6, column: 2 },
  includeInPayrollCell: { row: 7, column: 2 },
  summaryRows: [
    { label: 'Total Hours Worked', row: 8 },
    { label: 'Flat Rate Shifts', row: 9 },
  ],
};

const manifestRows = (entries: [string, TimesheetManifest][]): unknown[][] => (
  entries.map(([tabName, entry]) => [tabName, JSON.stringify(entry)])
);

const tabRowsFor = (manifestEntry: TimesheetManifest): unknown[][] => {
  const rows: unknown[][] = [];
  rows[manifestEntry.employeeSignatureCell.row - 1] = ['', 'Employee Signature'];
  rows[manifestEntry.supervisorSignatureCell.row - 1] = ['', 'Supervisor Signature'];
  rows[manifestEntry.includeInPayrollCell!.row - 1] = ['', false];
  rows[manifestEntry.summaryRows![0].row - 1] = ['Total Hours Worked', 37.5];
  rows[manifestEntry.summaryRows![1].row - 1] = ['Flat Rate Shifts', 2];
  return rows;
};

const quotaError = (): unknown => ({ code: 429, message: 'Quota exceeded' });

describe('readTimesheetDetailFromSheets', () => {
  beforeEach(() => {
    readTabValuesBatchMock.mockReset();
  });

  it('returns notGenerated immediately for an empty timesheetFileId, without calling Sheets', async () => {
    const detail = await readTimesheetDetailFromSheets('', 'tab-1');

    expect(detail).toEqual({
      totalHours: null,
      flatRateQuantity: null,
      employeeSigned: false,
      supervisorSigned: false,
      includeInPayroll: true,
    });
    expect(readTabValuesBatchMock).not.toHaveBeenCalled();
  });

  it('parses manifest and tab values from a single batched call', async () => {
    readTabValuesBatchMock.mockResolvedValue([
      manifestRows([['tab-1', manifest]]),
      tabRowsFor(manifest),
    ]);

    const detail = await readTimesheetDetailFromSheets('file-1', 'tab-1');

    expect(detail).toEqual({
      totalHours: 37.5,
      flatRateQuantity: 2,
      employeeSigned: true,
      supervisorSigned: true,
      includeInPayroll: false,
    });
    expect(readTabValuesBatchMock).toHaveBeenCalledWith('file-1', ['_manifest', 'tab-1']);
  });

  it('returns notGenerated when the batch call fails because a tab does not exist', async () => {
    readTabValuesBatchMock.mockRejectedValue(new TabNotFoundError('tab not found'));

    const detail = await readTimesheetDetailFromSheets('file-1', 'tab-1');

    expect(detail).toEqual({
      totalHours: null,
      flatRateQuantity: null,
      employeeSigned: false,
      supervisorSigned: false,
      includeInPayroll: true,
    });
  });

  it('propagates a non-TabNotFoundError instead of reporting notGenerated', async () => {
    readTabValuesBatchMock.mockRejectedValue(quotaError());

    await expect(readTimesheetDetailFromSheets('file-1', 'tab-1')).rejects.toEqual(quotaError());
  });

  it('returns notGenerated when the manifest has no entry for this tabName', async () => {
    readTabValuesBatchMock.mockResolvedValue([
      manifestRows([['some-other-tab', manifest]]),
      tabRowsFor(manifest),
    ]);

    const detail = await readTimesheetDetailFromSheets('file-1', 'tab-1');

    expect(detail.totalHours).toBeNull();
  });
});
