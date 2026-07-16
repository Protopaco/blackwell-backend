import type DevTestDataScenarioSummary from './DevTestDataScenarioSummary.js';
import type { PurgeDevTestDataResult } from '../purgeDevTestData.js';

type ResetDevTestDataResult = {
  purge: PurgeDevTestDataResult;
  testDataRootFolderId: string;
  scenarios: DevTestDataScenarioSummary[];
  clients: {
    writtenClientCode: string;
  };
};

export default ResetDevTestDataResult;
