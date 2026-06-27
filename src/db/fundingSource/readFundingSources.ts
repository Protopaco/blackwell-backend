import readTab from '#db/adapter/readTab.js';
import FundingSource from '#models/FundingSource.js';
import mapFundingSource from '#db/fundingSource/mapFundingSource.js';

// Reads all funding sources from the FundingSources tab of a client's payroll config file.
const readFundingSources = async (payrollConfigFileId: string): Promise<FundingSource[]> => {
  const rows = await readTab(payrollConfigFileId, 'FundingSources');
  return rows.map(mapFundingSource);
};

export default readFundingSources;
