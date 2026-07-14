// Builds a Drive folder link in the shape parseDriveLink expects — used wherever a builder or scenario
// needs to pass a real folder ID as a FolderInput.link value.
const buildDriveFolderLink = (folderId: string): string => `https://drive.google.com/drive/folders/${folderId}`;

export default buildDriveFolderLink;
