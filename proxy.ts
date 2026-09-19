import type { NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

// Next.js 16 renamed Middleware to Proxy (see node_modules/next/dist/docs/
// 01-app/01-getting-started/16-proxy.md) — same file/runtime, new name.
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Skip static assets and image optimization files; still run on
    // everything else so the session cookie stays fresh app-wide.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
