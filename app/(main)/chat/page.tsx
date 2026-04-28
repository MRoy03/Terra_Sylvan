'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { initPresence } from '@/lib/presence'
import { getOrCreateChat, getUserProfile } from '@/lib/firestore'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { Modal } from '@/components/ui/Modal'
import { SearchUsers } from '@/components/contacts/SearchUsers'
import { UserProfile } from '@/types'

export default function ChatPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()

  const [selectedChatId,  setSelectedChatId]  = useState<string | null>(null)
  const [selectedUser,    setSelectedUser]     = useState<UserProfile | null>(null)
  const [showSearch,      setShowSearch]       = useState(false)

  // Init presence on mount
  useEffect(() => {
    if (!user) return
    return initPresence(user.uid)
  }, [user])

  // Auto-open chat from ?with=uid param (e.g. clicked from contacts)
  useEffect(() => {
    const withUid = searchParams.get('with')
    if (!withUid || !user) return
    ;(async () => {
      const [chatId, profile] = await Promise.all([
        getOrCreateChat(user.uid, withUid),
        getUserProfile(withUid),
      ])
      if (profile) { setSelectedChatId(chatId); setSelectedUser(profile) }
    })()
  }, [searchParams, user])

  const openChat = (chatId: string, u: UserProfile) => {
    setSelectedChatId(chatId)
    setSelectedUser(u)
  }

  return (
    <div className="flex h-screen bg-night overflow-hidden">
      {/* ── Sidebar: chat list ── */}
      <div className={`
        w-full md:w-[340px] flex-shrink-0
        border-r border-forest-800/50
        ${selectedChatId ? 'hidden md:flex' : 'flex'} flex-col
      `}>
        {/* Back to dashboard */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-0">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-400 transition-colors"
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
      <div className={`flex-1 ${!selectedChatId ? 'hidden md:flex' : 'flex'} flex-col`}>
        {selectedChatId && selectedUser ? (
          <ChatWindow
            chatId={selectedChatId}
            otherUser={selectedUser}
            onBack={() => { setSelectedChatId(null); setSelectedUser(null) }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
            <div className="text-6xl animate-float">💬</div>
            <p className="text-forest-400 font-medium">Select a chat to start messaging</p>
            <p className="text-forest-700 text-sm">Or click + to find new people to connect with</p>
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
