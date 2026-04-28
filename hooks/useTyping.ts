'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { setTyping, subscribeTyping } from '@/lib/presence'

export function useTyping(chatId: string | null, myUid: string | null) {
  const [typers,  setTypers]  = useState<string[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!chatId || !myUid) return
    return subscribeTyping(chatId, myUid, setTypers)
  }, [chatId, myUid])

  const notifyTyping = useCallback(() => {
    if (!chatId || !myUid) return
    setTyping(chatId, myUid, true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (chatId && myUid) setTyping(chatId, myUid, false)
    }, 2000)
  }, [chatId, myUid])

  const stopTyping = useCallback(() => {
    if (!chatId || !myUid) return
    if (timerRef.current) clearTimeout(timerRef.current)
    setTyping(chatId, myUid, false)
  }, [chatId, myUid])

  return { typers, notifyTyping, stopTyping }
}
