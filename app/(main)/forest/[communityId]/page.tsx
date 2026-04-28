// Server component — exports generateStaticParams (required for static export).
// Renders the client component which handles all Firebase data fetching.
import { CommunityPageClient } from './CommunityPageClient'

// Return a placeholder so Next.js 16 output:export compiles this route into the
// JS bundle. All real community IDs are handled by client-side routing via the
// SPA 404.html redirect trick used on GitHub Pages.
export function generateStaticParams() { return [{ communityId: '_' }] }

export default function CommunityPage() {
  return <CommunityPageClient />
}
