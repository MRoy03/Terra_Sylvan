import { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:             'Terra Sylvan',
    short_name:       'Terra Sylvan',
    description:      'A 3D forest social platform. Your profile is a tree.',
    start_url:        '/dashboard',
    display:          'standalone',
    background_color: '#030d05',
    theme_color:      '#052e16',
    orientation:      'portrait-primary',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['social', 'lifestyle'],
    screenshots: [],
  }
}
