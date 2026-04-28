'use client'

import {
  createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode,
} from 'react'
import { ref, set, remove, onValue, off } from 'firebase/database'
import { rtdb } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { TREE_CONFIGS, UserProfile } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────
export type CallStatus = 'idle' | 'calling' | 'ringing' | 'active'

export interface IncomingCallInfo {
  callerId:    string
  callerName:  string
  callerEmoji: string
  timestamp:   number
}

interface VoiceCallCtxValue {
  callStatus:      CallStatus
  otherUser:       UserProfile | null
  incomingCall:    IncomingCallInfo | null
  isMuted:         boolean
  callDurationSec: number
  startCall:       (other: UserProfile) => Promise<void>
  acceptCall:      () => Promise<void>
  rejectCall:      () => Promise<void>
  endCall:         () => void
  toggleMute:      () => void
}

const VoiceCallCtx = createContext<VoiceCallCtxValue | null>(null)
export const useVoiceCall = () => useContext(VoiceCallCtx)!

// ─── Provider ─────────────────────────────────────────────────────────────────
export function VoiceCallProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()

  const peerRef          = useRef<any>(null)
  const mediaConnRef     = useRef<any>(null)
  const pendingConnRef   = useRef<any>(null)
  const localStreamRef   = useRef<MediaStream | null>(null)
  const audioRef         = useRef<HTMLAudioElement | null>(null)

  const [callStatus,      setCallStatus]      = useState<CallStatus>('idle')
  const [otherUser,       setOtherUser]       = useState<UserProfile | null>(null)
  const [incomingCall,    setIncomingCall]    = useState<IncomingCallInfo | null>(null)
  const [isMuted,         setIsMuted]         = useState(false)
  const [callDurationSec, setCallDurationSec] = useState(0)

  // ── Init PeerJS when logged in ──────────────────────────────────────────────
  useEffect(() => {
    if (!user || typeof window === 'undefined') return
    let destroyed = false

    import('peerjs').then(({ Peer }) => {
      if (destroyed) return
      const peer = new Peer(user.uid, { debug: 0 })
      peerRef.current = peer

      peer.on('call', (conn: any) => {
        pendingConnRef.current = conn
      })
      peer.on('error', () => {})
    }).catch(() => {})

    return () => {
      destroyed = true
      peerRef.current?.destroy()
      peerRef.current = null
    }
  }, [user])

  // ── RTDB incoming-call listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const callRef = ref(rtdb, `calls/${user.uid}`)

    const handler = (snap: any) => {
      const data = snap.val()
      if (data && data.status === 'ringing') {
        setIncomingCall({
          callerId:    data.callerId,
          callerName:  data.callerName,
          callerEmoji: data.callerEmoji,
          timestamp:   data.timestamp,
        })
        setCallStatus('ringing')
      } else if (!data) {
        // Call ended / cancelled by caller
        if (callStatus === 'ringing') cleanupCall()
      }
    }

    onValue(callRef, handler)
    return () => off(callRef, 'value', handler)
  }, [user, callStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Duration timer ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (callStatus !== 'active') { setCallDurationSec(0); return }
    const id = setInterval(() => setCallDurationSec((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [callStatus])

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const playRemoteStream = (stream: MediaStream) => {
    if (!audioRef.current) audioRef.current = new Audio()
    audioRef.current.srcObject = stream
    audioRef.current.play().catch(() => {})
  }

  const cleanupCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    mediaConnRef.current?.close()
    pendingConnRef.current = null
    localStreamRef.current = null
    mediaConnRef.current = null
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.srcObject = null
    }
    setCallStatus('idle')
    setOtherUser(null)
    setIncomingCall(null)
    setIsMuted(false)
    setCallDurationSec(0)
  }, [])

  const wireMediaConn = useCallback((conn: any) => {
    mediaConnRef.current = conn
    conn.on('stream', (remote: MediaStream) => {
      setCallStatus('active')
      playRemoteStream(remote)
    })
    conn.on('close',  () => cleanupCall())
    conn.on('error',  () => cleanupCall())
  }, [cleanupCall])

  // ── Public API ───────────────────────────────────────────────────────────────
  const startCall = useCallback(async (other: UserProfile) => {
    if (!user || !profile || !peerRef.current) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStreamRef.current = stream
      setOtherUser(other)
      setCallStatus('calling')

      // Signal callee via RTDB
      const treeEmoji = TREE_CONFIGS[profile.treeType]?.emoji ?? '🌳'
      await set(ref(rtdb, `calls/${other.uid}`), {
        callerId:    user.uid,
        callerName:  profile.displayName,
        callerEmoji: treeEmoji,
        status:      'ringing',
        timestamp:   Date.now(),
      })

      // Initiate WebRTC call
      const conn = peerRef.current.call(other.uid, stream)
      wireMediaConn(conn)

      // Auto-cancel after 45 s if not answered
      setTimeout(() => {
        if (mediaConnRef.current === conn && callStatus !== 'active') endCall()
      }, 45_000)
    } catch {
      cleanupCall()
    }
  }, [user, profile, wireMediaConn, cleanupCall, callStatus])

  const acceptCall = useCallback(async () => {
    if (!user || !pendingConnRef.current) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      localStreamRef.current = stream
      pendingConnRef.current.answer(stream)
      wireMediaConn(pendingConnRef.current)
      await remove(ref(rtdb, `calls/${user.uid}`))
    } catch {
      cleanupCall()
    }
  }, [user, wireMediaConn, cleanupCall])

  const rejectCall = useCallback(async () => {
    if (!user) return
    await remove(ref(rtdb, `calls/${user.uid}`))
    cleanupCall()
  }, [user, cleanupCall])

  const endCall = useCallback(() => {
    if (otherUser && callStatus === 'calling') {
      remove(ref(rtdb, `calls/${otherUser.uid}`)).catch(() => {})
    }
    if (user && (callStatus === 'ringing' || callStatus === 'active')) {
      remove(ref(rtdb, `calls/${user.uid}`)).catch(() => {})
    }
    cleanupCall()
  }, [user, otherUser, callStatus, cleanupCall])

  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = isMuted
    })
    setIsMuted((v) => !v)
  }, [isMuted])

  const value: VoiceCallCtxValue = {
    callStatus, otherUser, incomingCall, isMuted, callDurationSec,
    startCall, acceptCall, rejectCall, endCall, toggleMute,
  }

  return (
    <VoiceCallCtx.Provider value={value}>
      {children}
    </VoiceCallCtx.Provider>
  )
}
