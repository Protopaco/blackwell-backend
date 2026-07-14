import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import scenarios from './scenarios.js';
import createTestRootFolder from '../builders/createTestRootFolder.js';
import getUniqueCode from '../helpers/getUniqueCode.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import { assert } from 'node:console';
import buildDriveFolderLink from '../buildDriveFolderLink.js';
import createFolder from '#db/adapter/createFolder.js';

const defaultSettings = {
  timeInputMethod: TimeInputMethod.TotalHours,
  payPeriodInterval: PayPeriodInterval.BiWeekly,
  payPeriodStartDate: '2026-01-01',
};

describe('POST /api/v1/client', () => {
  it('creates a client with a new folder tree', async () => {
    const root = await createTestRootFolder('createClient_newFolderTree');
    const res = await request(app)
      .post('/api/v1/client')
      .send({
        clientName: 'New Folder Tree Test Client',
        clientCode: getUniqueCode('NEW'),
        employeePayrollFolder: {
          createNew: true,
          rootFolderLink: root.folderLink,
        },
        settings: defaultSettings,
      });

    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    expect(res.body.clientId).toBeDefined();
    expect(res.body.employeePayrollFolderId).toBeDefined();
    expect(res.body.payrollConfigFolderId).toBeDefined();
    expect(res.body.payrollReportFolderId).toBeDefined();
    expect(res.body.payrollConfigFileId).toBeDefined();
    expect(res.body.payPeriodRegistryFileId).toBeDefined();
  });

  it('creates a client whose folders all link to an already-existing folder tree', async () => {
    const root = await createTestRootFolder('createClient_allLinkedExisting');
    const employeePayrollFolderId = await createFolder('Employee Payroll', root.folderId);
    const payrollConfigFolderId = await createFolder('Payroll Config', employeePayrollFolderId);
    const payrollReportFolderId = await createFolder('Payroll Report', employeePayrollFolderId);

    const res = await request(app)
      .post('/api/v1/client')
      .send({
        clientName: 'All Linked Existing Test Client',
        clientCode: getUniqueCode('LINKED'),
        employeePayrollFolder: {
          link: buildDriveFolderLink(employeePayrollFolderId),
        },
        payrollConfigFolder: { link: buildDriveFolderLink(payrollConfigFolderId) },
        payrollReportFolder: { link: buildDriveFolderLink(payrollReportFolderId) },
        settings: defaultSettings,
      });

    assert(res.status === 201, `Expected status 201, got ${res.status}`);
    expect(res.body.employeePayrollFolderId).toBeDefined();
    expect(res.body.payrollConfigFolderId).toBe(payrollConfigFolderId);
    expect(res.body.payrollReportFolderId).toBe(payrollReportFolderId);
    expect(res.body.payrollConfigFileId).toBeDefined();
    expect(res.body.payPeriodRegistryFileId).toBeDefined();
  });
});
