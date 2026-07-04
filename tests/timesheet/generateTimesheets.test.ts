import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { TEST_CLIENT_ID } from "../helpers/testClient.js";
import getTestPayPeriod from "../helpers/getTestPayPeriod.js";

describe("POST /api/v1/timesheet/:clientId/:payPeriodId/generate", () => {
  let payPeriodId: string;
  let payPeriodName: string;

  beforeAll(async () => {
    ({ payPeriodId, payPeriodName } = await getTestPayPeriod());
    console.log(`Pay period: ${payPeriodName}`);
  });

  // Generate can take up to ~15s on first run: OAuth file creation + formatting batchUpdate
  it("returns 200", async () => {
    const res = await request(app)
      .post(`/api/v1/timesheet/${TEST_CLIENT_ID}/${payPeriodId}/generate`);

    expect(res.status).toBe(200);
  }, 30_000);

  it("all active employees have a timesheet after generation", async () => {
    const res = await request(app).get(
      `/api/v1/timesheet/status/${TEST_CLIENT_ID}/${payPeriodId}`,
    );

    const statusAfter = res.body;
    console.log("Status after generate:", JSON.stringify(statusAfter, null, 2));

    expect(res.status).toBe(200);
    expect(Array.isArray(statusAfter)).toBe(true);
    expect(statusAfter.length).toBeGreaterThan(0);
    for (const entry of statusAfter) {
      expect(entry.totalHours).not.toBeNull();
    }
  }, 30_000);

  it("returns 404 for an unknown pay period", async () => {
    const res = await request(app)
      .post(`/api/v1/timesheet/${TEST_CLIENT_ID}/unknown-pay-period-id/generate`);

    expect(res.status).toBe(404);
  });
});
