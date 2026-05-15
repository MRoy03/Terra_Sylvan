'use client'

import { useState, useRef, useMemo, useCallback } from 'react'
import { Message } from '@/types'
import { formatTime } from '@/lib/utils'
import { SmilePlus, Wind, Leaf, Reply, Play, Pause } from 'lucide-react'
import { toggleReaction, markMessageViewed } from '@/lib/firestore'
import { useAuth } from '@/lib/auth-context'
import { getStickerAnimation } from '@/lib/stickers'

interface MessageBubbleProps {
  message:  Message
  isMine:   boolean
  chatId:   string
  onReply?: (message: Message) => void
}

function QuotedBlock({ replyTo, isMine }: { replyTo: NonNullable<Message['replyTo']>; isMine: boolean }) {
  const preview = replyTo.type !== 'text' ? `[${replyTo.type}]` : replyTo.content.slice(0, 60) + (replyTo.content.length > 60 ? '…' : '')
  return (
    <div className={`mb-1.5 px-2.5 py-1.5 rounded-xl border-l-2 text-[11px]
      ${isMine
        ? 'border-white/40 bg-white/10 text-white/60'
        : 'border-forest-400/50 bg-forest-800/40 text-forest-400'}`}>
      <p className="font-medium text-[10px] opacity-70 mb-0.5">↩ Reply</p>
      <p className="leading-snug opacity-80 line-clamp-2">{preview}</p>
    </div>
  )
}

function fmtDur(s: number) {
  if (!isFinite(s) || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60), sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function VoiceMessage({ src, isMine }: { src: string; isMine: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing,  setPlaying]  = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const bars = useMemo(() => Array.from({ length: 30 }, () => 0.2 + Math.random() * 0.8), [])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play().catch(() => {}); setPlaying(true) }
  }

  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl min-w-[200px] max-w-[280px]
      ${isMine ? 'bg-forest-700 text-white rounded-br-sm' : 'bg-forest-900/80 text-forest-100 rounded-bl-sm border border-forest-800/40'}`}>
      <button onClick={toggle}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors
          ${isMine ? 'bg-white/20 hover:bg-white/30' : 'bg-forest-700/60 hover:bg-forest-600/60'}`}>
        {playing
          ? <Pause size={14} className={isMine ? 'text-white' : 'text-forest-300'} />
          : <Play  size={14} className={isMine ? 'text-white' : 'text-forest-300'} fill="currentColor" />}
      </button>

      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {/* Waveform */}
        <div className="flex items-end gap-0.5 h-7">
          {bars.map((h, i) => {
            const filled = duration > 0 && (i / bars.length) <= progress
            return (
              <div key={i} className="flex-1 rounded-full transition-colors duration-150" style={{
                height: `${h * 100}%`,
                background: filled
                  ? (isMine ? 'rgba(255,255,255,0.9)' : '#4ade80')
                  : (isMine ? 'rgba(255,255,255,0.25)' : '#1e4a28'),
              }} />
            )
          })}
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-[10px] tabular-nums ${isMine ? 'text-white/60' : 'text-forest-500'}`}>
            {playing && duration > 0 ? fmtDur(progress * duration) : fmtDur(duration)}
          </span>
          <span className={`text-[9px] ${isMine ? 'text-white/40' : 'text-forest-700'}`}>Voice</span>
        </div>
      </div>

      <audio ref={audioRef} src={src} preload="metadata"
        onLoadedMetadata={() => { if (audioRef.current) setDuration(audioRef.current.duration) }}
        onTimeUpdate={() => { if (audioRef.current) setProgress(audioRef.current.currentTime / audioRef.current.duration) }}
        onEnded={() => { setPlaying(false); setProgress(0) }} />
    </div>
  )
}

const QUICK_REACTIONS = ['❤️', '😂', '😮', '😢', '🌿', '🌸', '✨', '🔥']

// ── Message status: gold reacted > silver replied > crimson seen > blue firefly sent ──
function MessageStatus({ status, hasReactions, isReplied }: {
  status:       Message['status']
  hasReactions: boolean
  isReplied:    boolean
}) {
  if (hasReactions) return (
    <span title="Reacted" style={{ fontSize: '10px', color: '#f59e0b', filter: 'drop-shadow(0 0 3px #f59e0b88)', lineHeight: 1 }}>✦</span>
  )
  if (isReplied) return (
    <span title="Replied" style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1 }}>↺</span>
  )
  if (status === 'read') return (
    <span title="Seen" style={{ fontSize: '10px', color: '#f43f5e', filter: 'drop-shadow(0 0 3px #f43f5e66)', lineHeight: 1 }}>✦</span>
  )
  return (
    <span title="Sent" className="ts-firefly" style={{ fontSize: '10px', color: '#60a5fa', lineHeight: 1 }}>✦</span>
  )
}

function ReactionPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  return (
    <div className="absolute z-50 bottom-full mb-1 flex items-center gap-0.5 bg-forest-950/95
                    border border-forest-700/50 rounded-2xl px-2 py-1.5 shadow-2xl backdrop-blur-xl"
      onMouseLeave={onClose}>
      {QUICK_REACTIONS.map(e => (
        <button key={e} onClick={() => { onPick(e); onClose() }}
          className="text-xl leading-none hover:scale-125 transition-transform p-0.5 select-none">
          {e}
        </button>
      ))}
    </div>
  )
}

function ReactionRow({ reactions, myUid, onToggle }: {
  reactions: Record<string, string[]>
  myUid:     string
  onToggle:  (emoji: string) => void
}) {
  const entries = Object.entries(reactions).filter(([, uids]) => uids.length > 0)
  if (entries.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-0.5">
      {entries.map(([emoji, uids]) => (
        <button key={emoji} onClick={() => onToggle(emoji)}
          className={`reaction-bubble ${uids.includes(myUid) ? 'border-forest-400 bg-forest-800/80' : ''}`}>
          <span>{emoji}</span>
          <span className="text-forest-400 font-mono">{uids.length}</span>
        </button>
      ))}
    </div>
  )
}

// ── View-once message ──────────────────────────────────────────────────────────
function ViewOnceBubble({ message, isMine, chatId, myUid }: {
  message: Message
  isMine:  boolean
  chatId:  string
  myUid:   string
}) {
  const viewedBy: Record<string, boolean> = (message as any).viewedBy ?? {}
  // "Vanished" when any uid OTHER than the sender has viewed it (live from Firestore)
  const vanished = Object.entries(viewedBy).some(
    ([uid, seen]) => uid !== message.senderId && seen,
  )
  const [revealing, setRevealing] = useState(false)

  const handleReveal = async () => {
    if (vanished || isMine || revealing) return
    setRevealing(true)
    await markMessageViewed(chatId, message.id, myUid)
    // Firestore subscription will update message.viewedBy → re-render to vanished
  }

  // Vanished state — shown to BOTH sender and recipient after recipient views
  if (vanished) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-800/30 bg-orange-950/20 text-orange-700/60">
          <span className="text-sm leading-none">🔥</span>
          <span className="text-[10px]">Vanished · {formatTime(message.timestamp)}</span>
        </div>
      </div>
    )
  }

  // Sender sees "waiting for recipient" pill
  if (isMine) {
    return (
      <div className="flex justify-end px-3 py-0.5">
        <div className="relative group max-w-[72%]">
          <div className="px-3.5 py-2.5 rounded-2xl rounded-br-sm text-sm border border-orange-500/40 bg-orange-950/25 text-orange-300/80">
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">🔥</span>
              <div>
                <p className="text-xs font-medium leading-none">View once</p>
                <p className="text-[10px] text-orange-500/60 mt-0.5">Waiting for recipient to open…</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-0.5 justify-end">
            <span className="text-[10px] text-forest-600">{formatTime(message.timestamp)}</span>
            <MessageStatus status={message.status} hasReactions={false} isReplied={false} />
          </div>
        </div>
      </div>
    )
  }

  // Recipient sees tap-to-reveal
  return (
    <div className="flex justify-start px-3 py-0.5">
      <div className="relative group max-w-[72%]">
        <div
          onClick={handleReveal}
          className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-sm border border-orange-600/50 bg-orange-950/20 text-forest-100 cursor-pointer hover:border-orange-400/60 transition-all"
        >
          <div className="flex items-center gap-2 text-orange-400/80">
            <span className={`text-lg leading-none ${revealing ? 'animate-spin' : ''}`}>🔥</span>
            <div>
              <p className="text-xs font-medium leading-none">View once</p>
              <p className="text-[10px] text-orange-500/70 mt-0.5">
                {revealing ? 'Opening…' : message.type === 'text' ? 'Tap to reveal — vanishes after' : `Tap to view ${message.type} — vanishes after`}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-0.5 justify-start">
          <span className="text-[10px] text-forest-600">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  )
}

// ── Whisper message ────────────────────────────────────────────────────────────
function WhisperBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  const [revealed, setReveal] = useState(false)
  const reactions = message.reactions ?? {}

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
      <div className="relative group max-w-[72%]">
        <div
          onClick={() => setReveal(true)}
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed cursor-pointer transition-all
            border border-dashed
            ${isMine
              ? 'border-forest-500/50 bg-forest-800/30 text-white rounded-br-sm'
              : 'border-forest-600/50 bg-forest-900/30 text-forest-100 rounded-bl-sm'}
            ${!revealed ? 'select-none' : ''}`}
        >
          {!revealed ? (
            <div className="flex items-center gap-2 text-forest-500">
              <Wind size={14} />
              <span className="text-xs italic blur-[3px] select-none pointer-events-none">
                {message.content.slice(0, 20)}…
              </span>
              <span className="text-[10px] text-forest-600">tap to reveal</span>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <div className="flex items-center gap-1 mt-0.5 justify-end">
                <span className="text-[10px] text-forest-500">🌬️ whisper</span>
              </div>
            </>
          )}
        </div>
        <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-forest-600">{formatTime(message.timestamp)}</span>
          {isMine && (
            <MessageStatus
              status={message.status}
              hasReactions={Object.values(reactions).some(u => u.length > 0)}
              isReplied={!!(message as any).isReplied}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ── Leaf message (animated entry) ─────────────────────────────────────────────
function LeafBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  const [done, setDone] = useState(false)
  const reactions = message.reactions ?? {}

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
      <div className="relative group max-w-[72%]">
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
            ${done ? '' : 'leaf-message-enter'}
            ${isMine
              ? 'bg-gradient-to-br from-forest-700 to-forest-800 text-white rounded-br-sm border border-forest-500/30'
              : 'bg-gradient-to-br from-forest-900/90 to-forest-950/80 text-forest-100 rounded-bl-sm border border-forest-600/30'}`}
          onAnimationEnd={() => setDone(true)}
        >
          <div className="flex items-center gap-1.5 mb-1 text-forest-400">
            <Leaf size={11} className="text-forest-500" />
            <span className="text-[10px] italic">carried on a leaf</span>
          </div>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-forest-400/70">{formatTime(message.timestamp)}</span>
            {isMine && (
              <MessageStatus
                status={message.status}
                hasReactions={Object.values(reactions).some(u => u.length > 0)}
                isReplied={!!(message as any).isReplied}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function MessageBubble({ message, isMine, chatId, onReply }: MessageBubbleProps) {
  const { user }     = useAuth()
  const [pickerOpen, setPickerOpen] = useState(false)
  const [floaters,   setFloaters]   = useState<{ id: number; emoji: string }[]>([])
  const floaterKey   = useRef(0)
  const myUid      = user?.uid ?? ''
  const reactions  = message.reactions ?? {}
  const hasReactions = Object.values(reactions).some(u => u.length > 0)
  const isReplied  = !!message.isReplied

  const handleReact = useCallback(async (emoji: string) => {
    if (!myUid) return
    const id = ++floaterKey.current
    setFloaters(prev => [...prev, { id, emoji }])
    setTimeout(() => setFloaters(prev => prev.filter(f => f.id !== id)), 1100)
    await toggleReaction(chatId, message.id, emoji, myUid)
  }, [myUid, chatId, message.id])

  function ReplyBtn() {
    if (!onReply) return null
    return (
      <button
        onClick={() => onReply(message)}
        className="text-forest-600 hover:text-forest-300 p-1 relative"
        title="Reply"
      >
        <Reply size={14} />
      </button>
    )
  }

  function FloaterLayer() {
    if (floaters.length === 0) return null
    return (
      <>
        {floaters.map(f => (
          <div key={f.id}
            className="absolute pointer-events-none animate-float-react text-2xl z-50"
            style={{ bottom: '100%', left: '50%' }}>
            {f.emoji}
          </div>
        ))}
      </>
    )
  }

  // View-once
  if ((message as any).viewOnce) {
    return <ViewOnceBubble message={message} isMine={isMine} chatId={chatId} myUid={myUid} />
  }

  // Whisper mode
  if ((message as any).whisper) return <WhisperBubble message={message} isMine={isMine} />

  // Leaf message
  if ((message as any).leaf) return <LeafBubble message={message} isMine={isMine} />

  const isVoice   = message.type === 'voice'
  const isSticker = message.type === 'sticker'
  const isEmoji   = message.type === 'emoji' && message.content.length <= 4
  const isImage   = message.type === 'image'
  const isVideo   = message.type === 'video'

  // Voice message
  if (isVoice && message.mediaURL) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
        <div className="relative group">
          <FloaterLayer />
          <VoiceMessage src={message.mediaURL} isMine={isMine} />
          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-forest-600">{formatTime(message.timestamp)}</span>
            {isMine && <MessageStatus status={message.status} hasReactions={hasReactions} isReplied={isReplied} />}
          </div>
          <ReactionRow reactions={reactions} myUid={myUid} onToggle={handleReact} />
          <div className={`absolute ${isMine ? '-left-14' : '-right-14'} top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5`}>
            <button onClick={() => setPickerOpen(v => !v)} className="text-forest-600 hover:text-forest-300 p-1 relative">
              <SmilePlus size={15} />
              {pickerOpen && <ReactionPicker onPick={handleReact} onClose={() => setPickerOpen(false)} />}
            </button>
            <ReplyBtn />
          </div>
        </div>
      </div>
    )
  }

  // Animated sticker / large emoji
  if (isSticker || isEmoji) {
    const animClass = isSticker ? getStickerAnimation(message.content) : ''
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
        <div className="relative group">
          <div className={`text-5xl leading-none select-none sticker-pop ${animClass} inline-block`}>
            {message.content}
          </div>
          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-forest-600">{formatTime(message.timestamp)}</span>
            {isMine && <MessageStatus status={message.status} hasReactions={hasReactions} isReplied={isReplied} />}
          </div>
          <ReactionRow reactions={reactions} myUid={myUid} onToggle={handleReact} />
          <div className={`absolute ${isMine ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'}
            top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-1`}>
            <button onClick={() => setPickerOpen(v => !v)} className="text-forest-600 hover:text-forest-300 p-1 relative">
              <SmilePlus size={15} />
              {pickerOpen && <ReactionPicker onPick={handleReact} onClose={() => setPickerOpen(false)} />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Image / Video
  if (isImage || isVideo) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
        <div className="relative group">
          <div className={`max-w-[260px] rounded-2xl overflow-hidden border ${isMine ? 'border-forest-600/40' : 'border-forest-800/40'}`}>
            {isImage ? (
              <a href={message.mediaURL} target="_blank" rel="noopener noreferrer">
                <img src={message.mediaURL} alt="image" className="w-full max-h-60 object-cover" loading="lazy" />
              </a>
            ) : (
              <video src={message.mediaURL} controls className="w-full max-h-60" />
            )}
            <div className={`flex items-center justify-end gap-1 px-2 py-1 ${isMine ? 'bg-forest-800/60' : 'bg-forest-900/60'}`}>
              <span className="text-[10px] text-forest-500">{formatTime(message.timestamp)}</span>
              {isMine && <MessageStatus status={message.status} hasReactions={hasReactions} isReplied={isReplied} />}
            </div>
          </div>
          <ReactionRow reactions={reactions} myUid={myUid} onToggle={handleReact} />
          <div className={`absolute ${isMine ? '-left-14' : '-right-14'} top-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5`}>
            <button onClick={() => setPickerOpen(v => !v)} className="text-forest-600 hover:text-forest-300 p-1 relative">
              <SmilePlus size={15} />
              {pickerOpen && <ReactionPicker onPick={handleReact} onClose={() => setPickerOpen(false)} />}
            </button>
            <ReplyBtn />
          </div>
        </div>
      </div>
    )
  }

  // Regular text bubble
  const replyTo = message.replyTo
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
      <div className="relative group max-w-[72%]">
        <FloaterLayer />
        <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed
          ${isMine
            ? 'bg-forest-700 text-white rounded-br-sm'
            : 'bg-forest-900/80 text-forest-100 rounded-bl-sm border border-forest-800/40'
          }`}
        >
          {replyTo && <QuotedBlock replyTo={replyTo} isMine={isMine} />}
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-forest-400/70">{formatTime(message.timestamp)}</span>
            {isMine && <MessageStatus status={message.status} hasReactions={hasReactions} isReplied={isReplied} />}
          </div>
        </div>
        <ReactionRow reactions={reactions} myUid={myUid} onToggle={handleReact} />
        <div className={`absolute ${isMine ? '-left-14' : '-right-14'} top-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-0.5`}>
          <button onClick={() => setPickerOpen(v => !v)} className="text-forest-600 hover:text-forest-300 p-1 relative">
            <SmilePlus size={15} />
            {pickerOpen && <ReactionPicker onPick={handleReact} onClose={() => setPickerOpen(false)} />}
          </button>
          <ReplyBtn />
        </div>
      </div>
    </div>
  )
}
