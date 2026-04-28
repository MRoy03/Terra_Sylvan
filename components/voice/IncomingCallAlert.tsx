'use client'

import { useVoiceCall } from '@/context/VoiceCallContext'
import { Phone, PhoneOff } from 'lucide-react'

export function IncomingCallAlert() {
  const { incomingCall, acceptCall, rejectCall } = useVoiceCall()
  if (!incomingCall) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-fade-in">
      <div className="backdrop-blur-xl bg-forest-900/95 border border-forest-600/50 rounded-2xl p-4 shadow-2xl shadow-forest-900/60">
        {/* Pulse ring */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-forest-700/60 border-2 border-forest-500 flex items-center justify-center text-3xl animate-pulse-glow">
              {incomingCall.callerEmoji}
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 animate-ping" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs text-forest-500 uppercase tracking-wide">Incoming voice call</p>
            <p className="text-base font-bold text-white truncate mt-0.5">{incomingCall.callerName}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={rejectCall}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-sm font-medium transition-colors"
          >
            <PhoneOff size={16} />
            Decline
          </button>
          <button
            onClick={acceptCall}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
          >
            <Phone size={16} />
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
