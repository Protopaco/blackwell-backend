import deleteDevTestData from './deleteDevTestData.js';
import createDevTestDataRoot from './createDevTestDataRoot.js';

const resetDevTestData = async (): Promise<void> => {
  await deleteDevTestData();
  await createDevTestDataRoot();
};

export default resetDevTestData;
