import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import createFolder from '#db/adapter/createFolder.js';
import { TimesheetFolderStatus } from '#models/TimesheetFolderStatus.js';
import buildDriveFolderLink from '../buildDriveFolderLink.js';
import createTestClient from '../builders/createTestClient.js';
import createTestTimesheetFolder from '../builders/createTestTimesheetFolder.js';
import getTimesheetFolderByName from '../helpers/getTimesheetFolderByName.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

describe('PUT /api/v1/timesheetFolder/:clientId/:timesheetFolderId', () => {
  it('200 - Updates timesheet folder name only', async () => {
    const client = await createTestClient();
    const timesheetFolder = await createTestTimesheetFolder(client);
    const updatedName = `Updated Timesheet Folder ${getUniqueCode('TSFOLDER')}`;

    const res = await request(app)
      .put(`/api/v1/timesheetFolder/${client.clientId}/${timesheetFolder.timesheetFolderId}`)
      .send({ timesheetFolderName: updatedName });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('TimesheetFolder updated');

    const updatedTimesheetFolder = await getTimesheetFolderByName(client.clientId, updatedName);
    expect(updatedTimesheetFolder).toMatchObject({
      timesheetFolderId: timesheetFolder.timesheetFolderId,
      timesheetFolderName: updatedName,
      driveFolderId: timesheetFolder.driveFolderId,
      status: timesheetFolder.status,
    });
  });

  it('200 - Updates timesheet folder status', async () => {
    const client = await createTestClient();
    const timesheetFolder = await createTestTimesheetFolder(client);

    const res = await request(app)
      .put(`/api/v1/timesheetFolder/${client.clientId}/${timesheetFolder.timesheetFolderId}`)
      .send({ status: TimesheetFolderStatus.Inactive });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('TimesheetFolder updated');

    const updatedTimesheetFolder = await getTimesheetFolderByName(
      client.clientId,
      timesheetFolder.timesheetFolderName,
    );
    expect(updatedTimesheetFolder.status).toBe(TimesheetFolderStatus.Inactive);
    expect(updatedTimesheetFolder.driveFolderId).toBe(timesheetFolder.driveFolderId);
  });

  it('200 - Updates timesheet folder drive link', async () => {
    const client = await createTestClient();
    const timesheetFolder = await createTestTimesheetFolder(client);
    const newDriveFolderId = await createFolder(
      `Updated Timesheet Folder ${getUniqueCode('TSFOLDER')}`,
      client.employeePayrollFolderId,
    );

    const res = await request(app)
      .put(`/api/v1/timesheetFolder/${client.clientId}/${timesheetFolder.timesheetFolderId}`)
      .send({ driveFolderLink: buildDriveFolderLink(newDriveFolderId) });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('TimesheetFolder updated');

    const updatedTimesheetFolder = await getTimesheetFolderByName(
      client.clientId,
      timesheetFolder.timesheetFolderName,
    );
    expect(updatedTimesheetFolder.driveFolderId).toBe(newDriveFolderId);
    expect(updatedTimesheetFolder.status).toBe(timesheetFolder.status);
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();
    const timesheetFolderId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/timesheetFolder/${missingClientId}/${timesheetFolderId}`)
      .send({ timesheetFolderName: 'Missing Client Timesheet Folder' });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });

  it('404 - Timesheet folder not found', async () => {
    const client = await createTestClient();
    const missingTimesheetFolderId = crypto.randomUUID();

    const res = await request(app)
      .put(`/api/v1/timesheetFolder/${client.clientId}/${missingTimesheetFolderId}`)
      .send({ timesheetFolderName: 'Missing Timesheet Folder' });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`TimesheetFolder not found: ${missingTimesheetFolderId}`);
  });

  it('404 - Bad folder link', async () => {
    const client = await createTestClient();
    const timesheetFolder = await createTestTimesheetFolder(client);
    const badFolderLink = buildDriveFolderLink('INVALID_FOLDER_ID');

    const res = await request(app)
      .put(`/api/v1/timesheetFolder/${client.clientId}/${timesheetFolder.timesheetFolderId}`)
      .send({ driveFolderLink: badFolderLink });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('Folder not found or inaccessible');
    expect(res.body.message).toContain(badFolderLink);
  });
});
