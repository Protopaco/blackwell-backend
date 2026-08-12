import { describe, it, expect } from 'vitest';
import validateClientCodeIsUnique from '#services/client/validateClientCodeIsUnique.js';

describe('validateClientCodeIsUnique', () => {
  it('allows a client code that does not exist', () => {
    expect(() =>
      validateClientCodeIsUnique(
        [{ clientId: 'client-1', clientCode: 'ACME' } as any],
        'BLACKWELL',
      ),
    ).not.toThrow();
  });

  it('throws UnprocessableError when the client code already exists', () => {
    expect(() =>
      validateClientCodeIsUnique(
        [{ clientId: 'client-1', clientCode: 'ACME' } as any],
        'ACME',
      ),
    ).toThrow('Client code already exists: ACME');
  });

  it('allows a client to keep its own unchanged code when excluded', () => {
    expect(() =>
      validateClientCodeIsUnique(
        [{ clientId: 'client-1', clientCode: 'ACME' } as any],
        'ACME',
        'client-1',
      ),
    ).not.toThrow();
  });

  it('still throws when the code belongs to a different client than the excluded one', () => {
    expect(() =>
      validateClientCodeIsUnique(
        [
          { clientId: 'client-1', clientCode: 'ACME' } as any,
          { clientId: 'client-2', clientCode: 'BLACKWELL' } as any,
        ],
        'BLACKWELL',
        'client-1',
      ),
    ).toThrow('Client code already exists: BLACKWELL');
  });
});
