// Cloudflare Turnstile public site key, inlined at build time from
// NEXT_PUBLIC_TURNSTILE_SITE_KEY (a Workers Builds build variable). Locally it
// falls back to Cloudflare's test key. The server only verifies tokens when a
// site key is built in, so the widget and the check can never disagree.
export const turnstileSiteKey =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (process.env.NODE_ENV === "production" ? "" : "1x00000000000000000000AA");
