import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('#db/adapter/folderExists.js', () => ({ default: vi.fn() }));
vi.mock('#db/adapter/driveChildExists.js', () => ({ default: vi.fn() }));
vi.mock('#db/adapter/createFolder.js', () => ({ default: vi.fn() }));

import resolveFolder from '#services/client/resolveFolder.js';
import folderExists from '#db/adapter/folderExists.js';
import driveChildExists from '#db/adapter/driveChildExists.js';
import createFolder from '#db/adapter/createFolder.js';

describe('resolveFolder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('existing link', () => {
    it('returns the parsed ID when the folder exists', async () => {
      vi.mocked(folderExists).mockResolvedValueOnce(true);

      const folderId = await resolveFolder(
        { link: 'https://drive.google.com/drive/folders/abc123' },
        'parent-1',
        'Payroll Config',
      );

      expect(folderId).toBe('abc123');
      expect(folderExists).toHaveBeenCalledWith('abc123');
    });

    it('throws NotFoundError when the folder does not resolve', async () => {
      vi.mocked(folderExists).mockResolvedValueOnce(false);

      await expect(
        resolveFolder(
          { link: 'https://drive.google.com/drive/folders/missing' },
          'parent-1',
          'Payroll Config',
        ),
      ).rejects.toThrow('Folder not found or inaccessible');
    });
  });

  describe('create new', () => {
    it('creates the folder when the parent exists and there is no name collision', async () => {
      vi.mocked(folderExists).mockResolvedValueOnce(true);
      vi.mocked(driveChildExists).mockResolvedValueOnce(false);
      vi.mocked(createFolder).mockResolvedValueOnce('new-folder-id');

      const folderId = await resolveFolder({ createNew: true }, 'parent-1', 'Payroll Config');

      expect(folderId).toBe('new-folder-id');
      expect(createFolder).toHaveBeenCalledWith('Payroll Config', 'parent-1');
    });

    it('throws NotFoundError when the parent folder does not exist', async () => {
      vi.mocked(folderExists).mockResolvedValueOnce(false);

      await expect(
        resolveFolder({ createNew: true }, 'missing-parent', 'Payroll Config'),
      ).rejects.toThrow('Parent folder not found or inaccessible');

      expect(createFolder).not.toHaveBeenCalled();
    });

    it('throws UnprocessableError on a name collision', async () => {
      vi.mocked(folderExists).mockResolvedValueOnce(true);
      vi.mocked(driveChildExists).mockResolvedValueOnce(true);

      await expect(
        resolveFolder({ createNew: true }, 'parent-1', 'Payroll Config'),
      ).rejects.toThrow('already exists in the parent folder');

      expect(createFolder).not.toHaveBeenCalled();
    });
  });

  it('throws UnprocessableError when neither link nor createNew is provided', async () => {
    await expect(resolveFolder({}, 'parent-1', 'Payroll Config')).rejects.toThrow(
      'Folder input must specify either "link" or "createNew"',
    );
  });
});
