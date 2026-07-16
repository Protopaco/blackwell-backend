import deleteDevTestData from './deleteDevTestData.js';
import createDevTestDataRoot from './createDevTestDataRoot.js';
import createFreshClientScenario from './scenarios/createFreshClientScenario.js';

const resetDevTestData = async (): Promise<void> => {
  await deleteDevTestData();
  const rootFolderId = await createDevTestDataRoot();
  await createFreshClientScenario(rootFolderId);
};

export default resetDevTestData;
