/** @type {import('next').NextConfig} */

// Set NEXT_PUBLIC_BASE_PATH to '/your-repo-name' in GitHub Actions secrets.
// Leave empty (or unset) for a root domain (username.github.io) deployment.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const nextConfig = {
  output: 'export',       // generate static files in /out
  trailingSlash: true,    // required for GitHub Pages file-based routing
  basePath,               // prefix for project sites (e.g. /terra-sylvan)
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    'react-reconciler',
  ],
  images: {
    unoptimized: true,    // image optimization requires a server; disabled for static export
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
}

module.exports = nextConfig
