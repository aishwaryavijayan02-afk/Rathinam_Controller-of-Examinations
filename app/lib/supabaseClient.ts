import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qxmklrpggeolfvdcretz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseAnonKey.includes("placeholder"));
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy");
