import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter((o) => o.length > 0);

function isValidOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin === `https://${host}`) return true;
  const isDev = process.env.NODE_ENV === "development";
  if (isDev && origin.includes("localhost")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  const userAgent = request.headers.get("user-agent");

  if (!userAgent || userAgent.length < 10) {
    console.log("❌ Blocked: No user agent or too short");
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Access denied",
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (request.method === "OPTIONS" && pathname.startsWith("/api/")) {
    console.log("✅ Allowing OPTIONS request");
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Admin-Secret",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (pathname.startsWith("/api/")) {
    if (request.method !== "GET" && !isValidOrigin(origin, host)) {
      console.log("❌ Blocked: Invalid origin", { origin, host });
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Origin not allowed",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (pathname.includes("/lootbox")) {
      console.log("🎯 Lootbox endpoint detected");

      const botPatterns = [
        /curl/i,
        /wget/i,
        /python/i,
        /postman/i,
        /insomnia/i,
        /httpie/i,
        /bot/i,
      ];

      if (botPatterns.some((pattern) => pattern.test(userAgent))) {
        console.log("❌ Blocked: Bot pattern detected", { userAgent });
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: "Access denied",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (
        request.method === "POST" &&
        (!referer || !referer.includes(host || ""))
      ) {
        console.warn("⚠️ POST request to lootbox without proper referer:", {
          referer,
          host,
          userAgent: userAgent?.substring(0, 100),
        });
      }
    }
  }

  if (pathname.startsWith("/admin")) {
    const adminSecret = request.headers.get("x-admin-secret");
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    if (isValidOrigin(origin, host)) {
      response.headers.set("Access-Control-Allow-Origin", origin || "*");
    } else {
      // For development, be more permissive
      response.headers.set("Access-Control-Allow-Origin", "*");
    }
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Admin-Secret"
    );
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  // CSP header
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https:; frame-src *; connect-src *; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; style-src-elem 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; media-src 'self' data: blob: https:; object-src 'none'; base-uri 'self';"
  );

  console.log("✅ Request allowed to proceed");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
