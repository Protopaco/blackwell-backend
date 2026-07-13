import { describe, it, expect } from 'vitest';
import mapClient from '#db/client/mapClient.js';

describe('mapClient', () => {
  it('maps a full row to a Client', () => {
    const client = mapClient({
      ClientId: 'c1',
      ClientName: 'Demo Client',
      ClientCode: 'DEMO',
      Status: 'Active',
      EmployeePayrollFolderId: 'folder-2',
      PayrollConfigFolderId: 'folder-3',
      PayrollReportFolderId: 'folder-5',
      TimesheetsFolderId: 'folder-6',
      PayrollConfigFileId: 'file-1',
      PayPeriodRegistryFileId: 'file-2',
    });

    expect(client).toEqual({
      clientId: 'c1',
      clientName: 'Demo Client',
      clientCode: 'DEMO',
      status: 'Active',
      employeePayrollFolderId: 'folder-2',
      payrollConfigFolderId: 'folder-3',
      payrollReportFolderId: 'folder-5',
      timesheetsFolderId: 'folder-6',
      payrollConfigFileId: 'file-1',
      payPeriodRegistryFileId: 'file-2',
    });
  });

  describe('timesheetsFolderId nullability', () => {
    it('maps a missing value to null', () => {
      expect(mapClient({}).timesheetsFolderId).toBeNull();
    });

    it('maps an empty string to null', () => {
      expect(mapClient({ TimesheetsFolderId: '' }).timesheetsFolderId).toBeNull();
    });
  });
});
