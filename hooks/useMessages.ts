'use client'

import { useEffect, useState } from 'react'
import { subscribeMessages } from '@/lib/firestore'
import { Message } from '@/types'

export function useMessages(chatId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    if (!chatId) { setMessages([]); setLoading(false); return }
    setLoading(true)
    const unsub = subscribeMessages(chatId, (msgs) => {
      setMessages(msgs)
      setLoading(false)
    })
    return unsub
  }, [chatId])

  return { messages, loading }
}
