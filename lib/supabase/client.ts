import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

// manage cookies and sessions automatically in browser
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
