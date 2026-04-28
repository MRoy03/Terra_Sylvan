'use client'

import { useRouter } from 'next/navigation'
import { Users, Lock, Globe } from 'lucide-react'
import { Community, BIOME_CONFIGS } from '@/types'

interface CommunityCardProps {
  community:  Community
  isMember?:  boolean
}

export function CommunityCard({ community, isMember }: CommunityCardProps) {
  const router = useRouter()
  const cfg    = BIOME_CONFIGS[community.biomeType]

  return (
    <button
      onClick={() => router.push(`/forest/${community.id}`)}
      className="w-full text-left group"
    >
      <div className="relative overflow-hidden rounded-2xl border border-forest-800/50 bg-forest-950/60 backdrop-blur-sm hover:border-forest-600/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-forest-900/40">

        {/* Biome colour band */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${cfg.groundColor}, ${cfg.fogColor})` }}
        />

        <div className="p-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border border-forest-800/60"
                style={{ backgroundColor: cfg.groundColor + '44' }}
              >
                {cfg.emoji}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-forest-100 group-hover:text-white transition-colors truncate text-base leading-tight">
                  {community.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-forest-500 uppercase tracking-wide">
                    {cfg.label}
                  </span>
                  {community.isPrivate
                    ? <Lock size={10} className="text-forest-600" />
                    : <Globe size={10} className="text-forest-600" />
                  }
                </div>
              </div>
            </div>

            {/* Member badge */}
            {isMember && (
              <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-forest-700/60 text-forest-300 border border-forest-600/40">
                Joined
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-forest-400 line-clamp-2 leading-relaxed mb-3">
            {community.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-1.5 text-xs text-forest-600">
            <Users size={12} />
            <span>{community.memberCount.toLocaleString()} {community.memberCount === 1 ? 'tree' : 'trees'}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
