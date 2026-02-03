/**
 * Logout page — present only to satisfy Next.js route types.
 * GET /logout is handled by route.ts (session destroy + redirect).
 * This component is not rendered when the route handler runs.
 */
export default function LogoutPage() {
  return null;
}
