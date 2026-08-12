import { getCurrentProfile } from "@/lib/auth/server";
import { NavbarClient } from "./NavbarClient";

/**
 * Navbar — thin server wrapper.
 * Fetches the profile server-side and passes it as a prop to NavbarClient,
 * which handles all scroll-aware interactivity and mobile menu state.
 */
export async function Navbar() {
  const profile = await getCurrentProfile();
  return <NavbarClient profile={profile} />;
}
