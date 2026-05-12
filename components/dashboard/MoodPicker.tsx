'use client'

import { useState } from 'react'
import { MOOD_OPTIONS, getMoodOption, type MoodType } from '@/lib/mood'
import { saveMood, clearMood } from '@/lib/firestore'
import { forestToast } from '@/lib/forest-toast'

interface MoodPickerProps {
  uid:          string
  currentMood:  MoodType | null
  onMoodChange: (mood: MoodType | null) => void
}

export function MoodPicker({ uid, currentMood, onMoodChange }: MoodPickerProps) {
  const [open,   setOpen]   = useState(false)
  const [saving, setSaving] = useState(false)

  const current = currentMood ? getMoodOption(currentMood) : null

  const handleSelect = async (mood: MoodType) => {
    setSaving(true)
    try {
      await saveMood(uid, mood)
      onMoodChange(mood)
      setOpen(false)
      const opt = getMoodOption(mood)
      forestToast.mood(`Mood set to ${opt.label}`, { duration: 2500 })
    } catch {
      forestToast.error('Could not save mood')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!currentMood) { setOpen(false); return }
    setSaving(true)
    try {
      await clearMood(uid)
      onMoodChange(null)
      setOpen(false)
      forestToast.info('Mood cleared — real weather restored.')
    } catch {
      forestToast.error('Could not clear mood')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        title="Set your mood"
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm border backdrop-blur-md transition-all
          ${current
            ? 'bg-black/40 border-white/20 text-white'
            : 'bg-forest-900/50 border-forest-700/50 text-forest-300 hover:text-white hover:border-forest-500/60'
          }`}
      >
        <span className="text-base leading-none">{current?.emoji ?? '🌿'}</span>
        <span className="text-[10px] font-medium hidden sm:block">
          {current ? current.label : 'Mood'}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full right-0 mt-2 z-50 animate-fade-in">
            <div className="ritual-card p-3 w-56">
              <p className="text-[10px] text-forest-600 uppercase tracking-wider font-medium mb-2.5 px-1">
                How are you feeling?
              </p>

              {/* Clear / Real weather option */}
              <button
                onClick={handleClear}
                disabled={saving}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all mb-1
                  border-b border-forest-900/60 pb-2.5 mb-2.5
                  ${!currentMood
                    ? 'bg-forest-800/40 text-forest-300'
                    : 'text-forest-500 hover:bg-forest-900/50 hover:text-forest-200'
                  }`}
              >
                <span className="text-lg leading-none">🌤</span>
                <div className="text-left">
                  <p className="text-xs font-medium leading-none">Real weather</p>
                  <p className="text-[10px] text-forest-600 mt-0.5">
                    {currentMood ? 'Clear mood override' : 'Active — no override'}
                  </p>
                </div>
                {!currentMood && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-forest-400" />
                )}
              </button>

              <div className="flex flex-col gap-1">
                {MOOD_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => handleSelect(opt.type)}
                    disabled={saving}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all
                      ${currentMood === opt.type
                        ? 'bg-forest-800/60 text-white'
                        : 'text-forest-400 hover:bg-forest-900/50 hover:text-forest-200'
                      }`}
                  >
                    <span className="text-lg leading-none">{opt.emoji}</span>
                    <div className="text-left">
                      <p className="text-xs font-medium leading-none">{opt.label}</p>
                      <p className="text-[10px] text-forest-600 mt-0.5">{opt.hint}</p>
                    </div>
                    {currentMood === opt.type && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: opt.accent }} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
