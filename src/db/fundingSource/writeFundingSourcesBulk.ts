import writeValues from '#db/adapter/writeValues.js';
import mapFundingSourceRow from '#db/fundingSource/mapFundingSourceRow.js';
import { FUNDING_SOURCES_TAB, FUNDING_SOURCES_HEADERS } from '#config/constants.js';
import FundingSource from '#models/FundingSource.js';

// Writes a full set of funding sources to the given workbook's FundingSources tab in one call — header
// row always included, even for an empty list. Assumes the tab already exists (see createTabsIfNotExists.js).
const writeFundingSourcesBulk = async (workbookId: string, fundingSources: FundingSource[]): Promise<void> => {
  const rows = fundingSources.map(mapFundingSourceRow);
  const values = [FUNDING_SOURCES_HEADERS, ...rows.map((row) => FUNDING_SOURCES_HEADERS.map((header) => row[header] ?? ''))];

  await writeValues(workbookId, FUNDING_SOURCES_TAB, values);
};

export default writeFundingSourcesBulk;
