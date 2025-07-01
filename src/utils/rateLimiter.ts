import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Janela de tempo em ms
  maxRequests: number; // Máximo de requisições por janela
  keyGenerator?: (req: NextRequest) => string;
}

class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  public config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    // Limpar registros expirados a cada minuto
    setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }

  private getKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }
    
    // Usar IP como chave padrão
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 
               req.headers.get('x-real-ip') || 'unknown';
    return `rate_limit:${ip}`;
  }

  check(req: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const key = this.getKey(req);
    const now = Date.now();
    const resetTime = now + this.config.windowMs;

    const existing = this.store.get(key);
    
    if (!existing || now > existing.resetTime) {
      // Nova janela de tempo
      this.store.set(key, { count: 1, resetTime });
      return { 
        allowed: true, 
        remaining: this.config.maxRequests - 1, 
        resetTime 
      };
    }

    if (existing.count >= this.config.maxRequests) {
      return { 
        allowed: false, 
        remaining: 0, 
        resetTime: existing.resetTime 
      };
    }

    existing.count++;
    return { 
      allowed: true, 
      remaining: this.config.maxRequests - existing.count, 
      resetTime: existing.resetTime 
    };
  }
}

// Rate limiters para diferentes endpoints
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  maxRequests: 100 // 100 requisições por IP
});

export const purchaseRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minuto
  maxRequests: 5, // 5 compras por minuto por IP
  keyGenerator: (req) => {
    const body = req.body;
    const wallet = body && typeof body === 'object' && 'wallet' in body ? body.wallet : null;
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    return `purchase:${wallet || ip}`;
  }
});

export const adminRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutos
  maxRequests: 50 // 50 requisições admin por 5 min
});

export function withRateLimit(rateLimiter: RateLimiter) {
  return (handler: (req: NextRequest) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const { allowed, remaining, resetTime } = rateLimiter.check(req);
      
      if (!allowed) {
        return new NextResponse(JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Try again later.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimiter.config.maxRequests.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
          }
        });
      }

      const response = await handler(req);
      
      // Adicionar headers de rate limit na resposta
      response.headers.set('X-RateLimit-Limit', rateLimiter.config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      
      return response;
    };
  };
} 