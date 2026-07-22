import { describe, expect, it } from 'vitest';
import buildDriveFolderLink from '#utils/buildDriveFolderLink.js';

describe('buildDriveFolderLink', () => {
  it('builds a Google Drive folder URL from a folder id', () => {
    expect(buildDriveFolderLink('folder-1')).toBe(
      'https://drive.google.com/drive/folders/folder-1',
    );
  });
});
