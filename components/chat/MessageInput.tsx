'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Smile, Paperclip, Send, X, Loader2, Leaf, Wind, Reply, Mic, MicOff, Square } from 'lucide-react'
import { EmojiPanel } from './EmojiPanel'
import { uploadMedia, uploadAudio, isCloudinaryConfigured } from '@/lib/cloudinary'
import { forestToast } from '@/lib/forest-toast'
import type { Message } from '@/types'

type InputMode = 'text' | 'whisper' | 'leaf' | 'viewonce'

interface MessageInputProps {
  onSend:         (content: string, type?: 'text' | 'image' | 'video' | 'sticker' | 'voice', mediaURL?: string, extra?: Record<string, unknown>) => Promise<void>
  onTyping:       () => void
  onStopTyping:   () => void
  disabled?:      boolean
  replyingTo?:    Message | null
  onCancelReply?: () => void
}

function fmtSecs(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export function MessageInput({ onSend, onTyping, onStopTyping, disabled, replyingTo, onCancelReply }: MessageInputProps) {
  const [text,        setText]        = useState('')
  const [showEmoji,   setShowEmoji]   = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [uploadPct,   setUploadPct]   = useState(0)
  const [sending,     setSending]     = useState(false)
  const [inputMode,   setInputMode]   = useState<InputMode>('text')

  // ── Voice recording ─────────────────────────────────────────────────────────
  const [recording,    setRecording]    = useState(false)
  const [recSeconds,   setRecSeconds]   = useState(0)
  const [uploadingVoice, setUploadingVoice] = useState(false)
  const mediaRecRef  = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { timerRef.current && clearInterval(timerRef.current) }, [])

  const startRecording = useCallback(async () => {
    if (disabled) return
    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : ''
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      chunksRef.current = []
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
        if (blob.size < 1000) { forestToast.error('Recording too short'); return }
        if (isCloudinaryConfigured()) {
          setUploadingVoice(true)
          try {
            const url = await uploadAudio(blob)
            await onSend('[Voice message]', 'voice', url)
          } catch { forestToast.error('Voice upload failed') }
          finally { setUploadingVoice(false) }
        } else {
          // Fallback: store as object URL (ephemeral — works for local dev)
          const url = URL.createObjectURL(blob)
          await onSend('[Voice message]', 'voice', url)
        }
      }
      rec.start(100)
      mediaRecRef.current = rec
      setRecording(true)
      setRecSeconds(0)
      timerRef.current = setInterval(() => setRecSeconds(s => s + 1), 1000)
    } catch {
      forestToast.error('Microphone access denied')
    }
  }, [disabled, onSend])

  const stopRecording = useCallback(() => {
    timerRef.current && clearInterval(timerRef.current)
    mediaRecRef.current?.stop()
    mediaRecRef.current = null
    setRecording(false)
    setRecSeconds(0)
  }, [])

  const cancelRecording = useCallback(() => {
    timerRef.current && clearInterval(timerRef.current)
    if (mediaRecRef.current) {
      mediaRecRef.current.ondataavailable = null
      mediaRecRef.current.onstop = null
      mediaRecRef.current.stop()
      mediaRecRef.current = null
    }
    chunksRef.current = []
    setRecording(false)
    setRecSeconds(0)
  }, [])

  // ── Other handlers ───────────────────────────────────────────────────────────
  const inputRef  = useRef<HTMLTextAreaElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)

  const handleSend = useCallback(async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    try {
      const extra: Record<string, unknown> = {}
      if (inputMode === 'whisper')  extra.whisper  = true
      if (inputMode === 'leaf')     extra.leaf     = true
      if (inputMode === 'viewonce') extra.viewOnce = true
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
    if (!isCloudinaryConfigured()) { forestToast.error('Cloudinary not set up', 'Add credentials to .env.local'); return }
    const maxMB = file.type.startsWith('video/') ? 50 : 10
    if (file.size > maxMB * 1024 * 1024) { forestToast.error(`File too large. Max ${maxMB}MB.`); return }
    setUploading(true)
    try {
      const result = await uploadMedia(file, setUploadPct)
      await onSend(result.type === 'video' ? '[Video]' : '[Image]', result.type, result.url)
    } catch { forestToast.error('Upload failed. Try again.') }
    finally { setUploading(false); setUploadPct(0) }
  }

  const modeStyle: Record<InputMode, string> = {
    text:     'bg-forest-900/60 border-forest-800/50',
    whisper:  'bg-forest-900/80 border-forest-400/60',
    leaf:     'bg-forest-800/60 border-green-600/60',
    viewonce: 'bg-forest-900/80 border-orange-500/50',
  }

  // ── Recording UI ─────────────────────────────────────────────────────────────
  if (recording) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-t border-forest-800/50 bg-forest-950/90">
        {/* Cancel */}
        <button onClick={cancelRecording} className="flex-shrink-0 p-2 rounded-xl text-red-400 hover:bg-red-900/30 transition-colors">
          <X size={20} />
        </button>
        {/* Waveform + timer */}
        <div className="flex-1 flex items-center gap-3">
          <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1 rounded-full bg-red-400 animate-voice-bar"
                style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 50}ms` }} />
            ))}
          </div>
          <span className="text-sm font-mono text-red-400 tabular-nums">{fmtSecs(recSeconds)}</span>
          <span className="text-[10px] text-forest-600">Recording…</span>
        </div>
        {/* Send recording */}
        <button
          onClick={stopRecording}
          className="flex-shrink-0 w-11 h-11 rounded-full bg-red-500 hover:bg-red-400 text-white flex items-center justify-center transition-all shadow-lg shadow-red-900/40"
        >
          <Square size={16} fill="white" />
        </button>
      </div>
    )
  }

  // ── Uploading voice ───────────────────────────────────────────────────────────
  if (uploadingVoice) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 border-t border-forest-800/50 bg-forest-950/90">
        <Loader2 size={18} className="animate-spin text-forest-400 flex-shrink-0" />
        <span className="text-xs text-forest-500">Sending voice message…</span>
      </div>
    )
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

      {/* Reply preview */}
      {replyingTo && (
        <div className="absolute bottom-full left-3 right-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl z-10
                        bg-forest-900/95 border border-forest-600/40 backdrop-blur-sm">
          <Reply size={13} className="text-forest-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-forest-400 font-medium leading-none mb-0.5">Replying to message</p>
            <p className="text-[11px] text-forest-300 truncate leading-tight">
              {replyingTo.type !== 'text' ? `[${replyingTo.type}]` : replyingTo.content}
            </p>
          </div>
          <button onClick={onCancelReply} className="flex-shrink-0 text-forest-600 hover:text-forest-300 p-0.5">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Mode badge */}
      {inputMode !== 'text' && (
        <div className="absolute bottom-full left-3 mb-1 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium
          bg-forest-900/90 border border-forest-700/50 text-forest-300 z-10">
          {inputMode === 'whisper'  ? <><Wind size={10}/> Whisper</>   :
           inputMode === 'leaf'     ? <><Leaf size={10}/> Leaf</>      :
           <><span className="text-base leading-none">🔥</span> View once</>}
          <button onClick={() => setInputMode('text')} className="ml-0.5 text-forest-600 hover:text-forest-400">✕</button>
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-2.5 border-t border-forest-800/50 bg-forest-950/80">
        <button onClick={() => setShowEmoji(v => !v)} disabled={disabled}
          className={`flex-shrink-0 p-2 rounded-xl transition-colors ${showEmoji ? 'text-forest-300 bg-forest-800/60' : 'text-forest-500 hover:text-forest-300'}`}>
          {showEmoji ? <X size={20} /> : <Smile size={20} />}
        </button>

        {/* Mode buttons */}
        <button onClick={() => setInputMode(m => m === 'whisper' ? 'text' : 'whisper')} disabled={disabled}
          title="Whisper mode"
          className={`flex-shrink-0 p-2 rounded-xl transition-colors
            ${inputMode === 'whisper' ? 'text-forest-300 bg-forest-800/60' : 'text-forest-600 hover:text-forest-400'}`}>
          <Wind size={18} />
        </button>
        <button onClick={() => setInputMode(m => m === 'leaf' ? 'text' : 'leaf')} disabled={disabled}
          title="Leaf message"
          className={`flex-shrink-0 p-2 rounded-xl transition-colors
            ${inputMode === 'leaf' ? 'text-green-400 bg-forest-800/60' : 'text-forest-600 hover:text-forest-400'}`}>
          <Leaf size={18} />
        </button>
        <button onClick={() => setInputMode(m => m === 'viewonce' ? 'text' : 'viewonce')} disabled={disabled}
          title="View once"
          className={`flex-shrink-0 p-2 rounded-xl transition-colors text-base leading-none
            ${inputMode === 'viewonce' ? 'bg-orange-950/60 opacity-100' : 'opacity-50 hover:opacity-80'}`}>
          🔥
        </button>

        <button onClick={() => fileRef.current?.click()} disabled={disabled || uploading}
          className="flex-shrink-0 p-2 rounded-xl text-forest-500 hover:text-forest-300 transition-colors" title="Attach">
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
            inputMode === 'whisper'  ? '🌬️ Whisper…'         :
            inputMode === 'leaf'     ? '🍃 Write on a leaf…' :
            inputMode === 'viewonce' ? '🔥 View-once message…' :
            'Type a message…'
          }
          rows={1}
          className={`flex-1 border rounded-2xl px-4 py-2.5 text-sm text-forest-100 placeholder-forest-600
                      resize-none focus:outline-none focus:ring-2 focus:ring-forest-600 max-h-32 overflow-y-auto
                      ${modeStyle[inputMode]}`}
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />

        {/* Send or mic */}
        {text.trim() ? (
          <button onClick={handleSend} disabled={sending || disabled}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-forest-600 hover:bg-forest-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        ) : (
          <button onClick={startRecording} disabled={disabled}
            title="Hold to record voice message"
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-forest-800/70 hover:bg-red-900/60 text-forest-400 hover:text-red-300 flex items-center justify-center transition-all">
            <Mic size={18} />
          </button>
        )}
      </div>
    </div>
  )
}
