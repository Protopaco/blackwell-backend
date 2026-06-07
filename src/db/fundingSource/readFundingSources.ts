import sheetsAdapter from '#db/adapter/sheetsAdapter.js';
import FundingSource from '#models/FundingSource.js';

const mapToFundingSource = (row: Record<string, unknown>): FundingSource => ({
  fundingSourceId: row['FundingSourceId'] as string,
  fundingSourceName: row['FundingSourceName'] as string,
  fundingSourceCode: (row['FundingSourceCode'] as string) || undefined,
});

const readFundingSources = async (payrollConfigFileId: string): Promise<FundingSource[]> => {
  const rows = await sheetsAdapter.readTab(payrollConfigFileId, 'FundingSources');
  return rows.map(mapToFundingSource);
};

export default readFundingSources;
