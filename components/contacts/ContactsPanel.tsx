'use client'

import { useState } from 'react'
import { UserPlus, MessageCircle, Check, X, Users } from 'lucide-react'
import { useConnections } from '@/hooks/useConnections'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useAuth } from '@/lib/auth-context'
import { acceptFriendRequest, rejectFriendRequest, getOrCreateChat } from '@/lib/firestore'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { SearchUsers } from './SearchUsers'
import { UserProfile } from '@/types'
import { formatLastSeen } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ContactsPanelProps {
  onOpenChat: (chatId: string, user: UserProfile) => void
}

function ContactRow({
  profile,
  onMessage,
}: {
  profile:   UserProfile
  onMessage: () => void
}) {
  const { isOnline, lastSeen } = useOnlineStatus(profile.uid)
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-forest-900/40 transition-colors rounded-xl">
      <Avatar photoURL={profile.photoURL} displayName={profile.displayName} size="md" isOnline={isOnline} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{profile.displayName}</p>
        <p className="text-xs text-forest-500">
          {isOnline ? '🟢 Online' : lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : `@${profile.username}`}
        </p>
      </div>
      <button
        onClick={onMessage}
        className="p-2 rounded-xl text-forest-500 hover:text-forest-300 hover:bg-forest-800/50 transition-colors"
        title="Send message"
      >
        <MessageCircle size={17} />
      </button>
    </div>
  )
}

export function ContactsPanel({ onOpenChat }: ContactsPanelProps) {
  const { user } = useAuth()
  const { accepted, pending, loading } = useConnections()
  const [showSearch, setShowSearch] = useState(false)

  const handleMessage = async (profile: UserProfile) => {
    if (!user) return
    try {
      const chatId = await getOrCreateChat(user.uid, profile.uid)
      onOpenChat(chatId, profile)
    } catch {
      toast.error('Could not open chat')
    }
  }

  const handleAccept = async (friendUid: string, name: string) => {
    if (!user) return
    try {
      await acceptFriendRequest(user.uid, friendUid)
      toast.success(`${name} is now connected to your roots! 🌿`)
    } catch {
      toast.error('Failed to accept request')
    }
  }

  const handleReject = async (friendUid: string) => {
    if (!user) return
    try {
      await rejectFriendRequest(user.uid, friendUid)
    } catch {
      toast.error('Failed to reject request')
    }
  }

  return (
    <div className="flex flex-col h-full bg-forest-950/90">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-forest-800/50">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>🌿</span> Contacts
        </h2>
        <button
          onClick={() => setShowSearch(true)}
          className="p-2 rounded-xl text-forest-400 hover:text-white hover:bg-forest-800/60 transition-colors"
          title="Find people"
        >
          <UserPlus size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Pending requests */}
        {pending.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-forest-600 uppercase tracking-wider px-2 mb-1">
              Friend Requests ({pending.length})
            </p>
            {pending.map((conn) => conn.profile && (
              <div key={conn.uid} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-forest-900/40">
                <Avatar photoURL={conn.profile.photoURL} displayName={conn.profile.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{conn.profile.displayName}</p>
                  <p className="text-xs text-forest-600">@{conn.profile.username}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleAccept(conn.uid, conn.profile!.displayName)}
                    className="p-1.5 rounded-lg bg-forest-700 hover:bg-forest-600 text-white transition-colors"
                    title="Accept"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => handleReject(conn.uid)}
                    className="p-1.5 rounded-lg bg-forest-900/60 hover:bg-red-900/60 text-forest-400 hover:text-red-400 transition-colors"
                    title="Reject"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Accepted contacts */}
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-forest-800" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-28 bg-forest-800 rounded" />
                  <div className="h-2 w-20 bg-forest-900 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : accepted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3 text-center px-6">
            <Users size={36} className="text-forest-800" />
            <p className="text-forest-600 text-sm">No contacts yet.</p>
            <button
              onClick={() => setShowSearch(true)}
              className="text-forest-400 text-sm underline underline-offset-2 hover:text-forest-200 transition-colors"
            >
              Search for people to add →
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold text-forest-600 uppercase tracking-wider px-2 mb-1">
              Connections ({accepted.length})
            </p>
            {accepted.map((conn) => conn.profile && (
              <ContactRow
                key={conn.uid}
                profile={conn.profile}
                onMessage={() => handleMessage(conn.profile!)}
              />
            ))}
          </>
        )}
      </div>

      {/* Search modal */}
      <Modal isOpen={showSearch} onClose={() => setShowSearch(false)} title="🔍 Find People">
        <SearchUsers onOpenChat={(chatId, u) => { setShowSearch(false); onOpenChat(chatId, u) }} />
      </Modal>
    </div>
  )
}
