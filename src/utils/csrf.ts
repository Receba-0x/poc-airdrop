// ATENÇÃO: Este módulo depende de pacotes Node.js e só deve ser usado em rotas Node.js (API Route tradicional ou app/api com runtime nodejs), nunca em middleware Edge!
import Tokens from 'csrf';

const tokens = new Tokens();
const CSRF_SECRET_COOKIE = 'csrfSecret';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

export async function generateCsrfSecret() {
  return await tokens.secret();
}

export function createCsrfToken(secret: string) {
  return tokens.create(secret);
}

export function verifyCsrfToken(secret: string, token: string) {
  return tokens.verify(secret, token);
}

export { CSRF_SECRET_COOKIE, CSRF_TOKEN_HEADER }; 