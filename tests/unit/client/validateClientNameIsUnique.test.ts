import { describe, it, expect } from 'vitest';
import validateClientNameIsUnique from '#services/client/validateClientNameIsUnique.js';

describe('validateClientNameIsUnique', () => {
  it('allows a client name that does not exist', () => {
    expect(() =>
      validateClientNameIsUnique(
        [{ clientId: 'client-1', clientName: 'Acme Co' } as any],
        'Blackwell Co',
      ),
    ).not.toThrow();
  });

  it('throws UnprocessableError when the client name already exists', () => {
    expect(() =>
      validateClientNameIsUnique(
        [{ clientId: 'client-1', clientName: 'Acme Co' } as any],
        'Acme Co',
      ),
    ).toThrow('Client name already exists: Acme Co');
  });

  it('allows a client to keep its own unchanged name when excluded', () => {
    expect(() =>
      validateClientNameIsUnique(
        [{ clientId: 'client-1', clientName: 'Acme Co' } as any],
        'Acme Co',
        'client-1',
      ),
    ).not.toThrow();
  });

  it('still throws when the name belongs to a different client than the excluded one', () => {
    expect(() =>
      validateClientNameIsUnique(
        [
          { clientId: 'client-1', clientName: 'Acme Co' } as any,
          { clientId: 'client-2', clientName: 'Blackwell Co' } as any,
        ],
        'Blackwell Co',
        'client-1',
      ),
    ).toThrow('Client name already exists: Blackwell Co');
  });
});
