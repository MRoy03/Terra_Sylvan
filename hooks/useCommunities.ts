'use client'

import { useEffect, useState } from 'react'
import { subscribeAllCommunities, subscribeCommunity, isMember } from '@/lib/communities'
import { useAuth } from '@/lib/auth-context'
import { Community } from '@/types'

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    const unsub = subscribeAllCommunities((list) => {
      setCommunities(list)
      setLoading(false)
    })
    return unsub
  }, [])

  return { communities, loading }
}

export function useCommunity(communityId: string | null) {
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!communityId) { setLoading(false); return }
    const unsub = subscribeCommunity(communityId, (c) => {
      setCommunity(c)
      setLoading(false)
    })
    return unsub
  }, [communityId])

  return { community, loading }
}

export function useMembership(communityId: string | null) {
  const { user } = useAuth()
  const [isMemberState, setIsMember] = useState(false)
  const [checking,      setChecking] = useState(true)

  useEffect(() => {
    if (!communityId || !user) { setChecking(false); return }
    isMember(communityId, user.uid).then((v) => {
      setIsMember(v)
      setChecking(false)
    })
  }, [communityId, user])

  return { isMember: isMemberState, checking }
}
