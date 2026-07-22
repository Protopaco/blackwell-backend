const getDevTestDataParentFolderId = (): string => {
  const parentFolderId = process.env.TEST_DATA_ROOT_FOLDER_ID;
  if (!parentFolderId) throw new Error('TEST_DATA_ROOT_FOLDER_ID is not set');
  return parentFolderId;
};

export default getDevTestDataParentFolderId;
