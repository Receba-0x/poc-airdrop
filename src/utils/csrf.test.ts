import { generateCsrfSecret, createCsrfToken, verifyCsrfToken } from './csrf';

describe('CSRF Util', () => {
  it('gera um secret, cria e valida um token corretamente', async () => {
    const secret = await generateCsrfSecret();
    const token = createCsrfToken(secret);
    expect(verifyCsrfToken(secret, token)).toBe(true);
  });

  it('retorna false para token inválido', async () => {
    const secret = await generateCsrfSecret();
    const token = createCsrfToken(secret);
    expect(verifyCsrfToken(secret, token + 'x')).toBe(false);
  });

  it('retorna false para secret inválido', async () => {
    const secret = await generateCsrfSecret();
    const token = createCsrfToken(secret);
    expect(verifyCsrfToken(secret + 'x', token)).toBe(false);
  });
}); 