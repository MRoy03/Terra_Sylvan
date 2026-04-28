'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { initPresence } from '@/lib/presence'
import { getOrCreateChat } from '@/lib/firestore'
import { ContactsPanel } from '@/components/contacts/ContactsPanel'
import { UserProfile } from '@/types'

export default function ContactsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    return initPresence(user.uid)
  }, [user])

  const handleOpenChat = async (chatId: string, u: UserProfile) => {
    router.push(`/chat?with=${u.uid}`)
  }

  return (
    <div className="flex flex-col h-screen bg-night">
      {/* Back link */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-xs text-forest-600 hover:text-forest-400 transition-colors"
        >
          <ArrowLeft size={13} /> Dashboard
        </Link>
      </div>

      <div className="flex-1 overflow-hidden">
        <ContactsPanel onOpenChat={handleOpenChat} />
      </div>
    </div>
  )
}
