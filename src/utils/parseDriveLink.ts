import { UnprocessableError } from '#utils/errors.js';

// Extracts a Drive folder ID from a pasted Drive URL. Supports the two real-world link shapes:
// https://drive.google.com/drive/folders/{id} and https://drive.google.com/drive/u/{n}/folders/{id},
// with or without a trailing query string (e.g. ?usp=sharing).
const parseDriveLink = (link: string): string => {
  const marker = '/folders/';
  const markerIndex = link.indexOf(marker);
  if (markerIndex === -1) throw new UnprocessableError(`Unrecognized Drive folder link: ${link}`);

  const afterMarker = link.slice(markerIndex + marker.length);
  const id = afterMarker.split('?')[0].split('/')[0];
  if (!id) throw new UnprocessableError(`Unrecognized Drive folder link: ${link}`);

  return id;
};

export default parseDriveLink;
