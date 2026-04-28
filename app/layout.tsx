import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title:       'Terra Sylvan — Where Connections Grow',
  description: 'A 3D forest social platform. Your profile is a tree. Your connections are roots.',
  keywords:    ['social', 'forest', '3D', 'chat', 'community', 'terra sylvan'],
  authors:     [{ name: 'Terra Sylvan' }],
  openGraph: {
    title:       'Terra Sylvan — Where Connections Grow',
    description: 'A 3D forest social platform.',
    type:        'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#052e16',
  width:      'device-width',
  initialScale: 1,
}

// Inline script that runs before React hydrates.
// Restores the full path that was encoded by public/404.html so that
// client-side routing picks up the correct route on GitHub Pages.
const spaRoutingScript = `(function(l){
  if(l.search[1]==='/'){
    var d=l.search.slice(1).split('&').map(function(s){return s.replace(/~and~/g,'&')});
    window.history.replaceState(null,null,l.pathname.slice(0,-1)+d[0]+(d[1]?'?'+d[1]:'')+l.hash);
  }
}(window.location));`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: spaRoutingScript }} />
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#166534',
                color:      '#dcfce7',
                border:     '1px solid #16a34a',
                borderRadius: '12px',
                fontSize:   '14px',
              },
              error: {
                style: {
                  background: '#7f1d1d',
                  color:      '#fecaca',
                  border:     '1px solid #dc2626',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
