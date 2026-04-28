'use client'

import { useVoiceCall } from '@/context/VoiceCallContext'
import { Mic, MicOff, PhoneOff, Loader2 } from 'lucide-react'
import { TREE_CONFIGS } from '@/types'

function fmt(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function CallModal() {
  const { callStatus, otherUser, isMuted, callDurationSec, endCall, toggleMute } = useVoiceCall()

  if (callStatus !== 'calling' && callStatus !== 'active') return null

  const treeCfg = otherUser ? TREE_CONFIGS[otherUser.treeType] : null

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xs backdrop-blur-xl bg-forest-950/95 border border-forest-700/50 rounded-3xl p-6 shadow-2xl text-center">

        {/* Tree avatar */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className={`w-24 h-24 rounded-full bg-forest-800/60 border-4 flex items-center justify-center text-5xl
            ${callStatus === 'active' ? 'border-green-500 shadow-lg shadow-green-500/30' : 'border-forest-600'}`}>
            {treeCfg?.emoji ?? '🌳'}
          </div>
          {callStatus === 'active' && (
            <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-forest-950 animate-pulse" />
          )}
        </div>

        {/* Name */}
        <p className="text-xl font-bold text-white">{otherUser?.displayName ?? '…'}</p>

        {/* Status */}
        <div className="mt-1 mb-6 flex items-center justify-center gap-2 text-sm">
          {callStatus === 'calling' ? (
            <>
              <Loader2 size={14} className="animate-spin text-forest-400" />
              <span className="text-forest-400">Ringing…</span>
            </>
          ) : (
            <span className="text-green-400 tabular-nums font-mono">{fmt(callDurationSec)}</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-red-600/80 hover:bg-red-600 text-white'
                : 'bg-forest-800 hover:bg-forest-700 text-forest-300'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-all active:scale-95"
            title="End call"
          >
            <PhoneOff size={26} />
          </button>
        </div>

        {isMuted && (
          <p className="text-xs text-red-400 mt-4">Microphone muted</p>
        )}
      </div>
    </div>
  )
}
