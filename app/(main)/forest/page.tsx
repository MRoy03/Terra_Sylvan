'use client'

import { useState } from 'react'
import { Plus, Search, Trees, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useCommunities, useMembership } from '@/hooks/useCommunities'
import { CommunityCard } from '@/components/community/CommunityCard'
import { CreateCommunity } from '@/components/community/CreateCommunity'
import { Community } from '@/types'

function MemberAwareCommunityCard({ community, uid }: { community: Community; uid: string }) {
  const { isMember } = useMembership(community.id)
  return <CommunityCard community={community} isMember={isMember} />
}

export default function ForestPage() {
  const { user } = useAuth()
  const { communities, loading } = useCommunities()
  const [query,      setQuery]      = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const filtered = communities.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-forest-950 via-forest-900 to-forest-950">

      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-forest-950/80 border-b border-forest-800/50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trees size={22} className="text-forest-400" />
              <div>
                <h1 className="text-xl font-bold text-white leading-none">Forests</h1>
                <p className="text-xs text-forest-500 mt-0.5">Discover communities</p>
              </div>
            </div>
            {user && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                Plant
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search forests…"
              className="w-full bg-forest-900/60 border border-forest-800/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-forest-100 placeholder-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 size={32} className="animate-spin text-forest-500" />
            <p className="text-forest-500 text-sm">Growing forests…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <span className="text-6xl">🌱</span>
            {query ? (
              <p className="text-forest-400">No forests matching "{query}"</p>
            ) : (
              <>
                <p className="text-forest-400 text-lg font-medium">No forests yet</p>
                <p className="text-forest-600 text-sm max-w-xs">
                  Be the first to plant a community forest for others to grow in.
                </p>
                {user && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-600 text-forest-200 text-sm font-medium transition-colors mt-1"
                  >
                    <Plus size={16} />
                    Plant the First Forest
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map((c) => (
              user
                ? <MemberAwareCommunityCard key={c.id} community={c} uid={user.uid} />
                : <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateCommunity
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
