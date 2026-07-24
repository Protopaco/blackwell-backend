import readFundingSources from './readFundingSources.js';
import FundingSource from '#models/FundingSource.js';

// Reads the funding source list fresh from the given workbook's FundingSources tab (PayrollConfig or a pay
// period's report workbook) and returns one funding source by ID — always bypasses any cache.
const readFundingSourceById = async (workbookId: string, fundingSourceId: string): Promise<FundingSource | null> => {
  const fundingSources = await readFundingSources(workbookId);
  return fundingSources.find((fundingSource) => fundingSource.fundingSourceId === fundingSourceId) ?? null;
};

export default readFundingSourceById;
