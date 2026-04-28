'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LogOut, Settings, ChevronDown, ChevronUp, Thermometer } from 'lucide-react'
import toast from 'react-hot-toast'
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

const TreeScene = dynamic(() => import('@/components/3d/TreeScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full forest-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-7xl animate-float">🌱</div>
        <p className="text-forest-400 animate-pulse">Growing your tree…</p>
      </div>
    </div>
  ),
})

const MILESTONE_MESSAGES: Record<string, string> = {
  sapling: 'Your seedling sprouted into a sapling! 🌿',
  young:   'Your sapling grew into a young tree! 🌳',
  mature:  'Your tree has matured! Ancient wisdom awaits. 🌲',
  ancient: 'Your tree is now ancient! A legend of the forest. 🌳✨',
}

// ─── Mini weather widget (for nav) ───────────────────────────────────────────
function NavWeather() {
  const weather = useWeather()
  if (weather.loading) return null
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full
                    bg-black/30 border border-white/10 text-white text-xs backdrop-blur-md">
      <span className="text-base leading-none">{WEATHER_ICON[weather.condition]}</span>
      {weather.temperature !== null && (
        <span className="font-mono font-semibold">{weather.temperature}°</span>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { user, profile, logOut } = useAuth()
  const router      = useRouter()
  const unreadCount = useUnreadCount()
  const [statsOpen, setStatsOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [showStories, setShowStories] = useState(false)

  useEffect(() => {
    if (!user) return
    return initPresence(user.uid)
  }, [user])

  // Milestone detection
  useEffect(() => {
    if (!profile) return
    const stats = computeTreeStats(profile)
    const key   = `ts_stage_${profile.uid}`
    const prev  = sessionStorage.getItem(key)
    if (prev && prev !== stats.stage && MILESTONE_MESSAGES[stats.stage]) {
      toast(MILESTONE_MESSAGES[stats.stage], { duration: 5000, icon: '🎉' })
    }
    sessionStorage.setItem(key, stats.stage)
  }, [profile])

  if (!profile) return null

  const stats  = computeTreeStats(profile)
  const badge  = getStageBadge(stats.stage)
  const season = getCurrentSeason()

  const now    = new Date()
  const hour   = now.getHours()
  const timePhase =
    hour >= 5  && hour < 8  ? '🌅' :
    hour >= 8  && hour < 17 ? '☀️'  :
    hour >= 17 && hour < 20 ? '🌆'  : '🌙'

  const handleLogout = async () => {
    setSigningOut(true)
    try {
      await logOut()
      toast.success('See you in the forest! 🌿')
      router.replace('/login')
    } catch {
      toast.error('Sign-out failed')
      setSigningOut(false)
    }
  }

  return (
    <div className="scene-wrapper">
      {/* ── Full-screen 3D scene ── */}
      <TreeScene
        stats={stats}
        displayName={profile.displayName}
        status={profile.status}
        photoURL={profile.photoURL}
        treeType={profile.treeType}
        biomeType={TREE_BIOME_MAP[profile.treeType]}
      />

      {/* ── Top navigation bar ── */}
      <nav className="nav-glass flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌳</span>
          <span className="font-bold text-forest-200 text-base tracking-tight hidden sm:block">Terra Sylvan</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="tree-badge">{badge.label}</span>
          <span className="tree-badge hidden sm:inline-flex">{timePhase}</span>
          <span className="tree-badge hidden md:inline-flex">{SEASON_LABEL[season]}</span>
          <NavWeather />
        </div>

        <div className="flex items-center gap-1.5">
          <Link href="/settings">
            <Button variant="ghost" size="sm" title="Settings">
              <Settings size={17} />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout} loading={signingOut} title="Sign out">
            <LogOut size={17} />
          </Button>
        </div>
      </nav>

      {/* ── Stats overlay (top-left) ── */}
      <div className="absolute top-16 left-3 flex flex-col gap-2 z-40 pointer-events-none">
        <div className="flex flex-wrap gap-1.5">
          <span className="stat-pill" title="Messages → Leaves">
            🍃 <span className="tabular-nums">{profile.messageCount}</span>
          </span>
          <span className="stat-pill" title="Images → Flowers">
            🌸 <span className="tabular-nums">{profile.imageCount}</span>
          </span>
          <span className="stat-pill" title="Videos → Fruits">
            🍎 <span className="tabular-nums">{profile.videoCount}</span>
          </span>
          <span className="stat-pill" title="Connections → Roots">
            🌿 <span className="tabular-nums">{profile.connectionCount}</span>
          </span>
        </div>
        <span className="stat-pill self-start text-xs" title="Tree age">
          🕰 {stats.ageInDays === 0 ? 'Just sprouted!' : `${stats.ageInDays}d old`}
        </span>
      </div>

      {/* ── Stories strip — slides down from nav ── */}
      <div className={`absolute left-0 right-0 z-40 transition-all duration-300 ${showStories ? 'top-[56px]' : '-top-24'}`}>
        <div className="mx-3 mt-2 glass rounded-2xl px-3 py-2.5">
          <StoriesBar />
        </div>
      </div>

      {/* Stories toggle button (below nav, left-centre) */}
      <button
        onClick={() => setShowStories(v => !v)}
        className="absolute top-[58px] left-1/2 -translate-x-1/2 z-40
                   text-[10px] text-forest-500 hover:text-forest-300 flex items-center gap-1
                   bg-black/30 backdrop-blur-md border border-white/5 rounded-b-xl px-3 py-0.5
                   transition-colors"
        title={showStories ? 'Hide stories' : 'Show forest whispers'}
      >
        {showStories ? '▲ Whispers' : '▼ Forest Whispers'}
      </button>

      {/* ── Profile panel (bottom slide-up) ── */}
      <div className="absolute bottom-20 left-0 right-0 z-40 flex justify-center px-4">
        <div className={`w-full max-w-sm glass rounded-2xl transition-all duration-300
          ${statsOpen ? 'p-5' : 'p-0 h-0 overflow-hidden opacity-0 pointer-events-none'}`}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-forest-600 bg-forest-900
                            flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
              {profile.photoURL
                ? <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                : '🌳'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate">{profile.displayName}</p>
              <p className="text-forest-500 text-sm truncate">@{profile.username}</p>
              {profile.bio && <p className="text-forest-400 text-sm mt-1 line-clamp-2">{profile.bio}</p>}
              {profile.status && <p className="text-forest-400 text-sm mt-0.5 line-clamp-1">{profile.status}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
            <Stat label="Leaves (chats)"      value={profile.messageCount}    emoji="🍃" />
            <Stat label="Flowers (images)"    value={profile.imageCount}      emoji="🌸" />
            <Stat label="Fruits (videos)"     value={profile.videoCount}      emoji="🍎" />
            <Stat label="Roots (connections)" value={profile.connectionCount} emoji="🌿" />
          </div>

          {/* Growth stage bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-forest-600 mb-1">
              <span>Tree age</span>
              <span>{stats.ageInDays}d — {stats.stage}</span>
            </div>
            <div className="h-1.5 rounded-full bg-forest-900/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-forest-600 to-forest-400 transition-all"
                style={{ width: `${Math.min(100, (stats.scale / 2.0) * 100).toFixed(1)}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-forest-800/50">
            <Link href="/settings" className="block">
              <Button variant="secondary" size="sm" fullWidth>
                ✏️ Edit Profile
              </Button>
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

      {/* Toggle profile card */}
      <button
        onClick={() => setStatsOpen(v => !v)}
        className="absolute bottom-[72px] left-1/2 -translate-x-1/2 z-50 text-forest-600 hover:text-forest-400 transition-colors"
      >
        {statsOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>
    </div>
  )
}

function Stat({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="flex items-center gap-2 bg-forest-900/40 rounded-xl px-3 py-2">
      <span className="text-lg">{emoji}</span>
      <div>
        <p className="text-white font-bold tabular-nums leading-none">{value}</p>
        <p className="text-forest-600 text-xs mt-0.5">{label}</p>
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
  const cls = `relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-xs transition-all
    ${active   ? 'text-forest-300 bg-forest-800/60' : ''}
    ${disabled ? 'text-forest-800 cursor-not-allowed' : 'text-forest-500 hover:text-forest-300 hover:bg-forest-900/40'}`

  const inner = (
    <>
      <span className="relative text-xl">
        {icon}
        {!!badge && badge > 0 && (
          <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full
                           bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      <span>{label}</span>
    </>
  )

  if (href && !disabled) return <Link href={href} title={label} className={cls}>{inner}</Link>
  return <button onClick={onClick} disabled={disabled} title={label} className={cls}>{inner}</button>
}
