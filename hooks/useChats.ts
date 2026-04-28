'use client'

import { useEffect, useState } from 'react'
import { subscribeChats, getUserProfile } from '@/lib/firestore'
import { useAuth } from '@/lib/auth-context'
import { Chat, UserProfile } from '@/types'

export interface ChatWithProfile extends Chat {
  otherUser: UserProfile | null
}

export function useChats() {
  const { user } = useAuth()
  const [chats,   setChats]   = useState<ChatWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeChats(user.uid, async (rawChats) => {
      const enriched = await Promise.all(
        rawChats.map(async (chat) => {
          const otherUid  = chat.participants.find((p) => p !== user.uid) ?? ''
          const otherUser = otherUid ? await getUserProfile(otherUid) : null
          return { ...chat, otherUser }
        }),
      )
      setChats(enriched)
      setLoading(false)
    })
    return unsub
  }, [user])

  return { chats, loading }
}
