'use client'

import { useState, useEffect } from 'react'
import { Feather, Leaf } from 'lucide-react'
import { getDailyPrompt, getTodayKey } from '@/lib/ritual'
import { saveRitual, getRitual } from '@/lib/firestore'
import toast from 'react-hot-toast'

interface DailyRitualProps {
  uid: string
  onComplete: () => void
}

export function DailyRitual({ uid, onComplete }: DailyRitualProps) {
  const [open,      setOpen]      = useState(false)
  const [answer,    setAnswer]    = useState('')
  const [saving,    setSaving]    = useState(false)
  const [done,      setDone]      = useState(false)
  const prompt = getDailyPrompt()
  const today  = getTodayKey()

  useEffect(() => {
    getRitual(uid, today).then(existing => {
      if (existing) {
        setDone(true)
      } else {
        // Delay slightly so the dashboard settles first
        const id = setTimeout(() => setOpen(true), 1800)
        return () => clearTimeout(id)
      }
    })
  }, [uid, today])

  const handleSubmit = async () => {
    if (!answer.trim()) return
    setSaving(true)
    try {
      await saveRitual(uid, today, prompt, answer.trim())
      setDone(true)
      setOpen(false)
      onComplete()
      toast('🌿 Ritual complete — your tree glows with intention.', { duration: 4000 })
    } catch {
      toast.error('Could not save your ritual.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => !done && setOpen(true)}
        title={done ? 'Ritual complete today' : 'Daily growth ritual'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border backdrop-blur-md transition-all
          ${done
            ? 'bg-forest-800/30 border-forest-700/30 text-forest-500 cursor-default'
            : 'bg-amber-900/30 border-amber-700/40 text-amber-300 hover:bg-amber-800/40 cursor-pointer'
          }`}
      >
        <Leaf size={11} className={done ? 'text-forest-600' : 'text-amber-400'} />
        {done ? 'Ritual done' : 'Daily ritual'}
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Organic card */}
        <div className="ritual-card overflow-hidden">
          {/* Header strip */}
          <div className="px-6 pt-6 pb-4 border-b border-white/6">
            <div className="flex items-center gap-2 mb-1">
              <Feather size={14} className="text-amber-400" />
              <span className="text-xs text-amber-400/80 font-medium tracking-widest uppercase">Daily Ritual</span>
            </div>
            <p className="text-[11px] text-forest-600">{getTodayKey()}</p>
          </div>

          {/* Prompt */}
          <div className="px-6 py-6">
            <p className="text-lg text-white/90 leading-relaxed font-display mb-5">
              {prompt}
            </p>

            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Speak to the forest…"
              rows={4}
              autoFocus
              className="w-full bg-forest-950/60 border border-forest-800/50 rounded-2xl px-4 py-3.5
                         text-sm text-forest-100 placeholder-forest-700 resize-none
                         focus:outline-none focus:border-amber-700/60 focus:ring-1 focus:ring-amber-700/30
                         transition-colors"
            />

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setOpen(false)}
                className="text-xs text-forest-700 hover:text-forest-500 transition-colors"
              >
                Later
              </button>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim() || saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
                           bg-amber-800/60 hover:bg-amber-700/70 border border-amber-700/50
                           text-amber-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Leaf size={13} />
                {saving ? 'Planting…' : 'Plant this thought'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
