import { describe, it, expect } from 'vitest';
import parseDriveLink from '#utils/parseDriveLink.js';
import { UnprocessableError } from '#utils/errors.js';

describe('parseDriveLink', () => {
  it('extracts the ID from a plain folder link', () => {
    expect(parseDriveLink('https://drive.google.com/drive/folders/abc123')).toBe('abc123');
  });

  it('extracts the ID from a folder link with a user index', () => {
    expect(parseDriveLink('https://drive.google.com/drive/u/0/folders/abc123')).toBe('abc123');
  });

  it('extracts the ID from a folder link with a trailing query string', () => {
    expect(parseDriveLink('https://drive.google.com/drive/folders/abc123?usp=sharing')).toBe('abc123');
  });

  it('throws UnprocessableError for an unrecognized link', () => {
    expect(() => parseDriveLink('https://example.com/not-a-drive-link')).toThrow(UnprocessableError);
  });

  it('extracts the ID from a Google Sheets file link', () => {
    expect(parseDriveLink('https://docs.google.com/spreadsheets/d/file123/edit#gid=0')).toBe('file123');
  });

  it('extracts the ID from a Drive file link', () => {
    expect(parseDriveLink('https://drive.google.com/file/d/file123/view?usp=sharing')).toBe('file123');
  });

  it('extracts the ID from a Drive open file link', () => {
    expect(parseDriveLink('https://drive.google.com/open?id=file123')).toBe('file123');
  });
});
