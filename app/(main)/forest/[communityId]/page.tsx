// Server component — exports generateStaticParams (required for static export).
// Renders the client component which handles all Firebase data fetching.
import { CommunityPageClient } from './CommunityPageClient'

export function generateStaticParams() { return [] }

export default function CommunityPage() {
  return <CommunityPageClient />
}
