'use client'

import { useEffect, useState } from 'react'
import { subscribeConnections, getUserProfile } from '@/lib/firestore'
import { useAuth } from '@/lib/auth-context'
import { Connection, UserProfile } from '@/types'

export interface ConnectionWithProfile extends Connection {
  profile: UserProfile | null
}

export function useConnections() {
  const { user } = useAuth()
  const [connections, setConnections] = useState<ConnectionWithProfile[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeConnections(user.uid, async (rawConns) => {
      const enriched = await Promise.all(
        rawConns.map(async (conn) => ({
          ...conn,
          profile: await getUserProfile(conn.uid),
        })),
      )
      setConnections(enriched)
      setLoading(false)
    })
    return unsub
  }, [user])

  const accepted = connections.filter((c) => c.status === 'accepted')
  const pending  = connections.filter((c) => c.status === 'pending')

  return { connections, accepted, pending, loading }
}
