'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

export function PWAInstallPrompt() {
  const { canInstall, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)
  const [visible,   setVisible]   = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('pwa_prompt_dismissed')) { setDismissed(true); return }
    if (canInstall) {
      const t = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(t)
    }
  }, [canInstall])

  const dismiss = () => {
    setVisible(false)
    setDismissed(true)
    sessionStorage.setItem('pwa_prompt_dismissed', '1')
  }

  const handleInstall = async () => {
    const accepted = await install()
    if (accepted) setVisible(false)
    else dismiss()
  }

  if (!visible || dismissed) return null

  return (
    <div className="fixed bottom-[80px] left-3 right-3 z-50 pointer-events-auto"
      style={{ maxWidth: 380, margin: '0 auto' }}>
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border"
        style={{
          background:   'linear-gradient(135deg, rgba(5,20,7,0.98) 0%, rgba(9,30,11,0.98) 100%)',
          borderColor:  'rgba(74,222,128,0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow:    '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.08)',
        }}>
        {/* Tree icon */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'rgba(22,101,52,0.4)', border: '1px solid rgba(74,222,128,0.2)' }}>
          🌳
        </div>
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/95 leading-tight">Install Terra Sylvan</p>
          <p className="text-[11px] text-forest-500 leading-tight mt-0.5">Add to home screen for the full experience</p>
        </div>
        {/* Install button */}
        <button
          onClick={handleInstall}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={{
            background:  'linear-gradient(135deg, #16a34a, #15803d)',
            color:       '#fff',
            boxShadow:   '0 2px 12px rgba(22,163,74,0.35)',
          }}>
          <Download size={12} />
          Install
        </button>
        {/* Dismiss */}
        <button onClick={dismiss} className="flex-shrink-0 p-1 text-forest-700 hover:text-forest-400 transition-colors ml-1">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
