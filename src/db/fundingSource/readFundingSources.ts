import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import FundingSource from '#models/FundingSource.js';
import mapFundingSource from '#db/fundingSource/mapFundingSource.js';

const readFundingSources = async (payrollConfigFileId: string): Promise<FundingSource[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'FundingSources');
  return rows.map(mapFundingSource);
};

export default readFundingSources;
