'use client'

import { useState } from 'react'
import { Message } from '@/types'
import { formatTime } from '@/lib/utils'
import { SmilePlus, Wind, Leaf } from 'lucide-react'
import { toggleReaction, markMessageViewed } from '@/lib/firestore'
import { useAuth } from '@/lib/auth-context'
import { getStickerAnimation } from '@/lib/stickers'

interface MessageBubbleProps {
  message: Message
  isMine:  boolean
  chatId:  string
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
  const alreadyViewed = !!(message as any).viewedBy?.[myUid]
  const [revealed, setReveal] = useState(isMine || alreadyViewed)

  const handleReveal = async () => {
    if (revealed) return
    setReveal(true)
    await markMessageViewed(chatId, message.id, myUid)
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
      <div className="relative group max-w-[72%]">
        <div
          onClick={handleReveal}
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed transition-all border
            ${isMine
              ? 'border-orange-500/50 bg-orange-950/30 text-white rounded-br-sm'
              : 'border-orange-600/50 bg-orange-950/20 text-forest-100 rounded-bl-sm'}
            ${!revealed ? 'cursor-pointer hover:border-orange-400/60' : ''}`}
        >
          {!revealed ? (
            <div className="flex items-center gap-2 text-orange-400/80">
              <span className="text-lg leading-none">🔥</span>
              <div>
                <p className="text-xs font-medium leading-none">View once</p>
                <p className="text-[10px] text-orange-500/70 mt-0.5">
                  {message.type === 'text' ? 'Tap to reveal' : `Tap to view ${message.type}`}
                </p>
              </div>
              {!isMine && <span className="ml-auto text-[9px] text-orange-600/70">vanishes after</span>}
            </div>
          ) : (
            <>
              {message.type === 'image' && message.mediaURL ? (
                <img src={message.mediaURL} alt="view-once" className="max-w-[220px] rounded-xl" />
              ) : message.type === 'video' && message.mediaURL ? (
                <video src={message.mediaURL} controls className="max-w-[220px] rounded-xl" />
              ) : (
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              )}
              <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
                <span className="text-[10px] text-orange-500/60">🔥 view once</span>
              </div>
            </>
          )}
        </div>
        <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-forest-600">{formatTime(message.timestamp)}</span>
          {isMine && (
            <MessageStatus
              status={message.status}
              hasReactions={Object.values(message.reactions ?? {}).some(u => u.length > 0)}
              isReplied={!!(message as any).isReplied}
            />
          )}
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
export function MessageBubble({ message, isMine, chatId }: MessageBubbleProps) {
  const { user }     = useAuth()
  const [pickerOpen, setPickerOpen] = useState(false)
  const myUid      = user?.uid ?? ''
  const reactions  = message.reactions ?? {}
  const hasReactions = Object.values(reactions).some(u => u.length > 0)
  const isReplied  = !!(message as any).isReplied

  async function handleReact(emoji: string) {
    if (!myUid) return
    await toggleReaction(chatId, message.id, emoji, myUid)
  }

  // View-once
  if ((message as any).viewOnce) {
    return <ViewOnceBubble message={message} isMine={isMine} chatId={chatId} myUid={myUid} />
  }

  // Whisper mode
  if ((message as any).whisper) return <WhisperBubble message={message} isMine={isMine} />

  // Leaf message
  if ((message as any).leaf) return <LeafBubble message={message} isMine={isMine} />

  const isSticker = message.type === 'sticker'
  const isEmoji   = message.type === 'emoji' && message.content.length <= 4
  const isImage   = message.type === 'image'
  const isVideo   = message.type === 'video'

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
          <div className={`absolute ${isMine ? '-left-7' : '-right-7'} top-2 opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button onClick={() => setPickerOpen(v => !v)} className="text-forest-600 hover:text-forest-300 p-1 relative">
              <SmilePlus size={15} />
              {pickerOpen && <ReactionPicker onPick={handleReact} onClose={() => setPickerOpen(false)} />}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Regular text bubble
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
      <div className="relative group max-w-[72%]">
        <div className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed
          ${isMine
            ? 'bg-forest-700 text-white rounded-br-sm'
            : 'bg-forest-900/80 text-forest-100 rounded-bl-sm border border-forest-800/40'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] text-forest-400/70">{formatTime(message.timestamp)}</span>
            {isMine && <MessageStatus status={message.status} hasReactions={hasReactions} isReplied={isReplied} />}
          </div>
        </div>
        <ReactionRow reactions={reactions} myUid={myUid} onToggle={handleReact} />
        <div className={`absolute ${isMine ? '-left-7' : '-right-7'} top-1.5 opacity-0 group-hover:opacity-100 transition-opacity`}>
          <button onClick={() => setPickerOpen(v => !v)} className="text-forest-600 hover:text-forest-300 p-1 relative">
            <SmilePlus size={15} />
            {pickerOpen && <ReactionPicker onPick={handleReact} onClose={() => setPickerOpen(false)} />}
          </button>
        </div>
      </div>
    </div>
  )
}
