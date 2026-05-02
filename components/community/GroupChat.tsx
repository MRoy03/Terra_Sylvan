'use client'

import { useState, useEffect, useRef } from 'react'
import { Smile, Paperclip, Send, Loader2, X, Leaf, Wind, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'
import { sendGroupMessage, subscribeGroupMessages } from '@/lib/communities'
import { EmojiPanel } from '@/components/chat/EmojiPanel'
import { uploadMedia, isCloudinaryConfigured } from '@/lib/cloudinary'
import { TREE_CONFIGS } from '@/types'
import { getRandomFortune } from '@/lib/oracle'
import { getStickerAnimation } from '@/lib/stickers'

interface GroupMessage {
  id:        string
  senderId:  string
  content:   string
  type:      string
  mediaURL?: string | null
  timestamp: number
  whisper?:  boolean
  leaf?:     boolean
}

interface MemberInfo {
  uid:         string
  displayName: string
  treeType:    string
}

interface GroupChatProps {
  communityId: string
  memberMap:   Record<string, MemberInfo>
}

type InputMode = 'text' | 'whisper' | 'leaf'

function GroupBubble({ msg, isOwn, sender }: { msg: GroupMessage; isOwn: boolean; sender?: MemberInfo }) {
  const treeCfg = sender ? (TREE_CONFIGS as Record<string, { emoji: string }>)[sender.treeType] : null
  const [whisperRevealed, setWhisperRevealed] = useState(false)

  // Oracle card
  if (msg.type === 'oracle') {
    return (
      <div className="mx-2 my-2 px-4 py-3 rounded-2xl bg-gradient-to-br from-forest-900/80 to-forest-950/90
                      border border-forest-600/30 text-center">
        <div className="text-2xl mb-1">{msg.content.split('\n')[0]}</div>
        <p className="text-forest-300 text-sm leading-relaxed italic">{msg.content.split('\n').slice(1).join('\n')}</p>
        <p className="text-forest-600 text-[10px] mt-2">🌳 Forest Oracle</p>
      </div>
    )
  }

  // Whisper
  if (msg.whisper) {
    return (
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-0.5`}>
        {!isOwn && sender && (
          <span className="text-[10px] text-forest-500 px-2">{treeCfg?.emoji} {sender.displayName}</span>
        )}
        <div
          onClick={() => setWhisperRevealed(true)}
          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm border border-dashed cursor-pointer transition-all
            ${isOwn ? 'border-forest-500/40 bg-forest-800/30 text-white' : 'border-forest-600/40 bg-forest-900/30 text-forest-200'}`}
        >
          {!whisperRevealed ? (
            <span className="flex items-center gap-2 text-forest-500">
              <Wind size={13} />
              <span className="blur-sm text-[11px] italic select-none">whispered message…</span>
            </span>
          ) : (
            <span>{msg.content}</span>
          )}
        </div>
      </div>
    )
  }

  // Leaf message
  if (msg.leaf) {
    return (
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-0.5`}>
        {!isOwn && sender && (
          <span className="text-[10px] text-forest-500 px-2">{treeCfg?.emoji} {sender.displayName}</span>
        )}
        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leaf-message-enter
          ${isOwn
            ? 'bg-gradient-to-br from-forest-700 to-forest-800 text-white border border-forest-500/30'
            : 'bg-gradient-to-br from-forest-900/80 to-forest-950 text-forest-100 border border-forest-600/30'}`}
        >
          <div className="flex items-center gap-1 mb-1 text-forest-500 text-[10px]">
            <Leaf size={10} /> <span className="italic">on a leaf…</span>
          </div>
          {msg.content}
        </div>
      </div>
    )
  }

  if (msg.type === 'sticker' || msg.type === 'emoji') {
    const animClass = msg.type === 'sticker' ? getStickerAnimation(msg.content) : ''
    return (
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-0.5`}>
        {!isOwn && sender && (
          <span className="text-[10px] text-forest-500 px-2">{treeCfg?.emoji} {sender.displayName}</span>
        )}
        <span className={`text-5xl leading-none px-1 sticker-pop ${animClass}`}>{msg.content}</span>
      </div>
    )
  }

  if (msg.type === 'image') {
    return (
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-0.5`}>
        {!isOwn && sender && (
          <span className="text-[10px] text-forest-500 px-2">{treeCfg?.emoji} {sender.displayName}</span>
        )}
        <a href={msg.mediaURL ?? '#'} target="_blank" rel="noopener noreferrer">
          <img src={msg.mediaURL ?? ''} alt="shared image"
            className="max-w-[220px] rounded-2xl border border-forest-800/50 cursor-pointer hover:opacity-90 transition-opacity" />
        </a>
      </div>
    )
  }

  if (msg.type === 'video') {
    return (
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-0.5`}>
        {!isOwn && sender && (
          <span className="text-[10px] text-forest-500 px-2">{treeCfg?.emoji} {sender.displayName}</span>
        )}
        <video src={msg.mediaURL ?? ''} controls className="max-w-[240px] rounded-2xl border border-forest-800/50" />
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-0.5`}>
      {!isOwn && sender && (
        <span className="text-[10px] text-forest-500 px-2">{treeCfg?.emoji} {sender.displayName}</span>
      )}
      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed
        ${isOwn
          ? 'bg-forest-600 text-white rounded-br-sm'
          : 'bg-forest-900/80 text-forest-100 border border-forest-800/50 rounded-bl-sm'}`}>
        {msg.content}
      </div>
    </div>
  )
}

export function GroupChat({ communityId, memberMap }: GroupChatProps) {
  const { user }                            = useAuth()
  const [messages,  setMessages]            = useState<GroupMessage[]>([])
  const [text,      setText]                = useState('')
  const [showEmoji, setShowEmoji]           = useState(false)
  const [uploading, setUploading]           = useState(false)
  const [uploadPct, setUploadPct]           = useState(0)
  const [sending,   setSending]             = useState(false)
  const [inputMode, setInputMode]           = useState<InputMode>('text')
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unsub = subscribeGroupMessages(communityId, (msgs) => setMessages(msgs as GroupMessage[]))
    return unsub
  }, [communityId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending || !user) return
    setSending(true)
    try {
      await sendGroupMessage(
        communityId, user.uid, trimmed,
        inputMode === 'whisper' ? 'whisper' : inputMode === 'leaf' ? 'leaf' : 'text',
        undefined,
        { whisper: inputMode === 'whisper', leaf: inputMode === 'leaf' },
      )
      setText('')
      setInputMode('text')
    } catch { toast.error('Failed to send message.') }
    finally { setSending(false) }
  }

  const handleOracle = async () => {
    if (!user || sending) return
    setSending(true)
    try {
      const fortune = getRandomFortune()
      await sendGroupMessage(communityId, user.uid, `${fortune.emoji}\n${fortune.text}`, 'oracle')
    } catch { toast.error('The oracle is silent.') }
    finally { setSending(false) }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleEmojiSelect = (emoji: string) => { setText(prev => prev + emoji); setShowEmoji(false) }

  const handleStickerSelect = async (sticker: string) => {
    if (!user) return
    setShowEmoji(false)
    setSending(true)
    try { await sendGroupMessage(communityId, user.uid, sticker, 'sticker') }
    catch { toast.error('Failed to send sticker.') }
    finally { setSending(false) }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    e.target.value = ''
    if (!isCloudinaryConfigured()) { toast.error('Cloudinary not configured.'); return }
    const maxMB = file.type.startsWith('video/') ? 50 : 10
    if (file.size > maxMB * 1024 * 1024) { toast.error(`Max ${maxMB}MB.`); return }
    setUploading(true)
    try {
      const result = await uploadMedia(file, setUploadPct)
      await sendGroupMessage(communityId, user.uid, result.type === 'video' ? '[Video]' : '[Image]', result.type as any, result.url)
    } catch { toast.error('Upload failed.') }
    finally { setUploading(false); setUploadPct(0) }
  }

  const modeStyle: Record<InputMode, string> = {
    text:    '',
    whisper: 'border-forest-400/60 bg-forest-900/80',
    leaf:    'border-green-600/60 bg-forest-800/60',
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="text-5xl">🌲</span>
            <p className="text-forest-400 text-sm">No messages yet. Say hello to the forest!</p>
          </div>
        )}
        {messages.map((msg) => (
          <GroupBubble key={msg.id} msg={msg} isOwn={msg.senderId === user?.uid} sender={memberMap[msg.senderId]} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Emoji panel */}
      {showEmoji && (
        <div className="px-2 pb-2">
          <EmojiPanel onEmojiSelect={handleEmojiSelect} onStickerSelect={handleStickerSelect} />
        </div>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="px-3 pb-1">
          <div className="flex items-center gap-2 bg-forest-900/80 rounded-xl px-3 py-2 text-xs text-forest-300">
            <Loader2 size={13} className="animate-spin" />
            <div className="flex-1 bg-forest-800 rounded-full h-1">
              <div className="bg-forest-500 h-1 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
            </div>
            <span>{uploadPct}%</span>
          </div>
        </div>
      )}

      {/* Mode indicator */}
      {inputMode !== 'text' && (
        <div className="px-3 pb-1 flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
            ${inputMode === 'whisper'
              ? 'bg-forest-800/60 text-forest-300 border border-forest-600/40'
              : 'bg-green-900/60 text-green-300 border border-green-700/40'}`}>
            {inputMode === 'whisper' ? <Wind size={11} /> : <Leaf size={11} />}
            {inputMode === 'whisper' ? 'Whisper — fades after reading' : 'Leaf message — floats in'}
          </div>
          <button onClick={() => setInputMode('text')} className="text-forest-600 hover:text-forest-300 text-xs">✕</button>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-end gap-2 px-3 py-2.5 border-t border-forest-800/50 bg-forest-950/80">
        <button
          onClick={() => setShowEmoji(v => !v)}
          className={`flex-shrink-0 p-2 rounded-xl transition-colors ${showEmoji ? 'text-forest-300 bg-forest-800/60' : 'text-forest-500 hover:text-forest-300'}`}
        >
          {showEmoji ? <X size={20} /> : <Smile size={20} />}
        </button>

        {/* Mode buttons */}
        <button
          onClick={() => setInputMode(m => m === 'whisper' ? 'text' : 'whisper')}
          title="Whisper mode"
          className={`flex-shrink-0 p-2 rounded-xl transition-colors
            ${inputMode === 'whisper' ? 'text-forest-300 bg-forest-800/60' : 'text-forest-600 hover:text-forest-400'}`}
        >
          <Wind size={18} />
        </button>
        <button
          onClick={() => setInputMode(m => m === 'leaf' ? 'text' : 'leaf')}
          title="Leaf message"
          className={`flex-shrink-0 p-2 rounded-xl transition-colors
            ${inputMode === 'leaf' ? 'text-green-400 bg-forest-800/60' : 'text-forest-600 hover:text-forest-400'}`}
        >
          <Leaf size={18} />
        </button>
        <button
          onClick={handleOracle}
          disabled={sending}
          title="Ask the Forest Oracle"
          className="flex-shrink-0 p-2 rounded-xl text-forest-600 hover:text-yellow-400 transition-colors disabled:opacity-40"
        >
          <Sparkles size={18} />
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex-shrink-0 p-2 rounded-xl text-forest-500 hover:text-forest-300 transition-colors"
          title="Attach image or video"
        >
          <Paperclip size={20} />
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={uploading}
          placeholder={
            inputMode === 'whisper' ? '🌬️ Whisper to the forest…' :
            inputMode === 'leaf'    ? '🍃 Write on a leaf…' :
            'Say something to the forest…'
          }
          rows={1}
          className={`flex-1 border rounded-2xl px-4 py-2.5 text-sm text-forest-100 placeholder-forest-600 resize-none
                      focus:outline-none focus:ring-2 focus:ring-forest-600 max-h-32 overflow-y-auto
                      ${modeStyle[inputMode] || 'bg-forest-900/60 border-forest-800/50'}`}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-forest-600 hover:bg-forest-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
