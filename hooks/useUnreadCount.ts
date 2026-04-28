'use client'

import { useChats } from './useChats'
import { useAuth } from '@/lib/auth-context'

export function useUnreadCount(): number {
  const { user } = useAuth()
  const { chats } = useChats()

  if (!user) return 0
  return chats.filter(
    (c) => c.lastMessage && c.lastMessageSenderId !== user.uid,
  ).length
}
