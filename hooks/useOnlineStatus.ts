'use client'

import { useEffect, useState } from 'react'
import { subscribePresence } from '@/lib/presence'

export function useOnlineStatus(uid: string | null) {
  const [isOnline,  setIsOnline]  = useState(false)
  const [lastSeen,  setLastSeen]  = useState(0)

  useEffect(() => {
    if (!uid) return
    return subscribePresence(uid, (online, seen) => {
      setIsOnline(online)
      setLastSeen(seen)
    })
  }, [uid])

  return { isOnline, lastSeen }
}
