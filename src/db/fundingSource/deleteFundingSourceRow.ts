import readTab from '#db/adapter/readTab.js';
import deleteRow from '#db/adapter/deleteRow.js';
import { FUNDING_SOURCES_TAB } from '#config/constants.js';
import { NotFoundError } from '#utils/errors.js';

// Deletes a single funding source row from the FundingSources tab by fundingSourceId.
const deleteFundingSourceRow = async (
  workbookId: string,
  fundingSourceId: string,
): Promise<void> => {
  const rows = await readTab(workbookId, FUNDING_SOURCES_TAB);

  // Find the 1-based row number of the funding source entry
  // Add 2 to account for: 1 for the header row, 1 for the 0-to-1 index conversion
  const rowIndex = rows.findIndex((row) => row['FundingSourceId'] === fundingSourceId);
  if (rowIndex === -1) throw new NotFoundError(`Funding source not found: ${fundingSourceId}`);

  const rowNumber = rowIndex + 2;
  await deleteRow(workbookId, FUNDING_SOURCES_TAB, rowNumber);
};

export default deleteFundingSourceRow;
