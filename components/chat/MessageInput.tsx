'use client'

import { useState, useRef, useCallback } from 'react'
import { Smile, Paperclip, Send, X, Loader2, Leaf, Wind } from 'lucide-react'
import { EmojiPanel } from './EmojiPanel'
import { uploadMedia, isCloudinaryConfigured } from '@/lib/cloudinary'
import toast from 'react-hot-toast'

type InputMode = 'text' | 'whisper' | 'leaf'

interface MessageInputProps {
  onSend:       (content: string, type?: 'text' | 'image' | 'video' | 'sticker', mediaURL?: string, extra?: Record<string, unknown>) => Promise<void>
  onTyping:     () => void
  onStopTyping: () => void
  disabled?:    boolean
}

export function MessageInput({ onSend, onTyping, onStopTyping, disabled }: MessageInputProps) {
  const [text,        setText]        = useState('')
  const [showEmoji,   setShowEmoji]   = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [uploadPct,   setUploadPct]   = useState(0)
  const [sending,     setSending]     = useState(false)
  const [inputMode,   setInputMode]   = useState<InputMode>('text')
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      const extra: Record<string, unknown> = {}
      if (inputMode === 'whisper') extra.whisper = true
      if (inputMode === 'leaf')    extra.leaf    = true
      await onSend(trimmed, 'text', undefined, extra)
      setText('')
      setInputMode('text')
      onStopTyping()
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }, [text, sending, inputMode, onSend, onStopTyping])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    onTyping()
  }

  const handleEmojiSelect = (emoji: string) => {
    setText(prev => prev + emoji)
    setShowEmoji(false)
    inputRef.current?.focus()
  }

  const handleStickerSelect = async (sticker: string) => {
    setShowEmoji(false)
    setSending(true)
    try { await onSend(sticker, 'sticker') }
    finally { setSending(false) }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    if (!isCloudinaryConfigured()) { toast.error('Cloudinary not set up yet. Add credentials to .env.local'); return }
    const maxMB = file.type.startsWith('video/') ? 50 : 10
    if (file.size > maxMB * 1024 * 1024) { toast.error(`File too large. Max ${maxMB}MB.`); return }
    setUploading(true)
    try {
      const result = await uploadMedia(file, setUploadPct)
      await onSend(result.type === 'video' ? '[Video]' : '[Image]', result.type, result.url)
    } catch { toast.error('Upload failed. Try again.') }
    finally { setUploading(false); setUploadPct(0) }
  }

  const modeStyle: Record<InputMode, string> = {
    text:    'bg-forest-900/60 border-forest-800/50',
    whisper: 'bg-forest-900/80 border-forest-400/60',
    leaf:    'bg-forest-800/60 border-green-600/60',
  }

  return (
    <div className="relative">
      {showEmoji && (
        <div className="absolute bottom-full left-0 right-0 mb-2 px-2 z-20">
          <EmojiPanel onEmojiSelect={handleEmojiSelect} onStickerSelect={handleStickerSelect} />
        </div>
      )}

      {uploading && (
        <div className="absolute bottom-full left-0 right-0 mb-1 px-3">
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 text-xs text-forest-300">
            <Loader2 size={13} className="animate-spin" />
            <div className="flex-1 bg-forest-800 rounded-full h-1">
              <div className="bg-forest-500 h-1 rounded-full transition-all" style={{ width: `${uploadPct}%` }} />
            </div>
            <span>{uploadPct}%</span>
          </div>
        </div>
      )}

      {/* Mode badge */}
      {inputMode !== 'text' && (
        <div className="absolute bottom-full left-3 mb-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium
          bg-forest-900/90 border border-forest-700/50 text-forest-300 z-10">
          {inputMode === 'whisper' ? <><Wind size={10}/> Whisper</> : <><Leaf size={10}/> Leaf</>}
          <button onClick={() => setInputMode('text')} className="ml-0.5 text-forest-600 hover:text-forest-400">✕</button>
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-2.5 border-t border-forest-800/50 bg-forest-950/80">
        <button onClick={() => setShowEmoji(v => !v)} disabled={disabled}
          className={`flex-shrink-0 p-2 rounded-xl transition-colors ${showEmoji ? 'text-forest-300 bg-forest-800/60' : 'text-forest-500 hover:text-forest-300'}`}>
          {showEmoji ? <X size={20} /> : <Smile size={20} />}
        </button>

        {/* Whisper & Leaf mode buttons */}
        <button onClick={() => setInputMode(m => m === 'whisper' ? 'text' : 'whisper')} disabled={disabled}
          title="Whisper mode — message fades after reading"
          className={`flex-shrink-0 p-2 rounded-xl transition-colors
            ${inputMode === 'whisper' ? 'text-forest-300 bg-forest-800/60' : 'text-forest-600 hover:text-forest-400'}`}>
          <Wind size={18} />
        </button>
        <button onClick={() => setInputMode(m => m === 'leaf' ? 'text' : 'leaf')} disabled={disabled}
          title="Leaf message — floats in with animation"
          className={`flex-shrink-0 p-2 rounded-xl transition-colors
            ${inputMode === 'leaf' ? 'text-green-400 bg-forest-800/60' : 'text-forest-600 hover:text-forest-400'}`}>
          <Leaf size={18} />
        </button>

        <button onClick={() => fileRef.current?.click()} disabled={disabled || uploading}
          className="flex-shrink-0 p-2 rounded-xl text-forest-500 hover:text-forest-300 transition-colors" title="Attach image or video">
          <Paperclip size={20} />
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />

        <textarea
          ref={inputRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || uploading}
          placeholder={
            inputMode === 'whisper' ? '🌬️ Whisper…' :
            inputMode === 'leaf'    ? '🍃 Write on a leaf…' :
            'Type a message…'
          }
          rows={1}
          className={`flex-1 border rounded-2xl px-4 py-2.5 text-sm text-forest-100 placeholder-forest-600
                      resize-none focus:outline-none focus:ring-2 focus:ring-forest-600 max-h-32 overflow-y-auto
                      ${modeStyle[inputMode]}`}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />

        <button onClick={handleSend} disabled={!text.trim() || sending || disabled}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-forest-600 hover:bg-forest-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  )
}
