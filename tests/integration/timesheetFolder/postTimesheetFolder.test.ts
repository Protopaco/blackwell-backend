import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createFolder from '#db/adapter/createFolder.js';
import { TimesheetFolderStatus } from '#models/TimesheetFolderStatus.js';
import buildDriveFolderLink from '../buildDriveFolderLink.js';
import createTestClient from '../builders/createTestClient.js';
import getTimesheetFolderByName from '../helpers/getTimesheetFolderByName.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('POST /api/v1/timesheetFolder/:clientId', () => {
  it('201 - Creates timesheet folder', async () => {
    const client = await createTestClient();
    const uniqueCode = getUniqueCode('TSFOLDER');
    const driveFolderId = await createFolder(
      `Timesheet Folder ${uniqueCode}`,
      client.employeePayrollFolderId,
    );
    const requestBody = {
      timesheetFolderName: `Timesheet Folder ${uniqueCode}`,
      driveFolderLink: buildDriveFolderLink(driveFolderId),
    };

    const res = await request(app)
      .post(`/api/v1/timesheetFolder/${client.clientId}`)
      .send(requestBody);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('TimesheetFolder created');

    const timesheetFolder = await getTimesheetFolderByName(
      client.clientId,
      requestBody.timesheetFolderName,
    );
    expect(timesheetFolder).toMatchObject({
      timesheetFolderName: requestBody.timesheetFolderName,
      driveFolderId,
      status: TimesheetFolderStatus.Active,
    });
    expect(timesheetFolder.timesheetFolderId).toBeDefined();
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app)
      .post(`/api/v1/timesheetFolder/${missingClientId}`)
      .send({
        timesheetFolderName: 'Missing Client Timesheet Folder',
        driveFolderLink: buildDriveFolderLink('INVALID_FOLDER_ID'),
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Bad folder link', async () => {
    const client = await createTestClient();
    const badFolderLink = buildDriveFolderLink('INVALID_FOLDER_ID');

    const res = await request(app)
      .post(`/api/v1/timesheetFolder/${client.clientId}`)
      .send({
        timesheetFolderName: 'Bad Folder Link Timesheet Folder',
        driveFolderLink: badFolderLink,
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Folder not found or inaccessible');
    expect(res.body.message).toContain(badFolderLink);
  });

  it('422 - Malformed folder link', async () => {
    const client = await createTestClient();
    const malformedLink = 'https://example.com/not-a-drive-link';

    const res = await request(app)
      .post(`/api/v1/timesheetFolder/${client.clientId}`)
      .send({
        timesheetFolderName: 'Malformed Link Timesheet Folder',
        driveFolderLink: malformedLink,
      });

    expect(res.status).toBe(422);
    expect(res.body.message).toContain('Unrecognized Drive folder link:');
    expect(res.body.message).toContain(malformedLink);
  });
});
