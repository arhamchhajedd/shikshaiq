/**
 * Helper to determine if Supabase environment credentials are configured.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return false;
  }

  // Check against unconfigured placeholder strings
  if (
    url.includes("your-project-id") ||
    key.includes("your-anon-public-key") ||
    url === "" ||
    key === ""
  ) {
    return false;
  }

  return url.startsWith("https://") && key.length > 20;
}
