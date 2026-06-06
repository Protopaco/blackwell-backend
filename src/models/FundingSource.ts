import Guid from './Guid.js';

interface FundingSource {
  fundingSourceId: Guid;
  fundingSourceName: string;
  fundingSourceCode?: string;  // optional — reserved for QuickBooks mapping
}

export default FundingSource;
