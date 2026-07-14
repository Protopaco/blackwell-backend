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
});
