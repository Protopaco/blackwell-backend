import appendRow from '#db/adapter/appendRow.js';
import { FUNDING_SOURCES_TAB, FUNDING_SOURCES_HEADERS } from '#config/constants.js';
import FundingSource from '#models/FundingSource.js';

// Appends a new funding source row to the FundingSources tab.
const appendFundingSource = async (
  payrollConfigFileId: string,
  fundingSource: FundingSource,
): Promise<void> => {
  const row: Record<string, unknown> = {
    FundingSourceId: fundingSource.fundingSourceId,
    FundingSourceName: fundingSource.fundingSourceName,
    FundingSourceCode: fundingSource.fundingSourceCode ?? '',
  };

  await appendRow(payrollConfigFileId, FUNDING_SOURCES_TAB, FUNDING_SOURCES_HEADERS, row);
};

export default appendFundingSource;
