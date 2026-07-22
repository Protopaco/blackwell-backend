import { describe, it, expect, beforeEach, vi } from 'vitest';
import TimesheetDetail from '#models/TimesheetDetail.js';

const { readTimesheetDetailFromSheetsMock, getFileModifiedTimeMock } = vi.hoisted(() => ({
  readTimesheetDetailFromSheetsMock: vi.fn(),
  getFileModifiedTimeMock: vi.fn(),
}));

vi.mock('#services/timesheet/readTimesheetDetailFromSheets.js', () => ({ default: readTimesheetDetailFromSheetsMock }));
vi.mock('#db/adapter/getFileModifiedTime.js', () => ({ default: getFileModifiedTimeMock }));

import readTimesheetDetail from '#services/timesheet/readTimesheetDetail.js';
import timesheetDetailCache from '#utils/caches/timesheetDetailCache.js';

const detailAt = (totalHours: number): TimesheetDetail => ({
  totalHours,
  flatRateQuantity: null,
  employeeSigned: true,
  supervisorSigned: true,
  includeInPayroll: true,
});

describe('readTimesheetDetail', () => {
  beforeEach(() => {
    timesheetDetailCache.clear();
    readTimesheetDetailFromSheetsMock.mockReset();
    getFileModifiedTimeMock.mockReset();
  });

  it('reads from Sheets and caches the result on a cold cache', async () => {
    getFileModifiedTimeMock.mockResolvedValue('2026-07-01T00:00:00Z');
    readTimesheetDetailFromSheetsMock.mockResolvedValue(detailAt(10));

    const detail = await readTimesheetDetail('file-1', 'tab-1');

    expect(detail).toEqual(detailAt(10));
    expect(readTimesheetDetailFromSheetsMock).toHaveBeenCalledTimes(1);
  });

  it('serves the cached detail when modifiedTime matches the last read', async () => {
    getFileModifiedTimeMock.mockResolvedValue('2026-07-01T00:00:00Z');
    readTimesheetDetailFromSheetsMock.mockResolvedValue(detailAt(10));

    await readTimesheetDetail('file-1', 'tab-1');
    const secondDetail = await readTimesheetDetail('file-1', 'tab-1');

    expect(secondDetail).toEqual(detailAt(10));
    expect(readTimesheetDetailFromSheetsMock).toHaveBeenCalledTimes(1);
  });

  it('re-reads from Sheets when modifiedTime has changed since the last read', async () => {
    getFileModifiedTimeMock.mockResolvedValueOnce('2026-07-01T00:00:00Z');
    readTimesheetDetailFromSheetsMock.mockResolvedValueOnce(detailAt(10));
    await readTimesheetDetail('file-1', 'tab-1');

    getFileModifiedTimeMock.mockResolvedValueOnce('2026-07-02T00:00:00Z');
    readTimesheetDetailFromSheetsMock.mockResolvedValueOnce(detailAt(20));
    const secondDetail = await readTimesheetDetail('file-1', 'tab-1');

    expect(secondDetail).toEqual(detailAt(20));
    expect(readTimesheetDetailFromSheetsMock).toHaveBeenCalledTimes(2);
  });

  it('re-reads from Sheets when the Drive modifiedTime lookup fails to resolve a value', async () => {
    getFileModifiedTimeMock.mockResolvedValueOnce('2026-07-01T00:00:00Z');
    readTimesheetDetailFromSheetsMock.mockResolvedValueOnce(detailAt(10));
    await readTimesheetDetail('file-1', 'tab-1');

    getFileModifiedTimeMock.mockResolvedValueOnce(null);
    readTimesheetDetailFromSheetsMock.mockResolvedValueOnce(detailAt(10));
    await readTimesheetDetail('file-1', 'tab-1');

    expect(readTimesheetDetailFromSheetsMock).toHaveBeenCalledTimes(2);
  });

  it('keeps cache entries independent per timesheetFileId and tabName', async () => {
    getFileModifiedTimeMock.mockResolvedValue('2026-07-01T00:00:00Z');
    readTimesheetDetailFromSheetsMock
      .mockResolvedValueOnce(detailAt(10))
      .mockResolvedValueOnce(detailAt(99));

    await readTimesheetDetail('file-1', 'tab-1');
    const otherTabDetail = await readTimesheetDetail('file-1', 'tab-2');

    expect(otherTabDetail).toEqual(detailAt(99));
    expect(readTimesheetDetailFromSheetsMock).toHaveBeenCalledTimes(2);
  });

  it('coalesces concurrent calls for the same file and tab into a single Sheets read', async () => {
    let resolveModifiedTime: (value: string) => void;
    getFileModifiedTimeMock.mockReturnValue(new Promise((resolve) => {
      resolveModifiedTime = resolve;
    }));
    readTimesheetDetailFromSheetsMock.mockResolvedValue(detailAt(10));

    const firstCall = readTimesheetDetail('file-1', 'tab-1');
    const secondCall = readTimesheetDetail('file-1', 'tab-1');

    resolveModifiedTime!('2026-07-01T00:00:00Z');
    const [firstDetail, secondDetail] = await Promise.all([firstCall, secondCall]);

    expect(firstDetail).toEqual(detailAt(10));
    expect(secondDetail).toEqual(detailAt(10));
    expect(readTimesheetDetailFromSheetsMock).toHaveBeenCalledTimes(1);
    expect(getFileModifiedTimeMock).toHaveBeenCalledTimes(1);
  });

  it('allows a new read once a coalesced call has finished, rather than reusing it forever', async () => {
    getFileModifiedTimeMock.mockResolvedValue('2026-07-01T00:00:00Z');
    readTimesheetDetailFromSheetsMock.mockResolvedValue(detailAt(10));

    await readTimesheetDetail('file-1', 'tab-1');
    timesheetDetailCache.clear();
    await readTimesheetDetail('file-1', 'tab-1');

    expect(readTimesheetDetailFromSheetsMock).toHaveBeenCalledTimes(2);
  });

  it('bypasses the cache entirely when timesheetFileId is empty', async () => {
    readTimesheetDetailFromSheetsMock.mockResolvedValue({
      totalHours: null,
      flatRateQuantity: null,
      employeeSigned: false,
      supervisorSigned: false,
      includeInPayroll: true,
    });

    await readTimesheetDetail('', 'tab-1');

    expect(getFileModifiedTimeMock).not.toHaveBeenCalled();
    expect(readTimesheetDetailFromSheetsMock).toHaveBeenCalledTimes(1);
  });
});
