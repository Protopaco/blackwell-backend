import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createTestRootFolder from '../builders/createTestRootFolder.js';
import getUniqueCode from '../helpers/getUniqueCode.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import buildDriveFolderLink from '../buildDriveFolderLink.js';
import createFolder from '#db/adapter/createFolder.js';
import createTestClient from '../builders/createTestClient.js';

const defaultSettings = {
  timeInputMethod: TimeInputMethod.TotalHours,
  payPeriodInterval: PayPeriodInterval.BiWeekly,
  payPeriodStartDate: '2026-01-01',
};

describe('POST /api/v1/client', () => {
  it('201 - Creates client with new folder tree', async () => {
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

    expect(res.status).toBe(201);
    expect(res.body.clientId).toBeDefined();
    expect(res.body.employeePayrollFolderId).toBeDefined();
    expect(res.body.payrollConfigFolderId).toBeDefined();
    expect(res.body.payrollReportFolderId).toBeDefined();
    expect(res.body.payrollConfigFileId).toBeDefined();
    expect(res.body.payPeriodRegistryFileId).toBeDefined();
  });

  it('201 - Creates client with existing folders linked', async () => {
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

    expect(res.status).toBe(201);
    expect(res.body.employeePayrollFolderId).toBeDefined();
    expect(res.body.payrollConfigFolderId).toBe(payrollConfigFolderId);
    expect(res.body.payrollReportFolderId).toBe(payrollReportFolderId);
    expect(res.body.payrollConfigFileId).toBeDefined();
    expect(res.body.payPeriodRegistryFileId).toBeDefined();
  });

  it.fails('422 - Client Code already exists', async () => {
    const existingClient = await createTestClient();
    const root = await createTestRootFolder('createClient_duplicateClientCode');

    const res = await request(app)
      .post('/api/v1/client')
      .send({
        clientName: 'Duplicate Client Code Test Client',
        clientCode: existingClient.clientCode,
        employeePayrollFolder: {
          createNew: true,
          rootFolderLink: root.folderLink,
        },
        payrollConfigFolder: { createNew: true, rootFolderLink: root.folderLink },
        payrollReportFolder: { createNew: true, rootFolderLink: root.folderLink },
        settings: defaultSettings,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('already exists');
    expect(res.body.message).toContain('Client Code');
  });

  it('422 - Payroll Config file already exists', async () => {
    const existingClient = await createTestClient();

    const res = await request(app)
      .post('/api/v1/client')
      .send({
        clientName: 'Duplicate Payroll Config Test Client',
        clientCode: existingClient.clientCode,
        employeePayrollFolder: {
          link: buildDriveFolderLink(existingClient.employeePayrollFolderId),
        },
        payrollConfigFolder: {
          link: buildDriveFolderLink(existingClient.payrollConfigFolderId),
        },
        payrollReportFolder: {
          link: buildDriveFolderLink(existingClient.payrollReportFolderId),
        },
        settings: defaultSettings,
      });

    expect(res.status).toBe(422);
    const { message } = res.body;
    expect(message).toContain('A file');
    expect(message).toContain('already exists');
    expect(message).toContain('Payroll Config');
  });

  it('422 - Payroll Config folder already exists', async () => {
    const existingClient = await createTestClient();

    const res = await request(app)
      .post('/api/v1/client')
      .send({
        clientName: 'Duplicate Payroll Config Test Client',
        clientCode: existingClient.clientCode,
        employeePayrollFolder: {
          link: buildDriveFolderLink(existingClient.employeePayrollFolderId),
        },
        payrollConfigFolder: {
          createNew: true,
          rootFolderLink: buildDriveFolderLink(existingClient.employeePayrollFolderId),
        },
        payrollReportFolder: {
          link: buildDriveFolderLink(existingClient.payrollReportFolderId),
        },
        settings: defaultSettings,
      });

    expect(res.status).toBe(422);
    const { message } = res.body;
    expect(message).toContain('A folder');
    expect(message).toContain('already exists');
    expect(message).toContain('Payroll Config');
  });

  it('404 - Bad Employee Payroll folder link', async () => {
    const res = await request(app)
      .post('/api/v1/client')
      .send({
        clientName: 'Bad Folder Link Test Client',
        clientCode: getUniqueCode('BADLINK'),
        employeePayrollFolder: {
          link: 'https://drive.google.com/drive/folders/INVALID_FOLDER_ID',
        },
        payrollConfigFolder: {
          link: 'https://drive.google.com/drive/folders/INVALID_FOLDER_ID',
        },
        payrollReportFolder: {
          link: 'https://drive.google.com/drive/folders/INVALID_FOLDER_ID',
        },
        settings: defaultSettings,
      });

    expect(res.status).toBe(404);
    const { message } = res.body;
    expect(message).toContain('Folder not found');
  });

  it('422 - Missing Root Folder Link', async () => {
    const res = await request(app)
      .post('/api/v1/client')
      .send({
        clientName: 'Missing Root Folder Link Test Client',
        clientCode: getUniqueCode('MISSINGROOT'),
        employeePayrollFolder: {
          createNew: true,
        },
        payrollConfigFolder: {
          createNew: true,
        },
        payrollReportFolder: {
          createNew: true,
        },
        settings: defaultSettings,
      });

    expect(res.status).toBe(422);
    const { message } = res.body;
    expect(message).toContain(
      'rootFolderLink is required when creating a new Employee Payroll folder',
    );
  });

  it('422 - Malformed Folder Link', async () => {
    const malformedLink = 'https://example.com/not-a-drive-link';

    const res = await request(app)
      .post('/api/v1/client')
      .send({
        clientName: 'Malformed Folder Link Test Client',
        clientCode: getUniqueCode('MALFORMED'),
        employeePayrollFolder: {
          link: malformedLink,
        },
        payrollConfigFolder: {
          createNew: true,
          rootFolderLink: malformedLink,
        },
        payrollReportFolder: {
          createNew: true,
          rootFolderLink: malformedLink,
        },
        settings: defaultSettings,
      });

    expect(res.status).toBe(422);
    const { message } = res.body;
    expect(message).toContain('Unrecognized Drive folder link:');
    expect(message).toContain(malformedLink);
  });

  it('422 - Bad Employee Payroll Folder Object', async () => {
    const res = await request(app)
      .post('/api/v1/client')
      .send({
        clientName: 'Bad Employee Payroll Folder Object Test Client',
        clientCode: getUniqueCode('BADOBJ'),
        employeePayrollFolder: {
          invalidProperty: true,
        },
        payrollConfigFolder: {
          createNew: true,
          rootFolderLink: 'https://drive.google.com/drive/folders/INVALID_FOLDER_ID',
        },
        payrollReportFolder: {
          createNew: true,
          rootFolderLink: 'https://drive.google.com/drive/folders/INVALID_FOLDER_ID',
        },
        settings: defaultSettings,
      });

    expect(res.status).toBe(422);
    const { message } = res.body;
    expect(message).toContain('Folder input must specify either "link" or "createNew"');
  });
});
