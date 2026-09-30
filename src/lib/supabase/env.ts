// Reads the two public Supabase settings from .env.local.
// The "anon" key is designed to be public: what users can do is limited by
// row-level security rules in the database (see supabase/schema.sql).
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not set up yet. Create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (see .env.example), then restart `npm run dev`.",
    );
  }
  // Keep only https://xxxx.supabase.co, even if extra path text (like /rest/v1/) was pasted.
  return { url: new URL(url.trim()).origin, anonKey: anonKey.trim() };
}
