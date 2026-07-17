import { UnprocessableError } from '#utils/errors.js';

const parsePathId = (link: string, marker: string): string | null => {
  const markerIndex = link.indexOf(marker);
  if (markerIndex === -1) return null;

  const afterMarker = link.slice(markerIndex + marker.length);
  const id = afterMarker.split('?')[0].split('/')[0];
  return id || null;
};

// Extracts a Drive resource ID from a pasted Google Drive/Sheets URL. Resource type validation lives
// in the Drive adapters that look up the parsed ID.
const parseDriveLink = (link: string): string => {
  const pathId =
    parsePathId(link, '/folders/') ??
    parsePathId(link, '/spreadsheets/d/') ??
    parsePathId(link, '/file/d/');
  if (pathId) return pathId;

  try {
    const url = new URL(link);
    const openId = url.hostname === 'drive.google.com' && url.pathname === '/open'
      ? url.searchParams.get('id')
      : null;
    if (openId) return openId;
  } catch {
    // Fall through to the uniform business error below.
  }

  throw new UnprocessableError(`Unrecognized Drive link: ${link}`);
};

export default parseDriveLink;
