import FundingSource from '#models/FundingSource.js';

// Maps a FundingSource back to a sheet-row object keyed by FUNDING_SOURCES_HEADERS — the write-side inverse of mapFundingSource.ts.
const mapFundingSourceRow = (fundingSource: FundingSource): Record<string, unknown> => ({
  FundingSourceId: fundingSource.fundingSourceId,
  FundingSourceName: fundingSource.fundingSourceName,
  FundingSourceCode: fundingSource.fundingSourceCode ?? '',
});

export default mapFundingSourceRow;
