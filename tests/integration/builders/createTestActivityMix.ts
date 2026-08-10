import createTestActivity from './createTestActivity.js';
import createTestFundingSource from './createTestFundingSource.js';
import TestActivityMix from '../models/TestActivityMix.js';

// NOTE — the 4 activities here used to be distinguished by Activity.payRate (removed in [052]); with that
// gone they're now functionally identical placeholders. Tests built on this fixture that rely on that
// distinction are disabled (see postGeneratePayrollReport.test.ts) until [055] rewires flat-rate/hourly
// handling around the EmployeeActivityRates bridge — revisit this fixture then.
const createTestActivityMix = async (clientId: string): Promise<TestActivityMix> => {
  const fundingSource = await createTestFundingSource(clientId);
  const fundingSourceNames = [fundingSource.fundingSourceName];

  const hourlyPayRate1Activity = await createTestActivity(clientId, fundingSourceNames);
  const hourlyPayRate2Activity = await createTestActivity(clientId, fundingSourceNames);
  const flatPayRate1Activity = await createTestActivity(clientId, fundingSourceNames);
  const flatPayRate2Activity = await createTestActivity(clientId, fundingSourceNames);

  return {
    hourlyPayRate1Activity,
    hourlyPayRate2Activity,
    flatPayRate1Activity,
    flatPayRate2Activity,
    activities: [
      hourlyPayRate1Activity,
      hourlyPayRate2Activity,
      flatPayRate1Activity,
      flatPayRate2Activity,
    ],
  };
};

export default createTestActivityMix;
