import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// https://nextjs.org/docs/app/getting-started/proxy
// https://nextjs.org/docs/app/api-reference/file-conventions/proxy

export default function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/mail/:path*", "/cal/:path*"],
};
