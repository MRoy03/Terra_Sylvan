'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Phone, Images, Search, X, Stars } from 'lucide-react'
import { useMessages } from '@/hooks/useMessages'
import { useTyping } from '@/hooks/useTyping'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useAuth } from '@/lib/auth-context'
import { useVoiceCall } from '@/context/VoiceCallContext'
import { sendMessage, markAsReplied, getUserProfile, updateChatStreak, getChatStreak } from '@/lib/firestore'
import { playReceive, haptic } from '@/lib/sound-feedback'
import { ConstellationView } from './ConstellationView'
import { Avatar } from '@/components/ui/Avatar'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { MediaGallery } from './MediaGallery'
import { formatLastSeen } from '@/lib/utils'
import { UserProfile, MessageType, Message } from '@/types'
import { forestToast } from '@/lib/forest-toast'

interface ChatWindowProps {
  chatId:    string
  otherUser: UserProfile
  onBack?:   () => void
}

export function ChatWindow({ chatId, otherUser, onBack }: ChatWindowProps) {
  const { user }                             = useAuth()
  const { callStatus, startCall }            = useVoiceCall()
  const { messages, loading }                = useMessages(chatId)
  const { typers, notifyTyping, stopTyping } = useTyping(chatId, user?.uid ?? null)
  const { isOnline, lastSeen }               = useOnlineStatus(otherUser.uid)
  const [showGallery,    setShowGallery]    = useState(false)
  const [replyingTo,     setReplyingTo]     = useState<Message | null>(null)
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [searchQuery,    setSearchQuery]    = useState('')
  const [userMood,       setUserMood]       = useState('')
  const [streak,         setStreak]         = useState(0)
  const [constellation,  setConstellation]  = useState(false)
  const bottomRef    = useRef<HTMLDivElement>(null)
  const seenMsgIds   = useRef(new Set<string>())
  const isNight      = (() => { const h = new Date().getHours(); return h >= 20 || h < 5 })()

  // Load current user's mood + initial streak
  useEffect(() => {
    if (!user?.uid) return
    getUserProfile(user.uid).then(p => { if (p?.mood) setUserMood(p.mood) }).catch(() => {})
  }, [user?.uid])

  useEffect(() => {
    getChatStreak(chatId).then(setStreak).catch(() => {})
  }, [chatId])

  // Play receive sound when new messages arrive from the other user
  useEffect(() => {
    if (messages.length === 0) { seenMsgIds.current.clear(); return }
    const hasSeenAny = seenMsgIds.current.size > 0
    const newFromOther = messages.filter(m => !seenMsgIds.current.has(m.id) && m.senderId !== user?.uid)
    if (hasSeenAny && newFromOther.length > 0) { playReceive(); haptic([4, 20, 4]) }
    messages.forEach(m => seenMsgIds.current.add(m.id))
  }, [messages, user?.uid])

  const MOOD_BG: Record<string, string> = {
    sunny:   'radial-gradient(ellipse at center, #2a1500 0%, #180d00 50%, #030d05 100%)',
    breezy:  'radial-gradient(ellipse at center, #001828 0%, #001020 50%, #030d05 100%)',
    rainy:   'radial-gradient(ellipse at center, #080826 0%, #040418 50%, #030d05 100%)',
    stormy:  'radial-gradient(ellipse at center, #160026 0%, #0a0016 50%, #030d05 100%)',
    radiant: 'radial-gradient(ellipse at center, #001c08 0%, #001408 50%, #030d05 100%)',
  }
  const chatBg = MOOD_BG[userMood] ?? 'radial-gradient(ellipse at center, #071a0e 0%, #030d05 100%)'

  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => m.type === 'text' && m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typers])

  const handleSend = async (content: string, type: MessageType = 'text', mediaURL?: string, extra?: Record<string, unknown>) => {
    if (!user) return
    try {
      const fullExtra: Record<string, unknown> = { ...extra }
      if (replyingTo) {
        fullExtra.replyTo = {
          id:       replyingTo.id,
          senderId: replyingTo.senderId,
          content:  replyingTo.content,
          type:     replyingTo.type,
        }
      }
      await sendMessage(chatId, user.uid, content, type, mediaURL, fullExtra)
      if (replyingTo) {
        await markAsReplied(chatId, replyingTo.id)
        setReplyingTo(null)
      }
      // Streak update (fire-and-forget)
      updateChatStreak(chatId).then(s => {
        setStreak(s)
        if (s > 0 && s % 7 === 0) forestToast.info(`🔥 ${s}-day streak with ${otherUser.displayName}!`)
      }).catch(() => {})
    } catch {
      forestToast.error('Failed to send message')
    }
  }

  const handleCall = async () => {
    if (callStatus !== 'idle') {
      forestToast.call('You already have an active call.')
      return
    }
    try {
      await startCall(otherUser)
    } catch {
      forestToast.error('Could not start call', 'Check microphone permissions.')
    }
  }

  const statusText = isOnline
    ? '🟢 Online'
    : lastSeen
    ? `Last seen ${formatLastSeen(lastSeen)}`
    : 'Offline'

  const hasMedia = messages.some((m) => m.type === 'image' || m.type === 'video')

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--th-bg, #030c05)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b backdrop-blur-sm" style={{ background: 'var(--th-header, rgba(3,12,5,0.85))', borderColor: 'var(--th-border, rgb(30 58 34 / 0.5))' }}>
        {onBack && (
          <button onClick={onBack} className="text-forest-400 hover:text-white transition-colors md:hidden">
            <ArrowLeft size={22} />
          </button>
        )}

        <Avatar
          photoURL={otherUser.photoURL}
          displayName={otherUser.displayName}
          size="md"
          isOnline={isOnline}
        />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate leading-tight">{otherUser.displayName}</p>
          <p className="text-xs text-forest-500">{statusText}</p>
        </div>

        <div className="flex items-center gap-1">
          {/* Streak badge */}
          {streak >= 2 && (
            <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-orange-950/50 border border-orange-700/30">
              <span className="text-sm animate-streak-flame inline-block">🔥</span>
              <span className="text-xs font-mono text-orange-400 tabular-nums">{streak}</span>
            </div>
          )}
          {/* Constellation toggle (night only) */}
          {isNight && (
            <button
              onClick={() => setConstellation(v => !v)}
              className={`p-2 rounded-xl transition-colors ${constellation ? 'text-indigo-300 bg-indigo-900/30' : 'text-forest-500 hover:text-white hover:bg-forest-800/50'}`}
              title="Constellation view"
            >
              <Stars size={18} />
            </button>
          )}
          <button
            onClick={() => { setSearchOpen(v => !v); setSearchQuery('') }}
            className={`p-2 rounded-xl transition-colors ${searchOpen ? 'text-white bg-forest-700/60' : 'text-forest-500 hover:text-white hover:bg-forest-800/50'}`}
            title="Search messages"
          >
            <Search size={18} />
          </button>
          {hasMedia && (
            <button
              onClick={() => setShowGallery(true)}
              className="p-2 rounded-xl text-forest-500 hover:text-white hover:bg-forest-800/50 transition-colors"
              title="Shared media"
            >
              <Images size={18} />
            </button>
          )}
          <button
            onClick={handleCall}
            disabled={callStatus !== 'idle'}
            className="p-2 rounded-xl text-forest-500 hover:text-green-400 hover:bg-forest-800/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Voice call"
          >
            <Phone size={18} />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ background: 'var(--th-header, rgba(3,12,5,0.9))', borderColor: 'var(--th-border, rgb(30 58 34 / 0.5))' }}>
          <Search size={14} className="text-forest-500 flex-shrink-0" />
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search messages…"
            className="flex-1 bg-transparent text-sm text-forest-100 placeholder-forest-600 focus:outline-none"
          />
          {searchQuery && (
            <span className="text-[10px] text-forest-600">{filteredMessages.length} found</span>
          )}
          <button onClick={() => { setSearchOpen(false); setSearchQuery('') }} className="text-forest-600 hover:text-forest-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Messages */}
      {constellation && !loading && messages.length > 0 ? (
        <ConstellationView messages={filteredMessages} myUid={user?.uid ?? ''} />
      ) : (
        <div className="flex-1 overflow-y-auto py-2" style={{ backgroundImage: chatBg }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-4xl animate-float">🌿</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <span className="text-5xl">🌱</span>
              <p className="text-forest-600 text-sm">No messages yet. Say hello!</p>
              <p className="text-forest-700 text-xs">
                {otherUser.displayName}&apos;s tree will grow a new leaf with your first message.
              </p>
            </div>
          ) : (
            <>
              {filteredMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMine={msg.senderId === user?.uid}
                  chatId={chatId}
                  onReply={setReplyingTo}
                />
              ))}
              {typers.length > 0 && <TypingIndicator />}
              <div ref={bottomRef} />
            </>
          )}
        </div>
      )}

      <MessageInput
        onSend={handleSend}
        onTyping={notifyTyping}
        onStopTyping={stopTyping}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {showGallery && (
        <MediaGallery messages={messages} onClose={() => setShowGallery(false)} />
      )}
    </div>
  )
}
