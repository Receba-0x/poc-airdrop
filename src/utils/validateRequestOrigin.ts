import type { NextRequest } from "next/server";

export function validateRequestOrigin(
  req: NextRequest,
  action?: string
): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");
  const userAgent = req.headers.get("user-agent") || "";

  if (
    !userAgent.includes("Mozilla") &&
    !userAgent.includes("Chrome") &&
    !userAgent.includes("Safari")
  ) {
    return false;
  }

  if (origin && host && !origin.includes(host)) {
    return false;
  }

  const sensitiveActions = ["purchase"];
  if (action && sensitiveActions.includes(action)) {
    if (referer && host && !referer.includes(host)) {
      return false;
    }
  }

  return true;
}
