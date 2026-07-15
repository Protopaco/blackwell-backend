import request from 'supertest';
import app from '#app.js';
import Supervisor from '#models/Supervisor.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

const createTestSupervisor = async (
  clientId: string,
  overrides: Partial<Omit<Supervisor, 'supervisorId'>> = {},
): Promise<Supervisor> => {
  const uniqueCode = getUniqueCode('SUP');
  const requestBody = {
    firstName: `Test${uniqueCode}`,
    lastName: 'Supervisor',
    email: `test.supervisor.${uniqueCode.toLowerCase()}@example.com`,
    ...overrides,
  };

  const response = await request(app).post(`/api/v1/supervisor/${clientId}`).send(requestBody);
  if (response.status !== 201) {
    throw new Error(`createTestSupervisor failed: ${response.status} ${JSON.stringify(response.body)}`);
  }

  const supervisorsResponse = await request(app).get(`/api/v1/supervisor/${clientId}`);
  if (supervisorsResponse.status !== 200) {
    throw new Error(
      `createTestSupervisor lookup failed: ${supervisorsResponse.status} ${JSON.stringify(supervisorsResponse.body)}`,
    );
  }

  const supervisor = supervisorsResponse.body.find(
    (candidate: Supervisor) => candidate.email === requestBody.email,
  );
  if (!supervisor) {
    throw new Error(`createTestSupervisor not found: ${requestBody.email}`);
  }

  return supervisor;
};

export default createTestSupervisor;
