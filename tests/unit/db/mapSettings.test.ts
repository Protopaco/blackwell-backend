import { describe, it, expect } from 'vitest';
import mapSettings from '#db/settings/mapSettings.js';

describe('mapSettings', () => {
  it('maps a full row to Settings', () => {
    const settings = mapSettings({
      TimesheetTemplate: 'ClockInOut',
      PayPeriodInterval: 'Bi-Weekly',
      PayPeriodStartDate: '2026-01-05',
    });

    expect(settings).toEqual({
      timeInputMethod: 'ClockInOut',
      payPeriodInterval: 'Bi-Weekly',
      payPeriodStartDate: '2026-01-05',
    });
  });

  it('maps the TimesheetTemplate column to timeInputMethod, not a same-named field', () => {
    const settings = mapSettings({ TimesheetTemplate: 'TotalHours' });
    expect(settings.timeInputMethod).toBe('TotalHours');
    expect(settings).not.toHaveProperty('timesheetTemplate');
  });
});
