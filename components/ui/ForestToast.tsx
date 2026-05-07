'use client'

import { Toast, toast as hotToast } from 'react-hot-toast'

export type ForestToastVariant =
  | 'growth'    // tree grew / milestone
  | 'ritual'    // daily ritual complete
  | 'mood'      // mood changed
  | 'message'   // new message / sent
  | 'connect'   // friend request / connection
  | 'media'     // photo / video
  | 'call'      // voice call
  | 'seed'      // seed gifted / received
  | 'badge'     // badge unlocked
  | 'error'     // something went wrong
  | 'info'      // generic info

interface ForestToastData {
  variant:  ForestToastVariant
  title:    string
  body?:    string
}

// ── Icon SVGs per variant ───────────────────────────────────────────────────

function ToastIcon({ variant }: { variant: ForestToastVariant }) {
  const base = 'w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0 text-lg'

  if (variant === 'growth')  return <div className={`${base} bg-emerald-900/60 ring-1 ring-emerald-600/40`}>🌳</div>
  if (variant === 'ritual')  return <div className={`${base} bg-amber-900/60  ring-1 ring-amber-600/40`}>🌿</div>
  if (variant === 'mood')    return <div className={`${base} bg-sky-900/60    ring-1 ring-sky-500/40`}>🌤</div>
  if (variant === 'message') return <div className={`${base} bg-forest-900/60 ring-1 ring-forest-600/40`}>🍃</div>
  if (variant === 'connect') return (
    <div className={`${base} bg-violet-900/60 ring-1 ring-violet-500/40`}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="7"  cy="8"  r="3" stroke="#a78bfa" strokeWidth="1.5"/>
        <circle cx="13" cy="8"  r="3" stroke="#a78bfa" strokeWidth="1.5"/>
        <path d="M2 17c0-3 2-5 5-5h6c3 0 5 2 5 5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  )
  if (variant === 'media')   return <div className={`${base} bg-pink-900/60   ring-1 ring-pink-500/40`}>🌸</div>
  if (variant === 'call')    return (
    <div className={`${base} bg-teal-900/60 ring-1 ring-teal-500/40`}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M3 5a2 2 0 012-2h1.5l2 4.5-1.5 1.5a10 10 0 004 4l1.5-1.5L17 13.5V15a2 2 0 01-2 2A13 13 0 013 5z"
              fill="#5eead4" opacity="0.85"/>
      </svg>
    </div>
  )
  if (variant === 'seed')    return <div className={`${base} bg-lime-900/60    ring-1 ring-lime-500/40`}>🌱</div>
  if (variant === 'badge')   return <div className={`${base} bg-yellow-900/60  ring-1 ring-yellow-500/40`}>🏅</div>
  if (variant === 'error')   return (
    <div className={`${base} bg-red-900/60 ring-1 ring-red-500/40`}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <path d="M10 3L2 17h16L10 3z" stroke="#f87171" strokeWidth="1.5" strokeLinejoin="round"/>
        <line x1="10" y1="9" x2="10" y2="13" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="15.5" r="0.75" fill="#f87171"/>
      </svg>
    </div>
  )
  // info / default
  return (
    <div className={`${base} bg-forest-900/60 ring-1 ring-forest-600/40`}>
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#86efac" strokeWidth="1.5"/>
        <line x1="10" y1="9"  x2="10" y2="14" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="6.5" r="0.75" fill="#86efac"/>
      </svg>
    </div>
  )
}

// ── Accent colours per variant ──────────────────────────────────────────────

const ACCENT: Record<ForestToastVariant, string> = {
  growth:  'rgba(52,211,153,0.18)',
  ritual:  'rgba(217,119,6,0.18)',
  mood:    'rgba(56,189,248,0.15)',
  message: 'rgba(74,222,128,0.12)',
  connect: 'rgba(167,139,250,0.18)',
  media:   'rgba(244,114,182,0.15)',
  call:    'rgba(45,212,191,0.15)',
  seed:    'rgba(163,230,53,0.15)',
  badge:   'rgba(250,204,21,0.18)',
  error:   'rgba(248,113,113,0.18)',
  info:    'rgba(134,239,172,0.12)',
}

// ── The card component ───────────────────────────────────────────────────────

export function ForestToastCard({ t, data }: { t: Toast; data: ForestToastData }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl backdrop-blur-md
                  border border-white/8 shadow-2xl max-w-xs w-full
                  transition-all duration-300
                  ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      style={{
        background:  `linear-gradient(135deg, #0c1f0e 0%, #0a1a0b 100%)`,
        boxShadow:   `0 8px 32px rgba(0,0,0,0.5), inset 0 0 0 1px ${ACCENT[data.variant]}`,
      }}
    >
      <ToastIcon variant={data.variant} />

      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[13px] font-medium text-forest-100 leading-snug">{data.title}</p>
        {data.body && (
          <p className="text-[11px] text-forest-500 mt-0.5 leading-snug truncate">{data.body}</p>
        )}
      </div>

      <button
        onClick={() => hotToast.dismiss(t.id)}
        className="flex-shrink-0 mt-0.5 text-forest-700 hover:text-forest-400 transition-colors"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="12" y1="2" x2="2"  y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}
