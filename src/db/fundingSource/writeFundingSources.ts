import overwriteTabRows from '#db/adapter/overwriteTabRows.js';
import readFundingSources from '#db/fundingSource/readFundingSources.js';
import mapFundingSourceRow from '#db/fundingSource/mapFundingSourceRow.js';
import { FUNDING_SOURCES_TAB, FUNDING_SOURCES_HEADERS } from '#config/constants.js';
import FundingSource from '#models/FundingSource.js';
import { NotFoundError } from '#utils/errors.js';

// Overwrites all funding source rows, updating the one matching the given funding source.
const writeFundingSources = async (
  workbookId: string,
  updatedFundingSource: FundingSource,
): Promise<void> => {
  const fundingSources = await readFundingSources(workbookId);

  const index = fundingSources.findIndex(
    (fundingSource) => fundingSource.fundingSourceId === updatedFundingSource.fundingSourceId,
  );
  if (index === -1)
    throw new NotFoundError(`Funding source not found: ${updatedFundingSource.fundingSourceId}`);

  fundingSources[index] = updatedFundingSource;

  const rows = fundingSources.map(mapFundingSourceRow);

  await overwriteTabRows(workbookId, FUNDING_SOURCES_TAB, FUNDING_SOURCES_HEADERS, rows);
};

export default writeFundingSources;
