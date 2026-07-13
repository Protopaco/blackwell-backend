import getOAuthDriveClient from './getOAuthDriveClient.js';

// Returns true if a non-trashed folder or file with the given name already exists directly inside the
// given parent folder — the "does it exist" guard checked before creating anything, so we never silently
// duplicate something a human already placed there.
const driveChildExists = async (parentFolderId: string, name: string): Promise<boolean> => {
  const drive = getOAuthDriveClient();

  const escapedName = name.split("'").join("\\'");
  const response = await drive.files.list({
    q: `'${parentFolderId}' in parents and name = '${escapedName}' and trashed = false`,
    fields: 'files(id)',
  });

  return (response.data.files?.length ?? 0) > 0;
};

export default driveChildExists;
