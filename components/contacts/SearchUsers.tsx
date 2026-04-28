'use client'

import { useState, useCallback } from 'react'
import { Search, UserPlus, MessageCircle, Check, Clock } from 'lucide-react'
import { searchUsers, getConnectionStatus, sendFriendRequest, getOrCreateChat } from '@/lib/firestore'
import { useAuth } from '@/lib/auth-context'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { UserProfile } from '@/types'
import toast from 'react-hot-toast'

interface SearchUsersProps {
  onOpenChat: (chatId: string, user: UserProfile) => void
}

type ConnStatus = 'none' | 'pending' | 'accepted' | 'self'

interface ResultUser extends UserProfile {
  connStatus: ConnStatus
}

export function SearchUsers({ onOpenChat }: SearchUsersProps) {
  const { user } = useAuth()
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<ResultUser[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = useCallback(async (term: string) => {
    setQuery(term)
    if (!term.trim() || !user) { setResults([]); return }
    setLoading(true)
    try {
      const users = await searchUsers(term, user.uid)
      const enriched: ResultUser[] = await Promise.all(
        users.map(async (u) => {
          const status = await getConnectionStatus(user.uid, u.uid)
          return { ...u, connStatus: (status ?? 'none') as ConnStatus }
        }),
      )
      setResults(enriched)
    } finally {
      setLoading(false)
    }
  }, [user])

  const handleAddFriend = async (targetUser: ResultUser) => {
    if (!user) return
    try {
      await sendFriendRequest(user.uid, targetUser.uid)
      setResults((prev) =>
        prev.map((u) => u.uid === targetUser.uid ? { ...u, connStatus: 'pending' } : u),
      )
      toast.success(`Friend request sent to ${targetUser.displayName} 🌿`)
    } catch {
      toast.error('Failed to send request')
    }
  }

  const handleMessage = async (targetUser: ResultUser) => {
    if (!user) return
    try {
      const chatId = await getOrCreateChat(user.uid, targetUser.uid)
      onOpenChat(chatId, targetUser)
    } catch {
      toast.error('Could not open chat')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search input */}
      <div className="flex items-center gap-2 bg-forest-900/60 rounded-xl px-3 py-2.5 border border-forest-800/40">
        <Search size={15} className="text-forest-500 flex-shrink-0" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by username…"
          className="flex-1 bg-transparent text-sm text-forest-200 placeholder-forest-600 focus:outline-none"
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-6 text-forest-600 text-sm">
            Searching the forest…
          </div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="text-center py-6 text-forest-600 text-sm">
            No users found for &quot;{query}&quot;
          </div>
        )}

        {results.map((u) => (
          <div
            key={u.uid}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-forest-900/50 transition-colors"
          >
            <Avatar photoURL={u.photoURL} displayName={u.displayName} size="md" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{u.displayName}</p>
              <p className="text-xs text-forest-500">@{u.username}</p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {u.connStatus === 'accepted' ? (
                <Button variant="ghost" size="sm" onClick={() => handleMessage(u)}>
                  <MessageCircle size={15} /> Chat
                </Button>
              ) : u.connStatus === 'pending' ? (
                <span className="flex items-center gap-1 text-xs text-forest-500 px-2 py-1">
                  <Clock size={13} /> Pending
                </span>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => handleAddFriend(u)}>
                  <UserPlus size={15} /> Add
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
