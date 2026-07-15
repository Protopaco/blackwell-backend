import Activity from '#models/Activity.js';
import { PayRate } from '#models/PayRate.js';
import createTestActivity from './createTestActivity.js';
import createTestFundingSource from './createTestFundingSource.js';

interface TestActivityMix {
  hourlyPayRate1Activity: Activity;
  hourlyPayRate2Activity: Activity;
  flatPayRate1Activity: Activity;
  flatPayRate2Activity: Activity;
  activities: Activity[];
}

const createTestActivityMix = async (clientId: string): Promise<TestActivityMix> => {
  const fundingSource = await createTestFundingSource(clientId);
  const fundingSourceNames = [fundingSource.fundingSourceName];

  const hourlyPayRate1Activity = await createTestActivity(clientId, fundingSourceNames, {
    payRate: PayRate.HourlyPayRate1,
    flatRateAmount: 0,
  });

  const hourlyPayRate2Activity = await createTestActivity(clientId, fundingSourceNames, {
    payRate: PayRate.HourlyPayRate2,
    flatRateAmount: 0,
  });

  const flatPayRate1Activity = await createTestActivity(clientId, fundingSourceNames, {
    payRate: PayRate.FlatPayRate1,
    flatRateAmount: 45,
  });

  const flatPayRate2Activity = await createTestActivity(clientId, fundingSourceNames, {
    payRate: PayRate.FlatPayRate2,
    flatRateAmount: 75,
  });

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
