'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { LogOut, Settings, ChevronDown, ChevronUp, Sparkles, X, Shield } from 'lucide-react'
import { forestToast } from '@/lib/forest-toast'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { computeTreeStats, getStageBadge } from '@/lib/tree-utils'
import { initPresence } from '@/lib/presence'
import { getCurrentSeason, SEASON_LABEL } from '@/lib/seasons'
import { useWeather, WEATHER_ICON } from '@/lib/weather'
import { TREE_BIOME_MAP } from '@/types'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { Button } from '@/components/ui/Button'
import { StoriesBar } from '@/components/social/StoriesBar'
import { ForestRadio } from '@/components/audio/ForestRadio'
import { BadgeDisplay } from '@/components/profile/BadgeDisplay'
import { computeBadges } from '@/lib/badges'
import { getMediaByUser } from '@/lib/firestore'
import { getMoodOption, type MoodType } from '@/lib/mood'
import { computeBondXP, getBondLevel, BOND_GLOW } from '@/lib/companion-bond'
import { DailyRitual }   from '@/components/dashboard/DailyRitual'
import { TreeRingIcon }  from '@/components/icons/TreeRingIcon'
import { MemoryRings } from '@/components/dashboard/MemoryRings'
import { MoodPicker } from '@/components/dashboard/MoodPicker'
import type { WeatherCondition } from '@/lib/weather'

const TreeScene = dynamic(() => import('@/components/3d/TreeScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full forest-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-forest-800/40 border-t-forest-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border border-forest-700/30 border-b-forest-600/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-4 rounded-full bg-forest-900/60 border border-forest-700/40" />
        </div>
        <p className="text-forest-600 text-xs font-mono tracking-widest uppercase">Rendering forest</p>
      </div>
    </div>
  ),
})

const MILESTONE_MESSAGES: Record<string, string> = {
  sapling: 'Your seedling sprouted into a sapling!',
  young:   'Your sapling grew into a young tree!',
  mature:  'Your tree has matured. Ancient wisdom awaits.',
  ancient: 'Your tree is now ancient — a legend of the forest.',
}

function NavWeather() {
  const weather = useWeather()
  if (weather.loading) return null
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                    bg-black/30 border border-white/8 text-white/80 text-xs backdrop-blur-md">
      <span className="text-sm leading-none">{WEATHER_ICON[weather.condition]}</span>
      {weather.temperature !== null && (
        <span className="font-mono font-medium text-white/70">{weather.temperature}°</span>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile, logOut } = useAuth()
  const router       = useRouter()
  const unreadCount  = useUnreadCount()

  const [statsOpen,    setStatsOpen]    = useState(false)
  const [signingOut,   setSigningOut]   = useState(false)
  const [showStories,  setShowStories]  = useState(false)
  const [bioMode,      setBioMode]      = useState(false)
  const [mediaGallery, setMediaGallery] = useState<'image' | 'video' | null>(null)
  const [mediaItems,   setMediaItems]   = useState<{ url: string; timestamp: number }[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [showRings,    setShowRings]    = useState(false)
  const [ritualDone,   setRitualDone]   = useState(false)
  const [mood,         setMood]         = useState<MoodType | null>(
    () => (profile as any)?.mood as MoodType ?? null
  )
  const [showPhoto,    setShowPhoto]    = useState<boolean>(true)

  useEffect(() => {
    const stored = localStorage.getItem('ts_realistic_bg')
    if (stored !== null) setShowPhoto(stored !== 'false')
  }, [])

  useEffect(() => {
    if ((profile as any)?.mood) setMood((profile as any).mood as MoodType)
  }, [profile])

  useEffect(() => {
    if (!user) return
    return initPresence(user.uid)
  }, [user])

  useEffect(() => {
    if (!profile) return
    const stats = computeTreeStats(profile)
    const key   = `ts_stage_${profile.uid}`
    const prev  = sessionStorage.getItem(key)
    if (prev && prev !== stats.stage && MILESTONE_MESSAGES[stats.stage]) {
      forestToast.growth(MILESTONE_MESSAGES[stats.stage], { duration: 5000 })
    }
    sessionStorage.setItem(key, stats.stage)
  }, [profile])

  const openGallery = useCallback(async (type: 'image' | 'video') => {
    if (!user) return
    setMediaGallery(type)
    setMediaLoading(true)
    setMediaItems([])
    try {
      const items = await getMediaByUser(user.uid, type)
      setMediaItems(items)
    } catch {
      forestToast.error('Could not load media', 'A Firestore index may be needed.')
    } finally {
      setMediaLoading(false)
    }
  }, [user])

  if (!profile) return null

  const stats      = computeTreeStats(profile)
  const badge      = getStageBadge(stats.stage)
  const season     = getCurrentSeason()
  const badges     = computeBadges(profile)
  const bondXP     = computeBondXP(profile as any)
  const bond       = getBondLevel(bondXP)
  const moodOption = mood ? getMoodOption(mood) : null
  const weatherOverride: WeatherCondition | undefined = moodOption?.weather

  const now  = new Date()
  const hour = now.getHours()
  const timePhase =
    hour >= 5  && hour < 8  ? 'Dawn'    :
    hour >= 8  && hour < 17 ? 'Day'     :
    hour >= 17 && hour < 20 ? 'Dusk'    : 'Night'
  const timeColor =
    hour >= 5  && hour < 8  ? 'text-orange-400/80' :
    hour >= 8  && hour < 17 ? 'text-amber-300/80'  :
    hour >= 17 && hour < 20 ? 'text-orange-500/80' : 'text-indigo-400/80'

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await logOut()
      forestToast.info('See you in the forest.')
      router.replace('/login')
    } catch {
      forestToast.error('Sign-out failed')
      setSigningOut(false)
    }
  }

  const bondGlow = BOND_GLOW[bond.level] as string

  return (
    <div className={`scene-wrapper${bioMode ? ' bioluminescent' : ''} season-${season}`}>
      {/* ── 3D scene ── */}
      <TreeScene
        stats={stats}
        displayName={profile.displayName}
        status={profile.status}
        photoURL={profile.photoURL}
        treeType={profile.treeType}
        biomeType={TREE_BIOME_MAP[profile.treeType]}
        animal={(profile as any).animal ?? 'none'}
        bondLevel={bond.level}
        weatherOverride={weatherOverride}
        showPhoto={showPhoto}
      />

      {/* ── Navigation bar ── */}
      <nav className="nav-glass flex items-center justify-between px-4 py-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🌳</span>
          <span className="font-display font-semibold text-forest-200/90 text-base tracking-wide hidden sm:block">
            Terra Sylvan
          </span>
        </div>

        {/* Centre badges */}
        <div className="flex items-center gap-1.5">
          <span className="tree-badge">{badge.label}</span>
          <span className={`tree-badge hidden sm:inline-flex text-[10px] ${timeColor}`}>{timePhase}</span>
          <span className="tree-badge hidden md:inline-flex">{SEASON_LABEL[season]}</span>
          <NavWeather />
          {/* Mood indicator */}
          {moodOption && (
            <span className="tree-badge" title={`Mood: ${moodOption.label}`}>
              {moodOption.emoji}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPhoto(v => {
              const next = !v
              localStorage.setItem('ts_realistic_bg', String(next))
              return next
            })}
            title={showPhoto ? 'Switch to classic sky' : 'Switch to photo panorama'}
            className={`p-1.5 rounded-lg text-sm transition-colors ${!showPhoto ? 'text-amber-300 bg-amber-900/20' : 'text-forest-700 hover:text-forest-400'}`}
          >
            {showPhoto ? '🖼️' : '🎨'}
          </button>
          <MoodPicker uid={profile.uid} currentMood={mood} onMoodChange={setMood} />
          <button
            onClick={() => setBioMode(v => !v)}
            title="Bioluminescence mode"
            className={`p-1.5 rounded-lg text-xs transition-colors ${bioMode ? 'text-green-300 bg-green-900/30' : 'text-forest-700 hover:text-forest-400'}`}
          >
            <Sparkles size={15} className={bioMode ? 'text-green-300' : ''} />
          </button>
          <Link href="/settings">
            <Button variant="ghost" size="sm" title="Settings">
              <Settings size={16} />
            </Button>
          </Link>
          {user?.email === 'roy62125@gmail.com' && (
            <Link href="/admin" title="Admin panel">
              <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-400">
                <Shield size={15} />
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} loading={signingOut} title="Sign out">
            <LogOut size={16} />
          </Button>
        </div>
      </nav>

      {/* ── Stats overlay (top-left) ── */}
      <div className="absolute top-16 left-3 flex flex-col gap-2 z-40 pointer-events-none">
        <div className="flex flex-wrap gap-1.5 pointer-events-auto">
          <button
            className="stat-pill hover:bg-white/8 transition-colors cursor-pointer"
            title="View chats"
            onClick={() => router.push('/chat')}
          >
            <span className="text-[11px]">🍃</span>
            <span className="tabular-nums">{profile.messageCount}</span>
          </button>
          <button
            className="stat-pill hover:bg-white/8 transition-colors cursor-pointer"
            title="View photos"
            onClick={() => openGallery('image')}
          >
            <span className="text-[11px]">🌸</span>
            <span className="tabular-nums">{profile.imageCount}</span>
          </button>
          <button
            className="stat-pill hover:bg-white/8 transition-colors cursor-pointer"
            title="View videos"
            onClick={() => openGallery('video')}
          >
            <span className="text-[11px]">🍎</span>
            <span className="tabular-nums">{profile.videoCount}</span>
          </button>
          <span className="stat-pill">
            <span className="text-[11px]">🌿</span>
            <span className="tabular-nums">{profile.connectionCount}</span>
          </span>
          {(profile as any).seeds > 0 && (
            <span className="stat-pill">
              <span className="text-[11px]">🌱</span>
              <span className="tabular-nums">{(profile as any).seeds}</span>
            </span>
          )}
        </div>
        <span className="stat-pill self-start text-xs">
          <span className="text-[11px]">🕰</span>
          {stats.ageInDays === 0 ? 'Just sprouted' : `${stats.ageInDays}d`}
        </span>

        {/* Bond level */}
        {bond.level > 0 && (
          <span
            className="bond-badge self-start"
            style={{
              background: `${bondGlow}18`,
              border:     `1px solid ${bondGlow}35`,
              color:      bondGlow,
            }}
          >
            ✦ {bond.label}
          </span>
        )}

        {/* Memory rings + ritual on same row */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <DailyRitual uid={profile.uid} onComplete={() => setRitualDone(true)} />
          <button
            onClick={() => setShowRings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border backdrop-blur-md
                       bg-black/30 border-forest-800/50 text-forest-500 hover:text-forest-300
                       hover:border-forest-600/50 transition-colors"
            title="View tree memory rings"
          >
            <TreeRingIcon size={16} />
            <span>Rings</span>
          </button>
        </div>

        {badges.length > 0 && (
          <div className="pointer-events-auto">
            <BadgeDisplay badgeIds={badges} compact maxShow={5} />
          </div>
        )}
      </div>

      {/* ── Forest Radio ── */}
      <ForestRadio />

      {/* ── Stories strip ── */}
      <div className={`absolute left-0 right-0 z-40 transition-all duration-300 ${showStories ? 'top-[52px]' : '-top-24'}`}>
        <div className="mx-3 mt-2 glass rounded-2xl px-3 py-2.5">
          <StoriesBar />
        </div>
      </div>

      <button
        onClick={() => setShowStories(v => !v)}
        className="absolute top-[54px] left-1/2 -translate-x-1/2 z-40
                   text-[10px] text-forest-700 hover:text-forest-500 flex items-center gap-1
                   bg-black/25 backdrop-blur-md border border-white/4 rounded-b-xl px-3 py-0.5
                   transition-colors"
      >
        {showStories ? '▲ Whispers' : '▼ Forest Whispers'}
      </button>

      {/* ── Profile panel (bottom slide-up) ── */}
      <div className="absolute bottom-20 left-0 right-0 z-40 flex justify-center px-4">
        <div className={`w-full max-w-sm glass rounded-2xl transition-all duration-300
          ${statsOpen ? 'p-5' : 'p-0 h-0 overflow-hidden opacity-0 pointer-events-none'}`}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full border border-forest-700/50 bg-forest-950
                            flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
              {profile.photoURL
                ? <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                : '🌳'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-white/90 text-lg truncate leading-tight">
                {profile.displayName}
              </p>
              <p className="text-forest-600 text-xs mt-0.5 truncate">@{profile.username}</p>
              {profile.bio    && <p className="text-forest-500 text-xs mt-1 line-clamp-2 italic">{profile.bio}</p>}
              {profile.status && <p className="text-forest-500 text-xs mt-0.5 line-clamp-1">{profile.status}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
            <Stat label="Leaves"   value={profile.messageCount}    emoji="🍃" />
            <Stat label="Flowers"  value={profile.imageCount}      emoji="🌸" />
            <Stat label="Fruits"   value={profile.videoCount}      emoji="🍎" />
            <Stat label="Roots"    value={profile.connectionCount} emoji="🌿" />
          </div>

          {/* Bond level bar */}
          {bond.level > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center text-[10px] text-forest-600 mb-1">
                <span style={{ color: bondGlow }}>✦ {bond.label} Bond</span>
                <span>{bond.xp} XP</span>
              </div>
              <div className="h-1 rounded-full bg-forest-950/80 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${(bond.progress * 100).toFixed(1)}%`, background: bondGlow }}
                />
              </div>
            </div>
          )}

          {/* Growth stage bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-forest-700 mb-1">
              <span>Tree age</span>
              <span>{stats.ageInDays}d — {stats.stage}</span>
            </div>
            <div className="h-1 rounded-full bg-forest-950/80 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-forest-700 to-forest-500 transition-all"
                style={{ width: `${Math.min(100, (stats.scale / 2.0) * 100).toFixed(1)}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-forest-900/60 flex gap-2">
            <button
              onClick={() => setShowRings(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs
                         bg-forest-900/40 border border-forest-800/40 text-forest-400
                         hover:text-forest-200 hover:bg-forest-800/40 transition-colors"
            >
              <TreeRingIcon size={15} />
              <span>Memory Rings</span>
            </button>
            <Link href="/settings" className="flex-1">
              <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs
                                 bg-forest-900/40 border border-forest-800/40 text-forest-400
                                 hover:text-forest-200 hover:bg-forest-800/40 transition-colors">
                ✏️ Edit Profile
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom dock ── */}
      <div className="bottom-dock">
        <DockButton icon="🌳" label="My Tree"  active   onClick={() => setStatsOpen(v => !v)} />
        <DockButton icon="💬" label="Chats"    href="/chat"     badge={unreadCount} />
        <DockButton icon="🌲" label="Forest"   href="/forest" />
        <DockButton icon="👥" label="Contacts" href="/contacts" />
        <DockButton icon="⚙️" label="Settings" href="/settings" />
      </div>

      <button
        onClick={() => setStatsOpen(v => !v)}
        className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-50 text-forest-700 hover:text-forest-500 transition-colors"
      >
        {statsOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
      </button>

      {/* ── Media Gallery Modal ── */}
      {mediaGallery && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMediaGallery(null)} />
          <div className="relative z-10 w-full sm:max-w-lg glass rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-forest-900/60 flex-shrink-0">
              <h2 className="font-display text-lg font-semibold text-white/90">
                {mediaGallery === 'image' ? '🌸 Your Photos' : '🍎 Your Videos'}
              </h2>
              <button onClick={() => setMediaGallery(null)} className="text-forest-600 hover:text-white transition-colors p-1 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {mediaLoading ? (
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-forest-900/50 animate-pulse" />
                  ))}
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <p className="text-4xl">{mediaGallery === 'image' ? '🌸' : '🍎'}</p>
                  <p className="text-forest-600 text-sm font-display italic">
                    No {mediaGallery === 'image' ? 'photos' : 'videos'} yet.
                  </p>
                  <p className="text-forest-800 text-xs">Send some in chat to see them here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {mediaItems.map((item, i) => (
                    <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                      className="aspect-square rounded-xl overflow-hidden bg-forest-950/50 block hover:opacity-90 transition-opacity">
                      {mediaGallery === 'image'
                        ? <img src={item.url} alt="" className="w-full h-full object-cover" />
                        : <video src={item.url} className="w-full h-full object-cover" muted playsInline />
                      }
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Memory Rings Modal ── */}
      {showRings && (
        <MemoryRings profile={profile as any} stats={stats} onClose={() => setShowRings(false)} />
      )}
    </div>
  )
}

function Stat({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="flex items-center gap-2 bg-forest-950/50 rounded-xl px-3 py-2 border border-forest-900/40">
      <span className="text-base">{emoji}</span>
      <div>
        <p className="text-white/90 font-semibold tabular-nums leading-none text-sm">{value}</p>
        <p className="text-forest-700 text-[10px] mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function DockButton({
  icon, label, active, disabled, onClick, href, badge,
}: {
  icon: string; label: string; active?: boolean; disabled?: boolean
  onClick?: () => void; href?: string; badge?: number
}) {
  const cls = `relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-xs transition-all
    ${active   ? 'text-forest-300 bg-forest-900/50' : ''}
    ${disabled ? 'text-forest-900 cursor-not-allowed' : 'text-forest-600 hover:text-forest-300 hover:bg-forest-950/50'}`

  const inner = (
    <>
      <span className="relative text-lg leading-none">
        {icon}
        {!!badge && badge > 0 && (
          <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 rounded-full
                           bg-red-600/90 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <span className="text-[9px] tracking-wide">{label}</span>
    </>
  )

  if (href && !disabled) return <Link href={href} title={label} className={cls}>{inner}</Link>
  return <button onClick={onClick} disabled={disabled} title={label} className={cls}>{inner}</button>
}
