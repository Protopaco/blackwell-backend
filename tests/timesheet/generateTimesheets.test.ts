import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import { TEST_CLIENT_ID } from "../helpers/testClient.js";
import getTestPayPeriod from "../helpers/getTestPayPeriod.js";
import TimesheetStatusResult from "../../src/models/TimesheetStatusResult.js";
import { TimesheetStatus } from "../../src/models/TimesheetStatus.js";

describe("POST /api/v1/timesheet/generate", () => {
  let payPeriodId: string;
  let payPeriodName: string;
  let statusBefore: TimesheetStatusResult[];

  beforeAll(async () => {
    ({ payPeriodId, payPeriodName } = await getTestPayPeriod());

    console.log("🚀 ~ TEST_CLIENT_ID:", TEST_CLIENT_ID);
    const res = await request(app).get(
      `/api/v1/timesheet/status?clientId=${TEST_CLIENT_ID}&payPeriodId=${payPeriodId}`,
    );
    statusBefore = res.body;
    console.log(`Pay period: ${payPeriodName}`);
    console.log(
      "Status before generate:",
      JSON.stringify(statusBefore, null, 2),
    );
  });

  it("returns 200", async () => {
    const res = await request(app)
      .post("/api/v1/timesheet/generate")
      .send({ clientId: TEST_CLIENT_ID, payPeriodId });

    expect(res.status).toBe(200);
  });

  it("all active employees have a timesheet after generation", async () => {
    const res = await request(app).get(
      `/api/v1/timesheet/status?clientId=${TEST_CLIENT_ID}&payPeriodId=${payPeriodId}`,
    );

    const statusAfter: TimesheetStatusResult[] = res.body;
    console.log("Status after generate:", JSON.stringify(statusAfter, null, 2));

    expect(statusAfter.length).toBeGreaterThan(0);
    for (const entry of statusAfter) {
      expect(entry.status).not.toBe(TimesheetStatus.NotGenerated);
    }
  });

  it("returns 400 when clientId is missing", async () => {
    const res = await request(app)
      .post("/api/v1/timesheet/generate")
      .send({ payPeriodId });

    expect(res.status).toBe(400);
  });

  it("returns 400 when payPeriodId is missing", async () => {
    const res = await request(app)
      .post("/api/v1/timesheet/generate")
      .send({ clientId: TEST_CLIENT_ID });

    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown pay period", async () => {
    const res = await request(app)
      .post("/api/v1/timesheet/generate")
      .send({ clientId: TEST_CLIENT_ID, payPeriodId: "unknown-pay-period-id" });

    expect(res.status).toBe(404);
  });
});
