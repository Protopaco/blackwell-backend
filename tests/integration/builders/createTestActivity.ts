import request from 'supertest';
import app from '#app.js';
import Activity from '#models/Activity.js';
import { PayrollCategory } from '#models/PayrollCategory.js';
import { PayRate } from '#models/PayRate.js';
import createTestFundingSource from './createTestFundingSource.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

const createTestActivity = async (
  clientId: string,
  fundingSourceNames?: string[],
  overrides: Partial<Omit<Activity, 'activityId'>> = {},
): Promise<Activity> => {
  const uniqueCode = getUniqueCode('ACT');
  const names = fundingSourceNames ?? [
    (await createTestFundingSource(clientId)).fundingSourceName,
  ];
  const requestBody = {
    activityName: `Test Activity ${uniqueCode}`,
    trackSeparately: true,
    payrollCategory: PayrollCategory.Regular,
    fundingSources: names.map((fundingSourceName) => ({
      fundingSourceName,
      percentage: Math.floor(100 / names.length),
    })),
    payRate: PayRate.HourlyPayRate1,
    flatRateAmount: 0,
    ...overrides,
  };

  const response = await request(app).post(`/api/v1/activity/${clientId}`).send(requestBody);
  if (response.status !== 201) {
    throw new Error(`createTestActivity failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const activitiesResponse = await request(app).get(`/api/v1/activity/${clientId}`);
  if (activitiesResponse.status !== 200) {
    throw new Error(
      `createTestActivity lookup failed: ${activitiesResponse.status} ${JSON.stringify(activitiesResponse.body)}`,
    );
  }

  const activity = activitiesResponse.body.find(
    (candidate: Activity) => candidate.activityName === requestBody.activityName,
  );
  if (!activity) {
    throw new Error(`createTestActivity not found: ${requestBody.activityName}`);
  }

  return activity;
};

export default createTestActivity;
