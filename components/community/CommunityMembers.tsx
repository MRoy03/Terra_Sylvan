'use client'

import { useEffect, useState } from 'react'
import { Crown, Shield, User } from 'lucide-react'
import { getCommunityMembers } from '@/lib/communities'
import { getUserProfile } from '@/lib/firestore'
import { UserProfile, UserRole, TREE_CONFIGS } from '@/types'
import { Avatar } from '@/components/ui/Avatar'

interface MemberRow {
  uid:        string
  role:       UserRole
  joinedAt:   number
  profile:    UserProfile | null
}

const ROLE_ICON: Record<UserRole, React.ReactNode> = {
  admin:     <Crown  size={12} className="text-yellow-400" />,
  moderator: <Shield size={12} className="text-blue-400"   />,
  member:    <User   size={12} className="text-forest-500" />,
}

const ROLE_ORDER: Record<UserRole, number> = { admin: 0, moderator: 1, member: 2 }

interface CommunityMembersProps {
  communityId: string
}

export function CommunityMembers({ communityId }: CommunityMembersProps) {
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const raw = await getCommunityMembers(communityId)
      if (cancelled) return
      const enriched = await Promise.all(
        raw.map(async (m) => ({
          ...m,
          profile: await getUserProfile(m.uid),
        }))
      )
      if (cancelled) return
      enriched.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
      setMembers(enriched)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [communityId])

  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-2 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-forest-800" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-forest-800 rounded w-24" />
              <div className="h-2 bg-forest-900 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-y-auto">
      <p className="text-xs text-forest-600 px-4 py-2 uppercase tracking-wide font-medium">
        {members.length} {members.length === 1 ? 'Tree' : 'Trees'}
      </p>
      {members.map(({ uid, role, profile }) => {
        const treeCfg = profile ? TREE_CONFIGS[profile.treeType] : null
        return (
          <div
            key={uid}
            className="flex items-center gap-3 px-4 py-2 hover:bg-forest-900/40 transition-colors rounded-xl mx-2"
          >
            <Avatar
              photoURL={profile?.photoURL ?? null}
              displayName={profile?.displayName ?? uid}
              size="sm"
              isOnline={profile?.isOnline}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-forest-200 truncate">
                  {profile?.displayName ?? uid}
                </span>
                {treeCfg && <span className="text-sm">{treeCfg.emoji}</span>}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                {ROLE_ICON[role]}
                <span className="text-[11px] text-forest-500 capitalize">{role}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
