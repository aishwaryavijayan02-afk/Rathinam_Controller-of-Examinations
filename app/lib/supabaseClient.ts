import { createClient } from "@supabase/supabase-js";

const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qxmklrpggeolfvdcretz.supabase.co";
// Accept both the project URL and a pasted REST URL ending in `/rest/v1/`.
// Supabase's client adds `/rest/v1` itself, so keeping that suffix causes bad
// requests such as `/rest/v1/rest/v1/...`.
const supabaseUrl = configuredUrl.replace(/\/rest\/v1\/?$/, "");
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes("placeholder"));
};

// Keep the module importable before local environment setup is complete. All
// database operations are guarded by `isSupabaseConfigured()`.
export const supabase = createClient(supabaseUrl, supabaseAnonKey || "missing-anon-key");
