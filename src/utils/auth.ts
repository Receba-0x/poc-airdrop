import { jwtVerify, SignJWT } from 'jose';

export const TOKEN_EXPIRATION = 60 * 60 * 8;
const JWT_SECRET = process.env.ADMIN_SECRET || '';

export async function generateToken(payload: { username: string; role: string }) {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + TOKEN_EXPIRATION)
    .sign(secret);

  return token;
}

export async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      valid: true,
      payload
    };
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return {
      valid: false,
      payload: null
    };
  }
}

export async function isAuthenticated(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.slice(7);
  const { valid, payload } = await verifyToken(token);

  return valid && !!payload && typeof payload === 'object' && payload.role === 'admin';
}

export function getExpirationDate() {
  const expiresAt = new Date();
  expiresAt.setSeconds(expiresAt.getSeconds() + TOKEN_EXPIRATION);
  return expiresAt.toISOString();
} 