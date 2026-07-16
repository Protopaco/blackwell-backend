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
});
