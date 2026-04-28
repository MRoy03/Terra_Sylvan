'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Phone, Images } from 'lucide-react'
import { useMessages } from '@/hooks/useMessages'
import { useTyping } from '@/hooks/useTyping'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useAuth } from '@/lib/auth-context'
import { useVoiceCall } from '@/context/VoiceCallContext'
import { sendMessage } from '@/lib/firestore'
import { Avatar } from '@/components/ui/Avatar'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { TypingIndicator } from './TypingIndicator'
import { MediaGallery } from './MediaGallery'
import { formatLastSeen } from '@/lib/utils'
import { UserProfile, MessageType } from '@/types'
import toast from 'react-hot-toast'

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
  const [showGallery, setShowGallery]        = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typers])

  const handleSend = async (content: string, type: MessageType = 'text', mediaURL?: string) => {
    if (!user) return
    try {
      await sendMessage(chatId, user.uid, content, type, mediaURL)
    } catch {
      toast.error('Failed to send message')
    }
  }

  const handleCall = async () => {
    if (callStatus !== 'idle') {
      toast('You already have an active call.', { icon: '📞' })
      return
    }
    try {
      await startCall(otherUser)
    } catch {
      toast.error('Could not start call. Check microphone permissions.')
    }
  }

  const statusText = isOnline
    ? '🟢 Online'
    : lastSeen
    ? `Last seen ${formatLastSeen(lastSeen)}`
    : 'Offline'

  const hasMedia = messages.some((m) => m.type === 'image' || m.type === 'video')

  return (
    <div className="flex flex-col h-full bg-night">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-forest-800/50 bg-forest-950/80 backdrop-blur-sm">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2" style={{ backgroundImage: 'radial-gradient(ellipse at center, #071a0e 0%, #030d05 100%)' }}>
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
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.senderId === user?.uid}
                chatId={chatId}
              />
            ))}
            {typers.length > 0 && <TypingIndicator />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      <MessageInput
        onSend={handleSend}
        onTyping={notifyTyping}
        onStopTyping={stopTyping}
      />

      {showGallery && (
        <MediaGallery messages={messages} onClose={() => setShowGallery(false)} />
      )}
    </div>
  )
}
