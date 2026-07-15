import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '#app.js';
import TimesheetFolder from '#models/TimesheetFolder.js';
import createTestClient from '../builders/createTestClient.js';
import createTestTimesheetFolder from '../builders/createTestTimesheetFolder.js';

describe('GET /api/v1/timesheetFolder/:clientId', () => {
  it('200 - Gets timesheet folders', async () => {
    const client = await createTestClient();
    const timesheetFolder1 = await createTestTimesheetFolder(client);
    const timesheetFolder2 = await createTestTimesheetFolder(client);

    const res = await request(app).get(`/api/v1/timesheetFolder/${client.clientId}`);

    expect(res.status).toBe(200);
    expect(
      res.body.some(
        (candidate: TimesheetFolder) =>
          candidate.timesheetFolderId === timesheetFolder1.timesheetFolderId,
      ),
    ).toBe(true);
    expect(
      res.body.some(
        (candidate: TimesheetFolder) =>
          candidate.timesheetFolderId === timesheetFolder2.timesheetFolderId,
      ),
    ).toBe(true);
  });

  it('404 - Client not found', async () => {
    const missingClientId = crypto.randomUUID();

    const res = await request(app).get(`/api/v1/timesheetFolder/${missingClientId}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toContain(`Client not found: ${missingClientId}`);
  });
});
