import request from 'supertest';
import app from '#app.js';
import Holiday from '#models/Holiday.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

const createTestHoliday = async (
  clientId: string,
  overrides: Partial<Omit<Holiday, 'holidayId'>> = {},
): Promise<Holiday> => {
  const uniqueCode = getUniqueCode('HOL');
  const requestBody = {
    holidayName: `Test Holiday ${uniqueCode}`,
    holidayDate: '2026-12-25',
    ...overrides,
  };

  const response = await request(app).post(`/api/v1/holiday/${clientId}`).send(requestBody);
  if (response.status !== 201) {
    throw new Error(`createTestHoliday failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const holidaysResponse = await request(app).get(`/api/v1/holiday/${clientId}`);
  if (holidaysResponse.status !== 200) {
    throw new Error(
      `createTestHoliday lookup failed: ${holidaysResponse.status} ${JSON.stringify(holidaysResponse.body)}`,
    );
  }

  const holiday = holidaysResponse.body.find(
    (candidate: Holiday) => candidate.holidayName === requestBody.holidayName,
  );
  if (!holiday) {
    throw new Error(`createTestHoliday not found: ${requestBody.holidayName}`);
  }

  return holiday;
};

export default createTestHoliday;
