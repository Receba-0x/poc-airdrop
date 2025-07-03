import { NextRequest, NextResponse } from "next/server";
import {
  generateCsrfSecret,
  createCsrfToken,
  CSRF_SECRET_COOKIE,
  CSRF_TOKEN_HEADER,
} from "@/utils/csrf";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  let csrfSecret = request.cookies.get(CSRF_SECRET_COOKIE)?.value;
  const response = new NextResponse();

  if (!csrfSecret) {
    csrfSecret = await generateCsrfSecret();
    response.cookies.set(CSRF_SECRET_COOKIE, csrfSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 2,
    });
  }

  const csrfToken = createCsrfToken(csrfSecret);
  response.headers.set(CSRF_TOKEN_HEADER, csrfToken);
  response.headers.set("Content-Type", "application/json");
  return new NextResponse(JSON.stringify({ csrfToken }), {
    status: 200,
    headers: response.headers,
  });
}
