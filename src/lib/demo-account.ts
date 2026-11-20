import { ApiError } from "./api-helpers";

// The public demo workspace signs in with a shared login printed on /demo.
// Its seeded users have addresses that do not receive mail. Earlier seed data
// used vitros.app and vitros.io, which VitrOS does not own.
export const DEMO_LOGIN_EMAIL = "demo@vitroslabs.com";
const DEMO_DOMAIN = "demo.vitroslabs.com";
const UNOWNED_DOMAINS = ["vitros.app", "vitros.io"];

export function isDemoAddress(email: string): boolean {
  const address = email.trim().toLowerCase();
  if (address === DEMO_LOGIN_EMAIL) return true;
  const domain = address.split("@")[1] ?? "";
  return [DEMO_DOMAIN, ...UNOWNED_DOMAINS].some((d) => domain === d || domain.endsWith(`.${d}`));
}

// Maps a demo login on the old vitros.app domain to the address that user
// has now, so credentials emailed to prospects before the move keep working.
// Any other address is returned unchanged.
export function currentLoginEmail(email: string): string {
  const address = email.trim();
  const lower = address.toLowerCase();
  if (lower === "demo@vitros.app") return DEMO_LOGIN_EMAIL;
  if (lower.endsWith(".vitros.app")) return `${address.slice(0, -"vitros.app".length)}${DEMO_DOMAIN}`;
  return address;
}

// Anyone on the internet can sign in to the demo, so it must not be able to
// change its own password, start billing, or create accounts.
export function assertNotDemoAccount(user: { email: string }, action: string) {
  if (isDemoAddress(user.email)) {
    throw new ApiError(`The shared demo workspace cannot ${action}. Start a free trial to use this in your own lab.`, 403);
  }
}
