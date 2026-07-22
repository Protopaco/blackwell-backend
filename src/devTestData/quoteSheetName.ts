const quoteSheetName = (tabName: string): string => `'${tabName.replace(/'/g, "''")}'`;

export default quoteSheetName;
