// Server component — can legally export generateStaticParams.
// Community IDs are unknown at build time so we return [].
// The public/404.html SPA redirect handles direct-URL navigation on GitHub Pages.
export function generateStaticParams() { return [] }

export { CommunityPageClient as default } from './CommunityPageClient'
