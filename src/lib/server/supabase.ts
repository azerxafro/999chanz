import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sbsgajkedoilwyxyexcp.supabase.co';

let _client: SupabaseClient | null = null;

/**
 * Lazily initialise the Supabase admin client so that the module can be
 * imported at build-time (SvelteKit SSR analysis) without crashing when
 * environment variables are not yet available.
 */
export function getSupabase(): SupabaseClient {
  if (_client) return _client;

  // At runtime the key is expected via process.env (Vercel injects it)
  const key =
    (typeof process !== 'undefined' && process.env?.SUPABASE_SERVICE_ROLE_KEY) ?? '';

  if (!key) {
    console.warn('[supabase] SUPABASE_SERVICE_ROLE_KEY is not set — database calls will fail');
  }

  _client = createClient(SUPABASE_URL, key || 'placeholder', {
    auth: { persistSession: false }
  });

  return _client;
}

/** Convenience re-export so callers can just do `import { supabase }` */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop];
  }
});
