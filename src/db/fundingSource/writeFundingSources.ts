import writeTab from '#db/adapter/writeTab.js';
import readFundingSources from '#db/fundingSource/readFundingSources.js';
import { FUNDING_SOURCES_TAB } from '#config/constants.js';
import FundingSource from '#models/FundingSource.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites all funding source rows, updating the one matching the given funding source.
const writeFundingSources = async (
  payrollConfigFileId: string,
  updatedFundingSource: FundingSource,
): Promise<void> => {
  const fundingSources = await readFundingSources(payrollConfigFileId);

  const index = fundingSources.findIndex(
    (fundingSource) => fundingSource.fundingSourceId === updatedFundingSource.fundingSourceId,
  );
  if (index === -1)
    throw new NotFoundError(`Funding source not found: ${updatedFundingSource.fundingSourceId}`);

  fundingSources[index] = updatedFundingSource;

  const rows = fundingSources.map((fundingSource) => ({
    FundingSourceId: fundingSource.fundingSourceId,
    FundingSourceName: fundingSource.fundingSourceName,
    FundingSourceCode: fundingSource.fundingSourceCode ?? '',
  }));

  await writeTab(payrollConfigFileId, FUNDING_SOURCES_TAB, rows);
};

export default writeFundingSources;
