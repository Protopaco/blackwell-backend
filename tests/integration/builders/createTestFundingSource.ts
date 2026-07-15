import request from 'supertest';
import app from '#app.js';
import FundingSource from '#models/FundingSource.js';
import getUniqueCode from '../helpers/getUniqueCode.js';

const createTestFundingSource = async (
  clientId: string,
  overrides: Partial<Omit<FundingSource, 'fundingSourceId'>> = {},
): Promise<FundingSource> => {
  const uniqueCode = getUniqueCode('FS');
  const requestBody = {
    fundingSourceName: `Test Funding Source ${uniqueCode}`,
    fundingSourceCode: uniqueCode,
    ...overrides,
  };

  const response = await request(app).post(`/api/v1/fundingSource/${clientId}`).send(requestBody);
  if (response.status !== 201) {
    throw new Error(
      `createTestFundingSource failed: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }

  const fundingSourcesResponse = await request(app).get(`/api/v1/fundingSource/${clientId}`);
  if (fundingSourcesResponse.status !== 200) {
    throw new Error(
      `createTestFundingSource lookup failed: ${fundingSourcesResponse.status} ${JSON.stringify(fundingSourcesResponse.body)}`,
    );
  }

  const fundingSource = fundingSourcesResponse.body.find(
    (candidate: FundingSource) => candidate.fundingSourceName === requestBody.fundingSourceName,
  );
  if (!fundingSource) {
    throw new Error(`createTestFundingSource not found: ${requestBody.fundingSourceName}`);
  }

  return fundingSource;
};

export default createTestFundingSource;
