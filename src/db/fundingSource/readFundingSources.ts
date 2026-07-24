import readTab from '#db/adapter/readTab.js';
import { FUNDING_SOURCES_TAB } from '#config/constants.js';
import FundingSource from '#models/FundingSource.js';
import mapFundingSource from '#db/fundingSource/mapFundingSource.js';

// Reads all funding sources from the FundingSources tab of a client's payroll config file.
const readFundingSources = async (workbookId: string): Promise<FundingSource[]> => {
  const rows = await readTab(workbookId, FUNDING_SOURCES_TAB);
  return rows.map(mapFundingSource);
};

export default readFundingSources;
