'use client'

// Required by Next.js static export for dynamic routes.
// Returns [] because community IDs are unknown at build time;
// the SPA routing script handles direct URL navigation client-side.
export function generateStaticParams() { return [] }

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, Users, LogIn, LogOut, Loader2, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth-context'
import { subscribeCommunity, getCommunityMembers, joinCommunity, leaveCommunity } from '@/lib/communities'
import { getUserProfile } from '@/lib/firestore'
import { computeTreeStats } from '@/lib/tree-utils'
import { GroupChat } from '@/components/community/GroupChat'
import { CommunityMembers } from '@/components/community/CommunityMembers'
import { Community, UserProfile, BIOME_CONFIGS, TREE_CONFIGS } from '@/types'

const ForestScene = dynamic(
  () => import('@/components/3d/ForestScene'),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-forest-950">
      <Loader2 size={32} className="animate-spin text-forest-500" />
    </div>
  )}
)

interface ForestMember {
  uid:         string
  displayName: string
  treeType:    string
  isOnline:    boolean
  scale:       number
  photoURL?:   string | null
}

type TabType = 'forest' | 'chat' | 'members'

export default function CommunityPage() {
  const { communityId } = useParams<{ communityId: string }>()
  const { user } = useAuth()
  const router = useRouter()

  const [community,    setCommunity]    = useState<Community | null>(null)
  const [members,      setMembers]      = useState<ForestMember[]>([])
  const [memberMap,    setMemberMap]    = useState<Record<string, { uid: string; displayName: string; treeType: string }>>({})
  const [isMember,     setIsMember]     = useState(false)
  const [joining,      setJoining]      = useState(false)
  const [loadingScene, setLoadingScene] = useState(true)
  const [activeTab,    setActiveTab]    = useState<TabType>('forest')
  const [highlightUid, setHighlightUid] = useState<string | undefined>()

  // Subscribe to community
  useEffect(() => {
    if (!communityId) return
    return subscribeCommunity(communityId, (c) => setCommunity(c))
  }, [communityId])

  // Load members + their profiles
  useEffect(() => {
    if (!communityId) return
    let cancelled = false

    async function loadMembers() {
      setLoadingScene(true)
      const raw = await getCommunityMembers(communityId)
      if (cancelled) return

      const profiles = await Promise.all(raw.map((m) => getUserProfile(m.uid)))
      if (cancelled) return

      const forest: ForestMember[] = []
      const map: Record<string, { uid: string; displayName: string; treeType: string }> = {}

      raw.forEach((m, i) => {
        const p = profiles[i]
        if (!p) return
        const stats = computeTreeStats(p)
        forest.push({
          uid:         p.uid,
          displayName: p.displayName,
          treeType:    p.treeType,
          isOnline:    p.isOnline ?? false,
          scale:       stats.scale,
          photoURL:    p.photoURL,
        })
        map[p.uid] = { uid: p.uid, displayName: p.displayName, treeType: p.treeType }
      })

      setMembers(forest)
      setMemberMap(map)
      setLoadingScene(false)

      // Check membership for current user
      if (user) {
        setIsMember(raw.some((m) => m.uid === user.uid))
      }
    }

    loadMembers()
    return () => { cancelled = true }
  }, [communityId, user])

  const handleJoin = async () => {
    if (!user || !communityId) return
    setJoining(true)
    try {
      await joinCommunity(communityId, user.uid)
      setIsMember(true)
      toast.success('You joined the forest! 🌿')
    } catch {
      toast.error('Could not join. Try again.')
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    if (!user || !communityId) return
    setJoining(true)
    try {
      await leaveCommunity(communityId, user.uid)
      setIsMember(false)
      toast.success('You left the forest.')
    } catch {
      toast.error('Could not leave. Try again.')
    } finally {
      setJoining(false)
    }
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-forest-950 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-forest-500" />
      </div>
    )
  }

  const cfg = BIOME_CONFIGS[community.biomeType]

  return (
    <div className="flex flex-col h-screen bg-forest-950 overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 border-b border-forest-800/50 bg-forest-950/90 backdrop-blur-xl">
        <button
          onClick={() => router.push('/forest')}
          className="p-1.5 rounded-lg text-forest-500 hover:text-forest-300 hover:bg-forest-800/50 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl">{cfg.emoji}</span>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-white truncate leading-tight">{community.name}</h1>
            <div className="flex items-center gap-2 text-xs text-forest-500">
              <span>{cfg.label} Biome</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users size={10} />
                {community.memberCount} trees
              </span>
            </div>
          </div>
        </div>

        {user && (
          isMember ? (
            <button
              onClick={handleLeave}
              disabled={joining}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-forest-300 text-xs font-medium transition-colors disabled:opacity-50"
            >
              {joining ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
              Leave
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-600 hover:bg-forest-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
            >
              {joining ? <Loader2 size={12} className="animate-spin" /> : <LogIn size={12} />}
              Join
            </button>
          )
        )}
      </div>

      {/* Tab bar (mobile-friendly) */}
      <div className="flex-shrink-0 flex border-b border-forest-800/50 bg-forest-950/80">
        {(['forest', 'chat', 'members'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-forest-300 border-b-2 border-forest-500'
                : 'text-forest-600 hover:text-forest-400'
            }`}
          >
            {tab === 'forest' ? `${cfg.emoji} Forest` : tab === 'chat' ? '💬 Chat' : '👥 Members'}
          </button>
        ))}
      </div>

      {/* Main content — tab panels */}
      <div className="flex-1 overflow-hidden relative">

        {/* Forest 3D view */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'forest' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {loadingScene ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Loader2 size={28} className="animate-spin text-forest-500" />
              <p className="text-forest-500 text-sm">Growing forest…</p>
            </div>
          ) : (
            <ForestScene
              members={members as any}
              biomeType={community.biomeType}
              communityName={community.name}
              highlightUid={highlightUid}
            />
          )}
        </div>

        {/* Group chat */}
        <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'chat' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          {isMember ? (
            <GroupChat communityId={communityId} memberMap={memberMap} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <span className="text-5xl">🔒</span>
              <p className="text-forest-400 text-sm">Join this forest to participate in the community chat.</p>
              {user && (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {joining ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                  Join Forest
                </button>
              )}
            </div>
          )}
        </div>

        {/* Members */}
        <div className={`absolute inset-0 overflow-y-auto transition-opacity duration-200 ${activeTab === 'members' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <CommunityMembers communityId={communityId} />
        </div>
      </div>
    </div>
  )
}
