import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedOrigins = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'https://adr-token.vercel.app',
];

const allowedIPs: string[] = [];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  const isAllowedOrigin = origin && allowedOrigins.some(allowed =>
    origin === allowed || origin.endsWith('.' + allowed.replace(/^https?:\/\//, ''))
  );

  const isAllowedReferer = referer && allowedOrigins.some(allowed =>
    referer.startsWith(allowed)
  );

  const xForwardedFor = request.headers.get('x-forwarded-for') || '';
  const clientIP = xForwardedFor.split(',')[0].trim();
  const isAllowedIP = allowedIPs.length === 0 || allowedIPs.includes(clientIP);

  // Bypass de autenticação para a rota de login
  if (pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  // Verificar token para rotas administrativas
  if (pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization');
    
    // Verificar apenas se o token está presente no formato correto
    // A validação real do token será feita nas rotas da API
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({
        success: false,
        error: 'Unauthorized access'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  // Verificação de origem para evitar CSRF
  if (!isDevelopment && (!isAllowedOrigin && !isAllowedReferer) && !isAllowedIP) {
    console.warn(`Acesso negado: origem=${origin}, referer=${referer}, ip=${clientIP}`);

    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Forbidden access'
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
}; 