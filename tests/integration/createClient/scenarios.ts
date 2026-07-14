import { expect } from 'vitest';
import createTestClient from '../builders/createTestClient.js';
import buildDriveFolderLink from '../buildDriveFolderLink.js';
import createOAuthWorkbook from '#db/adapter/createOAuthWorkbook.js';
import ClientCreateRequest from '#models/ClientCreateRequest.js';
import { TimeInputMethod } from '#models/TimeInputMethod.js';
import { PayPeriodInterval } from '#models/PayPeriodInterval.js';
import type { Scenario } from '../scenarioTypes.js';

const TEST_DATA_ROOT_FOLDER_ID = process.env.TEST_DATA_ROOT_FOLDER_ID;
if (!TEST_DATA_ROOT_FOLDER_ID) throw new Error('TEST_DATA_ROOT_FOLDER_ID is not set');

const defaultSettings = {
  timeInputMethod: TimeInputMethod.TotalHours,
  payPeriodInterval: PayPeriodInterval.BiWeekly,
  payPeriodStartDate: '2026-01-01',
};

const uniqueCode = (label: string) => `T${label.slice(0, 10).toUpperCase()}${Date.now().toString(36)}`;

// Runs once, before any test in this file — real preconditions the collision/link scenarios below need.
const existingClient = await createTestClient();

// Manufactures an otherwise-unreachable precondition: a Pay Period Registry file with no matching
// Payroll Config file. The normal API always creates these two files together, in order, so the only
// way to get one without the other is to create it directly via the adapter, bypassing the route.
const orphanedRegistryClientCode = uniqueCode('ORPHAN');
await createOAuthWorkbook(`${orphanedRegistryClientCode} Pay Period Registry`, existingClient.payrollConfigFolderId);

const scenarios: Scenario<ClientCreateRequest>[] = [
  {
    label: 'createClient_newFolderTree',
    description: 'Creates a client with every folder/file provisioned fresh under the test data root.',
    input: {
      clientName: 'New Folder Tree Test Client',
      clientCode: uniqueCode('NEW'),
      employeePayrollFolder: { createNew: true, rootFolderLink: buildDriveFolderLink(TEST_DATA_ROOT_FOLDER_ID) },
      settings: defaultSettings,
    },
    expectedStatus: 201,
    assert: (res) => {
      expect(res.body.clientId).toBeDefined();
      expect(res.body.payrollConfigFileId).toBeDefined();
      expect(res.body.payPeriodRegistryFileId).toBeDefined();
    },
  },
  {
    label: 'createClient_allLinkedExisting',
    description: 'Creates a client whose folders all link to an already-existing folder tree — nothing new created.',
    input: {
      clientName: 'All Linked Existing Test Client',
      clientCode: uniqueCode('LINKED'),
      employeePayrollFolder: { link: buildDriveFolderLink(existingClient.employeePayrollFolderId) },
      payrollConfigFolder: { link: buildDriveFolderLink(existingClient.payrollConfigFolderId) },
      payrollReportFolder: { link: buildDriveFolderLink(existingClient.payrollReportFolderId) },
      settings: defaultSettings,
    },
    expectedStatus: 201,
    assert: (res) => {
      expect(res.body.employeePayrollFolderId).toBe(existingClient.employeePayrollFolderId);
      expect(res.body.payrollConfigFolderId).toBe(existingClient.payrollConfigFolderId);
    },
  },
  {
    label: 'createClient_duplicateClientCode',
    description: 'Fails with 422 — a Payroll Config file already exists for this client code in the target folder.',
    input: {
      clientName: 'Duplicate Client Code Test Client',
      clientCode: existingClient.clientCode,
      employeePayrollFolder: { link: buildDriveFolderLink(existingClient.employeePayrollFolderId) },
      payrollConfigFolder: { link: buildDriveFolderLink(existingClient.payrollConfigFolderId) },
      payrollReportFolder: { link: buildDriveFolderLink(existingClient.payrollReportFolderId) },
      settings: defaultSettings,
    },
    expectedStatus: 422,
    assert: (res) => {
      expect(res.body.message).toContain('already exists');
      expect(res.body.message).toContain('Payroll Config');
    },
  },
  {
    label: 'createClient_duplicatePayPeriodRegistry',
    description: 'Fails with 422 — the Payroll Config file would be created fine, but a Pay Period Registry file with this client code already exists.',
    input: {
      clientName: 'Duplicate Pay Period Registry Test Client',
      clientCode: orphanedRegistryClientCode,
      employeePayrollFolder: { link: buildDriveFolderLink(existingClient.employeePayrollFolderId) },
      payrollConfigFolder: { link: buildDriveFolderLink(existingClient.payrollConfigFolderId) },
      payrollReportFolder: { link: buildDriveFolderLink(existingClient.payrollReportFolderId) },
      settings: defaultSettings,
    },
    expectedStatus: 422,
    assert: (res) => {
      expect(res.body.message).toContain('already exists');
      expect(res.body.message).toContain('Pay Period Registry');
    },
  },
  {
    label: 'createClient_folderNameCollision',
    description: 'Fails with 422 — a folder named "Payroll Config" already exists in the parent when creating it fresh.',
    input: {
      clientName: 'Folder Name Collision Test Client',
      clientCode: uniqueCode('FOLDERCOL'),
      employeePayrollFolder: { link: buildDriveFolderLink(existingClient.employeePayrollFolderId) },
      payrollConfigFolder: { createNew: true },
      settings: defaultSettings,
    },
    expectedStatus: 422,
    assert: (res) => {
      expect(res.body.message).toContain('already exists');
    },
  },
  {
    label: 'createClient_badFolderLink',
    description: 'Fails with 404 — the linked employeePayrollFolder does not exist or is inaccessible.',
    input: {
      clientName: 'Bad Folder Link Test Client',
      clientCode: uniqueCode('BADLINK'),
      employeePayrollFolder: { link: buildDriveFolderLink('1AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA') },
      settings: defaultSettings,
    },
    expectedStatus: 404,
    assert: (res) => {
      expect(res.body.message).toContain('not found');
    },
  },
  {
    label: 'createClient_missingRootFolderLink',
    description: 'Fails with 422 — employeePayrollFolder.createNew is true but rootFolderLink is missing.',
    input: {
      clientName: 'Missing Root Folder Link Test Client',
      clientCode: uniqueCode('NOROOT'),
      employeePayrollFolder: { createNew: true },
      settings: defaultSettings,
    },
    expectedStatus: 422,
    assert: (res) => {
      expect(res.body.message).toContain('rootFolderLink');
    },
  },
  {
    label: 'createClient_malformedFolderLink',
    description: 'Fails with 422 — the supplied folder link is not a recognizable Drive URL.',
    input: {
      clientName: 'Malformed Folder Link Test Client',
      clientCode: uniqueCode('BADFMT'),
      employeePayrollFolder: { link: 'https://example.com/not-a-drive-link' },
      settings: defaultSettings,
    },
    expectedStatus: 422,
    assert: (res) => {
      expect(res.body.message).toContain('Unrecognized Drive folder link');
    },
  },
  {
    label: 'createClient_folderInputMissingBoth',
    description: 'Fails with 422 — employeePayrollFolder specifies neither link nor createNew.',
    input: {
      clientName: 'Folder Input Missing Both Test Client',
      clientCode: uniqueCode('NEITHER'),
      employeePayrollFolder: {},
      settings: defaultSettings,
    },
    expectedStatus: 422,
    assert: (res) => {
      expect(res.body.message).toContain('must specify either');
    },
  },
];

export default scenarios;
