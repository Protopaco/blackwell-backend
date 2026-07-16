import DevTestDataTemplateSummary from './DevTestDataTemplateSummary.js';

type BuildTestDataTemplatesResult = {
  templates: DevTestDataTemplateSummary[];
  clients: {
    removedTemporaryRows: number;
  };
};

export default BuildTestDataTemplatesResult;
