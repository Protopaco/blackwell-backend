import Guid from '#models/Guid.js';

interface FundingSource {
  fundingSourceId: Guid;
  fundingSourceName: string;
  fundingSourceCode?: string;  // optional — reserved for QuickBooks mapping
  fringeRate: number | null;  // optional flat fringe rate, as a percentage (e.g. 32 for 32%), applied to wages in the Allocation Report
}

export default FundingSource;
