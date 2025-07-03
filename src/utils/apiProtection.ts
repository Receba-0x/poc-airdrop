import { NextRequest } from "next/server";
import crypto from "crypto";
import { getAPISecretKey } from "./secretsManager";

export interface RequestSignature {
  timestamp: number;
  nonce: string;
  signature: string;
}

export class APIProtection {
  private static SECRET_KEY: string | null = null;
  private static readonly MAX_REQUEST_AGE = 5 * 60 * 1000;
  private static usedNonces = new Set<string>();

  private static async getSecretKey(): Promise<string> {
    if (!this.SECRET_KEY) {
      this.SECRET_KEY = await getAPISecretKey();
    }
    return this.SECRET_KEY;
  }

  static async generateRequestSignature(data: any): Promise<RequestSignature> {
    const secretKey = await this.getSecretKey();
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString("hex");
    const payload = JSON.stringify({ ...data, timestamp, nonce });
    const signature = crypto
      .createHmac("sha256", secretKey)
      .update(payload)
      .digest("hex");

    return { timestamp, nonce, signature };
  }

  static async verifyRequestSignature(
    data: any,
    providedSignature: RequestSignature
  ): Promise<{ valid: boolean; error?: string }> {
    const secretKey = await this.getSecretKey();
    const now = Date.now();

    if (now - providedSignature.timestamp > this.MAX_REQUEST_AGE) {
      return { valid: false, error: "Request expired" };
    }

    if (this.usedNonces.has(providedSignature.nonce)) {
      return { valid: false, error: "Nonce already used" };
    }

    const payload = JSON.stringify({
      ...data,
      timestamp: providedSignature.timestamp,
      nonce: providedSignature.nonce,
    });
    const expectedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(payload)
      .digest("hex");

    if (expectedSignature !== providedSignature.signature) {
      return { valid: false, error: "Invalid signature" };
    }

    this.usedNonces.add(providedSignature.nonce);

    if (this.usedNonces.size > 10000) {
      this.usedNonces.clear();
    }

    return { valid: true };
  }

  static validateRequestHeaders(req: NextRequest): {
    valid: boolean;
    error?: string;
  } {
    const contentType = req.headers.get("content-type");
    const userAgent = req.headers.get("user-agent");
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");

    if (
      ["POST", "PUT"].includes(req.method) &&
      !contentType?.includes("application/json")
    ) {
      return { valid: false, error: "Invalid content type" };
    }

    if (!userAgent) {
      return { valid: false, error: "User agent required" };
    }

    const suspiciousPatterns = [
      /curl/i,
      /wget/i,
      /python-requests/i,
      /postman/i,
      /insomnia/i,
      /httpie/i,
      /^bot/i,
      /scanner/i,
      /crawler/i,
    ];

    if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
      return { valid: false, error: "Suspicious user agent" };
    }

    if (req.method !== "GET" && !origin && !referer) {
      console.warn("Request without origin/referer:", {
        method: req.method,
        pathname: req.nextUrl.pathname,
        userAgent: userAgent?.substring(0, 100),
      });

      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔧 Development mode: allowing request without origin/referer"
        );
        return { valid: true };
      }
    }

    return { valid: true };
  }

  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  static verifyCSRFToken(token: string, expectedToken: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(token, "hex"),
      Buffer.from(expectedToken, "hex")
    );
  }

  static isValidWalletRequest(
    wallet: string,
    signature: string,
    message: string
  ): boolean {
    try {
      return (
        wallet.length === 42 && wallet.startsWith("0x") && signature.length > 0
      );
    } catch {
      return false;
    }
  }

  static detectSuspiciousActivity(req: NextRequest): {
    suspicious: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];
    const userAgent = req.headers.get("user-agent") || "";
    const origin = req.headers.get("origin");
    const referer = req.headers.get("referer");
    const pathname = req.nextUrl.pathname;

    if (/selenium|puppeteer|playwright|webdriver/i.test(userAgent)) {
      reasons.push("Automation tool detected");
    }

    if (pathname.includes("/lootbox") && req.method === "POST") {
      if (!req.headers.get("accept-language")) {
        reasons.push("Missing accept-language header");
      }

      if (!req.headers.get("accept-encoding")) {
        reasons.push("Missing accept-encoding header");
      }
    }

    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

    if (origin && pathname.includes("/lootbox") && req.method === "POST") {
      if (!origin.includes("localhost") && !allowedOrigins.includes(origin)) {
        reasons.push("Suspicious origin");
      }
    }

    if (pathname.includes("/lootbox") && req.method === "POST" && !referer) {
      reasons.push("Direct API access without referer");
    }

    if (process.env.NODE_ENV === "development" && reasons.length > 0) {
      console.log(
        "🔧 Development mode: logging suspicious activity but allowing request:",
        reasons
      );
      return {
        suspicious: false,
        reasons,
      };
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }
}

export function withAPIProtection(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest) => {
    // Validate headers
    const headerValidation = APIProtection.validateRequestHeaders(req);
    if (!headerValidation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: headerValidation.error,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Detect suspicious activity
    const suspiciousActivity = APIProtection.detectSuspiciousActivity(req);
    if (suspiciousActivity.suspicious) {
      console.warn("Suspicious activity detected:", suspiciousActivity.reasons);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Request blocked",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return handler(req);
  };
}
