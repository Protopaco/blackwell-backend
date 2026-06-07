import FundingSource from '#models/FundingSource.js';

const mapFundingSource = (row: Record<string, unknown>): FundingSource => ({
  fundingSourceId: row['FundingSourceId'] as string,
  fundingSourceName: row['FundingSourceName'] as string,
  fundingSourceCode: (row['FundingSourceCode'] as string) || undefined,
});

export default mapFundingSource;
