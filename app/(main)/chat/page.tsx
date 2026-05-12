'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { initPresence } from '@/lib/presence'
import { getOrCreateChat, getUserProfile } from '@/lib/firestore'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { Modal } from '@/components/ui/Modal'
import { SearchUsers } from '@/components/contacts/SearchUsers'
import { UserProfile } from '@/types'
import { TREE_BIOME_MAP } from '@/types'
import { useTheme } from '@/hooks/useTheme'
import type { BiomeType } from '@/types'

export default function ChatPage() {
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()

  const [selectedChatId,  setSelectedChatId]  = useState<string | null>(null)
  const [selectedUser,    setSelectedUser]     = useState<UserProfile | null>(null)
  const [showSearch,      setShowSearch]       = useState(false)

  const biome = profile?.treeType ? TREE_BIOME_MAP[profile.treeType] as BiomeType : undefined
  const { theme } = useTheme(biome)
  const t = theme.tokens

  // Apply CSS custom properties to document for deep theming
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--th-bg',           t.bg)
    root.style.setProperty('--th-bg-card',      t.bgCard)
    root.style.setProperty('--th-bg-input',     t.bgInput)
    root.style.setProperty('--th-border',       t.border)
    root.style.setProperty('--th-accent',       t.accent)
    root.style.setProperty('--th-accent-muted', t.accentMuted)
    root.style.setProperty('--th-text',         t.text)
    root.style.setProperty('--th-text-muted',   t.textMuted)
    root.style.setProperty('--th-glow',         t.glow)
    root.style.setProperty('--th-header',       t.headerBg)
    return () => {
      ;['--th-bg','--th-bg-card','--th-bg-input','--th-border','--th-accent',
        '--th-accent-muted','--th-text','--th-text-muted','--th-glow','--th-header',
      ].forEach(v => root.style.removeProperty(v))
    }
  }, [t])

  // Init presence on mount
  useEffect(() => {
    if (!user) return
    return initPresence(user.uid)
  }, [user])

  // Auto-open chat from ?with=uid param
  useEffect(() => {
    const withUid = searchParams.get('with')
    if (!withUid || !user) return
    ;(async () => {
      const [chatId, prof] = await Promise.all([
        getOrCreateChat(user.uid, withUid),
        getUserProfile(withUid),
      ])
      if (prof) { setSelectedChatId(chatId); setSelectedUser(prof) }
    })()
  }, [searchParams, user])

  const openChat = (chatId: string, u: UserProfile) => {
    setSelectedChatId(chatId)
    setSelectedUser(u)
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: t.bg }}
    >
      {/* Themed accent glow strip at top */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 z-50 pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${t.glow}60, transparent)` }}
      />

      {/* ── Sidebar: chat list ── */}
      <div
        className={`
          w-full md:w-[340px] flex-shrink-0
          ${selectedChatId ? 'hidden md:flex' : 'flex'} flex-col
        `}
        style={{
          background: t.bgCard,
          borderRight: `1px solid ${t.border}`,
        }}
      >
        {/* Back to dashboard */}
        <div
          className="flex items-center gap-2 px-3 pt-3 pb-0"
          style={{ borderBottom: `1px solid ${t.border}40` }}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs transition-colors mb-2"
            style={{ color: t.accentMuted }}
            onMouseEnter={e => (e.currentTarget.style.color = t.accent)}
            onMouseLeave={e => (e.currentTarget.style.color = t.accentMuted)}
          >
            <ArrowLeft size={13} /> Dashboard
          </Link>
        </div>

        <ChatList
          onSelectChat={openChat}
          selectedChatId={selectedChatId}
          onNewChat={() => setShowSearch(true)}
        />
      </div>

      {/* ── Main: chat window ── */}
      <div
        className={`flex-1 ${!selectedChatId ? 'hidden md:flex' : 'flex'} flex-col`}
        style={{ background: t.bg }}
      >
        {selectedChatId && selectedUser ? (
          <ChatWindow
            chatId={selectedChatId}
            otherUser={selectedUser}
            onBack={() => { setSelectedChatId(null); setSelectedUser(null) }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
            <div className="text-6xl animate-float">💬</div>
            <p className="font-medium" style={{ color: t.textMuted }}>Select a chat to start messaging</p>
            <p className="text-sm" style={{ color: t.border }}>Or click + to find new people to connect with</p>
          </div>
        )}
      </div>

      {/* New chat search modal */}
      <Modal isOpen={showSearch} onClose={() => setShowSearch(false)} title="🔍 Find People">
        <SearchUsers onOpenChat={(chatId, u) => { setShowSearch(false); openChat(chatId, u) }} />
      </Modal>
    </div>
  )
}
