import { describe, it, expect } from 'vitest';
import mapClient from '#db/client/mapClient.js';

describe('mapClient', () => {
  it('maps a full row to a Client', () => {
    const client = mapClient({
      ClientId: 'c1',
      ClientName: 'Demo Client',
      ClientCode: 'DEMO',
      TrackFundingSource: 'TRUE',
      ClientFolderLink: 'https://drive.google.com/folder',
      ClientFolderId: 'folder-1',
      EmployeePayrollFolderId: 'folder-2',
      PayrollConfigFolderId: 'folder-3',
      ReportFolderId: 'folder-4',
      PayrollReportFolderId: 'folder-5',
      TimesheetFolderId: 'folder-6',
      PayrollConfigFileId: 'file-1',
      PayPeriodRegistryFileId: 'file-2',
    });

    expect(client).toEqual({
      clientId: 'c1',
      clientName: 'Demo Client',
      clientCode: 'DEMO',
      trackFundingSource: true,
      clientFolderLink: 'https://drive.google.com/folder',
      clientFolderId: 'folder-1',
      employeePayrollFolderId: 'folder-2',
      payrollConfigFolderId: 'folder-3',
      reportsFolderId: 'folder-4',
      payrollReportFolderId: 'folder-5',
      timesheetsFolderId: 'folder-6',
      payrollConfigFileId: 'file-1',
      payPeriodRegistryFileId: 'file-2',
    });
  });

  describe('trackFundingSource coercion', () => {
    it('treats boolean true as true', () => {
      expect(mapClient({ TrackFundingSource: true }).trackFundingSource).toBe(true);
    });

    it('treats string "TRUE" as true', () => {
      expect(mapClient({ TrackFundingSource: 'TRUE' }).trackFundingSource).toBe(true);
    });

    it('treats string "FALSE" as false', () => {
      expect(mapClient({ TrackFundingSource: 'FALSE' }).trackFundingSource).toBe(false);
    });

    it('treats a missing value as false', () => {
      expect(mapClient({}).trackFundingSource).toBe(false);
    });
  });
});
