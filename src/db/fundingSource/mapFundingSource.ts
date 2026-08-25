import FundingSource from '#models/FundingSource.js';

// Converts a raw FundingSources sheet row into a FundingSource model.
const mapFundingSource = (row: Record<string, unknown>): FundingSource => ({
  fundingSourceId: row['FundingSourceId'] as string,
  fundingSourceName: row['FundingSourceName'] as string,
  fundingSourceCode: (row['FundingSourceCode'] as string) || undefined,
  fringeRate: row['FringeRate'] === '' || row['FringeRate'] == null ? null : Number(row['FringeRate']),
});

export default mapFundingSource;
