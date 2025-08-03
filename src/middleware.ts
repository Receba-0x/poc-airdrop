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

export async function middleware(request: NextRequest) {
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

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );

  if (pathname.startsWith("/api/")) {
    if (isValidOrigin(origin, host)) {
      response.headers.set("Access-Control-Allow-Origin", origin!);
    } else {
      if (process.env.NODE_ENV === "development") {
        response.headers.set("Access-Control-Allow-Origin", "*");
      }
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

  const isDev = process.env.NODE_ENV === "development";

  const trustedDomains = [
    "'self'",
    "https://imperadortoken.com",
    "https://www.imperadortoken.com",
    "https://adr-token.vercel.app",
    "https://adr-token-git-staging-imperador-token.vercel.app",
    "https://adriano-imperador.gitbook.io",
    "https://api.coingecko.com",
    "https://bnb-testnet.g.alchemy.com",
    "https://t.me",
    "https://x.com",
    "https://adrianotoken.org",
    "wss://relay.walletconnect.com",
    "wss://relay.walletconnect.org",
    "https://registry.walletconnect.com",
    "https://explorer-api.walletconnect.com",
    // Solana API URLs
    
    "https://api.devnet.solana.com",
    "https://api.mainnet-beta.solana.com",
    "https://solana-devnet.g.alchemy.com",
    "https://solana-mainnet.g.alchemy.com",
    "https://rpc.helius.xyz",
    "https://api.solana.fm",
  ];

  if (isDev) {
    trustedDomains.push("http://localhost:*", "https://localhost:*");
  }

  const cspDirectives = [
    `default-src ${trustedDomains.join(" ")}`,
    `script-src ${trustedDomains.join(" ")} ${
      isDev ? "'unsafe-eval'" : ""
    } 'unsafe-inline' https://va.vercel-scripts.com`,
    `style-src ${trustedDomains.join(
      " "
    )} 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src ${trustedDomains.join(" ")} data: https://fonts.gstatic.com`,
    `connect-src ${trustedDomains.join(
      " "
    )} wss: ws: https://api.web3modal.org https://pulse.walletconnect.org https://rpc.walletconnect.org https://data-seed-prebsc-1-s1.bnbchain.org`,
    `frame-src 'self' https://secure.walletconnect.org`,
    `img-src ${trustedDomains.join(" ")} data: blob:`,
    `media-src ${trustedDomains.join(" ")} data: blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ];

  response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

  console.log("✅ Request allowed to proceed");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
