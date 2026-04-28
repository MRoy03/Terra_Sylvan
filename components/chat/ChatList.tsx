'use client'

import { useState } from 'react'
import { Search, Plus, MessageCircle } from 'lucide-react'
import { useChats, ChatWithProfile } from '@/hooks/useChats'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { Avatar } from '@/components/ui/Avatar'
import { formatTime, truncate } from '@/lib/utils'
import { UserProfile } from '@/types'

interface ChatListProps {
  onSelectChat:    (chatId: string, otherUser: UserProfile) => void
  selectedChatId:  string | null
  onNewChat:       () => void
}

function ChatRow({
  chat,
  isSelected,
  myUid,
  onClick,
}: {
  chat:       ChatWithProfile
  isSelected: boolean
  myUid:      string
  onClick:    () => void
}) {
  const { isOnline } = useOnlineStatus(chat.otherUser?.uid ?? null)
  const preview = chat.lastMessage
    ? (chat.lastMessageSenderId === myUid ? `You: ${truncate(chat.lastMessage, 28)}` : truncate(chat.lastMessage, 32))
    : 'Start a conversation'

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-forest-900/60 transition-colors text-left
        ${isSelected ? 'bg-forest-900/80 border-r-2 border-forest-500' : ''}`}
    >
      <Avatar
        photoURL={chat.otherUser?.photoURL ?? null}
        displayName={chat.otherUser?.displayName ?? '?'}
        size="md"
        isOnline={isOnline}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-white truncate">
            {chat.otherUser?.displayName ?? 'Unknown'}
          </span>
          {chat.lastMessageAt ? (
            <span className="text-[11px] text-forest-600 flex-shrink-0 ml-1">
              {formatTime(chat.lastMessageAt)}
            </span>
          ) : null}
        </div>
        <p className="text-xs text-forest-500 truncate mt-0.5">{preview}</p>
      </div>
    </button>
  )
}

export function ChatList({ onSelectChat, selectedChatId, onNewChat }: ChatListProps) {
  const { chats, loading } = useChats()
  const [search, setSearch] = useState('')

  const filtered = search
    ? chats.filter((c) =>
        c.otherUser?.displayName.toLowerCase().includes(search.toLowerCase()) ||
        c.otherUser?.username.toLowerCase().includes(search.toLowerCase()),
      )
    : chats

  return (
    <div className="flex flex-col h-full bg-forest-950/90">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-forest-800/50">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>💬</span> Chats
        </h2>
        <button
          onClick={onNewChat}
          className="p-2 rounded-xl text-forest-400 hover:text-white hover:bg-forest-800/60 transition-colors"
          title="New chat"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-forest-800/30">
        <div className="flex items-center gap-2 bg-forest-900/60 rounded-xl px-3 py-2 border border-forest-800/40">
          <Search size={15} className="text-forest-500 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="flex-1 bg-transparent text-sm text-forest-200 placeholder-forest-600 focus:outline-none"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col gap-2 p-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-1 py-2 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-forest-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 bg-forest-800 rounded" />
                  <div className="h-2.5 w-36 bg-forest-900 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
            <MessageCircle size={36} className="text-forest-800" />
            <p className="text-forest-600 text-sm">
              {search ? 'No chats match your search.' : 'No conversations yet. Add a contact to start chatting!'}
            </p>
          </div>
        ) : (
          filtered.map((chat) => (
            <ChatRow
              key={chat.id}
              chat={chat}
              isSelected={chat.id === selectedChatId}
              myUid={chat.participants.find((p) => p !== chat.otherUser?.uid) ?? ''}
              onClick={() => chat.otherUser && onSelectChat(chat.id, chat.otherUser)}
            />
          ))
        )}
      </div>
    </div>
  )
}
