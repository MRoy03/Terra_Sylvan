'use client'

import { X, BookOpen } from 'lucide-react'
import { useJournal } from '@/hooks/useJournal'

interface JournalPanelProps {
  uid:     string
  onClose: () => void
}

export function JournalPanel({ uid, onClose }: JournalPanelProps) {
  const { entries, loading } = useJournal(uid)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-sm glass rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-forest-900/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen size={15} className="text-forest-400" />
            <h2 className="font-display text-base font-semibold text-white/90">Tree Journal</h2>
          </div>
          <button onClick={onClose} className="text-forest-600 hover:text-white p-1 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-forest-900/50 animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <span className="text-4xl">🌱</span>
              <p className="text-forest-600 text-sm font-display italic">Your journal is empty.</p>
              <p className="text-forest-800 text-xs leading-relaxed">
                Milestones — messages sent, connections made, tree stages — will be recorded here automatically.
              </p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-forest-700/60 via-forest-800/40 to-transparent" />
              <div className="space-y-5">
                {entries.map((e, i) => (
                  <div key={e.id ?? i} className="flex items-start gap-4 pl-1">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-forest-900/90 border border-forest-700/50
                                    flex items-center justify-center text-sm z-10 relative shadow-sm">
                      {e.emoji}
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-xs text-forest-200 leading-snug">{e.message}</p>
                      <p className="text-[10px] text-forest-700 mt-1">
                        {new Date(e.timestamp).toLocaleDateString([], {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
