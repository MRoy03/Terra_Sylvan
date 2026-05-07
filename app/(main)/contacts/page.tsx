'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { initPresence } from '@/lib/presence'
import { getOrCreateChat } from '@/lib/firestore'
import { ContactsPanel } from '@/components/contacts/ContactsPanel'
import { RootNetwork } from '@/components/social/RootNetwork'
import { UserProfile } from '@/types'

export default function ContactsPage() {
  const { user } = useAuth()
  const router   = useRouter()
  const [tab, setTab] = useState<'contacts' | 'network'>('contacts')

  useEffect(() => {
    if (!user) return
    return initPresence(user.uid)
  }, [user])

  const handleOpenChat = async (_chatId: string, u: UserProfile) => {
    router.push(`/chat?with=${u.uid}`)
  }

  return (
    <div className="flex flex-col h-screen bg-forest-950">
      {/* Back link + tab bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-forest-800/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-400 transition-colors"
        >
          <ArrowLeft size={13} /> Dashboard
        </Link>
        <div className="flex gap-1 bg-forest-900/60 rounded-xl p-1">
          <button
            onClick={() => setTab('contacts')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${tab === 'contacts' ? 'bg-forest-700 text-white' : 'text-forest-500 hover:text-forest-300'}`}
          >
            🌿 Contacts
          </button>
          <button
            onClick={() => setTab('network')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${tab === 'network' ? 'bg-forest-700 text-white' : 'text-forest-500 hover:text-forest-300'}`}
          >
            🕸 Root Network
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === 'contacts' ? (
          <ContactsPanel onOpenChat={handleOpenChat} />
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <RootNetwork />
          </div>
        )}
      </div>
    </div>
  )
}
