import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const inter     = Inter({ subsets: ['latin'], variable: '--font-inter',     display: 'swap' })
const cormorant = Cormorant_Garamond({
  subsets:  ['latin'],
  variable: '--font-cormorant',
  display:  'swap',
  weight:   ['300', '400', '500', '600', '700'],
  style:    ['normal', 'italic'],
})

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
  themeColor:   '#052e16',
  width:        'device-width',
  initialScale: 1,
}

const spaRoutingScript = `(function(l){
  if(l.search[1]==='/'){
    var d=l.search.slice(1).split('&').map(function(s){return s.replace(/~and~/g,'&')});
    window.history.replaceState(null,null,l.pathname.slice(0,-1)+d[0]+(d[1]?'?'+d[1]:'')+l.hash);
  }
}(window.location));`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: spaRoutingScript }} />
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background:   '#0e1f10',
                color:        '#dcfce7',
                border:       '1px solid rgba(134,239,172,0.2)',
                borderRadius: '14px',
                fontSize:     '13px',
                fontFamily:   'var(--font-inter)',
                boxShadow:    '0 8px 32px rgba(0,0,0,0.4)',
              },
              error: {
                style: {
                  background: '#1a0808',
                  color:      '#fecaca',
                  border:     '1px solid rgba(239,68,68,0.25)',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
