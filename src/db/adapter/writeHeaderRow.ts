import updateCells from './updateCells.js';

const writeHeaderRow = async (
  workbookId: string,
  tabName: string,
  headers: string[],
): Promise<void> => {
  await updateCells(workbookId, `${tabName}!A1`, [headers]);
};

export default writeHeaderRow;
